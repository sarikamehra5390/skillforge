import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import useSanctuaryStore from "../store/useSanctuaryStore";
import useAuthStore from "../store/useAuthStore";
import { SOUND_BY_ID } from "../utils/soundLibrary";
import AmbienceAudioContext from "./AmbienceAudioContextValue";

const clamp = (value, fallback = 0.3) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
const asLayers = (settings = {}) => {
  settings ||= {};
  if (Array.isArray(settings.audioLayers)) return settings.audioLayers.filter((layer) => SOUND_BY_ID[layer?.soundId]);
  const legacy = settings.audioTrack;
  return SOUND_BY_ID[legacy] ? [{ soundId: legacy, volume: 1, muted: false }] : [];
};

export const AmbienceAudioProvider = ({ children }) => {
  const settings = useSanctuaryStore((state) => state.settings);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const contextRef = useRef(null);
  const masterRef = useRef(null);
  const layersRef = useRef(new Map());
  const fadeRef = useRef(null);
  const timerRef = useRef(null);
  const timerRemainingRef = useRef(0);
  const playLockRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const layers = useMemo(() => asLayers({ audioLayers: settings?.audioLayers, audioTrack: settings?.audioTrack }), [settings?.audioLayers, settings?.audioTrack]);
  const masterVolume = clamp(settings?.masterVolume ?? settings?.audioVolume, 0.3);
  const masterMuted = settings?.audioMuted === true;

  const getContext = useCallback(() => {
    if (!contextRef.current && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const master = context.createGain();
        const limiter = context.createDynamicsCompressor();
        master.gain.value = masterMuted ? 0 : masterVolume;
        limiter.threshold.value = -3;
        limiter.knee.value = 0;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.15;
        master.connect(limiter);
        limiter.connect(context.destination);
        contextRef.current = context;
        masterRef.current = master;
      }
    }
    return contextRef.current;
  }, [masterMuted, masterVolume]);

  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const createNoiseBuffer = useCallback((context, color) => {
    const duration = 5;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      if (color === "brown") {
        brown = (brown + (0.02 * white)) / 1.02;
        data[index] = brown * 3.5;
      } else {
        data[index] = white;
      }
    }
    return buffer;
  }, []);

  const ensureLayer = useCallback((sound, layer, context) => {
    const existing = layersRef.current.get(sound.id);
    if (existing) {
      if (existing.disposeTimer) clearTimeout(existing.disposeTimer);
      existing.disposeTimer = null;
      existing.removing = false;
      return existing;
    }

    const gain = context?.createGain() || null;
    if (gain && masterRef.current) gain.connect(masterRef.current);
    const entry = { gain, audio: null, source: null, filter: null, sound };
    if (sound.generated && context) {
      const source = context.createBufferSource();
      source.buffer = createNoiseBuffer(context, sound.generated);
      source.loop = true;
      let output = source;
      if (sound.generated === "pink") {
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        source.connect(filter);
        output = filter;
        entry.filter = filter;
      } else if (sound.generated === "brown") {
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;
        source.connect(filter);
        output = filter;
        entry.filter = filter;
      }
      if (gain) output.connect(gain);
      entry.source = source;
    } else if (sound.generated) {
      throw new Error("Generated sounds require Web Audio support in this browser.");
    } else if (sound.src) {
      const audio = new Audio(sound.src);
      audio.loop = true;
      audio.preload = "none";
      audio.onerror = () => setPlaybackError(`Unable to load ${sound.name}. Try another sound.`);
      entry.audio = audio;
      if (context && gain) {
        try {
          const mediaSource = context.createMediaElementSource(audio);
          mediaSource.connect(gain);
          entry.mediaSource = mediaSource;
        } catch {
          // Safari/private contexts can reject duplicate media element connections.
          entry.gain = null;
        }
      }
    }
    layersRef.current.set(sound.id, entry);
    return entry;
  }, [createNoiseBuffer]);

  const setLayerGain = useCallback((entry, layer, fadeSeconds = 0.18) => {
    const target = layer.muted ? 0 : clamp(layer.volume, 0.25);
    if (entry.gain && contextRef.current) {
      const parameter = entry.gain.gain;
      parameter.cancelScheduledValues(contextRef.current.currentTime);
      parameter.setTargetAtTime(target, contextRef.current.currentTime, Math.max(0.015, fadeSeconds / 3));
    } else if (entry.audio) {
      entry.audio.volume = clamp(target * (masterMuted ? 0 : masterVolume));
    }
  }, [masterMuted, masterVolume]);

  const stopLayer = useCallback((id, fadeMs = 0) => {
    const entry = layersRef.current.get(id);
    if (!entry || entry.removing) return;
    entry.removing = true;
    if (fadeMs > 0) {
      if (entry.gain && contextRef.current) {
        entry.gain.gain.cancelScheduledValues(contextRef.current.currentTime);
        entry.gain.gain.setTargetAtTime(0, contextRef.current.currentTime, fadeMs / 3000);
      } else if (entry.audio) {
        entry.audio.volume = Math.min(entry.audio.volume, 0.2);
      }
    }
    const dispose = () => {
      if (entry.audio) {
        entry.audio.pause();
        entry.audio.onerror = null;
        entry.audio.removeAttribute("src");
        entry.audio.load();
      }
      try { entry.source?.stop(); } catch { /* already stopped */ }
      entry.source?.disconnect();
      entry.filter?.disconnect();
      entry.mediaSource?.disconnect();
      entry.gain?.disconnect();
      if (layersRef.current.get(id) === entry) layersRef.current.delete(id);
    };
    if (fadeMs > 0) entry.disposeTimer = setTimeout(dispose, fadeMs);
    else dispose();
  }, []);

  const play = useCallback(async () => {
    const current = useSanctuaryStore.getState().settings || {};
    const activeLayers = asLayers(current);
    if (!activeLayers.length) {
      setPlaybackError("Choose one or more sounds before pressing Play.");
      return;
    }
    if (playLockRef.current) return;
    playLockRef.current = true;
    setSessionComplete(false);
    setPlaybackError("");
    try {
      const context = getContext();
      if (context?.state === "suspended") await context.resume();
      for (const layer of activeLayers) {
        const sound = SOUND_BY_ID[layer.soundId];
        const entry = ensureLayer(sound, layer, context);
        setLayerGain(entry, layer);
        if (entry.audio && entry.audio.paused) await entry.audio.play();
        if (entry.source && entry.source.context.state === "running" && !entry.started) {
          entry.source.start();
          entry.started = true;
        }
      }
      setIsPlaying(true);
    } catch (error) {
      layersRef.current.forEach((entry) => entry.audio?.pause());
      contextRef.current?.suspend().catch(() => {});
      setIsPlaying(false);
      const message = "A sound could not start. Check the bundled audio file and try again.";
      setPlaybackError(message);
      toast.error(message);
      console.error("Sanctuary audio playback failed:", error);
    } finally {
      playLockRef.current = false;
    }
  }, [ensureLayer, getContext, setLayerGain]);

  const pause = useCallback(() => {
    clearFade();
    layersRef.current.forEach((entry) => {
      entry.audio?.pause();
    });
    contextRef.current?.suspend().catch(() => {});
    setIsPlaying(false);
  }, [clearFade]);

  const stopAll = useCallback(() => {
    pause();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    timerRemainingRef.current = 0;
    [...layersRef.current.keys()].forEach(stopLayer);
    setRemainingSeconds(0);
    setSessionComplete(false);
  }, [pause, stopLayer]);

  const fadeOutAndPause = useCallback((durationSeconds = 4) => {
    clearFade();
    const seconds = Math.max(0, durationSeconds);
    if (!seconds) { pause(); return; }
    const startedAt = Date.now();
    const startingValues = new Map([...layersRef.current.entries()].map(([id, entry]) => [id, entry.gain?.gain.value ?? entry.audio?.volume ?? 0]));
    fadeRef.current = setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / (seconds * 1000));
      layersRef.current.forEach((entry, id) => {
        const start = startingValues.get(id) || 0;
        if (entry.gain) entry.gain.gain.value = start * (1 - progress);
        else if (entry.audio) entry.audio.volume = start * (1 - progress);
      });
      if (progress >= 1) { clearFade(); pause(); }
    }, 50);
  }, [clearFade, pause]);

  const startSession = useCallback((durationMinutes, fadeAtEnd = true) => {
    const duration = Number(durationMinutes);
    if (!Number.isFinite(duration) || duration < 1 || duration > 240) return false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRemainingRef.current = Math.round(duration * 60);
    setRemainingSeconds(timerRemainingRef.current);
    setSessionComplete(false);
    play();
    timerRef.current = setInterval(() => {
      timerRemainingRef.current = Math.max(0, timerRemainingRef.current - 1);
      setRemainingSeconds(timerRemainingRef.current);
      if (timerRemainingRef.current === 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setSessionComplete(true);
        if (fadeAtEnd) fadeOutAndPause(8);
        else pause();
      }
    }, 1000);
    return true;
  }, [fadeOutAndPause, pause, play]);

  const stopSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    timerRemainingRef.current = 0;
    setRemainingSeconds(0);
    setSessionComplete(false);
    pause();
  }, [pause]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;
    const desiredIds = new Set(layers.map((layer) => layer.soundId));
    if (!layers.length && isPlaying) {
      const resetPlayback = setTimeout(() => setIsPlaying(false), 0);
      layersRef.current.forEach((_, id) => stopLayer(id));
      return () => clearTimeout(resetPlayback);
    }
    layersRef.current.forEach((_, id) => { if (!desiredIds.has(id)) stopLayer(id, 180); });
    layers.forEach((layer) => {
      const sound = SOUND_BY_ID[layer.soundId];
      if (!sound) return;
      const entry = ensureLayer(sound, layer, context);
      setLayerGain(entry, layer);
      if (isPlaying && entry.audio?.paused) {
        entry.audio.play().catch(() => {
          setPlaybackError("This sound could not play. Press Play to try again.");
          setIsPlaying(false);
        });
      }
      if (isPlaying && entry.source && !entry.started && context?.state === "running") {
        try { entry.source.start(); entry.started = true; } catch { /* source may have just been retired */ }
      }
    });
  }, [ensureLayer, isPlaying, layers, setLayerGain, stopLayer]);

  useEffect(() => {
    if (masterRef.current && contextRef.current) {
      const gain = masterRef.current.gain;
      gain.cancelScheduledValues(contextRef.current.currentTime);
      gain.setTargetAtTime(masterMuted ? 0 : masterVolume, contextRef.current.currentTime, 0.06);
    }
    layersRef.current.forEach((entry) => {
      if (!entry.gain && entry.audio) {
        const active = layers.find((layer) => layer.soundId === entry.sound.id);
        if (active) entry.audio.volume = clamp((active.muted ? 0 : active.volume) * (masterMuted ? 0 : masterVolume));
      }
    });
  }, [layers, masterMuted, masterVolume]);

  useEffect(() => {
    if (!isAuthenticated) {
      const resetPlayback = setTimeout(() => stopAll(), 0);
      return () => clearTimeout(resetPlayback);
    }
  }, [isAuthenticated, stopAll]);

  useEffect(() => () => {
    clearFade();
    if (timerRef.current) clearInterval(timerRef.current);
    layersRef.current.forEach((entry) => {
      entry.audio?.pause();
      entry.source?.disconnect();
      entry.filter?.disconnect();
      entry.mediaSource?.disconnect();
      entry.gain?.disconnect();
      if (entry.disposeTimer) clearTimeout(entry.disposeTimer);
    });
    try { contextRef.current?.close(); } catch { /* context already closed */ }
  }, [clearFade]);

  const value = useMemo(() => ({
    isPlaying, playbackError, play, pause, stopAll, fadeOutAndPause,
    remainingSeconds, sessionComplete, startSession, stopSession,
  }), [isPlaying, playbackError, play, pause, stopAll, fadeOutAndPause, remainingSeconds, sessionComplete, startSession, stopSession]);

  return <AmbienceAudioContext.Provider value={value}>{children}</AmbienceAudioContext.Provider>;
};

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Play, Pause, Square, Volume2, VolumeX, Plus, Trash2, Copy, Save, Search, Clock3, Sparkles } from "lucide-react";
import { toast } from "sonner";
import useSanctuaryStore from "../store/useSanctuaryStore";
import { useAmbienceAudio } from "../context/useAmbienceAudio";
import { SOUND_BY_ID, SOUND_LIBRARY, SOUND_MOODS, SEASONAL_WORLDS, SOUND_TIME_PRESETS } from "../utils/soundLibrary";

const sections = ["Discover", "By mood", "Seasonal worlds", "Sound Studio", "My mixes", "Focus sessions"];
const EMPTY_LIST = [];
const soundColor = { Nature: "from-emerald-400/15", Water: "from-cyan-400/15", Cozy: "from-orange-300/15", Focus: "from-violet-400/15" };
const makeMixId = () => globalThis.crypto?.randomUUID?.() || `mix-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const localSeason = (hemisphere = "north") => {
  const month = new Date().getMonth();
  const northern = month === 11 || month <= 1 ? "winter" : month <= 4 ? "spring" : month <= 7 ? "summer" : "autumn";
  if (hemisphere === "north") return northern;
  return ({ winter: "summer", spring: "autumn", summer: "winter", autumn: "spring" })[northern];
};

function createLayers(items) {
  return items.filter((layer, index, all) => SOUND_BY_ID[layer.soundId] && all.findIndex((item) => item.soundId === layer.soundId) === index).slice(0, 8).map((layer) => ({ soundId: layer.soundId, volume: Math.min(1, Math.max(0, Number(layer.volume) || 0)), muted: layer.muted === true }));
}

function SoundSanctuaryStudio() {
  const settings = useSanctuaryStore((state) => state.settings);
  const updateSettings = useSanctuaryStore((state) => state.updateSettings);
  const { isPlaying, playbackError, play, pause, stopAll, remainingSeconds, sessionComplete, startSession, stopSession } = useAmbienceAudio();
  const [section, setSection] = useState("Discover");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All sounds");
  const [mixName, setMixName] = useState("");
  const [editingMixId, setEditingMixId] = useState(null);
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState(40);
  const [fadeEnabled, setFadeEnabled] = useState(true);

  const layers = Array.isArray(settings?.audioLayers) ? settings.audioLayers : [];
  const favorites = Array.isArray(settings?.soundFavorites) ? settings.soundFavorites : EMPTY_LIST;
  const recents = Array.isArray(settings?.soundRecents) ? settings.soundRecents : EMPTY_LIST;
  const mixes = Array.isArray(settings?.savedSoundscapes) ? settings.savedSoundscapes : EMPTY_LIST;
  const masterVolume = Number.isFinite(settings?.masterVolume) ? settings.masterVolume : 0.3;

  const updateLayers = (nextLayers) => {
    const normalized = createLayers(nextLayers);
    updateSettings({ audioLayers: normalized, audioTrack: normalized[0]?.soundId || "none" });
  };
  const recordRecent = (soundIds) => {
    const next = [...new Set([...soundIds, ...recents])].slice(0, 12);
    updateSettings({ soundRecents: next });
  };
  const toggleSound = (soundId) => {
    const isActive = layers.some((layer) => layer.soundId === soundId);
    if (!isActive && layers.length >= 8) {
      toast.error("A mix can contain up to eight sounds.");
      return;
    }
    const next = isActive
      ? layers.filter((layer) => layer.soundId !== soundId)
      : [...layers, { soundId, volume: 0.25, muted: false }];
    updateLayers(next);
    if (!isActive) recordRecent([soundId]);
  };
  const previewSound = (soundId) => {
    if (!layers.some((layer) => layer.soundId === soundId)) {
      if (layers.length >= 8) { toast.error("A mix can contain up to eight sounds."); return; }
      updateLayers([...layers, { soundId, volume: 0.25, muted: false }]);
    }
    recordRecent([soundId]);
    play();
  };
  const setMix = (nextLayers, name) => {
    updateLayers(nextLayers);
    recordRecent(nextLayers.map((layer) => layer.soundId));
    if (name) toast.success(`${name} is ready in your mixer.`);
  };
  const toggleFavorite = (soundId) => updateSettings({ soundFavorites: favorites.includes(soundId) ? favorites.filter((id) => id !== soundId) : [...favorites, soundId].slice(0, 32) });

  const filteredSounds = useMemo(() => SOUND_LIBRARY.filter((sound) =>
    (!query.trim() || `${sound.name} ${sound.category} ${sound.description}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (category === "All sounds" || sound.category === category) &&
    (section !== "My mixes" || favorites.includes(sound.id) || recents.includes(sound.id))
  ), [query, category, section, favorites, recents]);

  const updateLayer = (soundId, patch) => updateLayers(layers.map((layer) => layer.soundId === soundId ? { ...layer, ...patch } : layer));
  const savedMix = mixes.find((mix) => mix.id === editingMixId);
  const saveMix = () => {
    const name = mixName.trim();
    if (!name) { toast.error("Give your soundscape a name first."); return; }
    if (!layers.length) { toast.error("Add a sound before saving a mix."); return; }
    const next = savedMix
      ? mixes.map((mix) => mix.id === savedMix.id ? { ...mix, name, layers: createLayers(layers) } : mix)
      : [...mixes, { id: makeMixId(), name, layers: createLayers(layers) }];
    if (!savedMix && next.length > 20) { toast.error("You can save up to 20 mixes."); return; }
    updateSettings({ savedSoundscapes: next });
    setMixName("");
    setEditingMixId(null);
    toast.success(savedMix ? "Soundscape updated." : "Soundscape saved.");
  };
  const duplicateMix = (mix) => {
    if (mixes.length >= 20) { toast.error("You can save up to 20 mixes."); return; }
    updateSettings({ savedSoundscapes: [...mixes, { ...mix, id: makeMixId(), name: `${mix.name} copy` }] });
    toast.success("Mix duplicated.");
  };
  const deleteMix = (mixId) => {
    updateSettings({ savedSoundscapes: mixes.filter((mix) => mix.id !== mixId) });
    if (editingMixId === mixId) { setEditingMixId(null); setMixName(""); }
    toast.success("Mix deleted.");
  };

  const activeCategories = ["All sounds", ...new Set(SOUND_LIBRARY.map((sound) => sound.category))];
  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--border)", background: "var(--glass)" }} aria-label="Sound player">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Sound Sanctuary</h3>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{layers.length ? `${layers.length} active ${layers.length === 1 ? "layer" : "layers"}` : "Choose a sound to begin"}{isPlaying ? " · Playing" : " · Paused"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={isPlaying ? pause : play} disabled={!layers.length} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white disabled:opacity-50" style={{ background: "var(--button)" }} aria-label={isPlaying ? "Pause sounds" : "Play sounds"}>{isPlaying ? <Pause size={16} /> : <Play size={16} />}{isPlaying ? "Pause" : "Play"}</button>
            <button type="button" onClick={stopAll} disabled={!layers.length && !isPlaying} className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ color: "var(--text)", borderColor: "var(--border)" }} aria-label="Stop all sounds"><Square size={15} />Stop</button>
            <button type="button" onClick={() => updateSettings({ audioMuted: !settings?.audioMuted })} aria-pressed={settings?.audioMuted === true} className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ color: "var(--text)", borderColor: "var(--border)" }} aria-label={settings?.audioMuted ? "Unmute sounds" : "Mute sounds"}>{settings?.audioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}{settings?.audioMuted ? "Muted" : "Mute"}</button>
          </div>
        </div>
        <label className="mt-4 block space-y-1.5 text-sm" style={{ color: "var(--text)" }}>
          <span className="flex justify-between"><span>Master volume</span><span>{Math.round(masterVolume * 100)}%</span></span>
          <input type="range" min="0" max="1" step="0.01" value={masterVolume} onChange={(event) => updateSettings({ masterVolume: Number(event.target.value) })} className="w-full accent-violet-400" aria-label="Master volume" />
        </label>
        <AnimatePresence>
          {layers.length > 0 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex min-h-8 items-end gap-1" aria-label="Active sound layers" role="img">
            {layers.map((layer, index) => <motion.span key={layer.soundId} className="w-2 rounded-full bg-gradient-to-t from-violet-500 to-pink-300" animate={isPlaying && !settings?.reducedMotion ? { height: [8, 15 + ((index * 9) % 20), 8] } : { height: Math.max(5, layer.volume * 26) }} transition={{ duration: 0.7 + index * 0.1, repeat: isPlaying && !settings?.reducedMotion ? Infinity : 0 }} title={SOUND_BY_ID[layer.soundId]?.name} />)}
          </motion.div>}
        </AnimatePresence>
        {playbackError && <p role="status" className="mt-2 text-sm text-rose-300">{playbackError}</p>}
      </section>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Sound sanctuary sections">
        {sections.map((item) => <button key={item} type="button" onClick={() => setSection(item)} aria-pressed={section === item} className="shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors" style={{ color: "var(--text)", borderColor: section === item ? "var(--accent)" : "var(--border)", background: section === item ? "var(--surface)" : "transparent" }}>{item}</button>)}
      </nav>

      {(section === "Discover" || section === "My mixes") && <section className="space-y-3" aria-label="Sound library">
        <label className="relative block"><Search size={17} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sounds..." className="glass-input w-full rounded-xl py-2.5 pl-10 pr-3" aria-label="Search sound library" /></label>
        <div className="flex gap-2 overflow-x-auto pb-1">{activeCategories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className="shrink-0 rounded-full px-3 py-1.5 text-xs" style={{ color: "var(--text)", background: category === item ? "var(--surface)" : "var(--glass)", border: `1px solid ${category === item ? "var(--accent)" : "var(--border)"}` }}>{item}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredSounds.map((sound) => {
            const active = layers.some((layer) => layer.soundId === sound.id);
            return <article key={sound.id} className={`rounded-2xl border bg-gradient-to-br ${soundColor[sound.category] || ""} p-3`} style={{ borderColor: active ? "var(--accent)" : "var(--border)", backgroundColor: "var(--glass)" }}>
              <div className="flex items-start gap-3"><span className="text-2xl" aria-hidden="true">{sound.emoji}</span><div className="min-w-0 flex-1"><h4 className="font-semibold" style={{ color: "var(--text)" }}>{sound.name}</h4><p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{sound.description}</p><p className="mt-1 text-[10px] opacity-70" style={{ color: "var(--text-secondary)" }}>{sound.category} · {sound.generated ? "Generated in your browser" : "Bundled recording"}</p></div><button type="button" onClick={() => toggleFavorite(sound.id)} aria-label={favorites.includes(sound.id) ? `Remove ${sound.name} from favorites` : `Add ${sound.name} to favorites`} aria-pressed={favorites.includes(sound.id)} className="rounded-lg p-2"><Heart size={17} className={favorites.includes(sound.id) ? "fill-pink-400 text-pink-400" : ""} /></button></div>
              <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => toggleSound(sound.id)} aria-pressed={active} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-semibold" style={{ color: "var(--text)", borderColor: active ? "var(--accent)" : "var(--border)" }}>{active ? <><span aria-hidden="true">✓</span>Remove</> : <><Plus size={15} />Add to mix</>}</button><button type="button" onClick={() => previewSound(sound.id)} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border px-2 py-2 text-xs font-semibold" style={{ color: "var(--text)", borderColor: "var(--border)" }}><Play size={14} />Preview</button></div>
              {!sound.generated && <details className="mt-2 text-[10px] opacity-70" style={{ color: "var(--text-secondary)" }}><summary className="cursor-pointer">Recording credit</summary><p className="pt-1">{sound.attribution}</p></details>}
            </article>;
          })}
        </div>
        {!filteredSounds.length && <p className="rounded-xl p-5 text-center text-sm" style={{ color: "var(--text-secondary)", background: "var(--glass)" }}>{section === "My mixes" ? "Favorite or play a sound to find it here." : "No sounds match this search yet. Try another word or category."}</p>}
        {section === "My mixes" && <div className="grid gap-3 sm:grid-cols-2">
          {mixes.map((mix) => <div key={mix.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}><h4 className="font-semibold" style={{ color: "var(--text)" }}>{mix.name}</h4><p className="my-1 text-xs" style={{ color: "var(--text-secondary)" }}>{mix.layers.map((layer) => SOUND_BY_ID[layer.soundId]?.name).filter(Boolean).join(" + ")}</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setMix(mix.layers, mix.name)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "var(--button)" }}>Load mix</button><button type="button" onClick={() => { setEditingMixId(mix.id); setMixName(mix.name); setSection("Sound Studio"); }} className="rounded-lg border px-3 py-1.5 text-xs" style={{ color: "var(--text)", borderColor: "var(--border)" }}>Edit</button><button type="button" onClick={() => duplicateMix(mix)} aria-label={`Duplicate ${mix.name}`} className="rounded-lg border p-1.5" style={{ color: "var(--text)", borderColor: "var(--border)" }}><Copy size={14} /></button><button type="button" onClick={() => deleteMix(mix.id)} aria-label={`Delete ${mix.name}`} className="rounded-lg border p-1.5" style={{ color: "var(--text)", borderColor: "var(--border)" }}><Trash2 size={14} /></button></div></div>)}
        </div>}
        {section === "My mixes" && <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}><h4 className="mb-2 text-sm font-semibold" style={{ color: "var(--text)" }}>Recently played</h4><div className="flex flex-wrap gap-2">{recents.map((id) => SOUND_BY_ID[id] && <button type="button" key={id} onClick={() => toggleSound(id)} className="rounded-full border px-3 py-1.5 text-xs" style={{ color: "var(--text)", borderColor: "var(--border)" }}>{SOUND_BY_ID[id].emoji} {SOUND_BY_ID[id].name} <Plus size={11} className="inline" /></button>)}{!recents.length && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Sounds you add will appear here.</p>}</div></div>}
      </section>}

      {section === "By mood" && <div className="grid gap-3 sm:grid-cols-2">{SOUND_MOODS.map((mood) => <button key={mood.id} type="button" onClick={() => setMix(mood.layers, mood.name)} className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5" style={{ borderColor: "var(--border)", background: "var(--glass)" }}><span className="text-2xl" aria-hidden="true">{mood.emoji}</span><h4 className="mt-2 font-bold" style={{ color: "var(--text)" }}>{mood.name}</h4><p className="text-xs" style={{ color: "var(--text-secondary)" }}>{mood.description}</p><p className="mt-2 text-[11px] opacity-70" style={{ color: "var(--text-secondary)" }}>{mood.layers.map((layer) => SOUND_BY_ID[layer.soundId].name).join(" + ")}</p></button>)}</div>}

      {section === "Seasonal worlds" && <section className="space-y-3"><p className="text-xs" style={{ color: "var(--text-secondary)" }}>Choose a world manually or turn on a local-season suggestion. No location access is used; recommendations use your selected hemisphere and your device’s calendar.</p><div className="flex flex-wrap items-center gap-3 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--glass)" }}><label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}><input type="checkbox" checked={settings?.seasonalAuto === true} onChange={(event) => updateSettings({ seasonalAuto: event.target.checked, seasonalWorld: event.target.checked ? localSeason(settings?.seasonalHemisphere) : settings?.seasonalWorld || "" })} className="accent-violet-400" />Suggest my local season</label>{settings?.seasonalAuto === true && <label className="ml-auto flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>Hemisphere<select value={settings?.seasonalHemisphere || "north"} onChange={(event) => updateSettings({ seasonalHemisphere: event.target.value, seasonalWorld: localSeason(event.target.value) })} className="glass-input rounded-lg px-2 py-1.5" aria-label="Seasonal hemisphere"><option value="north">Northern</option><option value="south">Southern</option></select></label>}</div><div className="grid gap-3 sm:grid-cols-2">{SEASONAL_WORLDS.map((world) => { const isSuggested = settings?.seasonalAuto && localSeason(settings?.seasonalHemisphere) === world.id; return <motion.button key={world.id} type="button" onClick={() => { setMix(world.layers, world.name); updateSettings({ seasonalWorld: world.id, seasonalAuto: false }); }} whileHover={settings?.reducedMotion ? undefined : { y: -3 }} className={`rounded-2xl border bg-gradient-to-br ${world.colors} p-4 text-left`} style={{ borderColor: settings?.seasonalWorld === world.id || isSuggested ? "var(--accent)" : "var(--border)", backgroundColor: "var(--glass)" }}><div className="flex items-center justify-between"><span className="text-3xl" aria-hidden="true">{world.emoji}</span>{isSuggested && <span className="rounded-full border px-2 py-1 text-[10px]" style={{ color: "var(--text)", borderColor: "var(--border)" }}>Local suggestion</span>}</div><h4 className="mt-2 font-bold" style={{ color: "var(--text)" }}>{world.name}</h4><p className="text-xs" style={{ color: "var(--text-secondary)" }}>{world.description}</p><p className="mt-2 text-[11px] opacity-70" style={{ color: "var(--text-secondary)" }}>{world.layers.map((layer) => SOUND_BY_ID[layer.soundId].name).join(" + ")}</p></motion.button>; })}</div></section>}

      {section === "Sound Studio" && <section className="space-y-4">
        <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--glass)" }}><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-bold" style={{ color: "var(--text)" }}>Live mixer</h4><p className="text-xs" style={{ color: "var(--text-secondary)" }}>Each layer has its own smooth volume and mute control.</p></div><button type="button" onClick={() => setMix([], "Mix cleared")} className="rounded-lg border px-3 py-2 text-xs" style={{ color: "var(--text)", borderColor: "var(--border)" }}>Reset mix</button></div>
          <div className="space-y-3">{layers.map((layer) => { const sound = SOUND_BY_ID[layer.soundId]; if (!sound) return null; return <div key={layer.soundId} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}><div className="flex items-center gap-2"><span aria-hidden="true">{sound.emoji}</span><span className="flex-1 text-sm font-medium" style={{ color: "var(--text)" }}>{sound.name}</span><button type="button" onClick={() => updateLayer(sound.id, { muted: !layer.muted })} aria-label={`${layer.muted ? "Unmute" : "Mute"} ${sound.name}`} aria-pressed={layer.muted} className="rounded-lg p-2"><VolumeX size={16} /></button><button type="button" onClick={() => toggleSound(sound.id)} aria-label={`Remove ${sound.name}`} className="rounded-lg p-2"><Trash2 size={15} /></button></div><label className="mt-2 flex items-center gap-3"><input type="range" min="0" max="1" step="0.01" value={layer.volume} onChange={(event) => updateLayer(sound.id, { volume: Number(event.target.value) })} className="w-full accent-violet-400" aria-label={`${sound.name} volume`} /><span className="w-10 text-right text-xs" style={{ color: "var(--text-secondary)" }}>{Math.round(layer.volume * 100)}%</span></label></div>; })}{!layers.length && <p className="rounded-xl p-4 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Add sounds from Discover to build your mix.</p>}</div>
          <div className="mt-4 flex flex-wrap gap-2"><span className="self-center text-xs" style={{ color: "var(--text-secondary)" }}>Mix preset:</span>{[["Minimal", 0.15], ["Balanced", 0.28], ["Immersive", 0.42]].map(([name, value]) => <button key={name} type="button" onClick={() => { updateLayers(layers.map((layer) => ({ ...layer, volume: value }))); updateSettings({ ambienceIntensity: name.toLowerCase() }); }} className="rounded-full border px-3 py-1.5 text-xs" style={{ color: "var(--text)", borderColor: "var(--border)" }}>{name}</button>)}</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><input value={mixName} onChange={(event) => setMixName(event.target.value)} maxLength={50} placeholder="Name this soundscape" className="glass-input min-h-10 rounded-xl px-3 text-sm" aria-label="Soundscape name" /><button type="button" onClick={saveMix} disabled={!layers.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--button)" }}><Save size={15} />{savedMix ? "Update mix" : "Save mix"}</button></div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">{SOUND_TIME_PRESETS.map((preset) => <button key={preset.name} type="button" onClick={() => setMix(preset.layers, preset.name)} className="rounded-xl border p-3 text-left text-sm" style={{ color: "var(--text)", borderColor: "var(--border)", background: "var(--glass)" }}><Sparkles size={14} className="mr-2 inline" />{preset.name}</button>)}</div>
      </section>}

      {section === "Focus sessions" && <section className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--border)", background: "var(--glass)" }}><div className="flex items-start gap-3"><Clock3 size={20} /><div><h4 className="font-bold" style={{ color: "var(--text)" }}>Focus session</h4><p className="text-xs" style={{ color: "var(--text-secondary)" }}>The timer runs in this app tab and fades your sound at the end when enabled.</p></div></div><div className="my-4 flex flex-wrap gap-2">{[15, 25, 45, 60, 90].map((minutes) => <button key={minutes} type="button" onClick={() => { setDuration(minutes); setCustomDuration(minutes); }} aria-pressed={duration === minutes} className="rounded-full border px-3 py-2 text-sm" style={{ color: "var(--text)", borderColor: duration === minutes ? "var(--accent)" : "var(--border)" }}>{minutes} min</button>)}</div><label className="flex max-w-sm items-center gap-3 text-sm" style={{ color: "var(--text)" }}>Custom minutes<input type="number" min="1" max="240" value={customDuration} onChange={(event) => { const value = event.target.value === "" ? "" : Number(event.target.value); setCustomDuration(value); setDuration(value); }} className="glass-input w-24 rounded-lg px-2 py-1.5" aria-label="Custom focus session duration in minutes" /></label><label className="mt-3 flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}><input type="checkbox" checked={fadeEnabled} onChange={(event) => setFadeEnabled(event.target.checked)} className="accent-violet-400" />Fade sounds out gently at the end</label><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => { if (remainingSeconds) stopSession(); else if (!Number.isFinite(duration) || duration < 1 || duration > 240) toast.error("Choose a duration between 1 and 240 minutes."); else startSession(duration, fadeEnabled); }} disabled={!remainingSeconds && !layers.length} className="rounded-xl px-4 py-2.5 font-semibold text-white disabled:opacity-50" style={{ background: "var(--button)" }}>{remainingSeconds ? "End session" : "Start focus session"}</button>{remainingSeconds > 0 && <span className="text-2xl font-semibold tabular-nums" style={{ color: "var(--text)" }} aria-live="polite">{formatTime(remainingSeconds)}</span>}{sessionComplete && <span className="text-sm" role="status" style={{ color: "var(--text-secondary)" }}>Session complete. Take a gentle pause.</span>}</div></section>}
    </div>
  );
}

export default SoundSanctuaryStudio;

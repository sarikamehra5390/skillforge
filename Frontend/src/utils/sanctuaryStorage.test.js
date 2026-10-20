import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SANCTUARY_SETTINGS,
  normalizeSettings,
  loadSanctuaryFromStorage,
  saveSanctuaryToStorage,
  hasPendingSanctuaryChanges,
  markSanctuaryChangesPending,
  clearPendingSanctuaryChanges,
} from "./sanctuaryStorage.js";
import { isVisualRainEnabled } from "./sanctuary.js";

test("fresh Sanctuary settings start with no selected audio", () => {
  assert.equal(DEFAULT_SANCTUARY_SETTINGS.audioTrack, "none");
  assert.deepEqual(DEFAULT_SANCTUARY_SETTINGS.audioLayers, []);
  assert.deepEqual(normalizeSettings().audioLayers, []);
});

test("an empty modern audio selection is not revived from a stale legacy track", () => {
  const settings = normalizeSettings({ audioLayers: [], audioTrack: "rain" });

  assert.deepEqual(settings.audioLayers, []);
  assert.equal(settings.audioTrack, "none");
});

test("legacy tracks created by visual ambience settings migrate as disabled", () => {
  for (const [audioTrack, musicId] of [
    ["rain", "rain"],
    ["rain", "rain-sounds"],
    ["wind", "wind"],
    ["wind", "wind-sounds"],
    ["birds", "birds"],
    ["birds", "bird-sounds"],
    ["nature", "nature-sounds"],
  ]) {
    const settings = normalizeSettings({ audioTrack, music: [musicId] });
    assert.deepEqual(settings.audioLayers, [], `${audioTrack} paired with ${musicId}`);
    assert.equal(settings.audioTrack, "none");
  }
});

test("an explicit legacy audio choice without a visual match is preserved as a selection", () => {
  const settings = normalizeSettings({ audioTrack: "rain", music: ["fireflies"] });

  assert.deepEqual(settings.audioLayers, [{ soundId: "rain", volume: 1, muted: false }]);
  assert.equal(settings.audioTrack, "rain");
});

test("themes and visual rain never add audio layers", () => {
  const settings = normalizeSettings({ theme: "rainy-evening", music: ["rain"], audioTrack: "none" });

  assert.equal(settings.theme, "rainy-evening");
  assert.deepEqual(settings.audioLayers, []);
});

test("visual rain requires the explicit Rain visual selection", () => {
  assert.equal(isVisualRainEnabled({ ambientEffects: true, music: ["fireflies"], backgroundAtmosphere: "rainy" }), false);
  assert.equal(isVisualRainEnabled({ ambientEffects: true, music: ["rain-sounds"] }), false);
  assert.equal(isVisualRainEnabled({ ambientEffects: false, music: ["rain"] }), false);
  assert.equal(isVisualRainEnabled({ ambientEffects: true, music: ["rain"] }), true);
});

test("sanctuary cache and pending edits are isolated by account", () => {
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };

  try {
    saveSanctuaryToStorage({ theme: "sakura-valley", treeType: "sakura" }, "account-a");
    saveSanctuaryToStorage({ theme: "ghibli-sky", treeType: "cosmic" }, "account-b");
    markSanctuaryChangesPending("account-a");

    assert.equal(loadSanctuaryFromStorage("account-a").theme, "sakura-valley");
    assert.equal(loadSanctuaryFromStorage("account-b").theme, "ghibli-sky");
    assert.equal(hasPendingSanctuaryChanges("account-a"), true);
    assert.equal(hasPendingSanctuaryChanges("account-b"), false);

    clearPendingSanctuaryChanges("account-a");
    assert.equal(hasPendingSanctuaryChanges("account-a"), false);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

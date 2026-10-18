const test = require("node:test");
const assert = require("node:assert/strict");
const SanctuarySettings = require("../models/SanctuarySettings");

test("sanctuary effect settings have safe defaults", () => {
  const settings = new SanctuarySettings({ userId: "507f1f77bcf86cd799439011" });

  assert.equal(settings.treeAura, "none");
  assert.equal(settings.ambientEffects, false);
  assert.equal(settings.reducedMotion, false);
  assert.equal(settings.theme, "classic");
  assert.equal(settings.particleIntensity, "medium");
  assert.equal(settings.glowIntensity, "balanced");
  assert.equal(settings.backgroundAtmosphere, "clear");
  assert.equal(settings.cardSpacing, "comfortable");
  assert.equal(settings.audioTrack, "none");
  assert.equal(settings.audioVolume, 0.3);
  assert.equal(settings.audioMuted, false);
});

test("sanctuary accepts the new themes and tree aura options", () => {
  const settings = new SanctuarySettings({
    userId: "507f1f77bcf86cd799439011",
    theme: "night-sanctuary",
    treeAura: "celestial-glow",
  });

  assert.equal(settings.validateSync(), undefined);
});

test("sanctuary accepts aurora and appearance/audio settings", () => {
  const settings = new SanctuarySettings({
    userId: "507f1f77bcf86cd799439011",
    theme: "aurora-sanctuary",
    particleIntensity: "high",
    glowIntensity: "magical",
    backgroundAtmosphere: "starry",
    cardSpacing: "compact",
    audioTrack: "wind",
    audioVolume: 0.45,
    audioMuted: true,
  });

  assert.equal(settings.validateSync(), undefined);
});

test("sanctuary rejects unknown tree aura values", () => {
  const settings = new SanctuarySettings({
    userId: "507f1f77bcf86cd799439011",
    treeAura: "unlocked-xp-glow",
  });

  assert.match(settings.validateSync().message, /treeAura/);
});

test("sanctuary stores independent layers, favorites, recents, and private mixes", () => {
  const settings = new SanctuarySettings({
    userId: "507f1f77bcf86cd799439011",
    audioLayers: [
      { soundId: "rain", volume: 0.3 },
      { soundId: "fireplace", volume: 0.2, muted: true },
      { soundId: "brown-noise", volume: 0.12 },
    ],
    masterVolume: 0.7,
    soundFavorites: ["rain", "fireplace"],
    soundRecents: ["brown-noise", "ocean"],
    savedSoundscapes: [{ id: "mix-1", name: "Rainy reading", layers: [{ soundId: "rain", volume: 0.3 }, { soundId: "fireplace", volume: 0.2 }] }],
  });

  assert.equal(settings.validateSync(), undefined);
  assert.equal(settings.audioLayers.length, 3);
  assert.equal(settings.audioLayers[1].muted, true);
  assert.equal(settings.masterVolume, 0.7);
  assert.equal(settings.savedSoundscapes[0].name, "Rainy reading");
});

test("sanctuary rejects duplicate and excessive active sound layers", () => {
  const duplicate = new SanctuarySettings({
    userId: "507f1f77bcf86cd799439011",
    audioLayers: [{ soundId: "rain", volume: 0.3 }, { soundId: "rain", volume: 0.2 }],
  });
  assert.match(duplicate.validateSync().message, /audioLayers/);

  const tooMany = new SanctuarySettings({
    userId: "507f1f77bcf86cd799439011",
    audioLayers: ["rain", "wind", "birds", "nature", "ocean", "fireplace", "white-noise", "pink-noise", "brown-noise"].map((soundId) => ({ soundId, volume: 0.2 })),
  });
  assert.match(tooMany.validateSync().message, /audioLayers/);
});

export const SOUND_LIBRARY = [
  { id: "rain", name: "Gentle Rain", category: "Nature", description: "A steady, soft rain for an unhurried focus session.", emoji: "🌧️", src: "/audio/rain-loop.mp3", attribution: "Kresiek The Furry · CC0 · OpenGameArt" },
  { id: "wind", name: "Wind in the Trees", category: "Nature", description: "A light breeze moving through a quiet canopy.", emoji: "🍃", src: "/audio/wind-in-tree.mp3", attribution: "Joseph SARDIN · CC0 · BigSoundBank" },
  { id: "birds", name: "Forest Birds", category: "Nature", description: "A brief woodland birdsong recording, looped gently.", emoji: "🐦", src: "/audio/birds-forest.ogg", attribution: "Barracuda1983 · Public domain · Wikimedia Commons" },
  { id: "nature", name: "Rain, Thunder & Birds", category: "Nature", description: "A layered outdoor storm recording with birds in the distance.", emoji: "⛈️", src: "/audio/nature-rain-birds.ogg", attribution: "Ezwa · Public domain · Wikimedia Commons" },
  { id: "ocean", name: "Atlantic Waves", category: "Water", description: "Waves rolling along the Atlantic shore.", emoji: "🌊", src: "/audio/sea-waves.mp3", attribution: "Joseph SARDIN · CC0 · BigSoundBank" },
  { id: "fireplace", name: "Crackling Fireplace", category: "Cozy", description: "A warm indoor fire with a soft, even crackle.", emoji: "🔥", src: "/audio/fireplace.mp3", attribution: "Joseph SARDIN · CC0 · BigSoundBank" },
  { id: "white-noise", name: "White Noise", category: "Focus", description: "Locally generated, even broadband noise.", emoji: "〰️", generated: "white" },
  { id: "pink-noise", name: "Pink Noise", category: "Focus", description: "Locally generated noise with a softer, balanced spectrum.", emoji: "〰️", generated: "pink" },
  { id: "brown-noise", name: "Brown Noise", category: "Focus", description: "Locally generated, low, warm noise for concentration.", emoji: "〰️", generated: "brown" },
];

export const SOUND_BY_ID = Object.fromEntries(SOUND_LIBRARY.map((sound) => [sound.id, sound]));

export const SOUND_MOODS = [
  { id: "deep-focus", name: "Deep Focus", emoji: "🎯", description: "Settle into a steady rhythm.", layers: [{ soundId: "brown-noise", volume: 0.25 }, { soundId: "rain", volume: 0.2 }] },
  { id: "creative-flow", name: "Creative Flow", emoji: "✨", description: "A little breeze and forest life.", layers: [{ soundId: "wind", volume: 0.3 }, { soundId: "birds", volume: 0.16 }] },
  { id: "cozy-evening", name: "Cozy Evening", emoji: "🕯️", description: "Warm firelight with gentle rain.", layers: [{ soundId: "fireplace", volume: 0.28 }, { soundId: "rain", volume: 0.17 }] },
  { id: "ocean-calm", name: "Ocean Calm", emoji: "🌊", description: "Slow waves for a peaceful pause.", layers: [{ soundId: "ocean", volume: 0.32 }] },
  { id: "guitar-practice", name: "Guitar Practice", emoji: "🎸", description: "Subtle room-free ambience without music.", layers: [{ soundId: "wind", volume: 0.12 }] },
  { id: "stormy-reading", name: "Stormy Reading", emoji: "📖", description: "A distant storm softened by birdsong.", layers: [{ soundId: "nature", volume: 0.25 }] },
];

export const SEASONAL_WORLDS = [
  { id: "spring", name: "Spring Garden", emoji: "🌷", description: "Fresh rain, birdsong and a gentle breeze.", colors: "from-emerald-400/20 to-sky-400/10", layers: [{ soundId: "rain", volume: 0.16 }, { soundId: "birds", volume: 0.18 }, { soundId: "wind", volume: 0.12 }] },
  { id: "summer", name: "Summer Shore", emoji: "☀️", description: "Warm air and slow Atlantic waves.", colors: "from-amber-400/20 to-cyan-400/10", layers: [{ soundId: "ocean", volume: 0.31 }, { soundId: "birds", volume: 0.1 }] },
  { id: "autumn", name: "Autumn Reading Corner", emoji: "🍂", description: "A cozy fire beneath a rainy sky.", colors: "from-orange-400/20 to-rose-400/10", layers: [{ soundId: "fireplace", volume: 0.27 }, { soundId: "rain", volume: 0.18 }, { soundId: "wind", volume: 0.1 }] },
  { id: "winter", name: "Winter Cabin", emoji: "❄️", description: "A sheltered cabin with wind outside and a warm fire.", colors: "from-sky-400/20 to-violet-400/10", layers: [{ soundId: "wind", volume: 0.18 }, { soundId: "fireplace", volume: 0.3 }] },
];

export const SOUND_TIME_PRESETS = [
  { name: "Peaceful Morning", layers: [{ soundId: "birds", volume: 0.18 }, { soundId: "wind", volume: 0.16 }] },
  { name: "Productive Afternoon", layers: [{ soundId: "brown-noise", volume: 0.22 }, { soundId: "rain", volume: 0.14 }] },
  { name: "Golden Hour", layers: [{ soundId: "ocean", volume: 0.25 }, { soundId: "birds", volume: 0.12 }] },
  { name: "Midnight Focus", layers: [{ soundId: "rain", volume: 0.2 }, { soundId: "pink-noise", volume: 0.12 }] },
  { name: "Sleep & Wind-down", layers: [{ soundId: "brown-noise", volume: 0.18 }, { soundId: "fireplace", volume: 0.13 }] },
];

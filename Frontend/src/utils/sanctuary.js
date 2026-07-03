export const TREE_OPTIONS = [
  { id: "sprout", name: "Sprout Tree", emoji: "🌱", unlockLevel: 0 },
  { id: "classic", name: "Classic Tree", emoji: "🌳", unlockLevel: 2 },
  { id: "sakura", name: "Sakura Tree", emoji: "🌸", unlockLevel: 5 },
  { id: "autumn", name: "Autumn Tree", emoji: "🍁", unlockLevel: 8 },
  { id: "winter", name: "Winter Tree", emoji: "❄️", unlockLevel: 10 },
  { id: "cosmic", name: "Cosmic Tree", emoji: "🌌", unlockLevel: 15 },
  { id: "golden", name: "Golden Tree", emoji: "✨", unlockLevel: 20 },
];

export const THEME_OPTIONS = [
  { id: "classic", name: "SkillForge Classic", emoji: "🌿", description: "The original sanctuary" },
  { id: "sunset-garden", name: "Sunset Garden", emoji: "🌅" },
  { id: "moonlit-forest", name: "Moonlit Forest", emoji: "🌙" },
  { id: "sakura-valley", name: "Sakura Valley", emoji: "🌸" },
  { id: "ghibli-sky", name: "Ghibli Sky", emoji: "☁️" },
  { id: "rainy-evening", name: "Rainy Evening", emoji: "🌧️" },
  { id: "starry-meadow", name: "Starry Meadow", emoji: "⭐" },
];

export const COMPANION_OPTIONS = [
  { id: "blue-bird", name: "Blue Bird", emoji: "🐦" },
  { id: "fox", name: "Fox", emoji: "🦊" },
  { id: "cat", name: "Cat", emoji: "🐱" },
  { id: "bunny", name: "Bunny", emoji: "🐰" },
  { id: "deer", name: "Deer", emoji: "🦌" },
  { id: "owl", name: "Owl", emoji: "🦉" },
  { id: "baby-dragon", name: "Baby Dragon", emoji: "🐉" },
  { id: "fire-spirit", name: "Fire Spirit", emoji: "🔥" },
];

export const MUSIC_OPTIONS = [
  { id: "fireflies", name: "Fireflies", emoji: "✨" },
  { id: "rain", name: "Rain", emoji: "🌧️" },
  { id: "snow", name: "Snow", emoji: "❄️" },
  { id: "leaves", name: "Leaves", emoji: "🍂" },
  { id: "wind", name: "Wind", emoji: "💨" },
  { id: "fog", name: "Fog", emoji: "🌫️" },
  { id: "stars", name: "Stars", emoji: "⭐" },
  { id: "birds", name: "Birds", emoji: "🐦" },
  { id: "night-mode", name: "Night Mode", emoji: "🌙" },
  { id: "nature-sounds", name: "Nature Sounds", emoji: "🌲" },
  { id: "rain-sounds", name: "Rain Sounds", emoji: "🌧️" },
  { id: "bird-sounds", name: "Bird Sounds", emoji: "🐦" },
  { id: "wind-sounds", name: "Wind Sounds", emoji: "💨" },
];

export const DECORATION_OPTIONS = [
  { id: "lanterns", name: "Lantern", emoji: "🏮" },
  { id: "flowers", name: "Flowers", emoji: "🌸" },
  { id: "butterflies", name: "Butterflies", emoji: "🦋" },
  { id: "bridge", name: "Bridge", emoji: "🌉" },
  { id: "campfire", name: "Campfire", emoji: "🔥" },
  { id: "bench", name: "Bench", emoji: "🪑" },
  { id: "crystals", name: "Magic Crystals", emoji: "💎" },
  { id: "wind-chimes", name: "Wind Chimes", emoji: "🎐" },
  { id: "waterfall", name: "Waterfall", emoji: "💧" },
  { id: "stone-path", name: "Stone Path", emoji: "🪨" },
];

export const TITLE_OPTIONS = [
  { id: "beginner", name: "Beginner", emoji: "🌱", unlockXP: 0 },
  { id: "streak-master", name: "Streak Master", emoji: "🔥", unlockXP: 500 },
  { id: "tree-keeper", name: "Tree Keeper", emoji: "🏆", unlockXP: 1000 },
  { id: "forest-guardian", name: "Forest Guardian", emoji: "⭐", unlockXP: 2500 },
  { id: "ancient-sage", name: "Ancient Sage", emoji: "🌳", unlockXP: 5000 },
  { id: "world-tree-guardian", name: "World Tree Guardian", emoji: "✨", unlockXP: 10000 },
];

export const AVATAR_COLORS = [
  "from-primary-400 to-secondary-400",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-green-400 to-emerald-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-violet-500",
];

export const PROFILE_FRAMES = [
  { id: "none", name: "None", emoji: "➖" },
  { id: "gold", name: "Gold", emoji: "🏆" },
  { id: "silver", name: "Silver", emoji: "🥈" },
  { id: "bronze", name: "Bronze", emoji: "🥉" },
];

export const THEME_STYLES = {
  "sunset-garden": {
    background: "bg-gradient-to-br from-orange-100 via-pink-100 to-purple-200",
    accent: "text-orange-500",
    cardBg: "bg-orange-50/80",
    border: "border-orange-200",
  },
  "moonlit-forest": {
    background: "bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900",
    accent: "text-indigo-400",
    cardBg: "bg-white/5",
    border: "border-white/10",
  },
  "sakura-valley": {
    background: "bg-gradient-to-br from-pink-100 via-pink-200 to-rose-300",
    accent: "text-pink-500",
    cardBg: "bg-pink-50/80",
    border: "border-pink-200",
  },
  "ghibli-sky": {
    background: "bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-300",
    accent: "text-sky-500",
    cardBg: "bg-blue-50/80",
    border: "border-blue-200",
  },
  "rainy-evening": {
    background: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
    accent: "text-slate-400",
    cardBg: "bg-slate-800/80",
    border: "border-slate-600",
  },
  "starry-meadow": {
    background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900",
    accent: "text-purple-400",
    cardBg: "bg-indigo-900/50",
    border: "border-purple-500/30",
  },
};
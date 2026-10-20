import {
  useEffect,
} from "react";

import useSanctuaryStore from "../store/useSanctuaryStore";
import ThemeContext from "./ThemeContextValue";
// Define all theme configurations with CSS variables
const THEMES = {
  classic: {
    id: "classic",
    name: "SkillForge Classic",
    css: {
      "--background":
        "linear-gradient(135deg, #1a1530 0%, #241b42 50%, #34235c 100%)",
      "--surface": "rgba(36, 27, 66, 0.85)",
      "--card": "rgba(45, 27, 78, 0.75)",
      "--navbar": "rgba(26, 21, 48, 0.4)",
      "--sidebar": "rgba(26, 21, 48, 0.35)",
      "--text": "#fff8e7",
      "--text-secondary": "#cbd5e1",
      "--accent": "#a78bfa",
      "--accent-light":
        "rgba(167, 139, 250, 0.15)",
      "--button":
        "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
      "--button-hover":
        "linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 100%)",
      "--border":
        "rgba(167, 139, 250, 0.25)",
      "--shadow":
        "rgba(167, 139, 250, 0.25)",
      "--glass":
        "rgba(45, 27, 78, 0.65)",
      "--glass-border":
        "rgba(167, 139, 250, 0.3)",
    },
  },

  "sunset-garden": {
    id: "sunset-garden",
    name: "Sunset Garden",
    css: {
      "--background":
        "linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ff6b88 100%)",
      "--surface":
        "rgba(255, 230, 210, 0.85)",
      "--card":
        "rgba(255, 240, 220, 0.75)",
      "--navbar":
        "rgba(255, 200, 150, 0.4)",
      "--sidebar":
        "rgba(255, 210, 170, 0.35)",
      "--text": "#4a3728",
      "--text-secondary": "#6b4f3a",
      "--accent": "#ff6b35",
      "--accent-light":
        "rgba(255, 107, 53, 0.15)",
      "--button":
        "linear-gradient(135deg, #ff6b35 0%, #ff8e53 100%)",
      "--button-hover":
        "linear-gradient(135deg, #ff8e53 0%, #ffb380 100%)",
      "--border":
        "rgba(255, 107, 53, 0.2)",
      "--shadow":
        "rgba(255, 107, 53, 0.2)",
      "--glass":
        "rgba(255, 240, 220, 0.65)",
      "--glass-border":
        "rgba(255, 107, 53, 0.25)",
    },
  },

  "moonlit-forest": {
    id: "moonlit-forest",
    name: "Moonlit Forest",
    css: {
      "--background":
        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      "--surface":
        "rgba(30, 41, 59, 0.8)",
      "--card":
        "rgba(51, 65, 85, 0.7)",
      "--navbar":
        "rgba(30, 41, 59, 0.5)",
      "--sidebar":
        "rgba(15, 23, 42, 0.6)",
      "--text": "#f8fafc",
      "--text-secondary": "#cbd5e1",
      "--accent": "#8b5cf6",
      "--accent-light":
        "rgba(139, 92, 246, 0.15)",
      "--button":
        "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
      "--button-hover":
        "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
      "--border":
        "rgba(139, 92, 246, 0.25)",
      "--shadow":
        "rgba(139, 92, 246, 0.25)",
      "--glass":
        "rgba(51, 65, 85, 0.65)",
      "--glass-border":
        "rgba(139, 92, 246, 0.3)",
    },
  },

  "sakura-valley": {
    id: "sakura-valley",
    name: "Sakura Valley",
    css: {
      "--background":
        "linear-gradient(135deg, #fff0f5 0%, #fce4ec 50%, #f8bbd9 100%)",
      "--surface":
        "rgba(255, 240, 245, 0.9)",
      "--card":
        "rgba(255, 245, 250, 0.8)",
      "--navbar":
        "rgba(255, 235, 245, 0.6)",
      "--sidebar":
        "rgba(255, 230, 240, 0.55)",
      "--text": "#4a2a3e",
      "--text-secondary": "#6b3b55",
      "--accent": "#ec4899",
      "--accent-light":
        "rgba(236, 72, 153, 0.15)",
      "--button":
        "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      "--button-hover":
        "linear-gradient(135deg, #f472b6 0%, #f9a8d4 100%)",
      "--border":
        "rgba(236, 72, 153, 0.2)",
      "--shadow":
        "rgba(236, 72, 153, 0.2)",
      "--glass":
        "rgba(255, 245, 250, 0.7)",
      "--glass-border":
        "rgba(236, 72, 153, 0.25)",
    },
  },

  "ghibli-sky": {
    id: "ghibli-sky",
    name: "Ghibli Sky",
    css: {
      "--background":
        "linear-gradient(135deg, #87ceeb 0%, #b0e0e6 50%, #e0f6ff 100%)",
      "--surface":
        "rgba(240, 248, 255, 0.9)",
      "--card":
        "rgba(255, 255, 255, 0.8)",
      "--navbar":
        "rgba(210, 240, 255, 0.6)",
      "--sidebar":
        "rgba(200, 230, 255, 0.55)",
      "--text": "#1a3a4a",
      "--text-secondary": "#3b5a6a",
      "--accent": "#38bdf8",
      "--accent-light":
        "rgba(56, 189, 248, 0.15)",
      "--button":
        "linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)",
      "--button-hover":
        "linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)",
      "--border":
        "rgba(56, 189, 248, 0.2)",
      "--shadow":
        "rgba(56, 189, 248, 0.2)",
      "--glass":
        "rgba(240, 248, 255, 0.7)",
      "--glass-border":
        "rgba(56, 189, 248, 0.25)",
    },
  },

  "rainy-evening": {
    id: "rainy-evening",
    name: "Rainy Evening",
    css: {
      "--background":
        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
      "--surface":
        "rgba(15, 23, 42, 0.85)",
      "--card":
        "rgba(30, 41, 59, 0.75)",
      "--navbar":
        "rgba(15, 23, 42, 0.55)",
      "--sidebar":
        "rgba(15, 23, 42, 0.6)",
      "--text": "#e2e8f0",
      "--text-secondary": "#cbd5e1",
      "--accent": "#64748b",
      "--accent-light":
        "rgba(100, 116, 139, 0.15)",
      "--button":
        "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
      "--button-hover":
        "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)",
      "--border":
        "rgba(100, 116, 139, 0.25)",
      "--shadow":
        "rgba(100, 116, 139, 0.25)",
      "--glass":
        "rgba(30, 41, 59, 0.7)",
      "--glass-border":
        "rgba(100, 116, 139, 0.3)",
    },
  },

  "starry-meadow": {
    id: "starry-meadow",
    name: "Starry Meadow",
    css: {
      "--background":
        "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #312e81 100%)",
      "--surface":
        "rgba(30, 27, 75, 0.85)",
      "--card":
        "rgba(49, 46, 129, 0.75)",
      "--navbar":
        "rgba(30, 27, 75, 0.55)",
      "--sidebar":
        "rgba(15, 23, 42, 0.6)",
      "--text": "#f0f9ff",
      "--text-secondary": "#e0f2fe",
      "--accent": "#a855f7",
      "--accent-light":
        "rgba(168, 85, 247, 0.15)",
      "--button":
        "linear-gradient(135deg, #a855f7 0%, #d946ef 100%)",
      "--button-hover":
        "linear-gradient(135deg, #d946ef 0%, #f472b6 100%)",
      "--border":
        "rgba(168, 85, 247, 0.25)",
      "--shadow":
        "rgba(168, 85, 247, 0.25)",
      "--glass":
        "rgba(49, 46, 129, 0.7)",
      "--glass-border":
        "rgba(168, 85, 247, 0.3)",
    },
  },

  "night-sanctuary": {
    id: "night-sanctuary",
    name: "Night Sanctuary",
    css: {
      "--background": "linear-gradient(135deg, #101426 0%, #191832 52%, #292047 100%)",
      "--surface": "rgba(25, 24, 50, 0.9)",
      "--card": "rgba(41, 32, 71, 0.82)",
      "--navbar": "rgba(16, 20, 38, 0.72)",
      "--sidebar": "rgba(16, 20, 38, 0.68)",
      "--text": "#E7E7FF",
      "--text-secondary": "#c2c0df",
      "--accent": "#B8A7FF",
      "--accent-light": "rgba(184, 167, 255, 0.15)",
      "--button": "linear-gradient(135deg, #8f80dc 0%, #b08cdb 100%)",
      "--button-hover": "linear-gradient(135deg, #a99afa 0%, #c59ce9 100%)",
      "--border": "rgba(184, 167, 255, 0.24)",
      "--shadow": "rgba(115, 224, 208, 0.16)",
      "--glass": "rgba(35, 33, 68, 0.72)",
      "--glass-border": "rgba(184, 167, 255, 0.26)",
      "--card-glow": "rgba(115, 224, 208, 0.13)",
    },
  },

  "evening-sanctuary": {
    id: "evening-sanctuary",
    name: "Evening Sanctuary",
    css: {
      "--background": "linear-gradient(135deg, #281A36 0%, #49305F 56%, #392541 100%)",
      "--surface": "rgba(52, 34, 67, 0.9)",
      "--card": "rgba(73, 48, 95, 0.82)",
      "--navbar": "rgba(40, 26, 54, 0.72)",
      "--sidebar": "rgba(40, 26, 54, 0.68)",
      "--text": "#FFF0E7",
      "--text-secondary": "#e0cbd5",
      "--accent": "#D9A0B8",
      "--accent-light": "rgba(217, 160, 184, 0.16)",
      "--button": "linear-gradient(135deg, #c88eab 0%, #d9a0b8 50%, #e6ad79 100%)",
      "--button-hover": "linear-gradient(135deg, #d9a0b8 0%, #edb5c5 55%, #ffc477 100%)",
      "--border": "rgba(217, 160, 184, 0.25)",
      "--shadow": "rgba(255, 196, 119, 0.16)",
      "--glass": "rgba(73, 48, 95, 0.72)",
      "--glass-border": "rgba(217, 160, 184, 0.28)",
      "--card-glow": "rgba(255, 196, 119, 0.14)",
    },
  },

  "aurora-sanctuary": {
    id: "aurora-sanctuary",
    name: "Aurora Sanctuary",
    css: {
      "--background": "linear-gradient(135deg, #0b1425 0%, #132139 54%, #17152f 100%)",
      "--surface": "rgba(18, 31, 52, 0.9)",
      "--card": "rgba(25, 43, 66, 0.82)",
      "--navbar": "rgba(10, 20, 37, 0.75)",
      "--sidebar": "rgba(10, 20, 37, 0.7)",
      "--text": "#e7f7f2",
      "--text-secondary": "#b9d2d1",
      "--accent": "#62d9c1",
      "--accent-light": "rgba(98, 217, 193, 0.15)",
      "--button": "linear-gradient(135deg, #35b7a5 0%, #8b78e6 100%)",
      "--button-hover": "linear-gradient(135deg, #56d6bd 0%, #a48ded 100%)",
      "--border": "rgba(98, 217, 193, 0.22)",
      "--shadow": "rgba(76, 220, 184, 0.2)",
      "--glass": "rgba(25, 43, 66, 0.72)",
      "--glass-border": "rgba(98, 217, 193, 0.25)",
      "--card-glow": "rgba(67, 221, 181, 0.12)",
    },
  },
};

export const ThemeProvider = ({
  children,
}) => {
  const settings = useSanctuaryStore(
    (state) => state.settings
  );

  const updateSettings = useSanctuaryStore(
    (state) => state.updateSettings
  );

  const themeId = settings?.theme || "classic";
  const currentTheme = THEMES[themeId]
    ? themeId
    : "classic";

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const theme = THEMES[currentTheme];

    Object.entries(theme.css).forEach(
      ([key, value]) => {
        document.documentElement.style.setProperty(
          key,
          value
        );
      }
    );
    document.documentElement.dataset.theme = currentTheme;
    document.documentElement.dataset.reducedMotion = settings?.reducedMotion ? "true" : "false";
    document.documentElement.dataset.glowIntensity = settings?.glowIntensity || "balanced";
    document.documentElement.dataset.cardSpacing = settings?.cardSpacing || "comfortable";
  }, [
    currentTheme,
    settings?.reducedMotion,
    settings?.glowIntensity,
    settings?.cardSpacing,
  ]);

  const changeTheme = (themeId) => {
    if (!THEMES[themeId]) {
      return;
    }

    updateSettings({
      theme: themeId,
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        changeTheme,
        THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { THEME_OPTIONS } from "../utils/sanctuary";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";

// Define all theme configurations with CSS variables
const THEMES = {
  "classic": {
    id: "classic",
    name: "SkillForge Classic",
    css: {
      "--background": "linear-gradient(135deg, #1a1530 0%, #241b42 50%, #34235c 100%)",
      "--surface": "rgba(36, 27, 66, 0.85)",
      "--card": "rgba(45, 27, 78, 0.75)",
      "--navbar": "rgba(26, 21, 48, 0.4)",
      "--sidebar": "rgba(26, 21, 48, 0.35)",
      "--text": "#fff8e7",
      "--text-secondary": "#cbd5e1",
      "--accent": "#a78bfa",
      "--accent-light": "rgba(167, 139, 250, 0.15)",
      "--button": "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
      "--button-hover": "linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 100%)",
      "--border": "rgba(167, 139, 250, 0.25)",
      "--shadow": "rgba(167, 139, 250, 0.25)",
      "--glass": "rgba(45, 27, 78, 0.65)",
      "--glass-border": "rgba(167, 139, 250, 0.3)",
    },
  },
  "sunset-garden": {
    id: "sunset-garden",
    name: "Sunset Garden",
    css: {
      "--background": "linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ff6b88 100%)",
      "--surface": "rgba(255, 230, 210, 0.85)",
      "--card": "rgba(255, 240, 220, 0.75)",
      "--navbar": "rgba(255, 200, 150, 0.4)",
      "--sidebar": "rgba(255, 210, 170, 0.35)",
      "--text": "#4a3728",
      "--text-secondary": "#6b4f3a",
      "--accent": "#ff6b35",
      "--accent-light": "rgba(255, 107, 53, 0.15)",
      "--button": "linear-gradient(135deg, #ff6b35 0%, #ff8e53 100%)",
      "--button-hover": "linear-gradient(135deg, #ff8e53 0%, #ffb380 100%)",
      "--border": "rgba(255, 107, 53, 0.2)",
      "--shadow": "rgba(255, 107, 53, 0.2)",
      "--glass": "rgba(255, 240, 220, 0.65)",
      "--glass-border": "rgba(255, 107, 53, 0.25)",
    },
  },
  "moonlit-forest": {
    id: "moonlit-forest",
    name: "Moonlit Forest",
    css: {
      "--background": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      "--surface": "rgba(30, 41, 59, 0.8)",
      "--card": "rgba(51, 65, 85, 0.7)",
      "--navbar": "rgba(30, 41, 59, 0.5)",
      "--sidebar": "rgba(15, 23, 42, 0.6)",
      "--text": "#f8fafc",
      "--text-secondary": "#cbd5e1",
      "--accent": "#8b5cf6",
      "--accent-light": "rgba(139, 92, 246, 0.15)",
      "--button": "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
      "--button-hover": "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
      "--border": "rgba(139, 92, 246, 0.25)",
      "--shadow": "rgba(139, 92, 246, 0.25)",
      "--glass": "rgba(51, 65, 85, 0.65)",
      "--glass-border": "rgba(139, 92, 246, 0.3)",
    },
  },
  "sakura-valley": {
    id: "sakura-valley",
    name: "Sakura Valley",
    css: {
      "--background": "linear-gradient(135deg, #fff0f5 0%, #fce4ec 50%, #f8bbd9 100%)",
      "--surface": "rgba(255, 240, 245, 0.9)",
      "--card": "rgba(255, 245, 250, 0.8)",
      "--navbar": "rgba(255, 235, 245, 0.6)",
      "--sidebar": "rgba(255, 230, 240, 0.55)",
      "--text": "#4a2a3e",
      "--text-secondary": "#6b3b55",
      "--accent": "#ec4899",
      "--accent-light": "rgba(236, 72, 153, 0.15)",
      "--button": "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
      "--button-hover": "linear-gradient(135deg, #f472b6 0%, #f9a8d4 100%)",
      "--border": "rgba(236, 72, 153, 0.2)",
      "--shadow": "rgba(236, 72, 153, 0.2)",
      "--glass": "rgba(255, 245, 250, 0.7)",
      "--glass-border": "rgba(236, 72, 153, 0.25)",
    },
  },
  "ghibli-sky": {
    id: "ghibli-sky",
    name: "Ghibli Sky",
    css: {
      "--background": "linear-gradient(135deg, #87ceeb 0%, #b0e0e6 50%, #e0f6ff 100%)",
      "--surface": "rgba(240, 248, 255, 0.9)",
      "--card": "rgba(255, 255, 255, 0.8)",
      "--navbar": "rgba(210, 240, 255, 0.6)",
      "--sidebar": "rgba(200, 230, 255, 0.55)",
      "--text": "#1a3a4a",
      "--text-secondary": "#3b5a6a",
      "--accent": "#38bdf8",
      "--accent-light": "rgba(56, 189, 248, 0.15)",
      "--button": "linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)",
      "--button-hover": "linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)",
      "--border": "rgba(56, 189, 248, 0.2)",
      "--shadow": "rgba(56, 189, 248, 0.2)",
      "--glass": "rgba(240, 248, 255, 0.7)",
      "--glass-border": "rgba(56, 189, 248, 0.25)",
    },
  },
  "rainy-evening": {
    id: "rainy-evening",
    name: "Rainy Evening",
    css: {
      "--background": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
      "--surface": "rgba(15, 23, 42, 0.85)",
      "--card": "rgba(30, 41, 59, 0.75)",
      "--navbar": "rgba(15, 23, 42, 0.55)",
      "--sidebar": "rgba(15, 23, 42, 0.6)",
      "--text": "#e2e8f0",
      "--text-secondary": "#cbd5e1",
      "--accent": "#64748b",
      "--accent-light": "rgba(100, 116, 139, 0.15)",
      "--button": "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)",
      "--button-hover": "linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)",
      "--border": "rgba(100, 116, 139, 0.25)",
      "--shadow": "rgba(100, 116, 139, 0.25)",
      "--glass": "rgba(30, 41, 59, 0.7)",
      "--glass-border": "rgba(100, 116, 139, 0.3)",
    },
  },
  "starry-meadow": {
    id: "starry-meadow",
    name: "Starry Meadow",
    css: {
      "--background": "linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #312e81 100%)",
      "--surface": "rgba(30, 27, 75, 0.85)",
      "--card": "rgba(49, 46, 129, 0.75)",
      "--navbar": "rgba(30, 27, 75, 0.55)",
      "--sidebar": "rgba(15, 23, 42, 0.6)",
      "--text": "#f0f9ff",
      "--text-secondary": "#e0f2fe",
      "--accent": "#a855f7",
      "--accent-light": "rgba(168, 85, 247, 0.15)",
      "--button": "linear-gradient(135deg, #a855f7 0%, #d946ef 100%)",
      "--button-hover": "linear-gradient(135deg, #d946ef 0%, #f472b6 100%)",
      "--border": "rgba(168, 85, 247, 0.25)",
      "--shadow": "rgba(168, 85, 247, 0.25)",
      "--glass": "rgba(49, 46, 129, 0.7)",
      "--glass-border": "rgba(168, 85, 247, 0.3)",
    },
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuthStore();
  const [currentTheme, setCurrentTheme] = useState("classic");

  // Apply theme to document root
  const applyTheme = (themeId) => {
    if (!THEMES[themeId]) return;

    const root = document.documentElement;
    const theme = THEMES[themeId];
    
    Object.entries(theme.css).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set transition duration to 600ms as requested
    root.style.transition = "all 600ms ease-in-out";
  };

  // Load theme from localStorage or user data on mount
  useEffect(() => {
    let savedTheme = localStorage.getItem("skillforge_theme");
    
    if (user && user.sanctuarySettings && user.sanctuarySettings.theme) {
      savedTheme = user.sanctuarySettings.theme;
    }
    
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Apply default theme if no saved theme
      applyTheme("sunset-garden");
    }
  }, [user]);

  // Change theme and persist
  const changeTheme = async (themeId) => {
    if (!THEMES[themeId]) return;
    
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("skillforge_theme", themeId);
    
    // Save to backend if user is logged in
    if (user) {
      try {
        await api.put("/sanctuary", {
          theme: themeId,
        });
      } catch (error) {
        console.error("Failed to save theme to backend:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_PRESETS = {
  orange: { label: '🍊 Default Orange', primary: '#f97316', secondary: '#22c55e' },
  purple: { label: '💜 Royal Purple', primary: '#a855f7', secondary: '#ec4899' },
  blue: { label: '🔵 Ocean Blue', primary: '#3b82f6', secondary: '#06b6d4' },
  rose: { label: '🌹 Rose Gold', primary: '#e11d48', secondary: '#f59e0b' },
  green: { label: '🌿 Nature Green', primary: '#22c55e', secondary: '#14b8a6' },
  red: { label: '🔴 Bold Red', primary: '#ef4444', secondary: '#f97316' },
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function lighten(hex, percent) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darken(hex, percent) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.round(r * (1 - percent / 100)));
  g = Math.max(0, Math.round(g * (1 - percent / 100)));
  b = Math.max(0, Math.round(b * (1 - percent / 100)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function applyThemeColors(config) {
  if (!config) return;
  const root = document.documentElement.style;
  const p = config.primary || '#f97316';
  const s = config.secondary || '#22c55e';

  // Core accents
  root.setProperty('--accent-orange', p);
  root.setProperty('--accent-blue', p);
  root.setProperty('--accent-green', s);

  // Gradients
  root.setProperty('--gradient-primary', `linear-gradient(135deg, ${p}, ${lighten(p, 20)})`);
  root.setProperty('--gradient-accent', `linear-gradient(135deg, ${p}, ${s})`);
  root.setProperty('--gradient-green', `linear-gradient(135deg, ${s}, ${lighten(s, 20)})`);
  root.setProperty('--gradient-orange', `linear-gradient(135deg, ${p}, ${s})`);

  // Sidebar
  root.setProperty('--sidebar-active-bg', hexToRgba(p, 0.08));
  root.setProperty('--sidebar-active-text', p);

  // Button hover
  root.setProperty('--accent-blue-hover', darken(p, 10));
}

export function ThemeProvider({ children }) {
  const [theme] = useState('light');
  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('synnoviq_custom_theme')) || null;
    } catch { return null; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeConfig) applyThemeColors(themeConfig);
  }, [themeConfig]);

  const applyTheme = useCallback((config) => {
    setThemeConfig(config);
    localStorage.setItem('synnoviq_custom_theme', JSON.stringify(config));
    applyThemeColors(config);
  }, []);

  const resetTheme = useCallback(() => {
    localStorage.removeItem('synnoviq_custom_theme');
    setThemeConfig(null);
    const root = document.documentElement.style;
    ['--accent-orange', '--accent-blue', '--accent-green', '--accent-blue-hover',
     '--gradient-primary', '--gradient-accent', '--gradient-green', '--gradient-orange',
     '--sidebar-active-bg', '--sidebar-active-text'].forEach(p => root.removeProperty(p));
  }, []);

  const toggleTheme = () => {}; // Light theme only for now

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeConfig, applyTheme, resetTheme, THEME_PRESETS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

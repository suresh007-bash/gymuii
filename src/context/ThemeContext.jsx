import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = 'light';

  useEffect(() => {
    localStorage.setItem('synnoviq_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const toggleTheme = () => {}; // Light theme only

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

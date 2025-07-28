import React, { createContext, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../../store/useAppStore';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const { settings, updateSettings } = useAppStore();
  const { theme } = settings;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    switch (theme) {
      case 'dark':
        applyTheme(true);
        break;
      case 'light':
        applyTheme(false);
        break;
      case 'system':
      default:
        // Check system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(mediaQuery.matches);
        
        // Listen for system theme changes
        const handleChange = (e) => applyTheme(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateSettings({ theme: themes[nextIndex] });
  };

  const setTheme = (newTheme) => {
    updateSettings({ theme: newTheme });
  };

  const isDark = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: isDark()
  };

  return (
    <ThemeContext.Provider value={value}>
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isDark() ? '#111827' : '#f9fafb'
        }}
        transition={{ duration: 0.2 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

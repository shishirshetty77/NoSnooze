import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { COLORS } from '../constants';
import { storageService } from '../services/storageService';

export interface Theme {
  colors: typeof COLORS.light;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    initializeTheme();
  }, []);

  const initializeTheme = async () => {
    try {
      const settings = await storageService.getSettings();
      if (settings.isDarkMode !== undefined) {
        setIsDarkMode(settings.isDarkMode);
      } else {
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      const colorScheme = Appearance.getColorScheme();
      setIsDarkMode(colorScheme === 'dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    try {
      const settings = await storageService.getSettings();
      await storageService.saveSettings({
        ...settings,
        isDarkMode: newTheme,
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme: Theme = {
    colors: isDarkMode ? COLORS.dark : COLORS.light,
    isDark: isDarkMode,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

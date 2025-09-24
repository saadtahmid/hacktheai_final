import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#111827' : '#ffffff');
    }
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme utility functions
export const getThemeColors = (isDark: boolean) => ({
  // Background colors
  bg: {
    primary: isDark ? '#0f0f0f' : '#ffffff',
    secondary: isDark ? '#1a1a1a' : '#f9fafb',
    tertiary: isDark ? '#262626' : '#ffffff',
    gradient: isDark
      ? 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #262626)'
      : 'linear-gradient(to bottom right, #f0fdf4, white)',
  },

  // Text colors
  text: {
    primary: isDark ? '#ffffff' : '#111827',
    secondary: isDark ? '#e5e5e5' : '#6b7280',
    tertiary: isDark ? '#a3a3a3' : '#374151',
  },

  // Border colors
  border: {
    primary: isDark ? '#404040' : '#e5e7eb',
    secondary: isDark ? '#525252' : '#d1d5db',
    accent: isDark ? '#22c55e' : '#dcfce7',
  },

  // Green theme colors (consistent across themes)
  green: {
    primary: '#16a34a',
    light: isDark ? '#22c55e' : '#16a34a',
    bg: isDark ? '#0d2818' : '#f0fdf4',
    border: isDark ? '#22c55e' : '#bbf7d0',
  },

  // Shadow colors
  shadow: isDark
    ? '0 10px 25px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
});

// CSS custom properties for themes
export const themeStyles = `
  :root[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-tertiary: #ffffff;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-tertiary: #374151;
    --border-primary: #e5e7eb;
    --border-secondary: #d1d5db;
    --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  
  :root[data-theme="dark"] {
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #262626;
    --text-primary: #ffffff;
    --text-secondary: #e5e5e5;
    --text-tertiary: #a3a3a3;
    --border-primary: #404040;
    --border-secondary: #525252;
    --shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  }
`;
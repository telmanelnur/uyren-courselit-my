"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Theme } from '@workspace/page-models';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  updateThemeColors: (colors: any) => void;
  updateThemeTypography: (typography: any) => void;
}

const defaultTheme: Theme = {
  id: "default",
  name: "Default Theme",
  theme: {
    colors: {
      light: {
        background: "#ffffff",
        foreground: "#1a1a1a",
        card: "#ffffff",
        cardForeground: "#1a1a1a",
        popover: "#ffffff",
        popoverForeground: "#1a1a1a",
        primary: "#f1511b",
        primaryForeground: "#ffffff",
        secondary: "#4a4a4a",
        secondaryForeground: "#ffffff",
        muted: "#f5f5f5",
        mutedForeground: "#6b7280",
        accent: "#ececec",
        accentForeground: "#1a1a1a",
        destructive: "#ef4444",
        border: "#e5e7eb",
        input: "#ffffff",
        ring: "#f1511b",
        chart1: "#f1511b",
        chart2: "#4a4a4a",
        chart3: "#ececec",
        chart4: "#6b7280",
        chart5: "#9ca3af",
        sidebar: "#ffffff",
        sidebarForeground: "#1a1a1a",
        sidebarPrimary: "#f1511b",
        sidebarPrimaryForeground: "#ffffff",
        sidebarAccent: "#ececec",
        sidebarAccentForeground: "#1a1a1a",
        sidebarBorder: "#e5e7eb",
        sidebarRing: "#f1511b",
        shadow2xs: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
        shadowXs: "0px 1px 3px 0px rgba(0, 0, 0, 0.1)",
        shadowSm: "0px 1px 2px 0px rgba(0, 0, 0, 0.06)",
        shadowMd: "0px 4px 6px -1px rgba(0, 0, 0, 0.1)",
        shadowLg: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
        shadowXl: "0px 20px 25px -5px rgba(0, 0, 0, 0.1)",
        shadow2xl: "0px 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },
      dark: {
        background: "#1a1a1a",
        foreground: "#ffffff",
        card: "#2a2a2a",
        cardForeground: "#ffffff",
        popover: "#2a2a2a",
        popoverForeground: "#ffffff",
        primary: "#f1511b",
        primaryForeground: "#ffffff",
        secondary: "#9ca3af",
        secondaryForeground: "#ffffff",
        muted: "#374151",
        mutedForeground: "#9ca3af",
        accent: "#374151",
        accentForeground: "#ffffff",
        destructive: "#ef4444",
        border: "#374151",
        input: "#374151",
        ring: "#f1511b",
        chart1: "#f1511b",
        chart2: "#9ca3af",
        chart3: "#374151",
        chart4: "#6b7280",
        chart5: "#4b5563",
        sidebar: "#1a1a1a",
        sidebarForeground: "#ffffff",
        sidebarPrimary: "#f1511b",
        sidebarPrimaryForeground: "#ffffff",
        sidebarAccent: "#374151",
        sidebarAccentForeground: "#ffffff",
        sidebarBorder: "#374151",
        sidebarRing: "#f1511b",
        shadow2xs: "0px 1px 2px 0px rgba(0, 0, 0, 0.3)",
        shadowXs: "0px 1px 3px 0px rgba(0, 0, 0, 0.4)",
        shadowSm: "0px 1px 2px 0px rgba(0, 0, 0, 0.4)",
        shadowMd: "0px 4px 6px -1px rgba(0, 0, 0, 0.4)",
        shadowLg: "0px 10px 15px -3px rgba(0, 0, 0, 0.4)",
        shadowXl: "0px 20px 25px -5px rgba(0, 0, 0, 0.4)",
        shadow2xl: "0px 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }
    },
    typography: {
      preheader: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "12px",
        fontWeight: "400"
      },
      header1: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "48px",
        fontWeight: "700"
      },
      header2: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "42px",
        fontWeight: "700"
      },
      header3: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "32px",
        fontWeight: "600"
      },
      header4: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "24px",
        fontWeight: "600"
      },
      subheader1: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "20px",
        fontWeight: "500"
      },
      subheader2: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "18px",
        fontWeight: "500"
      },
      text1: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "16px",
        fontWeight: "400"
      },
      text2: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "14px",
        fontWeight: "400"
      },
      link: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "16px",
        fontWeight: "500"
      },
      button: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "16px",
        fontWeight: "600"
      },
      input: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "16px",
        fontWeight: "400"
      },
      caption: {
        fontFamily: "Montserrat, sans-serif",
        fontSize: "12px",
        fontWeight: "400"
      }
    },
    interactives: {
      button: {},
      link: {},
      card: {},
      input: {}
    },
    structure: {
      page: {
        width: "max-w-6xl"
      },
      section: {
        padding: {
          x: "px-4",
          y: "py-16"
        }
      }
    }
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = defaultTheme 
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateThemeColors = (colors: any) => {
    setTheme(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: { ...prev.theme.colors, ...colors }
      }
    }));
  };

  const updateThemeTypography = (typography: any) => {
    setTheme(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        typography: { ...prev.theme.typography, ...typography }
      }
    }));
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    updateThemeColors,
    updateThemeTypography
  };

  return (
    <ThemeContext.Provider value={value}>
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

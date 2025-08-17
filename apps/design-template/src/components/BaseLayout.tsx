"use client";

import React, { ReactNode } from 'react';
import { useSiteInfo } from './SiteInfoProvider';
import { useTheme } from './ThemeProvider';
import Header from './Header';
import Footer from './Footer';
import { ThemeEditor } from './ThemeEditor';

interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showThemeEditor?: boolean;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  title,
  description,
  showThemeEditor = false
}) => {
  const { siteInfo } = useSiteInfo();
  const { theme, isDarkMode } = useTheme();

  const pageTitle = title || siteInfo.title;
  const pageDescription = description || siteInfo.subtitle;

  // Get current color scheme
  const currentColors = isDarkMode ? theme.theme.colors.dark : theme.theme.colors.light;
  const currentTypography = theme.theme.typography.text1;

  // Generate dynamic CSS variables from theme
  const themeStyles = `
    :root {
      --color-primary: ${currentColors.primary};
      --color-secondary: ${currentColors.secondary};
      --color-background: ${currentColors.background};
      --color-text: ${currentColors.foreground};
      --color-accent: ${currentColors.accent};
      --color-card: ${currentColors.card};
      --color-border: ${currentColors.border};
      --font-family: ${currentTypography.fontFamily};
      --font-size-base: ${currentTypography.fontSize};
      --font-weight-normal: ${currentTypography.fontWeight};
    }
    
    .dark {
      --color-background: ${theme.theme.colors.dark.background};
      --color-text: ${theme.theme.colors.dark.foreground};
      --color-accent: ${theme.theme.colors.dark.accent};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div 
          className="min-h-screen bg-background text-text"
          style={{
            backgroundColor: currentColors.background,
            color: currentColors.foreground,
            fontFamily: currentTypography.fontFamily
          }}
        >
          <Header onThemeEditorToggle={() => {}} />
          
          <main className="flex-1">
            {children}
          </main>
          
          <Footer />
          
          {showThemeEditor && <ThemeEditor onClose={() => {}} />}
        </div>
      </div>
    </>
  );
};

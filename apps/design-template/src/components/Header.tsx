import Link from 'next/link';
import { useSiteInfo } from './SiteInfoProvider';
import { useTheme } from './ThemeProvider';
import { Palette, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onThemeEditorToggle?: () => void;
}

export default function Header({ onThemeEditorToggle }: HeaderProps) {
  const { siteInfo } = useSiteInfo();
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current color scheme
  const currentColors = isDarkMode ? theme.theme.colors.dark : theme.theme.colors.light;

  return (
    <header 
      className="w-full shadow-sm transition-colors duration-200"
      style={{
        backgroundColor: currentColors.background,
        borderBottom: `1px solid ${currentColors.border}`
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="text-2xl font-bold transition-colors duration-200 hover:opacity-80"
            style={{ color: currentColors.primary }}
          >
            {siteInfo.logo?.file ? (
              <img 
                src={siteInfo.logo.file} 
                alt={siteInfo.logo.caption || siteInfo.title} 
                className="h-8 w-auto mr-2"
              />
            ) : null}
            {siteInfo.title}
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/courses" 
            className="transition-colors duration-200 hover:opacity-80"
            style={{ color: currentColors.secondary }}
          >
            Courses
          </Link>
          <Link 
            href="/about" 
            className="transition-colors duration-200 hover:opacity-80"
            style={{ color: currentColors.secondary }}
          >
            About
          </Link>
          <Link 
            href="/contact" 
            className="transition-colors duration-200 hover:opacity-80"
            style={{ color: currentColors.secondary }}
          >
            Contact
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10"
            style={{ 
              backgroundColor: isDarkMode ? `${currentColors.accent}20` : `${currentColors.accent}10`,
              color: currentColors.secondary
            }}
            title="Toggle dark mode"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10"
            style={{ 
              backgroundColor: `${currentColors.accent}10`,
              color: currentColors.secondary
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="transition-colors duration-200 hover:opacity-80"
              style={{ color: currentColors.secondary }}
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: currentColors.primary,
                color: currentColors.primaryForeground
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden border-t transition-colors duration-200"
          style={{ borderColor: currentColors.border }}
        >
          <div className="px-4 py-4 space-y-4">
            <Link 
              href="/courses" 
              className="block transition-colors duration-200 hover:opacity-80"
              style={{ color: currentColors.secondary }}
            >
              Courses
            </Link>
            <Link 
              href="/about" 
              className="block transition-colors duration-200 hover:opacity-80"
              style={{ color: currentColors.secondary }}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block transition-colors duration-200 hover:opacity-80"
              style={{ color: currentColors.secondary }}
            >
              Contact
            </Link>
            <div className="pt-4 border-t" style={{ borderColor: currentColors.border }}>
              <Link 
                href="/login" 
                className="block mb-2 transition-colors duration-200 hover:opacity-80"
                style={{ color: currentColors.secondary }}
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="block px-6 py-2 rounded-full font-semibold text-center transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: currentColors.primary,
                  color: currentColors.primaryForeground
                }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

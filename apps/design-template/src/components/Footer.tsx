import Link from 'next/link';
import { useSiteInfo } from './SiteInfoProvider';
import { useTheme } from './ThemeProvider';

export default function Footer() {
  const { siteInfo } = useSiteInfo();
  const { theme, isDarkMode } = useTheme();

  // Get current color scheme
  const currentColors = isDarkMode ? theme.theme.colors.dark : theme.theme.colors.light;

  return (
    <footer 
      className="w-full transition-colors duration-200"
      style={{
        backgroundColor: currentColors.accent,
        borderTop: `1px solid ${currentColors.border}`
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              {siteInfo.logo?.file && (
                <img 
                  src={siteInfo.logo.file} 
                  alt={siteInfo.logo.caption || siteInfo.title} 
                  className="h-8 w-auto mr-3"
                />
              )}
              <h3 
                className="text-xl font-bold"
                style={{ color: currentColors.primary }}
              >
                {siteInfo.title}
              </h3>
            </div>
            <p 
              className="text-base mb-4 max-w-md"
              style={{ color: currentColors.secondary }}
            >
              {siteInfo.subtitle}
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10"
                style={{ 
                  backgroundColor: `${currentColors.primary}10`,
                  color: currentColors.primary
                }}
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10"
                style={{ 
                  backgroundColor: `${currentColors.primary}10`,
                  color: currentColors.primary
                }}
                title="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-10"
                style={{ 
                  backgroundColor: `${currentColors.primary}10`,
                  color: currentColors.primary
                }}
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 
              className="text-lg font-semibold mb-4"
              style={{ color: currentColors.foreground }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/courses" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 
              className="text-lg font-semibold mb-4"
              style={{ color: currentColors.foreground }}
            >
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/help" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="transition-colors duration-200 hover:opacity-80"
                  style={{ color: currentColors.secondary }}
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="border-t mt-8 pt-8 text-center"
          style={{ borderColor: currentColors.border }}
        >
          <p 
            className="text-sm"
            style={{ color: currentColors.secondary }}
          >
            © {new Date().getFullYear()} {siteInfo.title}. All rights reserved.
          </p>
          {siteInfo.mailingAddress && (
            <p 
              className="text-sm mt-2"
              style={{ color: currentColors.secondary }}
            >
              {siteInfo.mailingAddress}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

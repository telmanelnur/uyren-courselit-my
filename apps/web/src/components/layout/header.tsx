"use client";

import { useSiteInfo } from "@/components/contexts/site-info-context";
import { useTheme } from "@/components/contexts/theme-context";
import { useProfile } from "@/components/contexts/profile-context";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, LogOut, Settings, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@workspace/page-primitives";
import ThemeToggle from "./theme-toggle";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "@workspace/components-library";

export default function Header() {
  const { siteInfo } = useSiteInfo();
  const { theme } = useTheme();
  const { profile } = useProfile();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Blog", href: "/blog" },
  ];

  // Handle click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out error",
        description: "There was an issue signing out. Please try again.",
        variant: "destructive",
      });
    }
    setUserMenuOpen(false);
  };

  const isAuthenticated = status === "authenticated" && session?.user;

  return (
    <header className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {siteInfo?.logo?.file ? (
                <Image
                  src={siteInfo.logo.file}
                  alt={siteInfo.logo.caption || siteInfo.title || "Logo"}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {siteInfo?.title?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold text-foreground">
                {siteInfo?.title || "Uyren Academy"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-brand-primary font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md text-muted-foreground hover:text-brand-primary hover:bg-accent transition-colors duration-200"
                >
                  {profile?.avatar?.file ? (
                    <Image
                      src={profile.avatar.file}
                      alt={profile.name || "User Avatar"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-brand-primary" />
                  )}
                  <span className="font-medium text-foreground">
                    {profile?.name || session?.user?.name || "User"}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-brand-primary hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-red-500 hover:bg-accent"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  theme={theme.theme}
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {!isAuthenticated && (
              <Link href="/courses">
                <Button
                  theme={theme.theme}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-brand-primary hover:bg-accent"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-brand-primary font-medium transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 border-b border-border">
                      <div className="flex items-center space-x-2">
                        {profile?.avatar?.file ? (
                          <Image
                            src={profile.avatar.file}
                            alt={profile.name || "User Avatar"}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-8 h-8 text-brand-primary" />
                        )}
                        <span className="font-medium text-foreground">
                          {profile?.name || session?.user?.name || "User"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        theme={theme.theme}
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      theme={theme.theme}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      theme={theme.theme}
                      className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link
                    href="/courses"
                    className="block w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      theme={theme.theme}
                      className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white"
                    >
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

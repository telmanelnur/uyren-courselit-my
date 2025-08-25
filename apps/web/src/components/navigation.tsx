"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/layout/theme-toggle"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setIsNavigating(false)
  }, [pathname])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Grants", href: "/grants" },
    { name: "Community", href: "/community" },
    { name: "Sponsorship", href: "/sponsorship" },
  ]

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (href === pathname) return

    // Show loading bar
    setIsNavigating(true)

    // Create loading bar element
    const loadingBar = document.createElement("div")
    loadingBar.className = "nav-loading"
    document.body.appendChild(loadingBar)

    // Navigate after short delay
    setTimeout(() => {
      router.push(href)
      // Remove loading bar after animation
      setTimeout(() => {
        if (document.body.contains(loadingBar)) {
          document.body.removeChild(loadingBar)
        }
      }, 800)
    }, 50)
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 group transition-all duration-300"
            onClick={(e) => handleNavigation("/", e)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-hover rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">UyrenAI</div>
              <div className="text-xs text-brand-primary">AI-Powered Learning</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={cn(
                    "relative py-2 px-1 text-gray-700 transition-all duration-300 hover:text-brand-primary group",
                    isActive ? "font-bold text-brand-primary" : "font-medium",
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary transform transition-transform duration-300" />
                  )}
                  {!isActive && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transform transition-all duration-300 group-hover:w-full" />
                  )}
                </Link>
              )
            })}

            <ThemeToggle />

            <Link href="/register" onClick={(e) => handleNavigation("/register", e)}>
              <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="h-6 w-6 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="h-6 w-6 transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden border-t overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col space-y-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={cn(
                    "block py-2 px-2 transition-all duration-200 rounded-md",
                    isActive
                      ? "text-brand-primary font-bold bg-orange-50 border-l-4 border-brand-primary pl-4"
                      : "text-gray-700 hover:text-brand-primary hover:bg-orange-50/50 font-medium",
                  )}
                >
                  {item.name}
                </Link>
              )
            })}

            <div className="flex items-center justify-between py-2 px-2">
              <span className="text-gray-700 font-medium">Theme</span>
              <ThemeToggle />
            </div>

            <Link href="/register" onClick={(e) => handleNavigation("/register", e)}>
              <Button className="w-full mt-4 bg-brand-primary hover:bg-brand-primary-hover text-white py-2 rounded-lg font-medium transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

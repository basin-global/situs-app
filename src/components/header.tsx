'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { useOG } from '@/contexts/og-context'
import { OGChooser } from './og-chooser'
import { Navigation } from './navigation'  // Import the new Navigation component

export default function Header() {
  const { login, authenticated, user, logout } = usePrivy()
  const { currentOG } = useOG()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isHomePage = pathname === '/'
  const isProfilePage = pathname.startsWith('/profile')
  const isOGPage = !isHomePage && !isProfilePage

  const logoSrc = isOGPage && currentOG
    ? `/ogs/orbs/${currentOG.og_name.replace(/^\./, '')}-orb.png`
    : "/assets/logos/situs-circle.png"

  const logoLink = isOGPage && currentOG
    ? `/${currentOG.og_name.replace(/^\./, '')}`
    : "/"

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  const shouldShowOGChooserAndNavigation = !isHomePage && !isProfilePage

  return (
    <header className="bg-gradient-to-r from-secondary to-primary text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Left side: Logo and OGChooser */}
          <div className="flex items-center space-x-4">
            <Link href={logoLink} className="flex items-center">
              <Image 
                src={logoSrc}
                alt={isOGPage && currentOG ? `${currentOG.og_name} OG` : "Situs Protocol"}
                width={60}
                height={60}
                priority={true}
                style={{ width: 'auto', height: 'auto' }}
              />
              {(isHomePage || isProfilePage) && (
                <div className="ml-4">
                  <Image 
                    src="/assets/logos/situs-logo-text.png"
                    alt="Situs Protocol"
                    width={200}
                    height={50}
                    priority={true}
                    style={{ width: 'auto', height: 'auto' }}
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/assets/logos/fallback-logo.png';
                    }}
                  />
                </div>
              )}
            </Link>
            {shouldShowOGChooserAndNavigation && (
              <div className="w-auto">
                <OGChooser />
              </div>
            )}
          </div>
          
          {/* Right side: Navigation, Login button or user info */}
          <div className="flex items-center space-x-6">
            {shouldShowOGChooserAndNavigation && <Navigation />}
            {!authenticated ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => login()}
                className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 text-lg"
              >
                Login
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                  {truncateAddress(user?.wallet?.address || '')}
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="text-lg font-medium hover:text-gray-200 transition-colors duration-300"
                  >
                    <ChevronDown size={20} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#111] ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                          onClick={() => {
                            logout()
                            setIsDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-base text-white hover:bg-gray-800"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isHomePage && !authenticated && (
        <div className="container mx-auto px-4 mt-20 mb-28 text-center">
          <p className="text-4xl font-bold mb-8 text-yellow-300 animate-pulse">
            reduce risk, ensure resilience
          </p>
          <h1 className="text-6xl font-extrabold mb-16 leading-tight max-w-5xl mx-auto">
            Tools to help you care for the places you love.
          </h1>
          <Button 
            size="lg" 
            onClick={() => login()}
            className="bg-white text-primary hover:bg-yellow-300 hover:text-primary transition-colors duration-300 text-xl px-10 py-4 rounded-full shadow-xl"
          >
            Get Started
          </Button>
        </div>
      )}
    </header>
  )
}
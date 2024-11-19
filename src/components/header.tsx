'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { useOG } from '@/contexts/og-context'
import { OGChooser } from './og-chooser'
import { Navigation } from './navigation'
import { ConnectedAccount } from './ConnectedAccount'

// Utility function to truncate addresses
const truncateAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Header() {
  const { authenticated, login } = usePrivy()
  const { currentOG } = useOG()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add check for metadata route
  const isMetadataRoute = pathname.startsWith('/metadata/')
  if (isMetadataRoute) return null;

  const isHomePage = pathname === '/'
  const isProfilePage = pathname.startsWith('/profile')
  const isAdminPage = pathname.startsWith('/manage')
  const isMemberPage = pathname.startsWith('/member')
  const isAssetsPage = pathname.startsWith('/assets')
  const isFlowPage = pathname.startsWith('/flow')
  const isToolsPage = pathname.startsWith('/tools')

  const isOGPage = !isHomePage && !isProfilePage && !isAdminPage && !isMemberPage && !isAssetsPage && !isFlowPage && !isToolsPage

  const logoSrc = isOGPage && currentOG
    ? `/ogs/orbs/${currentOG.og_name.replace(/^\./, '')}-orb.png`
    : "/assets/logos/situs-circle.png"

  const logoLink = isOGPage && currentOG
    ? `/${currentOG.og_name.replace(/^\./, '')}`
    : "/"

  const shouldShowOGChooserAndNavigation = !isHomePage && !isProfilePage && !isAdminPage && !isMemberPage && !isAssetsPage && !isFlowPage && !isToolsPage

  return (
    <header className={`bg-gradient-to-r from-secondary to-primary text-white shadow-lg relative z-[40] py-3`}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mobile-header-container flex justify-between items-center relative">
            {/* Left side: Logo(s) and OGChooser */}
            <div className="flex items-center gap-4 flex-shrink-0 z-[30]">
              <Link href={logoLink} className="flex items-center gap-2">
                <Image 
                  src={logoSrc}
                  alt={isOGPage && currentOG ? `${currentOG.og_name} OG` : "Situs Protocol"}
                  width={isOGPage ? 35 : 45}
                  height={isOGPage ? 35 : 45}
                  priority={true}
                  className="object-contain"
                />
                {!isOGPage && (
                  <Image
                    src={authenticated ? "/assets/logos/situs-txt-auth.png" : "/assets/logos/situs-logo-text.png"}
                    alt="Situs"
                    width={150}
                    height={45}
                    priority={true}
                    className="object-contain"
                  />
                )}
              </Link>
              {shouldShowOGChooserAndNavigation && (
                <div className="w-auto scale-75 md:scale-100 origin-left flex-shrink-0">
                  <OGChooser />
                </div>
              )}
            </div>
            
            {/* Right side with navigation and user menu */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 z-[100]">
              {shouldShowOGChooserAndNavigation && (
                <>
                  {/* Mobile menu button */}
                  <div className="md:hidden -ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="text-white p-1"
                    >
                      <Menu size={20} />
                    </Button>
                  </div>
                  {/* Desktop navigation */}
                  <div className="hidden md:block">
                    <Navigation />
                  </div>
                </>
              )}
              
              {/* User menu */}
              <div className="relative z-[50]">
                <ConnectedAccount />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && shouldShowOGChooserAndNavigation && (
        <div className="md:hidden absolute left-0 right-0 top-full bg-primary shadow-lg z-[40] px-4 py-2">
          <div className="max-w-5xl mx-auto">
            <Navigation />
          </div>
        </div>
      )}

      {/* Hero section */}
      {isHomePage && !authenticated && (
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto mt-20 mb-28 text-center">
            <p className="text-4xl font-bold mb-8 text-yellow-300 animate-pulse">
              reduce risk, ensure resilience
            </p>
            <h1 className="text-6xl font-extrabold mb-16 leading-tight max-w-5xl mx-auto">
              Tools to help you care for the places you love.
            </h1>
            <Button 
              size="lg" 
              onClick={login}
              className="bg-white text-primary hover:bg-yellow-300 hover:text-primary transition-colors duration-300 text-xl px-10 py-4 rounded-full shadow-xl"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

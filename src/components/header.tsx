'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, Wallet, User, LogOut, Settings, UserCircle } from 'lucide-react'
import { useOG } from '@/contexts/og-context'
import { OGChooser } from './og-chooser'
import { Navigation } from './navigation'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/utils/adminUtils'
import { fetchENSName } from '@/lib/simplehash'

// Utility function to truncate addresses
const truncateAddress = (address: string) => {
  if (address.length <= 10) return address; // Return as is if it's already short
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Header() {
  const { login, authenticated, logout, user } = usePrivy()
  const { wallets } = useWallets()
  const { currentOG } = useOG()
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [ensName, setEnsName] = useState<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isUserAdmin, setIsUserAdmin] = useState(false)

  const isHomePage = pathname === '/'
  const isProfilePage = pathname.startsWith('/profile')
  const isAdminPage = pathname.startsWith('/manage')
  const isMemberPage = pathname.startsWith('/member')
  const isAssetsPage = pathname.startsWith('/assets')
  const isOGPage = !isHomePage && !isProfilePage && !isAdminPage && !isMemberPage && !isAssetsPage

  const logoSrc = isOGPage && currentOG
    ? `/ogs/orbs/${currentOG.og_name.replace(/^\./, '')}-orb.png`
    : "/assets/logos/situs-circle.png"

  const logoLink = isOGPage && currentOG
    ? `/${currentOG.og_name.replace(/^\./, '')}`
    : "/"

  const shouldShowOGChooserAndNavigation = !isHomePage && !isProfilePage && !isAdminPage && !isMemberPage && !isAssetsPage

  useEffect(() => {
    const fetchEnsName = async () => {
      if (wallets.length > 0) {
        try {
          console.log('Header - Fetching ENS for wallet:', wallets[0].address);
          const response = await fetch(`/api/simplehash/ens?address=${wallets[0].address}`);
          console.log('Header - ENS API response:', await response.clone().json());
          const data = await response.json();
          console.log('Header - Setting ENS name:', data.name);
          setEnsName(data.name);
        } catch (error) {
          console.error('Header - Error fetching ENS name:', error);
        }
      }
    };

    fetchEnsName();
  }, [wallets]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check if the user is an admin when wallets change
    if (wallets.length > 0) {
      setIsUserAdmin(isAdmin(wallets[0].address))
    }
  }, [wallets]);

  const handleMyAccountClick = () => {
    if (user?.wallet?.address) {
      router.push(`/member/${user.wallet.address}`);
      setIsUserMenuOpen(false);
    } else {
      toast.error('Wallet address not available');
    }
  };

  return (
    <header className={`bg-gradient-to-r from-secondary to-primary text-white shadow-lg relative z-50 ${
      isHomePage && !authenticated ? 'py-6' : 'py-3'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Left side: Logo and OGChooser */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link href={logoLink} className="flex items-center">
              <Image 
                src={logoSrc}
                alt={isOGPage && currentOG ? `${currentOG.og_name} OG` : "Situs Protocol"}
                width={isOGPage || authenticated ? 45 : 60}
                height={isOGPage || authenticated ? 45 : 60}
                priority={true}
                className="object-contain"
              />
              {(isHomePage || isProfilePage || isAdminPage || isMemberPage || isAssetsPage) && (
                <div className="ml-4">
                  <Image 
                    src="/assets/logos/situs-logo-text.png"
                    alt="Situs Protocol"
                    width={authenticated ? 150 : 200}
                    height={authenticated ? 38 : 50}
                    priority={true}
                    className="object-contain"
                  />
                </div>
              )}
            </Link>
            {shouldShowOGChooserAndNavigation && (
              <div className="w-auto scale-90 origin-left flex-shrink-0">
                <OGChooser />
              </div>
            )}
          </div>
          
          {/* Right side: Navigation and User Menu */}
          <div className="flex items-center space-x-6 flex-shrink-0">
            {shouldShowOGChooserAndNavigation && <Navigation />}
            {!authenticated ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={login}
                className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 text-lg"
              >
                Login
              </Button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors duration-300"
                >
                  <span className="text-base font-medium">
                    {ensName || (wallets.length > 0 ? truncateAddress(wallets[0].address) : 'No wallet connected')}
                  </span>
                  <ChevronDown size={20} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-[#111] ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <div className="flex flex-col w-full text-left px-4 py-3 text-base text-gray-300">
                        {ensName && <span className="text-sm text-gray-400 mb-1">{ensName}</span>}
                        {wallets.length > 0 && truncateAddress(wallets[0].address)}
                      </div>
                      <button
                        onClick={handleMyAccountClick}
                        className="flex items-center w-full text-left px-4 py-3 text-base text-gray-300 hover:bg-gray-800"
                        role="menuitem"
                      >
                        <UserCircle size={18} className="mr-3" />
                        My Account
                      </button>
                      <button
                        onClick={() => {
                          router.push('/member/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-base text-gray-300 hover:bg-gray-800"
                        role="menuitem"
                      >
                        <User size={18} className="mr-3" />
                        Profile
                      </button>
                      {isUserAdmin && (
                        <button
                          onClick={() => {
                            router.push('/manage');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-base text-gray-300 hover:bg-gray-800"
                          role="menuitem"
                        >
                          <Settings size={18} className="mr-3" />
                          Admin
                        </button>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-3 text-base text-gray-300 hover:bg-gray-800"
                        role="menuitem"
                      >
                        <LogOut size={18} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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

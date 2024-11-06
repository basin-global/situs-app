'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { ChevronDown, LogOut, Settings, User, UserCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/utils/adminUtils'

// Utility function to truncate addresses
const truncateAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function ConnectedAccount() {
  const { login, authenticated, logout, user } = usePrivy()
  const { wallets } = useWallets()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [ensName, setEnsName] = useState<string | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isUserAdmin, setIsUserAdmin] = useState(false)

  useEffect(() => {
    const fetchEnsName = async () => {
      if (wallets.length > 0) {
        try {
          const response = await fetch(`/api/simplehash/ens?address=${wallets[0].address}`);
          const data = await response.json();
          setEnsName(data.name);
        } catch (error) {
          console.error('Error fetching ENS name:', error);
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

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Menu toggle clicked, current state:', !isUserMenuOpen);
    setIsUserMenuOpen(prev => !prev);
  };

  useEffect(() => {
    console.log('Menu open state changed:', isUserMenuOpen);
  }, [isUserMenuOpen]);

  useEffect(() => {
    console.log('ConnectedAccount render:', {
      isUserMenuOpen,
      authenticated,
      hasWallet: wallets.length > 0,
      ensName,
      isUserAdmin
    });
  }, [isUserMenuOpen, authenticated, wallets, ensName, isUserAdmin]);

  if (!authenticated) {
    return (
      <Button 
        variant="outline" 
        size="lg"
        onClick={login}
        className="bg-white text-primary hover:bg-primary hover:text-white transition-colors duration-300 text-lg"
      >
        Login
      </Button>
    )
  }

  return (
    <div className="relative -mr-2 md:mr-0" ref={userMenuRef}>
      <button
        onClick={handleMenuToggle}
        className="flex items-center space-x-2 bg-white/10 px-2 md:px-4 py-2 rounded-full hover:bg-white/20 transition-colors duration-300 cursor-pointer"
        style={{ 
          minHeight: '42px',
        }}
      >
        <span className="text-sm md:text-base font-medium truncate max-w-[80px] md:max-w-[120px]">
          {ensName || (wallets.length > 0 ? truncateAddress(wallets[0].address) : 'No wallet connected')}
        </span>
        <ChevronDown 
          size={18}
          className={`transition-transform duration-200 flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-[100]"
          onClick={() => setIsUserMenuOpen(false)}
        >
          <div 
            className="absolute right-2 md:right-0 w-[calc(100%-1rem)] md:w-64 bg-[#111] rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1"
            style={{
              top: '60px',
              zIndex: 101,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
              {ensName && <div className="font-medium">{ensName}</div>}
              <div className="truncate">
                {wallets.length > 0 && truncateAddress(wallets[0].address)}
              </div>
            </div>

            <button
              onClick={handleMyAccountClick}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <UserCircle className="mr-3 h-5 w-5" />
              My Account
            </button>

            <button
              onClick={() => {
                router.push('/member/profile');
                setIsUserMenuOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </button>

            {isUserAdmin && (
              <button
                onClick={() => {
                  router.push('/manage');
                  setIsUserMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                <Settings className="mr-3 h-5 w-5" />
                Admin
              </button>
            )}

            <button
              onClick={() => {
                logout();
                setIsUserMenuOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
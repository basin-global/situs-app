'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { OgAccount } from '@/types';
import MyAccounts from '@/components/MyAccounts';
import { useOG } from '@/contexts/og-context';
import { AssetSearch } from '@/modules/assets/AssetSearch';

interface SimpleHashNFT {
  token_id: string;
  name: string;
  collection?: {
    name?: string;
  };
  contract_address?: string;
}

interface SimpleHashResponse {
  nfts: SimpleHashNFT[];
}

interface OG {
  contract_address: string;
  og_name: string;
}

export default function ProfilePage() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const { OGs } = useOG();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimpleHashLoaded, setIsSimpleHashLoaded] = useState(false);

  // Listen for SimpleHash data load
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      // First, wait for SimpleHash data
      const checkSimpleHash = async () => {
        try {
          const contractAddresses = OGs?.map(og => og.contract_address).join(',');
          const walletAddress = user?.wallet?.address;
          if (!walletAddress) return;
          
          const response = await fetch(`/api/simplehash/accounts?address=${walletAddress}&contractAddress=${contractAddresses}`);
          const data = await response.json();
          if (data.nfts) {
            // Once SimpleHash data is loaded, set the state
            setIsSimpleHashLoaded(true);
          }
        } catch (error) {
          console.error('Error checking SimpleHash:', error);
        }
      };

      checkSimpleHash();
    }
  }, [authenticated, user?.wallet?.address, OGs]);

  console.log('Profile Page - Initial Render:', {
    authenticated,
    hasUser: !!user,
    walletAddress: user?.wallet?.address,
    hasOGs: !!OGs,
    ogsCount: OGs?.length,
    OGs,
    isSimpleHashLoaded
  });

  if (!ready) {
    return <div>Loading Privy...</div>;
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">Please log in to view your profile.</p>
        <Button onClick={login}>Login</Button>
      </div>
    );
  }

  const truncateAddress = (address: string) => {
    if (!address || address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAccountInfo = (account: any) => {
    if (typeof account === 'object' && 'address' in account) {
      return truncateAddress(account.address);
    }
    return truncateAddress(account);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Navigation Links */}
      <div className="flex justify-center space-x-8 mb-12">
        <a href="#accounts" className="text-xl font-mono font-bold text-white hover:text-yellow-300 transition-colors">
          ACCOUNTS
        </a>
        <span className="text-white/30">|</span>
        <a href="#profile" className="text-xl font-mono font-bold text-white hover:text-yellow-300 transition-colors">
          PROFILE
        </a>
      </div>

      {/* Accounts Section */}
      <div id="accounts" className="mb-16 max-w-5xl mx-auto">
        <h2 className="text-4xl font-mono font-bold mb-8 text-white text-center">
          My Accounts
        </h2>
        
        <AssetSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search accounts..."
          className="mb-8"
          isAccountSearch={true}
        />

        {isSimpleHashLoaded ? (
          <MyAccounts searchQuery={searchQuery} />
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-400">Loading accounts...</p>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div id="profile" className="max-w-2xl mx-auto mt-12">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8">
          <h2 className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 text-center">
            My Profile
          </h2>
          
          {/* Member Account */}
          <div className="text-center">
            <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Member Account
            </label>
            <div className="group relative">
              <span className="text-xl font-medium text-gray-900 dark:text-gray-100">
                {truncateAddress(user?.wallet?.address || '')}
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="text-center">
            <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <p className="text-xl text-gray-900 dark:text-gray-100">
              {user?.email?.address || 'Not provided'}
            </p>
          </div>

          {/* Linked Accounts */}
          <div className="text-center">
            <label className="block text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Linked Accounts
            </label>
            <div className="space-y-2">
              {user?.linkedAccounts?.map((account, index) => (
                <p key={index} className="text-xl text-gray-900 dark:text-gray-100">
                  {getAccountInfo(account)}
                </p>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <Button
              onClick={logout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg rounded-lg transition duration-300"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

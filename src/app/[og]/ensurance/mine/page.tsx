'use client';

import { useOG } from '@/contexts/og-context';
import AssetsModule from '@/modules/assets';
import { ChainDropdown } from '@/components/ChainDropdown';
import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AssetSearch } from '@/modules/assets/AssetSearch';
import { SubNavigation } from '@/components/sub-navigation';

export default function MyEnsurancePage() {
  const { currentOG } = useOG();
  const [selectedChain, setSelectedChain] = useState('base');
  const { user, login } = usePrivy();
  const { wallets } = useWallets();
  const [searchQuery, setSearchQuery] = useState('');

  const connectedAddress = wallets?.[0]?.address;

  if (!currentOG) {
    return <div>Loading...</div>;
  }

  if (!user?.wallet?.address) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4 flex justify-center">
          <SubNavigation type="ensurance" />
        </div>
        
        <div className="text-center">
          <h2 className="text-5xl font-mono font-bold mb-8">
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
              My Certificates
            </span>
          </h2>
          
          <div className="p-8 rounded-lg bg-gray-100 dark:bg-gray-800 max-w-md mx-auto">
            <p className="text-lg mb-4">Please login to view your certificates</p>
            <button
              onClick={login}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="ensurance" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          My Certificates
        </span>
      </h2>
      
      <div className="relative mb-4">
        <div className="absolute right-0 top-0">
          <ChainDropdown
            selectedChain={selectedChain}
            onChange={setSelectedChain}
            filterEnsurance={true}
            className="h-[40px] px-4 py-2 rounded-md transition-all duration-200 text-gray-300 hover:bg-gray-800 text-base font-sans bg-transparent border-0"
          />
        </div>
        <div className="flex justify-center">
          <AssetSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search my certificates..."
            isAccountSearch={false}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="min-h-[200px]">
          {connectedAddress ? (
            <AssetsModule
              address={connectedAddress}
              selectedChain={selectedChain}
              isEnsuranceTab={true}
              isTokenbound={false}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Please connect your wallet to view your certificates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
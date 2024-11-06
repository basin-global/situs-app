'use client';

import { useOG } from '@/contexts/og-context';
import AssetsModule from '@/modules/assets';
import { ChainDropdown } from '@/components/ChainDropdown';
import { useState, useRef, useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AssetSearch } from '@/modules/assets/AssetSearch';
import { SubNavigation } from '@/components/sub-navigation';

export default function EnsurancePage() {
  const { currentOG } = useOG();
  const [selectedChain, setSelectedChain] = useState('base');
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [shouldLoadAssets, setShouldLoadAssets] = useState(false);
  const assetsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get the connected address
  const connectedAddress = useMemo(() => {
    const address = wallets?.[0]?.address || '';
    console.log('Ensurance Page - Connected Address:', address);
    return address;
  }, [wallets]);

  const isOwner = useMemo(() => {
    if (!authenticated || !user?.wallet?.address || !connectedAddress) return false;
    const result = user.wallet.address.toLowerCase() === connectedAddress.toLowerCase();
    console.log('Ensurance Page - Ownership check:', { result, userWallet: user.wallet.address, connectedAddress });
    return result;
  }, [authenticated, user?.wallet?.address, connectedAddress]);

  useEffect(() => {
    if (connectedAddress) {
      console.log('Ensurance Page - Setting shouldLoadAssets to true');
      setShouldLoadAssets(true);
    }
  }, [connectedAddress]);

  if (!currentOG) {
    console.log('Ensurance Page - No currentOG');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="ensurance" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          Certificates of Ensurance
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
            placeholder="Search certificates..."
            isAccountSearch={false}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="min-h-[200px]" ref={assetsRef}>
          {connectedAddress ? (
            <AssetsModule
              address={connectedAddress}
              selectedChain={selectedChain}
              isEnsuranceTab={true}
              isTokenbound={false}
              isOwner={isOwner}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Please connect your wallet to view ensurance certificates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
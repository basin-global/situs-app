'use client';

import { useOG } from '@/contexts/og-context';
import AssetsModule from '@/modules/assets';
import { ChainDropdown } from '@/components/ChainDropdown';
import { useState, useRef, useEffect, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

export default function EnsurancePage() {
  const { currentOG } = useOG();
  const [selectedChain, setSelectedChain] = useState('base');
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [shouldLoadAssets, setShouldLoadAssets] = useState(false);
  const assetsRef = useRef<HTMLDivElement>(null);

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

  // Set shouldLoadAssets to true immediately if we have an address
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

  console.log('Ensurance Page - Rendering with:', {
    authenticated,
    connectedAddress,
    shouldLoadAssets,
    selectedChain
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Certificates of Ensurance</h1>
        <ChainDropdown
          selectedChain={selectedChain}
          onChange={setSelectedChain}
          filterEnsurance={true}
        />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="min-h-[200px]" ref={assetsRef}>
          {connectedAddress ? (
            <AssetsModule
              address={connectedAddress}
              selectedChain={selectedChain}
              isEnsuranceTab={true}
              isTokenbound={false}
              isOwner={isOwner}
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
'use client';

import { useOG } from '@/contexts/og-context';
import { SubNavigation } from '@/components/sub-navigation';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import CurrencyModule from '@/modules/currency';
import { useState } from 'react';
import { ChainDropdown } from '@/components/ChainDropdown';

export default function MyCurrencyPage() {
  const { currentOG } = useOG();
  const { wallets } = useWallets();
  const { user, login } = usePrivy();
  const connectedAddress = wallets?.[0]?.address;
  const [selectedChain, setSelectedChain] = useState('base');

  if (!currentOG) {
    return <div>Loading...</div>;
  }

  if (!user?.wallet?.address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <SubNavigation type="currency" />
        </div>
        
        <div className="text-center">
          <h2 className="text-5xl font-mono font-bold mb-8">
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
              My Currencies
            </span>
          </h2>
          
          <div className="p-8 rounded-lg bg-gray-100 dark:bg-gray-800 max-w-md mx-auto">
            <p className="text-lg mb-4">Please login to view your currencies</p>
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
        <SubNavigation type="currency" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          My Currencies
        </span>
      </h2>

      <div className="relative mb-4">
        <div className="absolute right-0 top-4">
          <ChainDropdown
            selectedChain={selectedChain}
            onChange={setSelectedChain}
            className="h-[40px] px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 text-base font-sans bg-transparent border-0"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
        <div className="min-h-[200px]">
          {connectedAddress ? (
            <CurrencyModule 
              address={connectedAddress}
              selectedChain={selectedChain}
              isTokenbound={false}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Please connect your wallet to view your currencies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center">
        <p className="text-xl font-bold text-gray-400">Coming Soon</p>
        <p className="text-gray-500 text-sm">Currency features will be available in the next update</p>
      </div>
    </div>
  );
} 
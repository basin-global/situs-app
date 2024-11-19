'use client';

import { useOG } from '@/contexts/og-context';
import { SubNavigation } from '@/components/sub-navigation';
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { ChainDropdown } from '@/components/ChainDropdown';
import { AssetSearch } from '@/modules/assets/AssetSearch';

export default function SwapCurrencyPage() {
  const { currentOG } = useOG();
  const [selectedChain, setSelectedChain] = useState('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnsurance, setSelectedEnsurance] = useState<string | null>(null);
  const [convertAmount, setConvertAmount] = useState<string>('');

  // Placeholder conversion rate
  const conversionRate = 1000; // 1 Ensurance = 1000 ENSURE

  if (!currentOG) return null;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="currency" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          Swap Currencies
        </span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - UniSwap Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Token Swap</h3>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-2">UniSwap SDK integration coming soon...</p>
              <p className="text-sm text-gray-500">Swap any token on Base</p>
            </div>
          </div>
        </div>

        {/* Right Column - Ensurance Conversion */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Convert Ensurance to ENSURE</h3>
          
          {/* Chain and Search */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <ChainDropdown
                selectedChain={selectedChain}
                onChange={setSelectedChain}
                filterEnsurance={true}
                className="h-[40px] px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 text-base font-sans bg-gray-800 border-0"
              />
              <div className="flex-grow">
                <AssetSearch 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder="Search ensurance certificates..."
                />
              </div>
            </div>
          </div>

          {/* Conversion Form */}
          <div className="space-y-6">
            {/* Select Ensurance Asset */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Ensurance Certificate
              </label>
              <select 
                className="w-full bg-gray-700 border-gray-600 rounded-md px-4 py-2 text-gray-200"
                value={selectedEnsurance || ''}
                onChange={(e) => setSelectedEnsurance(e.target.value)}
              >
                <option value="">Select a certificate</option>
                <option value="1">Certificate #1</option>
                <option value="2">Certificate #2</option>
              </select>
            </div>

            {/* Conversion Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Conversion Rate
              </label>
              <div className="bg-gray-700 rounded-md px-4 py-2 text-gray-200">
                1 Ensurance = {conversionRate} ENSURE
              </div>
            </div>

            {/* Amount to Convert */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount to Convert
              </label>
              <input
                type="number"
                className="w-full bg-gray-700 border-gray-600 rounded-md px-4 py-2 text-gray-200"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            {/* You Receive */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                You Receive
              </label>
              <div className="bg-gray-700 rounded-md px-4 py-2 text-gray-200">
                {convertAmount ? Number(convertAmount) * conversionRate : 0} ENSURE
              </div>
            </div>

            {/* Convert Button */}
            <Button 
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
              disabled={!selectedEnsurance || !convertAmount}
            >
              Convert to ENSURE
            </Button>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center text-gray-400">
        <p>Currency swap features coming soon...</p>
      </div>
    </div>
  );
} 
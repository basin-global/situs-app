'use client';

import { useState } from 'react';
import { ChainDropdown } from '@/components/ChainDropdown';
import { AssetSearch } from '@/modules/assets/AssetSearch';
import { Button } from "@/components/ui/button";

export function ConvertModule() {
  const [selectedChain, setSelectedChain] = useState('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnsurance, setSelectedEnsurance] = useState<string | null>(null);
  const [convertAmount, setConvertAmount] = useState<string>('');

  // Placeholder conversion rate
  const conversionRate = 1000; // 1 Ensurance = 1000 ENSURE

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-2">Coming Soon</h3>
          <p className="text-gray-200 text-lg">
            Ensurance to $ENSURE conversion
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-200">Convert Ensurance</h3>
        <ChainDropdown
          selectedChain={selectedChain}
          onChange={setSelectedChain}
          filterEnsurance={true}
          className="h-[40px] px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 text-base font-sans bg-gray-800 border-0"
        />
      </div>

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
  );
} 
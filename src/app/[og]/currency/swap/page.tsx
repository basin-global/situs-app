'use client';

import { useOG } from '@/contexts/og-context';
import { SubNavigation } from '@/components/sub-navigation';
import { SwapModule } from '@/modules/currency/swap';
import { ConvertModule } from '@/modules/currency/convert';
import { useState } from 'react';

export default function SwapCurrencyPage() {
  const { currentOG } = useOG();
  const [activeModule, setActiveModule] = useState<'both' | 'swap' | 'convert'>('both');

  if (!currentOG) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center">
        <SubNavigation type="currency" />
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-mono font-bold mb-12 text-center">
          <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
            Swap & Convert
          </span>
        </h2>
        
        {activeModule === 'both' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div 
              className="group cursor-pointer transition-all duration-300 min-h-[400px]"
              onClick={() => setActiveModule('swap')}
            >
              <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl rounded-2xl h-full">
                <SwapModule />
              </div>
            </div>
            <div 
              className="group cursor-pointer transition-all duration-300 min-h-[400px]"
              onClick={() => setActiveModule('convert')}
            >
              <div className="transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl rounded-2xl h-full">
                <ConvertModule />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveModule('both')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors px-4 py-2 rounded-lg hover:bg-gray-800/50"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all options
            </button>

            <div className="w-full transition-all duration-500 ease-in-out transform min-h-[400px]">
              {activeModule === 'swap' ? <SwapModule /> : <ConvertModule />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
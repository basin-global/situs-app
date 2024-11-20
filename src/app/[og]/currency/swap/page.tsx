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
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="currency" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          Swap & Convert
        </span>
      </h2>
      
      {activeModule === 'both' ? (
        // Initial two-column view
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div 
            className="cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => setActiveModule('swap')}
          >
            <SwapModule />
          </div>
          <div 
            className="cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => setActiveModule('convert')}
          >
            <ConvertModule />
          </div>
        </div>
      ) : (
        // Focused view with module selection
        <div className="flex flex-col items-center gap-8">
          {/* Back button */}
          <button
            onClick={() => setActiveModule('both')}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to all options
          </button>

          {/* Active Module */}
          <div className="w-full max-w-2xl transition-all duration-300">
            {activeModule === 'swap' ? <SwapModule /> : <ConvertModule />}
          </div>
        </div>
      )}
    </div>
  );
} 
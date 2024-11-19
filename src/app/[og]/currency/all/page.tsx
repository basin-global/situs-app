'use client';

import { useOG } from '@/contexts/og-context';
import { SubNavigation } from '@/components/sub-navigation';
import { AssetSearch } from '@/modules/assets/AssetSearch';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { EnsureModal } from '@/modules/ensure/ensure-modal';

// Dummy currency data
const currencies = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    description: 'Native currency of the Ethereum network',
    image: '/assets/currencies/eth.png'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    description: 'Fully-reserved stablecoin pegged to USD',
    image: '/assets/currencies/usdc.png'
  },
  {
    id: 'ensure',
    name: 'Ensure',
    symbol: 'ENSURE',
    description: 'Native token of the Situs Protocol',
    image: '/assets/currencies/ensure.png'
  },
  {
    id: 'dai',
    name: 'Dai',
    symbol: 'DAI',
    description: 'Decentralized stablecoin pegged to USD',
    image: '/assets/currencies/dai.png'
  },
  {
    id: 'earth',
    name: 'Earth',
    symbol: 'EARTH',
    description: 'Carbon credit backed token',
    image: '/assets/currencies/earth.png'
  },
  {
    id: 'usdglo',
    name: 'USD GLO',
    symbol: 'USDGLO',
    description: 'Global stablecoin backed by real-world assets',
    image: '/assets/currencies/usdglo.png'
  },
  {
    id: 'char',
    name: 'Char',
    symbol: 'CHAR',
    description: 'Toucan Protocol carbon token on Base',
    image: '/assets/currencies/char.png'
  }
];

export default function AllCurrencyPage() {
  const { currentOG } = useOG();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnsureModal, setShowEnsureModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<any>(null);

  if (!currentOG) return null;

  const filteredCurrencies = currencies.filter(currency => 
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = (currency: any) => {
    setSelectedCurrency(currency);
    setShowEnsureModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="currency" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          Featured Currencies
        </span>
      </h2>

      <div className="mb-6 flex justify-center">
        <AssetSearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search currencies..."
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCurrencies.map(currency => (
          <div key={currency.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 relative">
                <Image
                  src={currency.image}
                  alt={currency.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-200">{currency.name}</h3>
                <p className="text-sm text-gray-400">{currency.symbol}</p>
              </div>
            </div>
            <p className="text-gray-500 mb-4 text-sm">{currency.description}</p>
            <Button
              onClick={() => handleBuy(currency)}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
            >
              Buy {currency.symbol}
            </Button>
          </div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 text-center text-gray-400">
        <p>Currency features coming soon...</p>
      </div>

      {/* Ensure Modal */}
      {showEnsureModal && selectedCurrency && (
        <EnsureModal
          isOpen={showEnsureModal}
          onClose={() => setShowEnsureModal(false)}
          operation="ensure"
          asset={{
            chain: 'base',
            contract_address: '0x...',
            token_id: '1',
            name: selectedCurrency.name
          }}
          isTokenbound={false}
        />
      )}
    </div>
  );
} 
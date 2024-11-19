'use client';

import CurrencyModule from '@/modules/currency';

interface MetadataCurrencyProps {
  address: string;
  selectedChain: string;
}

export default function MetadataCurrency({ address, selectedChain }: MetadataCurrencyProps) {
  return (
    <div className="p-4">
      <CurrencyModule
        address={address}
        selectedChain={selectedChain}
        isTokenbound={true}
        isOwner={false}
        searchQuery=""
        setSearchQuery={() => {}}
      />
    </div>
  );
} 
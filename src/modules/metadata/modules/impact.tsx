'use client';

import ImpactModule from '@/modules/impact';

interface MetadataImpactProps {
  address: string;
  selectedChain: string;
}

export default function MetadataImpact({ address, selectedChain }: MetadataImpactProps) {
  return (
    <div className="p-4">
      <ImpactModule
        address={address}
        selectedChain={selectedChain}
        isTokenbound={true}
        isOwner={false}
      />
    </div>
  );
} 
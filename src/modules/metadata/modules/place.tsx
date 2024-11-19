'use client';

import PlaceModule from '@/modules/place';

interface MetadataPlaceProps {
  address: string;
  selectedChain: string;
}

export default function MetadataPlace({ address, selectedChain }: MetadataPlaceProps) {
  return (
    <div className="p-4">
      <PlaceModule
        address={address}
        selectedChain={selectedChain}
        isTokenbound={true}
        isOwner={false}
      />
    </div>
  );
} 
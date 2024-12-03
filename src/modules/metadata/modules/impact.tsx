'use client';

interface MetadataImpactProps {
  address: string;
  selectedChain: string;
}

export default function MetadataImpact({ address, selectedChain }: MetadataImpactProps) {
  return (
    <div className="p-4">
      <div className="text-gray-400">Impact data coming soon</div>
    </div>
  );
} 
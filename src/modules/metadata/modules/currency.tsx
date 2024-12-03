'use client';

interface MetadataCurrencyProps {
  address: string;
  selectedChain: string;
}

export default function MetadataCurrency({ address, selectedChain }: MetadataCurrencyProps) {
  return (
    <div className="p-4">
      <div className="text-gray-400">Currency data coming soon</div>
    </div>
  );
} 
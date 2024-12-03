'use client';

interface MetadataReputationProps {
  address: string;
  selectedChain: string;
}

export default function MetadataReputation({ address, selectedChain }: MetadataReputationProps) {
  return (
    <div className="p-4">
      <div className="text-gray-400">Reputation data coming soon</div>
    </div>
  );
} 
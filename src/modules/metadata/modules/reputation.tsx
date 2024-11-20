'use client';

import ReputationModule from '@/modules/reputation';

interface MetadataReputationProps {
  address: string;
  selectedChain: string;
}

export default function MetadataReputation({ address, selectedChain }: MetadataReputationProps) {
  return (
    <div className="p-4">
      <ReputationModule />
    </div>
  );
} 
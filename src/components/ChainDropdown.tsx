import React from 'react';
import { getActiveChains, chainOrder } from '@/config/chains';
import { ensuranceContracts } from '@/modules/ensurance/config';

interface ChainDropdownProps {
  selectedChain: string;
  onChange: (chain: string) => void;
  filterEnsurance?: boolean;
  className?: string;
}

export function ChainDropdown({ 
  selectedChain, 
  onChange, 
  filterEnsurance,
  className = "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
}: ChainDropdownProps) {
  const chains = getActiveChains()
    .filter(chain => !filterEnsurance || chain.simplehashName in ensuranceContracts)
    .sort((a, b) => {
      // Use chainOrder for consistent ordering
      const aIndex = chainOrder.indexOf(a.simplehashName);
      const bIndex = chainOrder.indexOf(b.simplehashName);
      return aIndex - bIndex;
    });

  // Remove 'all' option from chainOptions
  const chainOptions = filterEnsurance
    ? Object.keys(ensuranceContracts)
    : chains.map(chain => chain.simplehashName);

  return (
    <select
      value={selectedChain}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {chainOptions.map((chainName) => (
        <option key={chainName} value={chainName}>
          {chains.find(c => c.simplehashName === chainName)?.name || chainName}
        </option>
      ))}
    </select>
  );
} 
import React from 'react';
import Image from 'next/image';
import { getActiveChains, chainOrder } from '@/config/chains';
import { ensuranceContracts } from '@/modules/ensurance/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  className = ""
}: ChainDropdownProps) {
  const chains = getActiveChains()
    .filter(chain => !filterEnsurance || chain.simplehashName in ensuranceContracts)
    .sort((a, b) => {
      const aIndex = chainOrder.indexOf(a.simplehashName);
      const bIndex = chainOrder.indexOf(b.simplehashName);
      return aIndex - bIndex;
    });

  const chainOptions = filterEnsurance
    ? Object.keys(ensuranceContracts)
    : chains.map(chain => chain.simplehashName);

  const getChainIconPath = (chainName: string) => {
    const svgPath = `/assets/icons/${chainName}.svg`;
    const pngPath = `/assets/icons/${chainName}.png`;
    return svgPath;
  };

  const ChainIcon = ({ chainName }: { chainName: string }) => (
    <Image
      src={getChainIconPath(chainName)}
      alt={`${chainName} icon`}
      width={16}
      height={16}
      className="object-contain mr-0 lg:mr-2 flex-shrink-0"
      onError={(e) => {
        const imgElement = e.target as HTMLImageElement;
        if (imgElement.src.endsWith('.svg')) {
          imgElement.src = imgElement.src.replace('.svg', '.png');
        }
      }}
    />
  );

  return (
    <Select onValueChange={onChange} value={selectedChain}>
      <SelectTrigger className={`${className} flex items-center gap-2 min-w-[40px] lg:min-w-[120px]`}>
        <SelectValue 
          placeholder="Select chain"
          className="flex items-center"
        >
          <div className="flex items-center">
            <ChainIcon chainName={selectedChain} />
            <span className="hidden lg:inline">
              {chains.find(c => c.simplehashName === selectedChain)?.name || selectedChain}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#111] border-gray-700 text-gray-200">
        {chainOptions.map((chainName) => {
          const chain = chains.find(c => c.simplehashName === chainName);
          return (
            <SelectItem 
              key={chainName} 
              value={chainName}
              className="flex items-center gap-2 hover:bg-gray-800 focus:bg-gray-800 cursor-pointer py-2"
            >
              <div className="flex items-center">
                <ChainIcon chainName={chainName} />
                <span className="hidden lg:inline">
                  {chain?.name || chainName}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
} 
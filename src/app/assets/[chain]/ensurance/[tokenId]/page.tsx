'use client';

import { useEffect } from 'react';
import { getEnsuranceContractForChain } from '@/modules/ensurance/config';
import AssetDetailPage from '../../[contract]/[tokenId]/page';

interface EnsurancePageProps {
  params: {
    chain: string;
    tokenId: string;
  };
}

export default function EnsurancePage({ params }: EnsurancePageProps) {
  // Get the contract address for this chain
  const contractAddress = getEnsuranceContractForChain(params.chain);

  // If we have a contract address, render the asset detail page with those params
  if (contractAddress) {
    return <AssetDetailPage params={{ 
      chain: params.chain, 
      contract: contractAddress, 
      tokenId: params.tokenId 
    }} />;
  }

  // Return empty div if no contract found
  return <div />;
}

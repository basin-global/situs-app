'use client';

import { useEffect, useState } from 'react';
import { FlowViewer } from '@/modules/splits/flows/FlowViewer';
import { useSplitMetadata } from '@0xsplits/splits-sdk-react';
import { base, zora, arbitrum, optimism } from 'viem/chains';

// Map chain names to chain IDs
const chainIdMap = {
  'base': base.id,
  'zora': zora.id,
  'arbitrum': arbitrum.id,
  'optimism': optimism.id
} as const;

type ChainName = keyof typeof chainIdMap;

export default function SplitFlowPage({ params }: { params: { chain: string; split: string } }) {
  const [error, setError] = useState<string | null>(null);

  // Get chain ID from params
  const chainId = chainIdMap[params.chain as ChainName];
  const { splitMetadata, error: splitError, isLoading } = useSplitMetadata(
    chainId || base.id,
    params.split as `0x${string}`
  );

  // Validate chain and address format
  useEffect(() => {
    if (!chainIdMap[params.chain as ChainName]) {
      setError('Invalid chain');
    } else if (!params.split.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid address format');
    } else {
      setError(null);
    }
  }, [params.chain, params.split]);

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Parameters</h2>
            <p className="text-gray-400">
              {error === 'Invalid chain' 
                ? `Chain "${params.chain}" is not supported. Please use: ${Object.keys(chainIdMap).join(', ')}`
                : 'The address provided is not in the correct format. Please provide a valid Ethereum address.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">Loading split data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (splitError || !splitMetadata) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Not a Split Contract</h2>
            <p className="text-gray-400">
              The address {params.split} is not a valid Split contract on {params.chain}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-200">Flow of Value</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-400 font-mono">{params.split}</p>
            <span className="text-gray-500">|</span>
            <p className="text-gray-400 capitalize">{params.chain}</p>
          </div>
        </div>

        <FlowViewer 
          address={params.split} 
          chainId={chainId}
        />
      </div>
    </div>
  );
} 
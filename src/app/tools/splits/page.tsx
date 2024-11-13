'use client';

import { useState, useEffect } from 'react';
import { useSplitMetadata } from '@0xsplits/splits-sdk-react';
import { getActiveChains } from '@/config/chains';
import { SplitsBar } from '@/modules/splits/components/SplitsBar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useRouter, useSearchParams } from 'next/navigation';

interface SplitMetadata {
  type: 'Split' | 'SplitV2';
  address: string;
  controller: {
    address: string;
    ens?: string;
  } | null;
  newPotentialController: {
    address: string;
    ens?: string;
  } | null;
  distributorFeePercent: number;
  distributionsPaused: boolean;
  distributeDirection: 'pull' | 'push';
  recipients: {
    percentAllocation: number;
    recipient: {
      address: string;
      ens?: string;
    };
  }[];
  createdBlock: number;
}

interface ChainResult {
  chain: string;
  chainId: number;
  split?: SplitMetadata;
  error?: string;
}

const bigIntSerializer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

export default function SplitsChecker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState(searchParams.get('address') || '');
  const [results, setResults] = useState<ChainResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const activeChains = getActiveChains();
  
  // Add more detailed logging for each chain's response
  const chainMetadata = activeChains.map(chain => {
    const { splitMetadata, isLoading, status, error: splitError } = useSplitMetadata(
      chain.id,
      address || ''
    );
    
    // Detailed logging of the response
    console.log(`Chain ${chain.name} (${chain.id}) response:`, {
      metadata: splitMetadata,
      error: splitError,
      status,
      isLoading,
      hasData: !!splitMetadata,
      errorType: splitError ? splitError.constructor.name : null,
      errorMessage: splitError?.message
    });
    
    return {
      chainId: chain.id,
      chainName: chain.name,
      splitMetadata,
      splitError,
      isLoading,
      status
    };
  });

  const isAnyLoading = chainMetadata.some(chain => chain.isLoading);

  const handleCheck = () => {
    setError(null);
    setResults([]);

    if (!address) {
      setError('Please enter a valid address.');
      return;
    }
    
    // Update URL with the address
    router.push(`/tools/splits?address=${address}`);
    
    const newResults = chainMetadata.map(chain => ({
      chain: chain.chainName,
      chainId: chain.chainId,
      split: chain.splitMetadata,
      error: chain.splitError?.message
    }));

    setResults(newResults);
  };

  // Load initial address from URL
  useEffect(() => {
    const urlAddress = searchParams.get('address');
    if (urlAddress) {
      setAddress(urlAddress);
      handleCheck();
    }
  }, []);

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-200">Splits Checker</h1>
      <div className="mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter 0x address"
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCheck}
          disabled={isAnyLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isAnyLoading ? 'Checking...' : 'Check'}
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <div>
        {results.map((result, index) => (
          <div key={index} className="mb-4 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-200 mb-2">
              {result.chain} (Chain ID: {result.chainId})
            </h2>
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : result.split ? (
              <>
                {result.split.recipients && (
                  <SplitsBar recipients={result.split.recipients} />
                )}
                <Accordion type="single" collapsible className="mt-4">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-gray-200">
                      View Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-gray-200">
                        {JSON.stringify(result.split, bigIntSerializer, 2)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <p className="text-gray-400">No split found on this chain</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
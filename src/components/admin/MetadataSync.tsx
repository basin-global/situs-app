'use client'

import React, { useState } from 'react';
import { useOG } from '@/contexts/og-context';
import { AdminOGSelector } from './AdminOGSelector';
import { Button } from '@/components/ui/button';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '@/abi/SitusOG.json';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

const MetadataSync: React.FC = () => {
  const { currentOG } = useOG();
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentToken, setCurrentToken] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);

  const syncMetadata = async () => {
    if (!currentOG?.contract_address) {
      console.error('No OG selected');
      return;
    }

    setIsSyncing(true);
    setCurrentToken(0);

    try {
      // Get total supply from contract
      const idCounter = await publicClient.readContract({
        address: currentOG.contract_address as Address,
        abi: SitusOGAbi,
        functionName: 'idCounter',
        args: [],
      }) as bigint;

      const supply = Number(idCounter);
      setTotalSupply(supply);
      console.log(`Total supply from contract: ${supply}`);

      // Just hit each URL
      for (let tokenId = 1; tokenId <= supply; tokenId++) {
        const url = `https://ensitus.xyz/api/metadata/${currentOG.contract_address}/${tokenId}`;
        console.log(`Hitting: ${url}`);
        await fetch(url);
        setCurrentToken(tokenId);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSyncing(false);
      setCurrentToken(0);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mt-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Metadata Sync
      </h2>
      
      <div className="space-y-4">
        <AdminOGSelector />
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={syncMetadata}
            disabled={isSyncing || !currentOG}
          >
            {isSyncing ? 'Syncing...' : 'Sync Metadata'}
          </Button>

          {isSyncing && currentToken > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Processing token {currentToken} of {totalSupply}
            </div>
          )}
        </div>

        {currentOG && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Selected: {currentOG.og_name}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataSync; 
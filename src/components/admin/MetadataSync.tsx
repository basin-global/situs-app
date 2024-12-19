'use client'

import React, { useState } from 'react';
import { useOG } from '@/contexts/og-context';
import { AdminOGSelector } from './AdminOGSelector';
import { Button } from '@/components/ui/button';

const MetadataSync: React.FC = () => {
  const { currentOG } = useOG();
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);

  const syncMetadata = async () => {
    if (!currentOG?.contract_address || !currentOG?.total_supply) {
      console.error('No OG selected or missing data');
      return;
    }

    setIsSyncing(true);
    setProgress({ current: 0, total: currentOG.total_supply });

    try {
      // Just cycle through each token ID and hit the metadata URL
      for (let tokenId = 1; tokenId <= currentOG.total_supply; tokenId++) {
        const url = `${process.env.NEXT_PUBLIC_METADATA_URL}/api/metadata/${currentOG.contract_address}/${tokenId}`;
        
        try {
          await fetch(url);
          setProgress(prev => prev ? { ...prev, current: tokenId } : null);
          // Small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error fetching token ${tokenId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in sync:', error);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setProgress(null);
      }, 2000);
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
          
          {progress && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Token {progress.current} of {progress.total}
              {progress.current === progress.total && ' - Complete!'}
            </div>
          )}
        </div>

        {currentOG && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Selected: {currentOG.og_name} ({currentOG.total_supply} tokens)
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataSync; 
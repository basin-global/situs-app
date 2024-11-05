'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { OgAccount } from '@/types';
import AllAccounts from '@/components/allAccounts';
import { useOG } from '@/contexts/og-context';

interface SimpleHashNFT {
  token_id: string;
  name: string;
  collection?: {
    name?: string;
  };
  contract_address?: string;
}

export default function MyOGAccounts() {
  const { user } = usePrivy();
  const { OGs } = useOG();
  const [myAccounts, setMyAccounts] = useState<OgAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAllOGAccounts = async () => {
      if (!user?.wallet?.address || !OGs) return;

      try {
        const contractAddresses = OGs.map(og => og.contract_address).join(',');
        const apiUrl = `/api/simplehash/accounts?address=${user.wallet.address}&contractAddress=${contractAddresses}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.nfts) {
          const accounts = data.nfts.map((nft: SimpleHashNFT) => {
            const uniqueId = `${nft.contract_address}-${nft.token_id}`;
            
            return {
              account_name: nft.name,
              token_id: nft.token_id,
              tba_address: '',
              og_name: '',
              id: uniqueId
            };
          });
          setMyAccounts(accounts);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    fetchAllOGAccounts();
  }, [user?.wallet?.address, OGs]);

  if (!user?.wallet?.address) return null;

  return (
    <div className="mb-16 max-w-5xl mx-auto">
      <h2 className="text-4xl font-mono font-bold mb-8 text-white text-center">
        My Accounts
      </h2>
      
      <div className="mb-8 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
        />
      </div>

      <AllAccounts 
        og=""
        accounts={myAccounts}
        searchQuery={searchQuery}
        hideOgSuffix={true}
        showCreateOption={false}
        getAccountUrl={(account: OgAccount) => {
          const [name, og] = account.account_name.split('.');
          return `/${og}/${name}`;
        }}
      />
    </div>
  );
} 
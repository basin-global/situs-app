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

interface MyAccountsProps {
  searchQuery: string;
}

export default function MyAccounts({ searchQuery }: MyAccountsProps) {
  const { user } = usePrivy();
  const { OGs } = useOG();
  const [myAccounts, setMyAccounts] = useState<OgAccount[]>([]);

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
      <AllAccounts 
        og=""
        accounts={myAccounts}
        searchQuery={searchQuery}
        setSearchQuery={() => {}}
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
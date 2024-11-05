'use client'

import React, { useState, useEffect } from 'react'
import { useOG } from '@/contexts/og-context'
import AllAccounts from '@/components/allAccounts'
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation'
import { usePrivy } from '@privy-io/react-auth'
import { OgAccount } from '@/types'

interface SimpleHashNFT {
  token_id: string;
  name: string;
}

interface SimpleHashResponse {
  nfts: SimpleHashNFT[];
}

export default function MyAccountsPage() {
  const { currentOG } = useOG()
  const [searchQuery, setSearchQuery] = useState('')
  const { user, login } = usePrivy()
  const [myAccounts, setMyAccounts] = useState<OgAccount[]>([])

  useEffect(() => {
    if (user?.wallet?.address && currentOG?.contract_address) {
      console.log('Fetching NFTs with:', {
        wallet: user.wallet.address,
        contract: currentOG.contract_address
      });

      fetch(`/api/simplehash/accounts?address=${user.wallet.address}&contractAddress=${currentOG.contract_address}`)
        .then(res => {
          console.log('Response status:', res.status);
          return res.json();
        })
        .then((data: SimpleHashResponse) => {
          console.log('Received data:', data);
          if (data.nfts) {
            const accounts = data.nfts.map(nft => ({
              account_name: nft.name,
              token_id: nft.token_id,
              tba_address: '',
              og_name: currentOG.og_name
            }));
            console.log('Mapped accounts:', accounts);
            setMyAccounts(accounts);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    }
  }, [user?.wallet?.address, currentOG])

  if (!currentOG) {
    return <div>Loading...</div>
  }

  if (!user?.wallet?.address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center">
          <AccountsSubNavigation />
        </div>
        
        <div className="text-center">
          <h2 className="text-5xl font-mono font-bold mb-8">
            My{' '}
            <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
              .{currentOG.og_name.replace(/^\./, '')}
            </span>
            {' '}Accounts
          </h2>
          
          <div className="p-8 rounded-lg bg-gray-100 dark:bg-gray-800 max-w-md mx-auto">
            <p className="text-lg mb-4">Please login to view your accounts</p>
            <button
              onClick={login}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center">
        <AccountsSubNavigation />
      </div>
      
      <h2 className="text-5xl font-mono font-bold mb-8 text-center">
        My{' '}
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          .{currentOG.og_name.replace(/^\./, '')}
        </span>
        {' '}Accounts
      </h2>
      
      <div className="mb-8 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
        />
      </div>
      
      <AllAccounts 
        og={currentOG.og_name.replace(/^\./, '')} 
        searchQuery={searchQuery}
        accounts={myAccounts}
        hideOgSuffix={true}
        showCreateOption={true}
      />
    </div>
  )
}

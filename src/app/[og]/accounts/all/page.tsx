'use client'

import React, { useState } from 'react'
import { useOG } from '@/contexts/og-context'
import AllAccounts from '@/components/allAccounts'
import { SubNavigation } from '@/components/sub-navigation'
import { AssetSearch } from '@/modules/assets/AssetSearch'

export default function AllAccountsPage() {
  const { currentOG } = useOG()
  const [searchQuery, setSearchQuery] = useState('')

  if (!currentOG) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="accounts" />
      </div>
      
      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          .{currentOG.og_name.replace(/^\./, '')}
        </span>
        {' '}Accounts
      </h2>
      
      <AssetSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search accounts..."
        className="mb-4"
        isAccountSearch={true}
      />
      
      <AllAccounts 
        og={currentOG.og_name.replace(/^\./, '')} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  )
}

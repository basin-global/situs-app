'use client'

import React, { useState } from 'react'
import { useOG } from '@/contexts/og-context'
import AllAccounts from '@/components/allAccounts'
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation'

export default function AllAccountsPage() {
  const { currentOG } = useOG()
  const [searchQuery, setSearchQuery] = useState('')

  if (!currentOG) {
    return <div>Loading...</div>
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center">
        <AccountsSubNavigation />
      </div>
      
      <h2 className="text-5xl font-mono font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        .{currentOG.og_name.replace(/^\./, '')} Accounts
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
      />
    </div>
  )
}

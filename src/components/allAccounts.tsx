'use client'

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useOG } from '@/contexts/og-context'

interface AllAccountsProps {
  og: string
  searchQuery: string
}

export default function AllAccounts({ og, searchQuery }: AllAccountsProps) {
  const { accounts, fetchAccounts, isLoading } = useOG()

  useEffect(() => {
    fetchAccounts(og)
  }, [og, fetchAccounts])

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => 
      account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.token_id.toString().includes(searchQuery)
    )
  }, [accounts, searchQuery])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark p-8">
      <div className="max-w-7xl mx-auto">
        {filteredAccounts.length === 0 && <p>No accounts found matching your search.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAccounts.map((account) => (
            <Link
              key={account.token_id}
              href={`/${og}/${account.account_name}`}
              className="bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-primary-foreground dark:text-primary-dark-foreground font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center"
            >
              <span className="text-lg">{account.account_name}.{og}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

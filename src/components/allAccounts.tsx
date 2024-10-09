'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useOG } from '@/contexts/og-context'

export default function AllAccounts({ og }: { og: string }) {
  const { accounts, fetchAccounts, isLoading } = useOG()

  useEffect(() => {
    fetchAccounts(og)
  }, [og, fetchAccounts])

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
        <h2 className="text-5xl font-mono font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          .{og} Accounts
        </h2>
        {accounts.length === 0 && <p>No accounts found.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {accounts.map((account) => (
            <Link
              key={account.token_id}
              href={`/${og}/accounts/name/${account.account_name}`}
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

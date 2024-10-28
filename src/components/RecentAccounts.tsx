// src/components/RecentAccounts.tsx
'use client'

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useOG } from '@/contexts/og-context'

interface RecentAccountsProps {
  og: string
}

export default function RecentAccounts({ og }: RecentAccountsProps) {
  const { accounts, fetchAccounts, isLoading } = useOG()

  useEffect(() => {
    fetchAccounts(og)
  }, [og, fetchAccounts])

  const recentAccounts = useMemo(() => {
    return [...accounts]
      .sort((a, b) => b.token_id - a.token_id)
      .slice(0, 10)
  }, [accounts])

  if (isLoading) {
    return <div className="text-center py-4">Loading recent accounts...</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {recentAccounts.map((account) => (
        <Link
          key={account.token_id}
          href={`/${og}/${account.account_name}`}
          className="block"
        >
          <div className="bg-muted dark:bg-muted-dark border border-border dark:border-border-dark rounded-lg p-4 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent-dark dark:hover:text-accent-dark-foreground">
            <p className="font-mono text-sm truncate">
              {account.account_name}.{og}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

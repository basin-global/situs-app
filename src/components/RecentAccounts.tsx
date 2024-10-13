// src/components/RecentAccounts.tsx
'use client'

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useOG } from '@/contexts/og-context'

interface RecentAccountsProps {
  og: string
  limit: number
}

export default function RecentAccounts({ og, limit }: RecentAccountsProps) {
  const { accounts, fetchAccounts, isLoading } = useOG()

  useEffect(() => {
    fetchAccounts(og)
  }, [og, fetchAccounts])

  const recentAccounts = useMemo(() => {
    return [...accounts]
      .sort((a, b) => b.token_id - a.token_id)
      .slice(0, limit)
  }, [accounts, limit])

  if (isLoading) {
    return <div className="animate-pulse">Loading recent accounts...</div>
  }

  return (
    <div className="space-y-2">
      {recentAccounts.map((account) => (
        <Link
          key={account.token_id}
          href={`/${og}/accounts/name/${account.account_name}`}
          className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
        >
          <span className="text-sm font-medium">{account.account_name}.{og}</span>
        </Link>
      ))}
    </div>
  )
}
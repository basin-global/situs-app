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
      .sort((a, b) => Number(b.token_id) - Number(a.token_id))
      .slice(0, 12)
  }, [accounts])

  if (isLoading) {
    return <div className="text-center py-2 text-sm text-foreground/60">Loading newest members...</div>
  }

  return (
    <div className="space-y-3">
      {recentAccounts.map((account) => (
        <Link
          key={account.token_id}
          href={`/${og}/${account.account_name}`}
          className="block"
        >
          <div className="bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-primary-foreground dark:text-primary-dark-foreground py-2.5 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.02] flex items-center">
            <span className="text-sm font-mono">
              {account.account_name}.{og}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

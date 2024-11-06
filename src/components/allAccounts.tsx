'use client'

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useOG } from '@/contexts/og-context'
import { OgAccount } from '@/types'

interface AllAccountsProps {
  og: string
  searchQuery: string
  setSearchQuery: (query: string) => void
  accounts?: OgAccount[]
  hideOgSuffix?: boolean
  showCreateOption?: boolean
  getAccountUrl?: (account: OgAccount) => string
}

export default function AllAccounts({ og, searchQuery, setSearchQuery, accounts: providedAccounts, hideOgSuffix = false, showCreateOption = false, getAccountUrl }: AllAccountsProps) {
  const { accounts: contextAccounts, fetchAccounts, isLoading } = useOG()

  useEffect(() => {
    if (!providedAccounts) {
      fetchAccounts(og)
    }
  }, [og, fetchAccounts, providedAccounts])

  const displayAccounts = providedAccounts || contextAccounts || [];

  const filteredAccounts = useMemo(() => {
    if (!displayAccounts || !searchQuery) return displayAccounts || [];
    
    return displayAccounts.filter(account => {
      const accountName = account?.account_name || '';
      const tokenId = account?.token_id?.toString() || '';
      const query = searchQuery.toLowerCase();
      
      return accountName.toLowerCase().includes(query) ||
             tokenId.includes(query);
    });
  }, [displayAccounts, searchQuery]);

  const getDisplayName = (account: OgAccount) => {
    const accountName = account?.account_name || '';
    if (accountName.includes('.')) {
      return accountName;
    }
    return `${accountName}.${og || ''}`;
  };

  const constructAccountUrl = (account: OgAccount) => {
    if (getAccountUrl) {
      return getAccountUrl(account);
    }

    const accountName = account?.account_name || '';
    if (accountName.includes('.')) {
      const [name, ogName] = accountName.split('.');
      return `/${ogName}/${name}`;
    }

    return `/${og}/${accountName}`;
  };

  if (isLoading && !providedAccounts) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {filteredAccounts.length === 0 && (
          <div className="text-center">
            <p className="mb-4">No accounts found matching your search.</p>
            {showCreateOption && (
              <div className="mt-8">
                <p className="text-lg mb-4">Want to create a new account?</p>
                <Link
                  href={`/${og}/accounts/create`}
                  className="inline-block bg-primary hover:bg-primary-dark text-primary-foreground dark:text-primary-dark-foreground font-bold py-3 px-6 rounded-lg transition duration-200"
                >
                  Create New Account
                </Link>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAccounts.map((account) => {
            const displayName = getDisplayName(account);
            const url = constructAccountUrl(account);
            const key = account.id || account.token_id;

            return (
              <Link
                key={key}
                href={url}
                className="bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-primary-foreground dark:text-primary-dark-foreground font-bold py-4 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center"
              >
                <span className="text-lg font-mono">{displayName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  )
}

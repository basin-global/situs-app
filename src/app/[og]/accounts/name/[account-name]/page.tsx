'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OgAccount } from '@/types/index';
import { useOG } from '@/contexts/og-context';
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation';
import AccountContractInfo from '@/components/admin/account-contract-info';

export default function AccountPage({ params }: { params: { og: string; 'account-name': string } }) {
  const { og, 'account-name': account_name } = params;
  const { currentOG } = useOG();
  const [account, setAccount] = useState<OgAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch(`/api/${og}/${account_name}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Account not found');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        const data = await response.json();
        setAccount({
          ...data,
          token_id: Number(data.token_id) // Ensure token_id is a number
        });
      } catch (err) {
        console.error('Error fetching account:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccount();
  }, [og, account_name]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-foreground dark:text-foreground-dark bg-background dark:bg-background-dark">
        <h1 className="text-3xl font-bold mb-4">Account Not Found</h1>
        <p className="text-xl mb-6">This account does not seem to exist. Please check the account name and the onchain group name and try again.</p>
        <Link href={`/${og}/accounts/all`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          See All Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark">
      <div className="mb-8 flex justify-center">
        <AccountsSubNavigation />
      </div>
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Account Details</h1>
        <div className="space-y-4">
          <p className="text-lg">
            <span className="font-semibold">Full Account Name:</span> {`${currentOG?.og_name}/${account.account_name}`}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Token ID:</span> {account.token_id.toString()}
          </p>
          {account.created_at && (
            <p className="text-lg">
              <span className="font-semibold">Created At:</span> {new Date(account.created_at).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <AccountContractInfo token_id={account.token_id} />
      </div>
    </div>
  );
}

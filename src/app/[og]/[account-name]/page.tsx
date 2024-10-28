'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { OgAccount } from '@/types/index';
import { useOG } from '@/contexts/og-context';
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation';
import AccountContractInfo from '@/components/admin/account-contract-info';
import { TabbedModules } from '@/components/TabbedModules';
import { toast } from 'react-toastify';

export default function AccountPage({ params }: { params: { og: string; 'account-name': string } }) {
  const { og, 'account-name': account_name } = params;
  const { currentOG } = useOG();
  const [account, setAccount] = useState<OgAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnchainData, setShowOnchainData] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Account address copied to clipboard!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy TBA address');
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOnchainData(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="relative group">
            {account.tba_address ? (
              <p 
                className="text-sm font-space-mono cursor-pointer text-center mb-2 opacity-0 group-hover:opacity-70 transition-opacity duration-300 delay-300 text-gray-600 dark:text-gray-400"
                onClick={() => copyToClipboard(account.tba_address!)}
              >
                {account.tba_address}
              </p>
            ) : (
              <p className="text-sm font-space-mono text-center mb-2 text-gray-600 dark:text-gray-400">
                TBA address not available
              </p>
            )}
            <h1 
              className="text-6xl font-bold mb-6 text-center cursor-pointer"
              onClick={() => account.tba_address && copyToClipboard(account.tba_address)}
            >
              {`${account_name}${currentOG?.og_name}`}
            </h1>
          </div>
          
          <div className="mb-6 flex justify-center">
            {account.tba_address ? (
              <TabbedModules tbaAddress={account.tba_address} />
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">
                TBA address not available. Some features may be limited.
              </p>
            )}
          </div>
        </div>
        
        <div className={`mt-8 transition-opacity duration-1000 ease-in-out ${showOnchainData ? 'opacity-100' : 'opacity-0'}`}>
          {showOnchainData && <AccountContractInfo token_id={account.token_id} />}
        </div>
      </div>
    </div>
  );
}

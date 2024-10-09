'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { OgAccount } from '@/types/index';
import { useOG } from '@/contexts/og-context';

export default function AccountPage({ params }: { params: { og: string; 'account-name': string } }) {
  const { og, 'account-name': account_name } = params;
  const { currentOG, setCurrentOG, getOGByName, isLoading, accounts, fetchAccounts } = useOG();
  const [account, setAccount] = useState<OgAccount | null>(null);

  useEffect(() => {
    if (!isLoading && og) {
      const ogToSet = getOGByName(og);
      if (ogToSet && (!currentOG || og !== currentOG.og_name.replace(/^\./, ''))) {
        setCurrentOG(ogToSet);
      }
    }
  }, [og, currentOG, setCurrentOG, getOGByName, isLoading]);

  useEffect(() => {
    if (currentOG && currentOG.og_name) {
      fetchAccounts(currentOG.og_name);
    }
  }, [currentOG, fetchAccounts]);

  useEffect(() => {
    const foundAccount = accounts.find(acc => acc.account_name === account_name);
    setAccount(foundAccount || null);
  }, [accounts, account_name]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    notFound();
  }

  return (
    <div>
      <h1>Account Details</h1>
      <p>Full Account Name: {`${og}/${account.account_name}`}</p>
      <p>Token ID: {account.token_id}</p>
      <p>Created At: {account.created_at}</p>
    </div>
  );
}

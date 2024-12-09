'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { OG, OgAccount } from '@/types/index';
import { getOGs } from '@/config/og';
import { usePathname } from 'next/navigation';

interface OGContextType {
  currentOG: OG | null;
  setCurrentOG: (og: OG) => void;
  OGs: OG[];
  isLoading: boolean;
  getOGByName: (name: string) => OG | undefined;
  accounts: OgAccount[];
  fetchAccounts: (og: string) => Promise<void>;
}

const OGContext = createContext<OGContextType | null>(null);

export function OGProvider({ children }: { children: React.ReactNode }) {
  const [currentOG, setCurrentOG] = useState<OG | null>(null);
  const [OGs, setOGs] = useState<OG[]>([]);
  const [accounts, setAccounts] = useState<OgAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleSetCurrentOG = useCallback((og: OG) => {
    setIsLoading(true);
    setAccounts([]);
    setCurrentOG(og);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  const getOGByName = useCallback((name: string) => {
    return OGs.find(og => og.og_name === name || og.og_name === `.${name}`);
  }, [OGs]);

  useEffect(() => {
    const fetchOGs = async () => {
      setIsLoading(true);
      try {
        const fetchedOGs = await getOGs();
        console.log('Raw OGs from API:', fetchedOGs);
        console.log('Number of OGs fetched:', fetchedOGs.length);
        // Log any OGs that might be filtered out
        const invalidOGs = fetchedOGs.filter(og => !og.og_name);
        if (invalidOGs.length > 0) {
          console.warn('Found OGs without og_name:', invalidOGs);
        }
        setOGs(fetchedOGs);
      } catch (error) {
        console.error('Error fetching OGs:', error);
        setOGs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOGs();
  }, []);

  useEffect(() => {
    const ogNameFromPath = pathname.split('/')[1];
    if (ogNameFromPath && (!currentOG || ogNameFromPath !== currentOG.og_name.replace(/^\./, ''))) {
      const ogToSet = getOGByName(ogNameFromPath);
      if (ogToSet) {
        handleSetCurrentOG(ogToSet);
      }
    }
  }, [pathname, OGs, currentOG, getOGByName, handleSetCurrentOG]);

  const fetchAccounts = useCallback(async (og: string) => {
    setIsLoading(true);
    setAccounts([]);
    
    try {
      const response = await fetch(`/api/getAccounts?og=${og}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    currentOG,
    setCurrentOG: handleSetCurrentOG,
    OGs,
    isLoading,
    getOGByName,
    accounts,
    fetchAccounts,
  }), [currentOG, handleSetCurrentOG, OGs, isLoading, getOGByName, accounts, fetchAccounts]);

  return (
    <OGContext.Provider value={contextValue}>
      {children}
    </OGContext.Provider>
  );
}

export function useOG() {
  const context = useContext(OGContext);
  if (context === null) {
    throw new Error('useOG must be used within an OGProvider');
  }
  return context;
}

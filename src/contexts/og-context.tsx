'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { OG, OgAccount } from '@/types/index';
import { getOGs } from '@/config/og';
import { usePathname } from 'next/navigation';

interface OGContextType {
  currentOG: OG | null;
  setCurrentOG: (og: OG) => void;  // Changed this type
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

  useEffect(() => {
    const fetchOGs = async () => {
      setIsLoading(true);
      try {
        const fetchedOGs = await getOGs();
        console.log('OGs set in context:', fetchedOGs);
        setOGs(fetchedOGs);
      } catch (error) {
        console.error('Error fetching OGs:', error);
        setOGs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOGs();
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    const ogNameFromPath = pathname.split('/')[1];
    if (ogNameFromPath && (!currentOG || ogNameFromPath !== currentOG.og_name.replace(/^\./, ''))) {
      const ogToSet = getOGByName(ogNameFromPath);
      if (ogToSet) {
        setCurrentOG(ogToSet);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, OGs]);

  // Removed setCurrentOGWithDot function

  const getOGByName = useCallback((name: string) => {
    return OGs.find(og => og.og_name === name || og.og_name === `.${name}`);
  }, [OGs]);

  const fetchAccounts = useCallback(async (og: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/getAccounts?og=${og}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    currentOG, 
    setCurrentOG,  // Now using setCurrentOG directly
    OGs, 
    isLoading,
    getOGByName,
    accounts,
    fetchAccounts,
  }), [currentOG, setCurrentOG, OGs, isLoading, getOGByName, accounts, fetchAccounts]);

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

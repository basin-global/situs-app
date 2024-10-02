'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { SitusOG, getSitusOGs } from '@/config/situs';
import { checkUserOGs } from '@/utils/simplehash';

interface SitusContextType {
  currentSitus: string | null;
  setCurrentSitus: (situs: string) => void;
  situsOGs: SitusOG[];
  userOGs: SitusOG[];
  otherOGs: SitusOG[];
  getOGByName: (name: string) => SitusOG | undefined;
  isLoading: boolean;
  fetchUserOGs: (walletAddress: string) => Promise<void>;
}

const SitusContext = createContext<SitusContextType | undefined>(undefined);

export function SitusProvider({ children }: { children: React.ReactNode }) {
  const [currentSitus, setCurrentSitus] = useState<string | null>(null);
  const [userOGs, setUserOGs] = useState<SitusOG[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [situsOGs, setSitusOGs] = useState<SitusOG[]>([]);

  useEffect(() => {
    getSitusOGs().then(setSitusOGs).catch(error => {
      console.error('Error fetching OGs:', error);
      setSitusOGs([]);
    });
  }, []);

  const otherOGs = useMemo(() => {
    return situsOGs.filter(og => !userOGs.some(userOg => userOg.contractAddress === og.contractAddress));
  }, [situsOGs, userOGs]);

  const fetchUserOGs = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    try {
      const contractAddresses = situsOGs.map(og => og.contractAddress).join(',');
      const ownedContracts = await checkUserOGs(walletAddress, contractAddresses);
      const userOwnedOGs = situsOGs.filter(og => ownedContracts.includes(og.contractAddress));
      setUserOGs(userOwnedOGs);
    } catch (error) {
      console.error('Error checking user OGs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [situsOGs]);

  const getOGByName = useCallback((name: string) => {
    return situsOGs.find(og => og.name === name || og.name === `.${name}`);
  }, [situsOGs]);

  const setCurrentSitusWithDot = useCallback((situs: string) => {
    setCurrentSitus(situs.startsWith('.') ? situs : `.${situs}`);
  }, []);

  const contextValue = useMemo(() => ({
    currentSitus, 
    setCurrentSitus: setCurrentSitusWithDot, 
    situsOGs, 
    userOGs, 
    otherOGs, 
    getOGByName,
    isLoading,
    fetchUserOGs
  }), [currentSitus, setCurrentSitusWithDot, situsOGs, userOGs, otherOGs, getOGByName, isLoading, fetchUserOGs]);

  return (
    <SitusContext.Provider value={contextValue}>
      {children}
    </SitusContext.Provider>
  );
}

export function useSitus() {
  const context = useContext(SitusContext);
  if (context === undefined) {
    throw new Error('useSitus must be used within a SitusProvider');
  }
  return context;
}
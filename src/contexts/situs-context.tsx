'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSitusOGs } from '@/config/situs';

interface SitusContextType {
  currentSitus: string;
  setCurrentSitus: (situs: string) => void;
}

const SitusContext = createContext<SitusContextType | undefined>(undefined);

export function SitusProvider({ children }: { children: React.ReactNode }) {
  const [currentSitus, setCurrentSitus] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const situsOGs = getSitusOGs();
    const validSitusNames = situsOGs.map(og => og.name.replace('.', ''));
    
    const pathParts = pathname.split('/').filter(Boolean);
    const currentPathSitus = pathParts[0];

    if (validSitusNames.includes(currentPathSitus)) {
      setCurrentSitus(currentPathSitus);
      localStorage.setItem('currentSitus', currentPathSitus);
    } else if (pathname === '/' || pathname === '/profile') {
      // Reset currentSitus when on home page or profile page
      setCurrentSitus('');
      localStorage.removeItem('currentSitus');
    } else if (currentSitus && !pathname.startsWith('/profile')) {
      // Only redirect if not on the home page, not on the profile page, and a currentSitus is set
      router.push(`/${currentSitus}${pathname}`);
    }
  }, [pathname, currentSitus, router]);

  return (
    <SitusContext.Provider value={{ currentSitus, setCurrentSitus }}>
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
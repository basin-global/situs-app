'use client';

import { usePathname } from 'next/navigation';
import { useSitus } from '@/contexts/situs-context';
import React from 'react';

interface PageContentProps {
  situs: string;
  children: React.ReactNode;
}

export default function PageContent({ situs, children }: PageContentProps) {
  const pathname = usePathname();
  const { currentSitus } = useSitus();
  
  // Extract the page name from the URL
  const pathParts = pathname.split('/').filter(Boolean);
  const pageName = pathParts[pathParts.length - 1] || 'Home';

  // Capitalize the first letter of the page name
  const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
      <p>This is the {pageTitle} page for the {situs} Situs.</p>
      {children}
    </div>
  );
}
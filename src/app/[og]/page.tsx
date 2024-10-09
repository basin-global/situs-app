'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useOG } from '@/contexts/og-context';
import ogData from '@/data/ogs.json';

interface OGData {
  name: string;
  tagline: string;
  description: string;
  email: string;
  website: string;
}

export default function SitusPage(): ReactNode {
  const { currentOG } = useOG();
  const [bannerPath, setBannerPath] = useState<string>('/ogs/banners/basin-banner.jpg');

  useEffect(() => {
    if (currentOG) {
      const situs = currentOG.og_name.replace(/^\./, '').toLowerCase();
      const newBannerPath = `/ogs/banners/${situs}-banner.jpg`;
      
      // Check if the banner exists
      fetch(newBannerPath, { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            setBannerPath(newBannerPath);
          } else {
            setBannerPath('/ogs/banners/basin-banner.jpg');
          }
        })
        .catch(() => setBannerPath('/ogs/banners/basin-banner.jpg'));
    }
  }, [currentOG]);

  if (!currentOG) {
    return <div>Loading...</div>;
  }

  const situs = currentOG.og_name.replace(/^\./, '').toLowerCase();
  
  // Fallback data
  const fallbackOG: OGData = {
    name: `${situs.charAt(0).toUpperCase() + situs.slice(1)} OG`,
    tagline: "Details coming soon",
    description: "Detailed description will be available shortly.",
    email: `tmo@basin.global`,
    website: `https://warpcast.com/~/channel/situs`
  };

  // Use the OG data from JSON if it exists, otherwise use the fallback
  const og: OGData = (ogData as Record<string, OGData>)[situs] || fallbackOG;

  return (
    <>
      <div className="relative w-full h-0 pb-[25%] mb-8 rounded-lg overflow-hidden">
        <Image
          src={bannerPath}
          alt={`${og.name} banner`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent">
          <div className="p-6 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{og.name}</h1>
            <p className="text-xl md:text-2xl">{og.tagline}</p>
          </div>
        </div>
      </div>

      <div className="flex mb-8">
        <div className="flex-grow mr-8">
          <p className="text-xl text-muted-foreground dark:text-muted-foreground-dark">{og.description}</p>
        </div>
        
        <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg w-64 flex-shrink-0">
          <Link href={og.website} className="text-accent dark:text-accent-dark hover:underline block mb-2">
            Visit website
          </Link>
          <Link href={`mailto:${og.email}`} className="text-accent dark:text-accent-dark hover:underline">
            Email
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Accounts</h3>
          {/* Placeholder for Accounts component */}
          <p className="text-muted-foreground dark:text-muted-foreground-dark">Accounts component will be loaded here</p>
        </div>
        <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Assets</h3>
          {/* Placeholder for Assets component */}
          <p className="text-muted-foreground dark:text-muted-foreground-dark">Assets component will be loaded here</p>
        </div>
        <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Currencies</h3>
          {/* Placeholder for Currencies component */}
          <p className="text-muted-foreground dark:text-muted-foreground-dark">Currencies component will be loaded here</p>
        </div>
      </div>
    </>
  );
}
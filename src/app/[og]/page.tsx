'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useOG } from '@/contexts/og-context';
import { useOGData } from '@/hooks/useOGData';
import RecentAccounts from '@/components/RecentAccounts';

export default function OgPage(): ReactNode {
  const { currentOG } = useOG();
  const { ogData, isLoading, error } = useOGData();
  const [bannerPath, setBannerPath] = useState<string>('/ogs/banners/basin-banner.jpg');

  useEffect(() => {
    if (currentOG?.og_name) {
      const situs = currentOG.og_name.replace(/^\./, '').toLowerCase();
      const newBannerPath = `/ogs/banners/${situs}-banner.jpg`;
      
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
    return null; // or a minimal loading indicator if absolutely necessary
  }

  const situs = currentOG.og_name?.replace(/^\./, '').toLowerCase() || '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
      <div className="relative w-full h-0 pb-[25%] mb-8 rounded-lg overflow-hidden">
        <Image
          src={bannerPath}
          alt={`${ogData?.name_front || currentOG.og_name} banner`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent">
          <div className="p-6 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{ogData?.name_front || currentOG.og_name}</h1>
            <p className="text-xl md:text-2xl">{ogData?.tagline || 'Loading...'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mb-8">
        <div className="flex-grow md:mr-8 mb-4 md:mb-0">
          <p className="text-xl text-muted-foreground dark:text-muted-foreground-dark">
            {ogData?.description || 'No description available'}
          </p>
        </div>
        
        <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg w-full md:w-64 flex-shrink-0">
          <Link 
            href={`/${situs}/accounts/create`}
            className="block w-full bg-primary hover:bg-primary-dark text-primary-foreground dark:text-primary-dark-foreground font-bold py-3 px-4 rounded text-center mb-6 text-lg transition duration-150 ease-in-out"
          >
            JOIN {currentOG.og_name}
          </Link>
          
          <div className="space-y-2 text-m">
            {ogData?.total_supply && ogData.total_supply > 0 && (
              <Link 
                href={`/${situs}/accounts/all`}
                className="block text-accent dark:text-accent-dark hover:underline"
              >
                Members: {ogData.total_supply}
              </Link>
            )}
            {ogData?.website && (
              <Link 
                href={ogData.website} 
                className="block text-accent dark:text-accent-dark hover:underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Website
              </Link>
            )}
            {ogData?.email && (
              <Link 
                href={`mailto:${ogData.email}`} 
                className="block text-accent dark:text-accent-dark hover:underline"
              >
                Email
              </Link>
            )}
            {ogData?.chat && (
              <Link 
                href={ogData.chat} 
                className="block text-accent dark:text-accent-dark hover:underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Group Chat
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-muted dark:bg-muted-dark p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Newest Members</h3>
            <Link 
              href={`/${situs}/accounts/all`}
              className="inline-block bg-primary hover:bg-primary-dark text-primary-foreground dark:text-primary-dark-foreground font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
            >
              View All
            </Link>
          </div>
          <RecentAccounts og={situs} />
        </div>
      </div>
    </div>
  );
}

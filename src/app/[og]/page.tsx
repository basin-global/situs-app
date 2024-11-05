'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useOG } from '@/contexts/og-context';
import { useOGData } from '@/hooks/useOGData';
import RecentAccounts from '@/components/RecentAccounts';
import AssetCard from '@/modules/assets/AssetCard';
import EnsurancePreview from '@/components/EnsurancePreview';


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
    return null;
  }

  const situs = currentOG.og_name?.replace(/^\./, '').toLowerCase() || '';

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative w-full h-0 pb-[20%] mb-6 rounded-xl overflow-hidden">
        <Image
          src={bannerPath}
          alt={`${ogData?.name_front || currentOG.og_name} banner`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="brightness-75"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/70 via-black/40 to-transparent">
          <div className="p-8 max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-white leading-tight whitespace-nowrap">
              {ogData?.name_front || currentOG.og_name}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium tracking-wide">
              {ogData?.tagline || 'Reducing Risk, Increasing Resilience'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        <div className="lg:col-span-3 flex flex-col h-full space-y-8">
          <div className="bg-muted/50 dark:bg-muted-dark/50 rounded-xl p-6 backdrop-blur-sm flex-grow">
            <p className="text-lg leading-relaxed text-foreground/90 dark:text-foreground-dark/90">
              {ogData?.description || 'Details coming soon...'}
            </p>
          </div>
          
          <div className="flex-grow">
            <EnsurancePreview 
              contractAddress={currentOG.contract_address}
              og={currentOG.og_name.replace(/^\./, '')}
            />
          </div>
        </div>

        <div className="flex flex-col h-full space-y-6">
          {/* Main CTA Card */}
          <div className="bg-muted dark:bg-muted-dark rounded-xl overflow-hidden flex-grow">
            {/* CTA Button Section */}
            <div className="p-6 border-b border-white/10">
              <Link 
                href={`/${situs}/accounts/create`}
                className="block w-full bg-primary hover:bg-primary-dark text-primary-foreground dark:text-primary-dark-foreground font-normal py-3 px-4 rounded-lg text-center text-base transition duration-150 ease-in-out"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span>Get Your</span>
                  <span className="font-extrabold text-2xl bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
                    {currentOG.og_name}
                  </span>
                  <span>Account</span>
                </div>
              </Link>
            </div>

            {/* Stats & Links Section */}
            <div className="p-6">
              {/* Members Count */}
              {ogData?.total_supply && ogData.total_supply > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium">Members</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium">
                        {ogData.total_supply}
                      </span>
                    </div>
                    <Link 
                      href={`/${situs}/accounts/all`}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors group"
                    >
                      View All <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Links - Only render the div if at least one link exists */}
              {(ogData?.website || ogData?.chat || ogData?.email) && (
                <div className="space-y-3">
                  {/* Website - Only show if exists */}
                  {ogData?.website && ogData.website.trim() && (
                    <Link 
                      href={ogData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="font-medium">{ogData.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}

                  {/* Chat - Only show if exists */}
                  {ogData?.chat && ogData.chat.trim() && (
                    <Link 
                      href={ogData.chat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <span className="font-medium">Community Chat</span>
                      </div>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}

                  {/* Email - Only show if exists */}
                  {ogData?.email && ogData.email.trim() && (
                    <Link 
                      href={`mailto:${ogData.email}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Contact</span>
                      </div>
                      <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Members Card */}
          <div className="bg-muted dark:bg-muted-dark rounded-xl p-6 flex-grow">
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Newest Members</h3>
                <Link 
                  href={`/${situs}/accounts/all`}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors group"
                >
                  View All <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
            </div>
            <RecentAccounts og={situs} />
          </div>
        </div>
      </div>
    </div>
  );
}

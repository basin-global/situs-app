'use client';

import { Suspense, useState, useEffect } from 'react';
import type { OgAccount } from '@/types/index';
import { SitusToggle } from './components/SitusToggle';
import { Tabs } from './components/Tabs';
import MetadataAssets from './modules/assets';
import MetadataCurrency from './modules/currency';
import MetadataPlace from './modules/place';
import MetadataImpact from './modules/impact';
import MetadataReputation from './modules/reputation';

const DEFAULT_TABS = [
  { id: 'assets', label: 'Assets', component: MetadataAssets },
  { id: 'currency', label: 'Currency', component: MetadataCurrency },
  { id: 'place', label: 'Place', component: MetadataPlace },
  { id: 'impact', label: 'Impact', component: MetadataImpact },
  { id: 'reputation', label: 'Reputation', component: MetadataReputation }
];

interface ModuleViewProps {
  contract: string;
  tokenId: string;
}

export function ModuleView({ contract, tokenId }: ModuleViewProps) {
  const [account, setAccount] = useState<OgAccount | null>(null);
  const [activeTab, setActiveTab] = useState('assets');
  const [selectedChain, setSelectedChain] = useState('base');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ogIcon, setOgIcon] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch(`/api/metadata/${contract}/${tokenId}`);
        if (!response.ok) throw new Error('Failed to fetch account');
        const data = await response.json();
        setAccount({
          tba_address: data.tba_address,
          account_name: data.name,
          token_id: parseInt(data.token_id),
          created_at: data.created_at,
          owner_of: data.owner_of,
          description: data.description
        });
        setImageUrl(data.image);
        if (data.og_name) {
          setOgIcon(`/ogs/orbs/${data.og_name.replace(/^\./, '')}-orb.png`);
        }
      } catch (error) {
        console.error('Error fetching account:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAccount();
  }, [contract, tokenId]);

  if (isLoading) return null;

  return (
    <div className="w-full h-full relative">
      {imageUrl && (
        <>
          <img 
            src={imageUrl} 
            alt={account?.account_name || 'Account Image'}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isPanelOpen ? 'blur-lg' : ''
            }`}
          />
        </>
      )}

      <div className="absolute top-4 left-4 flex items-center gap-3 z-50">
        <SitusToggle
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="hover:scale-105 transition-transform"
          iconUrl={ogIcon}
        />
        <div className={`text-white text-lg font-medium transition-opacity duration-300 ${
          isPanelOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          {account?.account_name}
        </div>
      </div>

      {isPanelOpen && (
        <div className="absolute inset-0 flex flex-col">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-none">
              <div className="h-16" />
              <div className="bg-black/90 border-b border-gray-700">
                <div className="flex items-center justify-between px-4 h-12">
                  <Tabs 
                    tabs={DEFAULT_TABS}
                    currentTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                  <select
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="ml-4 bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 border border-gray-700"
                  >
                    {['base', 'optimism', 'arbitrum', 'zora'].map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {account?.tba_address && (
                <div className="h-full">
                  {DEFAULT_TABS.map(tab => (
                    <div 
                      key={tab.id}
                      className={activeTab === tab.id ? 'block h-full' : 'hidden'}
                    >
                      <tab.component
                        address={account.tba_address}
                        selectedChain={selectedChain}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
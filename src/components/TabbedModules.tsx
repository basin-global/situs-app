import React, { useState, lazy, Suspense, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation';
import { getActiveChains, chainOrder } from '@/config/chains'
import { ensuranceContracts, isEnsuranceToken } from '@/modules/ensurance/config'
import * as Tooltip from '@radix-ui/react-tooltip'

const AssetsModule = lazy(() => import('@/modules/assets'))
const CurrencyModule = lazy(() => import('@/modules/currency'))
const PlaceModule = lazy(() => import('@/modules/place'))
const ImpactModule = lazy(() => import('@/modules/impact'))
const ReputationModule = lazy(() => import('@/modules/reputation'))
const EnsureModule = lazy(() => import('@/modules/ensure'))

interface TabData {
  value: string;
  label: string;
  component: React.LazyExoticComponent<any>;
  showChainDropdown: boolean;
  isEnsurance?: boolean;
}

const tabData: TabData[] = [
  { value: 'ensurance', label: 'Ensurance', component: AssetsModule, showChainDropdown: true, isEnsurance: true },
  { value: 'ensure', label: 'Ensure', component: EnsureModule, showChainDropdown: false },
  { value: 'assets', label: 'Assets', component: AssetsModule, showChainDropdown: true },
  { value: 'currency', label: 'Currency', component: CurrencyModule, showChainDropdown: true },
  { value: 'reputation', label: 'Reputation', component: ReputationModule, showChainDropdown: false },
  { value: 'place', label: 'Place', component: PlaceModule, showChainDropdown: false },
  { value: 'impact', label: 'Impact', component: ImpactModule, showChainDropdown: false },
]

interface TabbedModulesProps {
  tbaAddress: string;
}

export function TabbedModules({ tbaAddress }: TabbedModulesProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const moduleFromUrl = urlParams.get('module');
      return moduleFromUrl || localStorage.getItem('activeTab') || 'assets';
    }
    return 'assets';
  });

  const [selectedChain, setSelectedChain] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('chain') || 'all';
    }
    return 'all';
  });

  const activeChains = getActiveChains();

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const updateUrl = (tab: string, chain: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('module', tab);
    
    // Only include chain parameter if it's not 'all' and the tab has chain dropdown
    const activeTab = tabData.find(t => t.value === tab);
    if (activeTab?.showChainDropdown && chain !== 'all') {
      url.searchParams.set('chain', chain);
    } else {
      url.searchParams.delete('chain');
    }

    router.push(url.toString());
  };

  const handleChainChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = event.target.value;
    setSelectedChain(newChain);
    updateUrl(activeTab, newChain);
  };

  const setActiveTabAndUpdateUrl = (tab: string) => {
    setActiveTab(tab);
    updateUrl(tab, selectedChain);
  };

  const orderedChains = activeTab === 'ensurance'
    ? ['all', ...Object.keys(ensuranceContracts)]
    : ['all', ...chainOrder.filter(chain => activeChains.some(ac => ac.simplehashName === chain))];

  const activeTabData = tabData.find(tab => tab.value === activeTab);

  const getTabStyle = (tabValue: string) => {
    const isPortfolioTab = tabValue === 'assets' || tabValue === 'currency';
    const isActive = activeTab === tabValue;

    if (isPortfolioTab) {
      return isActive
        ? 'text-gray-900 dark:text-white font-semibold border-2 border-transparent bg-clip-border bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600'
        : 'text-gray-600 dark:text-gray-300 border-2 border-transparent hover:bg-clip-border hover:bg-gradient-to-r hover:from-amber-300 hover:via-yellow-500 hover:to-amber-600 hover:text-gray-900 hover:dark:text-white'
    }

    return isActive
      ? 'bg-blue-500 text-white'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden w-full">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex space-x-2">
          {tabData.map((tab) => (
            <Tooltip.Provider key={tab.value}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${getTabStyle(tab.value)}`}
                    onClick={() => setActiveTabAndUpdateUrl(tab.value)}
                  >
                    {tab.label}
                  </button>
                </Tooltip.Trigger>
                {(tab.value === 'assets' || tab.value === 'currency') && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-black/90 text-white px-3 py-1.5 rounded text-sm font-bold"
                      sideOffset={5}
                    >
                      Portfolio
                      <Tooltip.Arrow className="fill-black/90" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>
            </Tooltip.Provider>
          ))}
        </div>
        {activeTabData?.showChainDropdown && (
          <select
            value={selectedChain}
            onChange={handleChainChange}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
          >
            {orderedChains.map((chainName) => (
              <option key={chainName} value={chainName}>
                {chainName === 'all' ? 'All Chains' : activeChains.find(c => c.simplehashName === chainName)?.name || chainName}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="p-4 w-full">
        <Suspense fallback={<div>Loading...</div>}>
          {activeTabData && (
            <activeTabData.component
              key={activeTabData.value}
              tbaAddress={tbaAddress}
              selectedChain={selectedChain}
              isEnsurance={activeTabData.isEnsurance}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}

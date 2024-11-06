'use client';

import AllOGs from '@/components/allOGs'
import NexusSection from '@/components/NexusSection'
import PossibleSection from '@/components/PossibleSection'
import SupportSection from '@/components/SupportSection'
import MyAccounts from '@/components/MyAccounts'
import { usePrivy } from '@privy-io/react-auth'
import { possibleLogos, supportLogos } from '@/config/logos'
import { useState } from 'react'
import { AssetSearch } from '@/modules/assets/AssetSearch'

export default function HomePage() {
  const { authenticated } = usePrivy();
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [ogSearchQuery, setOgSearchQuery] = useState('');

  return (
    <>
      {authenticated && (
        <div className="flex justify-center space-x-8 mb-4 mt-8">
          <a href="#local-is-global" className="text-xl font-mono font-bold text-white hover:text-yellow-300 transition-colors">
            GROUPS
          </a>
          <span className="text-white/30">|</span>
          <a href="#accounts" className="text-xl font-mono font-bold text-white hover:text-yellow-300 transition-colors">
            ACCOUNTS
          </a>
        </div>
      )}
      
      <div id="groups" className={authenticated ? 'mt-4' : ''}>
        <AllOGs searchQuery={ogSearchQuery} setSearchQuery={setOgSearchQuery} />
      </div>
      
      {authenticated && (
        <div id="accounts" className="mb-16 max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-mono font-bold mb-8 text-white text-center">
            My Accounts
          </h2>
          
          <AssetSearch 
            searchQuery={accountSearchQuery}
            setSearchQuery={setAccountSearchQuery}
            placeholder="Search accounts..."
            className="mb-8"
            isAccountSearch={true}
          />

          <MyAccounts searchQuery={accountSearchQuery} />
        </div>
      )}
      
      <NexusSection />
      <PossibleSection logos={possibleLogos} />
      <SupportSection logos={supportLogos} />
    </>
  )
}
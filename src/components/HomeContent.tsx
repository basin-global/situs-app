'use client';

import AllOGs from '@/components/allOGs'
import NexusSection from '@/components/NexusSection'
import PossibleSection from '@/components/PossibleSection'
import SupportSection from '@/components/SupportSection'
import MyAccounts from '@/components/MyAccounts'
import { usePrivy } from '@privy-io/react-auth'

interface HomeContentProps {
  possibleLogos: any[];
  supportLogos: any[];
}

export default function HomeContent({ possibleLogos, supportLogos }: HomeContentProps) {
  const { authenticated } = usePrivy();

  return (
    <>
      {authenticated && (
        <div className="flex justify-center space-x-8 mb-4 mt-8">
          <a href="#groups" className="text-xl font-mono font-bold text-white hover:text-yellow-300 transition-colors">
            GROUPS
          </a>
          <span className="text-white/30">|</span>
          <a href="#accounts" className="text-xl font-mono font-bold text-white hover:text-yellow-300 transition-colors">
            ACCOUNTS
          </a>
        </div>
      )}
      
      <div id="groups" className={authenticated ? 'mt-4' : ''}>
        <AllOGs />
      </div>
      
      {authenticated && (
        <div id="accounts">
          <MyAccounts />
        </div>
      )}
      
      <NexusSection />
      <PossibleSection logos={possibleLogos} />
      <SupportSection logos={supportLogos} />
    </>
  );
} 
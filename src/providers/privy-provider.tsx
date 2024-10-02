'use client'

import { PrivyProvider } from '@privy-io/react-auth';
import { supportedChains } from '@/config/chains';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm1dmgstc06htj0hfahsvl6n1"
      config={{
        defaultChain: supportedChains.find(chain => chain.id === 8453), // Base
        supportedChains: supportedChains,
      }}
    >
      {children}
    </PrivyProvider>
  )
}
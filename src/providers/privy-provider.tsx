'use client'

import { PrivyProvider } from '@privy-io/react-auth';
import { supportedChains, getActiveChains } from '@/config/chains';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const activeChains = getActiveChains();
  const baseChain = supportedChains.find(chain => chain.id === 8453); // Base

  if (!baseChain) {
    console.error('Base chain not found in supported chains');
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: baseChain || supportedChains[0],
        supportedChains: activeChains,
      }}
    >
      {children}
    </PrivyProvider>
  )
}

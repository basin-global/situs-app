'use client'

import { PrivyProvider } from '@privy-io/react-auth';
import { supportedChains } from '@/config/chains';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        defaultChain: supportedChains.find(chain => chain.id === 8453), // Base
        supportedChains: supportedChains,
      }}
    >
      {children}
    </PrivyProvider>
  )
}
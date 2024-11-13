'use client';

import { createPublicClient, http } from 'viem'
import { SplitsProvider } from '@0xsplits/splits-sdk-react'
import { ReactNode } from 'react'
import { getActiveChains } from '@/config/chains'

// Create public clients for active chains
const publicClients = Object.fromEntries(
  getActiveChains().map(chain => [
    chain.id,
    createPublicClient({
      chain: {
        id: chain.id,
        name: chain.name,
        network: chain.simplehashName,
        nativeCurrency: chain.nativeCurrency,
        rpcUrls: chain.rpcUrls,
      },
      transport: http()
    })
  ])
)

// Config using active chain IDs and client config
const splitsConfig = {
  chainIds: getActiveChains().map(chain => chain.id),
  publicClients,
  includeEnsNames: false, // Optional: set to true if you want ENS names
  apiConfig: {
    apiKey: process.env.NEXT_PUBLIC_IS_SPLITS_API_KEY // Required for data client
  }
}

interface SplitsWrapperProps {
  children: ReactNode
}

export function SplitsWrapper({ children }: SplitsWrapperProps) {
  return (
    <SplitsProvider config={splitsConfig}>
      {children}
    </SplitsProvider>
  )
} 
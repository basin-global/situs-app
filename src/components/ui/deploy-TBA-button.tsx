"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { getChainBySimplehashName } from '@/config/chains'
import { TokenboundClient } from "@tokenbound/sdk"
import { getTokenBoundClientConfig } from '@/config/tokenbound'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'react-toastify'
import { BrowserProvider, JsonRpcSigner } from "ethers"

interface DeployTBAButtonProps {
  address: string
  chain: string
  onSuccess?: () => void
  className?: string
}

export function DeployTBAButton({ 
  address, 
  chain,
  onSuccess,
  className = ""
}: DeployTBAButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = usePrivy()

  const handleDeploy = async () => {
    if (!user?.wallet?.address) {
      toast.error('Please connect your wallet')
      return
    }

    setIsLoading(true)
    try {
      const chainConfig = getChainBySimplehashName(chain)
      if (!chainConfig) {
        throw new Error(`Unsupported chain: ${chain}`)
      }

      // Get provider and signer
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner() as JsonRpcSigner

      // Create Tokenbound client with the correct signer type
      const client = new TokenboundClient({
        ...getTokenBoundClientConfig(chainConfig.id),
        signer
      })

      // createAccount returns { account, txHash }
      const result = await client.createAccount({
        tokenContract: address as `0x${string}`,
        tokenId: "1",
      })

      // Wait for the transaction using provider
      await provider.waitForTransaction(result.txHash)
      
      toast.success('Account deployed successfully')
      onSuccess?.()
    } catch (err) {
      console.error('Error deploying account:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to deploy account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleDeploy}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Deploying..." : "Deploy Account"}
    </Button>
  )
} 
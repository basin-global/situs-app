import { fetchENSName } from '@/lib/simplehash'
import { fetchENSAddress } from '@/lib/simplehash' // We'll need to create this
import { Suspense } from 'react'

interface ResolverResult {
  input: string
  ethereumAddress?: string
  ensName?: string
  situsAccount?: {
    name: string
    address: string
    og?: {
      name: string
      address: string
      type: string
    }
    split?: {
      address: string
      type: string
    }
  }
}

async function resolveInput(input: string): Promise<ResolverResult> {
  const result: ResolverResult = { input }

  // Check if input is a Situs account (contains a dot but isn't .eth)
  if (input.includes('.') && !input.endsWith('.eth')) {
    try {
      // Split the input into name and og parts (e.g., "tmo.basin" -> ["tmo", "basin"])
      const [accountName] = input.split('.')
      const response = await fetch(`/api/resolver?query=${accountName}`)
      const data = await response.json()
      
      if (data.account) {
        result.situsAccount = {
          name: data.account.account_name,
          address: data.account.address,
          og: data.account.og,
          split: data.account.split
        }
        result.ethereumAddress = data.account.address
      }
    } catch (error) {
      console.error('Situs account lookup failed:', error)
    }
  }

  // Check if input is an Ethereum address
  if (input.startsWith('0x')) {
    result.ethereumAddress = input
    // Reverse ENS lookup
    try {
      const ensName = await fetchENSName(input)
      if (ensName) result.ensName = ensName
    } catch (error) {
      console.error('ENS reverse lookup failed:', error)
    }
  }

  // Check if input is an ENS name
  if (input.endsWith('.eth')) {
    try {
      const address = await fetchENSAddress(input)
      if (address) {
        result.ethereumAddress = address
        result.ensName = input
      }
    } catch (error) {
      console.error('ENS lookup failed:', error)
    }
  }

  return result
}

function ResultDisplay({ result }: { result: ResolverResult }) {
  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resolver Results</h2>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400">Input</span>
          <span className="font-mono">{result.input}</span>
        </div>

        {result.ethereumAddress && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Ethereum Address</span>
            <span className="font-mono">{result.ethereumAddress}</span>
          </div>
        )}

        {result.ensName && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">ENS Name</span>
            <span>{result.ensName}</span>
          </div>
        )}

        {result.situsAccount && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Situs Account</span>
            <span>{result.situsAccount.name} ({result.situsAccount.address})</span>
          </div>
        )}

        {result.situsAccount?.og && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">OG Contract</span>
            <span>{result.situsAccount.og.name} ({result.situsAccount.og.type} at {result.situsAccount.og.address})</span>
          </div>
        )}

        {result.situsAccount?.split && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800">
            <span className="text-gray-500 dark:text-gray-400">Split Contract</span>
            <span>{result.situsAccount.split.type} ({result.situsAccount.split.address})</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function ResolverPage({ params }: { params: { resolver: string } }) {
  const result = await resolveInput(params.resolver)

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ResultDisplay result={result} />
      </Suspense>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useOG } from '@/contexts/og-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'

export default function Footer() {
  const { currentOG } = useOG()
  const pathname = usePathname()
  const iconSize = 24

  const [darkMode, setDarkMode] = useState(true) // Set default to true for dark mode
  const { authenticated } = usePrivy()
  const [ethPrice, setEthPrice] = useState<number | null>(null)

  useEffect(() => {
    // Always set dark mode on initial load
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')

    if (authenticated) {
      // Fetch ETH price
      const fetchEthPrice = async () => {
        try {
          const response = await fetch('/api/eth-price')
          const data = await response.json()
          if (data.price) {
            setEthPrice(data.price)
          }
        } catch (error) {
          console.error('Error fetching ETH price:', error)
        }
      }

      fetchEthPrice()
      // Optionally, set up an interval to update the price periodically
      const interval = setInterval(fetchEthPrice, 5 * 60 * 1000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [authenticated])

  const toggleDarkMode = (value: boolean) => {
    setDarkMode(value)
    if (value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', value.toString())
  }

  const isOGPage = pathname.split('/')[1] !== ''

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-4 items-center">
            <Link href="/" className="text-foreground dark:text-foreground-dark hover:text-accent dark:hover:text-accent-dark transition-colors duration-300">
              Home
            </Link>
            {authenticated && (
              <Link href="/profile" className="text-foreground dark:text-foreground-dark hover:text-accent dark:hover:text-accent-dark transition-colors duration-300">
                Profile
              </Link>
            )}
          </div>
          <div className="flex space-x-6 items-center">
            <Link href="https://warpcast.com/~/channel/situs" target="_blank" rel="noopener noreferrer">
              <Image src="/footer/warpcast.png" alt="Warpcast" width={iconSize} height={iconSize} />
            </Link>
            <Link href="https://docs.situs.ac" target="_blank" rel="noopener noreferrer">
              <Image src="/footer/gitbook.png" alt="Situs Docs" width={iconSize} height={iconSize} />
            </Link>
            <Link href="https://github.com/basin-global/Situs-Protocol" target="_blank" rel="noopener noreferrer">
              <Image src="/footer/github.png" alt="GitHub" width={iconSize} height={iconSize} />
            </Link>
            {isOGPage && currentOG ? (
              <>
                <Link href={`https://basescan.org/token/${currentOG.contract_address}`} target="_blank" rel="noopener noreferrer">
                  <Image src="/footer/basescan.png" alt="Basescan" width={iconSize} height={iconSize} />
                </Link>
                <Link href={`https://opensea.io/assets/base/${currentOG.contract_address}`} target="_blank" rel="noopener noreferrer">
                  <Image src="/footer/opensea.png" alt="OpenSea" width={iconSize} height={iconSize} />
                </Link>
                <Link href={`https://rarible.com/collection/base/${currentOG.contract_address}/items`} target="_blank" rel="noopener noreferrer">
                  <Image src="/footer/rarible.png" alt="Rarible" width={iconSize} height={iconSize} />
                </Link>
              </>
            ) : (
              <Link href="https://basescan.org/address/0x67c814835e1920324634fd6da416a0e79c949970#readContract#F3" target="_blank" rel="noopener noreferrer">
                <Image src="/footer/basescan.png" alt="Basescan" width={iconSize} height={iconSize} />
              </Link>
            )}
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <span 
                className={`cursor-pointer transition-opacity duration-300 ${darkMode ? 'opacity-50' : 'opacity-100'}`}
                onClick={() => toggleDarkMode(false)}
              >
                ☀️
              </span>
              <span 
                className={`cursor-pointer transition-opacity duration-300 ${darkMode ? 'opacity-100' : 'opacity-50'}`}
                onClick={() => toggleDarkMode(true)}
              >
                🌙
              </span>
            </div>
            {authenticated && ethPrice && (
              <span className="font-mono text-sm text-gray-400">
                ETH: ${ethPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
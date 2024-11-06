'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { OG } from '@/types/index';
import { useOG } from '@/contexts/og-context'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { currentOG } = useOG()
  const pathname = usePathname()

  if (!currentOG) return null

  const ogPath = currentOG.og_name.replace(/^\./, '')

  // More specific path matching
  const isAccountsActive = pathname.includes('/accounts') || 
    (pathname.match(new RegExp(`/${ogPath}/[^/]+$`)) && 
     !pathname.includes('/ensurance') && 
     !pathname.includes('/currency'))
  const isAssetsActive = pathname.includes('/ensurance')
  const isCurrencyActive = pathname.includes('/currency')

  return (
    <nav className={`
      flex 
      md:space-x-2 
      items-center 
      relative 
      z-[30]
      md:flex-row 
      flex-col 
      space-y-2 
      md:space-y-0
    `}>
      <Link href={`/${ogPath}/accounts/all`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs w-full md:w-auto font-medium h-9
            ${isAccountsActive 
              ? 'text-yellow-300 bg-white/10' 
              : 'text-white/80 hover:bg-white/10'
            }`}
        >
          ACCOUNTS
        </Button>
      </Link>
      <Link href={`/${ogPath}/ensurance/all`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs w-full md:w-auto font-medium h-9
            ${isAssetsActive 
              ? 'text-yellow-300 bg-white/10' 
              : 'text-white/80 hover:bg-white/10'
            }`}
        >
          ASSETS
        </Button>
      </Link>
      <Link href={`/${ogPath}/currency`}>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs w-full md:w-auto font-medium h-9
            ${isCurrencyActive 
              ? 'text-yellow-300 bg-white/10' 
              : 'text-white/80 hover:bg-white/10'
            }`}
        >
          CURRENCY
        </Button>
      </Link>
    </nav>
  )
}

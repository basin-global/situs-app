'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { OG } from '@/types/index';
import { useOG } from '@/contexts/og-context'

export function Navigation() {
  const { currentOG } = useOG()

  if (!currentOG) return null

  const ogPath = currentOG.og_name.replace(/^\./, '')

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
        <Button variant="ghost" size="sm" className="text-xs w-full md:w-auto font-medium text-white/80 hover:bg-white/10 h-9">ACCOUNTS</Button>
      </Link>
      <Link href={`/${ogPath}/ensurance`}>
        <Button variant="ghost" size="sm" className="text-xs w-full md:w-auto font-medium text-white/80 hover:bg-white/10 h-9">ASSETS</Button>
      </Link>
      <Link href={`/${ogPath}/currency`}>
        <Button variant="ghost" size="sm" className="text-xs w-full md:w-auto font-medium text-white/80 hover:bg-white/10 h-9">CURRENCY</Button>
      </Link>
    </nav>
  )
}

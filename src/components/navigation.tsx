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
    <nav className="flex space-x-2 items-center">
      <Link href={`/${ogPath}/accounts/all`}>
        <Button variant="ghost" size="sm" className="text-xs font-medium text-white/80 hover:bg-white/10 h-9">ACCOUNTS</Button>
      </Link>
      <Link href={`/${ogPath}/ensurance`}>
        <Button variant="ghost" size="sm" className="text-xs font-medium text-white/80 hover:bg-white/10 h-9">ASSETS</Button>
      </Link>
      <Link href={`/${ogPath}/currency`}>
        <Button variant="ghost" size="sm" className="text-xs font-medium text-white/80 hover:bg-white/10 h-9">CURRENCY</Button>
      </Link>
    </nav>
  )
}

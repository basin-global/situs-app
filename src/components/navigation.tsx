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
        <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-white/10 h-9">Accounts</Button>
      </Link>
      <Link href={`/${ogPath}/assets`}>
        <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-white/10 h-9">Assets</Button>
      </Link>
      <Link href={`/${ogPath}/currencies`}>
        <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-white/10 h-9">Currencies</Button>
      </Link>
    </nav>
  )
}

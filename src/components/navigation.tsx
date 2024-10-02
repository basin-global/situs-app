'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useSitus } from '@/contexts/situs-context'

export function Navigation() {
  const { currentSitus } = useSitus()

  if (!currentSitus) return null

  const situsPath = currentSitus.replace(/^\./, '')

  return (
    <nav className="flex space-x-2 items-center">
      <Link href={`/${situsPath}/accounts`}>
        <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-white/10 h-9">Accounts</Button>
      </Link>
      <Link href={`/${situsPath}/assets`}>
        <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-white/10 h-9">Assets</Button>
      </Link>
      <Link href={`/${situsPath}/currencies`}>
        <Button variant="ghost" size="sm" className="text-sm font-medium hover:bg-white/10 h-9">Currencies</Button>
      </Link>
    </nav>
  )
}

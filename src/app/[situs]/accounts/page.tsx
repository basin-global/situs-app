'use client';

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useSitus } from '@/contexts/situs-context'
import { useEffect } from 'react'

interface PageProps {
  params: { situs: string }
}

export default function AccountsPage({ params }: PageProps) {
  const { currentSitus, setCurrentSitus } = useSitus()

  useEffect(() => {
    if (params.situs && params.situs !== currentSitus) {
      setCurrentSitus(params.situs)
    }
  }, [params.situs, currentSitus, setCurrentSitus])

  return (
    <div className="bg-background text-foreground min-h-screen">
      <h1 className="text-primary text-2xl font-bold mb-4">Accounts</h1>
      {/* Content removed */}
    </div>
  )
}
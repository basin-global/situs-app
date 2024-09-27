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

  const accountLinks = [
    { href: '/accounts/mine', label: 'My Accounts' },
    { href: '/accounts/create', label: 'Create Account' },
    { href: '/accounts/all', label: 'All Accounts' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountLinks.map((link) => (
          <Link key={link.href} href={`/${currentSitus || params.situs}${link.href}`} passHref>
            <Button variant="outline" className="w-full h-24 text-lg">
              {link.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
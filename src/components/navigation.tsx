'use client'

import { Button } from "@/components/ui/button"
import { Users, FileText, Coins, DollarSign, ArrowRightLeft, Send } from "lucide-react"
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSitus } from '@/contexts/situs-context'
import { getSitusOGByName } from '@/config/situs'
import { SitusChooser } from './situs-chooser'  // Changed this line

function NavItem({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentSitus } = useSitus()
  const og = getSitusOGByName(currentSitus)
  const contractAddress = og?.contractAddress || ''
  
  const fullHref = `/${currentSitus}${href}`
  
  const [isOpen, setIsOpen] = useState(pathname.startsWith(fullHref))

  return (
    <div>
      <Button
        asChild
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Link href={fullHref}>
          <div className="flex items-center">
            <Icon className="mr-2 h-4 w-4" />
            {children}
          </div>
        </Link>
      </Button>
      {isOpen && (
        <div className="ml-6 mt-2 space-y-2">
          {href === '/accounts' && (
            <>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/accounts/mine`}>Mine</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/accounts/all/${contractAddress}`}>All</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/accounts/create`}>Create</Link>
              </Button>
              {/* Conditional rendering for Admin */}
              {process.env.NEXT_PUBLIC_SHOW_ADMIN === 'true' && (
                <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                  <Link href={`/${currentSitus}/accounts/admin`}>Admin</Link>
                </Button>
              )}
            </>
          )}
          {href === '/certificates' && (
            <>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/certificates/mine`}>Mine</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/certificates/all`}>All</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/certificates/create`}>Create</Link>
              </Button>
            </>
          )}
          {href === '/currency' && (
            <>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/currency/buy`}>
                  <DollarSign className="mr-2 h-4 w-4" /> Buy
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/currency/swap`}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Swap
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                <Link href={`/${currentSitus}/currency/send`}>
                  <Send className="mr-2 h-4 w-4" /> Send
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function Navigation() {
  const { currentSitus } = useSitus()
  const pathname = usePathname()

  if (!currentSitus || pathname === '/') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Select a Situs</h2>
        <SitusChooser />
      </div>
    )
  }

  return (
    <nav className="space-y-2">
      <NavItem href="/accounts" icon={Users}>Accounts</NavItem>
      <NavItem href="/certificates" icon={FileText}>Certificates</NavItem>
      <NavItem href="/currency" icon={Coins}>Currency</NavItem>
    </nav>
  )
}
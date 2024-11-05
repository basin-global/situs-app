'use client'

import React from 'react'
import { useOG } from '@/contexts/og-context'
import { DollarSign, ArrowLeftRight, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function CurrencyPage() {
  const { currentOG } = useOG()

  if (!currentOG) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          {currentOG.og_name} Currencies
        </h1>
        
        <div className="bg-muted/50 dark:bg-muted-dark/50 rounded-xl p-8 backdrop-blur-sm">
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Buy & Sell</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <ArrowLeftRight className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Swap</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm font-medium">Send</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">
            Currency Management Coming Soon
          </h2>
          <p className="text-muted-foreground mb-8">
            Tools to help you manage your currencies. 
            Trade, swap, and transfer with ease - all within your {currentOG.og_name} account.
          </p>

          <div className="flex justify-center gap-4">
            <Link 
              href={`/${currentOG.og_name.replace(/^\./, '')}`}
              className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

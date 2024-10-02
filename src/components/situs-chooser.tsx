'use client'

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSitus } from '@/contexts/situs-context'

export function SitusChooser() {
  const { currentSitus, setCurrentSitus, situsOGs } = useSitus()
  const router = useRouter()
  const pathname = usePathname()

  const handleSitusChange = (value: string) => {
    setCurrentSitus(value)
    
    const pathParts = pathname.split('/')
    pathParts[1] = value.replace(/^\./, '')
    const newPath = pathParts.join('/')
    
    router.push(newPath)
  }

  return (
    <Select onValueChange={handleSitusChange} value={currentSitus || undefined}>
      <SelectTrigger className="bg-transparent border-none text-5xl font-bold flex items-center text-white p-0 tracking-wider w-full justify-start hover:text-yellow-300 transition-colors duration-300 focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Choose Situs" />
      </SelectTrigger>
      <SelectContent className="bg-[#111] text-white border-none rounded-none shadow-lg">
        {situsOGs.map((og) => (
          <SelectItem 
            key={og.contract_address || og.og_name} 
            value={og.og_name}
            className="text-3xl font-bold tracking-wider hover:bg-gray-800 transition-colors duration-300 focus:bg-gray-800 focus:text-white"
          >
            {og.og_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
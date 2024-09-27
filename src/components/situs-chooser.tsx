'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSitusOGs, SitusOG } from '@/config/situs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSitus } from '@/contexts/situs-context'

export function SitusChooser() {
  const { currentSitus, setCurrentSitus } = useSitus()
  const router = useRouter()
  const pathname = usePathname()
  const [situsOGs, setSitusOGs] = useState<SitusOG[]>([])

  useEffect(() => {
    const sortedOGs = getSitusOGs().sort((a, b) => a.name.localeCompare(b.name));
    setSitusOGs(sortedOGs);
  }, [])

  const handleSitusChange = (value: string) => {
    setCurrentSitus(value)
    
    // Extract the path after the current situs
    const pathParts = pathname.split('/')
    pathParts[1] = value // Replace the current situs with the new one
    const newPath = pathParts.join('/')
    
    router.push(newPath)
  }

  return (
    <Select onValueChange={handleSitusChange} value={currentSitus || undefined}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Choose Situs" />
      </SelectTrigger>
      <SelectContent>
        {situsOGs.map((og) => (
          <SelectItem key={og.contractAddress} value={og.name.slice(1)}>
            {og.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
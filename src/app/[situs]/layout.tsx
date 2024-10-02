// The [situs] layout focuses on the content within the specific route.

'use client';

import { useEffect } from 'react';
import { useSitus } from '@/contexts/situs-context';
import { useParams } from 'next/navigation';

export default function SitusLayout({ children }: { children: React.ReactNode }) {
    const { setCurrentSitus } = useSitus();
    const params = useParams();

    useEffect(() => {
        if (params.situs) {
            setCurrentSitus(`.${params.situs as string}`);
        }
    }, [params.situs, setCurrentSitus]);

    return (
      <div className="flex bg-background text-foreground">
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    )
}
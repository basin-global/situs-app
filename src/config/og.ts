import { OG } from '@/types/index';

let cachedOGs: OG[] | null = null;

export async function getOGs(): Promise<OG[]> {
    if (cachedOGs && !isHardRefresh()) {
        console.log('Full cached OGs:', JSON.stringify(cachedOGs, null, 2));
        return cachedOGs;
    }

    try {
        const response = await fetch('/api/getOGs', {
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch OGs');
        }
        const data = await response.json();
        console.log('Full API response:', JSON.stringify(data, null, 2));
        cachedOGs = data;
        return data;
    } catch (error) {
        console.error('Error fetching OGs:', error);
        return [];
    }
}
function isHardRefresh(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Use the modern Performance API
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navEntry.type === 'reload';
}

export function clearOGsCache() {
    cachedOGs = null;
}


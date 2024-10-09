import { OG } from '@/types/index';

let cachedOGs: OG[] | null = null;

export async function getOGs(): Promise<OG[]> {
    if (cachedOGs && !isHardRefresh()) {
        return cachedOGs;
    }

    try {
        const response = await fetch('/api/getOGs', {
            cache: 'no-store' // This ensures fresh data on fetch
        });
        if (!response.ok) {
            throw new Error('Failed to fetch OGs');
        }
        const data = await response.json();
        cachedOGs = data;
        return data;
    } catch (error) {
        console.error('Error fetching OGs:', error);
        return [];
    }
}

function isHardRefresh(): boolean {
    // Check if it's a hard refresh (Ctrl+F5 or Cmd+Shift+R)
    return window.performance && window.performance.navigation.type === 1;
}

export function clearOGsCache() {
    cachedOGs = null;
}


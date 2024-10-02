import { SitusOG } from '@/types/situs';

let cachedOGs: SitusOG[] | null = null;

export async function getSitusOGs(): Promise<SitusOG[]> {
    if (cachedOGs) {
        return cachedOGs;
    }

    try {
        const response = await fetch('/api/getOGs');
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

export function clearOGsCache() {
    cachedOGs = null;
}

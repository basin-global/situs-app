import { NextResponse } from 'next/server';
import { getAllOGs } from '@/lib/database';

export const runtime = 'edge';

export async function GET() {
  try {
    console.log('API: Starting getOGs request');
    const ogs = await getAllOGs();
    console.log('API: Returning', ogs.length, 'OGs');
    
    // Log first and last OG for verification
    if (ogs.length > 0) {
      console.log('API: First OG:', ogs[0].og_name);
      console.log('API: Last OG:', ogs[ogs.length - 1].og_name);
    }
    
    return NextResponse.json(ogs);
  } catch (error) {
    console.error('API: Error fetching OGs:', error);
    return NextResponse.json({ error: 'Failed to fetch OGs' }, { status: 500 });
  }
}

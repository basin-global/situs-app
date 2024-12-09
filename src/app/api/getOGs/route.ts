import { NextResponse } from 'next/server';
import { getAllOGs } from '@/lib/database';

export const runtime = 'edge';

export async function GET() {
  try {
    console.log('API: Starting getOGs request');
    const ogs = await getAllOGs();
    console.log('API: Database returned:', ogs.length, 'OGs');
    console.log('API: First OG example:', ogs[0]);
    console.log('API: Last OG example:', ogs[ogs.length - 1]);
    
    // Log any OGs with null/undefined critical fields
    const invalidOGs = ogs.filter(og => !og.og_name || !og.contract_address);
    if (invalidOGs.length > 0) {
      console.log('API: Found OGs with missing critical fields:', invalidOGs);
    }
    
    return NextResponse.json(ogs);
  } catch (error) {
    console.error('API: Error fetching OGs:', error);
    return NextResponse.json({ error: 'Failed to fetch OGs' }, { status: 500 });
  }
}

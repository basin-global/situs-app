import { NextResponse } from 'next/server';
import { getAllOGs } from '@/lib/database';

export const runtime = 'edge';

export async function GET() {
  try {
    console.log('API: Fetching OGs from database...');
    const ogs = await getAllOGs();
    console.log('API: Fetched OGs from database:', ogs.length);
    return NextResponse.json(ogs);
  } catch (error) {
    console.error('API: Error fetching OGs:', error);
    return NextResponse.json({ error: 'Failed to fetch OGs' }, { status: 500 });
  }
}

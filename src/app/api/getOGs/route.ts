import { NextResponse } from 'next/server';
import { getAllOGs } from '@/lib/database';

export const runtime = 'edge';

export async function GET() {
  try {
    console.log('Fetching OGs...');
    const ogs = await getAllOGs();
    console.log('Fetched OGs:', ogs);
    return NextResponse.json(ogs);
  } catch (error) {
    console.error('Error fetching OGs:', error);
    return NextResponse.json({ error: 'Failed to fetch OGs' }, { status: 500 });
  }
}
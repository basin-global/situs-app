import { NextResponse } from 'next/server';
import { getAllOGs } from '@/lib/database';

export async function GET() {
  try {
    const ogs = await getAllOGs();
    return NextResponse.json(ogs.rows);
  } catch (error) {
    console.error('Error fetching OGs:', error);
    return NextResponse.json({ error: 'Failed to fetch OGs' }, { status: 500 });
  }
}
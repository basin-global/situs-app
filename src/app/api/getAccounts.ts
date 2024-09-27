import { NextResponse } from 'next/server';
import { getAccountsForOG } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const og = searchParams.get('og');
  
  if (!og) {
    return NextResponse.json({ error: 'OG parameter is required' }, { status: 400 });
  }

  try {
    const accounts = await getAccountsForOG(og);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}
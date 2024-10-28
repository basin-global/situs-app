import { NextResponse } from 'next/server';
import { getOGByName, getAccountsForOG } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const og = searchParams.get('og');

  if (!og) {
    return NextResponse.json({ error: 'OG parameter is required' }, { status: 400 });
  }

  try {
    const ogData = await getOGByName(og);
    if (!ogData) {
      return NextResponse.json({ error: 'OG not found' }, { status: 404 });
    }
    
    const accounts = await getAccountsForOG(og);
    // Assuming we want to return only the 5 most recent accounts
    const recentAccounts = accounts.slice(0, 5);

    return NextResponse.json({ ogData, recentAccounts });
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return NextResponse.json({ error: 'Failed to fetch OG data', details: (error as Error).message }, { status: 500 });
  }
}

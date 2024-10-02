// This API route fetches accounts for a specific OG from the database, NOT directly from the blockchain.
// The database is periodically updated with blockchain data via a separate process.
// See src/app/api/update-database/route.ts for the update process.

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
import { NextResponse } from 'next/server';
import { getAccountByName } from '@/lib/database';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { og: string; account_name: string } }
) {
  const { og, account_name } = params;

  if (!og || !account_name) {
    return NextResponse.json({ error: 'OG and account name are required' }, { status: 400 });
  }

  try {
    const account = await getAccountByName(og, account_name);
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account', details: (error as Error).message },
      { status: 500 }
    );
  }
}

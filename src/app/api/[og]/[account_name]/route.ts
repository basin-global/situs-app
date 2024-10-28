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

    // Explicitly structure the response to include tba_address and token_id
    const responseData = {
      account_name: account.account_name,
      tba_address: account.tba_address || null,
      token_id: account.token_id,
      // Include other fields as needed
      owner_of: account.owner_of,
      created_at: account.created_at
    };

    console.log('Account data being returned:', responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account', details: (error as Error).message },
      { status: 500 }
    );
  }
}

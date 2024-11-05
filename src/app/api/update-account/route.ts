import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sanitizeOGName } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { og, accountName, tokenId, tbaAddress } = await request.json();
    const sanitizedOG = sanitizeOGName(og);

    console.log('Updating database with:', {
      og: sanitizedOG,
      accountName,
      tokenId,
      tbaAddress
    });

    await sql.query(`
      INSERT INTO situs_accounts_${sanitizedOG} 
        (token_id, account_name, tba_address)
      VALUES ($1, $2, $3)
      ON CONFLICT (token_id) DO UPDATE SET
        account_name = $2,
        tba_address = $3
    `, [tokenId, accountName, tbaAddress]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
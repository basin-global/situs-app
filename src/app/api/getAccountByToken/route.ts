import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contract = searchParams.get('contract')?.toLowerCase();
  const tokenId = searchParams.get('tokenId');

  console.log('API: Checking contract and tokenId:', { contract, tokenId });

  if (!contract || !tokenId) {
    console.log('API: Missing required parameters');
    return NextResponse.json({ error: 'Contract and tokenId parameters are required' }, { status: 400 });
  }

  try {
    console.log('API: Querying situs_ogs for contract:', contract);
    const { rows: ogRows } = await sql`
      SELECT og_name 
      FROM situs_ogs 
      WHERE LOWER(contract_address) = ${contract}
      LIMIT 1;
    `;
    console.log('API: Found OG rows:', ogRows);

    if (ogRows.length > 0) {
      const ogName = ogRows[0].og_name;
      console.log('API: Found OG:', ogName);
      
      const accountQuery = `
        SELECT account_name 
        FROM situs_accounts_${ogName.replace(/\./g, '')}
        WHERE token_id = $1
        LIMIT 1
      `;
      
      console.log('API: Executing query:', accountQuery);
      const { rows: accountRows } = await sql.query(accountQuery, [tokenId]);
      console.log('API: Found account rows:', accountRows);

      if (accountRows.length > 0) {
        const result = {
          account_name: accountRows[0].account_name,
          og_name: ogName
        };
        console.log('API: Returning result:', result);
        return NextResponse.json(result);
      }
    }
    console.log('API: No matching OG or account found');
    return NextResponse.json(null);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch account', details: (error as Error).message }, { status: 500 });
  }
} 
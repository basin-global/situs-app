import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT og_name, last_updated
      FROM situs_ogs
      ORDER BY last_updated DESC
    `;
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching last update times:', error);
    return NextResponse.json({ error: 'Failed to fetch last update times' }, { status: 500 });
  }
}
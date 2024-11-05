import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.toLowerCase()

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT account_name, address 
      FROM situs_accounts 
      WHERE LOWER(account_name) = ${query}
    `

    return NextResponse.json({ account: result.rows[0] || null })
  } catch (error) {
    console.error('Database query failed:', error)
    return NextResponse.json({ error: 'Failed to query account' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server';

const SIMPLEHASH_BASE_URL = 'https://api.simplehash.com/api/v0';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'No endpoint specified' }, { status: 400 });
  }

  const url = `${SIMPLEHASH_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': process.env.SIMPLEHASH_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`SimpleHash API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error calling SimpleHash API' }, { status: 500 });
  }
}
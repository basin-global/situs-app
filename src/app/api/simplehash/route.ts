import { NextRequest, NextResponse } from 'next/server';

const SIMPLEHASH_BASE_URL = 'https://api.simplehash.com/api/v0';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!process.env.SIMPLEHASH_API_KEY) {
    return NextResponse.json({ error: 'SimpleHash API key is not set' }, { status: 500 });
  }

  if (!endpoint) {
    return NextResponse.json({ error: 'No endpoint specified' }, { status: 400 });
  }

  const url = new URL(`${SIMPLEHASH_BASE_URL}/${endpoint}`);
  
  // Add all other query params to the URL
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      url.searchParams.append(key, value);
    }
  });

  console.log("Full SimpleHash API URL:", url.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-KEY': process.env.SIMPLEHASH_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`SimpleHash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in SimpleHash API call:", error);
    return NextResponse.json({ error: 'Error calling SimpleHash API' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

  if (!BASESCAN_API_KEY) {
    return NextResponse.json({ error: 'Basescan API key is not set' }, { status: 500 });
  }

  try {
    const response = await axios.get(`https://api.basescan.org/api?module=stats&action=ethprice&apikey=${BASESCAN_API_KEY}`);
    if (response.data.status === '1' && response.data.message === 'OK') {
      return NextResponse.json({ price: parseFloat(response.data.result.ethusd) });
    } else {
      return NextResponse.json({ error: 'Error in Basescan API response' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching ETH price from Basescan:', error);
    return NextResponse.json({ error: 'Error fetching ETH price from Basescan' }, { status: 500 });
  }
}
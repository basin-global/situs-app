import { NextResponse } from 'next/server';
import { fetchNFTsByContract } from '@/lib/simplehash';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get('chain');
  const contractAddress = searchParams.get('contractAddress');

  if (!chain || !contractAddress) {
    return NextResponse.json({ error: 'Missing chain or contract address' }, { status: 400 });
  }

  try {
    const nfts = await fetchNFTsByContract(chain, contractAddress);
    return NextResponse.json(nfts);
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    return NextResponse.json({ error: 'Error fetching NFT data' }, { status: 500 });
  }
}

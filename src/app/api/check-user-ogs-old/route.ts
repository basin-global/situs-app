import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get('walletAddress');
  const contractAddresses = searchParams.get('contractAddresses');

  if (!walletAddress || !contractAddresses) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  const formattedContractAddresses = contractAddresses
    .split(',')
    .map(address => `base.${address}`)
    .join(',');

  const url = `https://api.simplehash.com/api/v0/nfts/owners_v2?chains=base&wallet_addresses=${walletAddress}&contract_addresses=${formattedContractAddresses}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': process.env.SIMPLEHASH_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`SimpleHash API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.nfts || !Array.isArray(data.nfts)) {
      throw new Error("Unexpected API response structure");
    }

    const ownedContracts = Array.from(new Set(data.nfts.map((nft: any) => nft.contract_address.replace('base.', ''))));
    return NextResponse.json(ownedContracts);
  } catch (error) {
    console.error("Error in checkUserOGs:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
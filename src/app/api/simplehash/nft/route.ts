import { NextResponse } from 'next/server';
import { fetchNFTsByTBA, fetchNFTDetails, ActiveChain } from '@/lib/simplehash';
import { getActiveChainNames } from '@/config/chains';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tbaAddress = searchParams.get('tbaAddress');
  const activeChains = getActiveChainNames();

  console.log('NFT route - Active chains:', activeChains);
  console.log('NFT route - TBA Address:', tbaAddress);

  const chain = searchParams.get('chain') as ActiveChain;
  const contractAddress = searchParams.get('contractAddress');
  const tokenId = searchParams.get('tokenId');

  try {
    if (tbaAddress) {
      const nfts = await fetchNFTsByTBA(tbaAddress);
      return NextResponse.json(nfts);
    } else if (chain && contractAddress && tokenId) {
      const nftDetails = await fetchNFTDetails(chain, contractAddress, tokenId);
      return NextResponse.json(nftDetails);
    } else {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    return NextResponse.json({ error: 'Error fetching NFT data' }, { status: 500 });
  }
}

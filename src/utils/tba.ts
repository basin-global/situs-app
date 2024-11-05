import { TokenboundClient } from '@tokenbound/sdk';
import { createPublicClient, http, Transport } from 'viem';
import { base } from 'viem/chains';

// Create a properly typed client
const transport = http();
const publicClient = createPublicClient({
  chain: base,
  transport
});

export async function calculateTBA(
  contractAddress: `0x${string}`,
  tokenId: number
): Promise<`0x${string}`> {
  const tokenboundClient = new TokenboundClient({
    chainId: base.id,
    publicClient: publicClient as any, // Type assertion to avoid viem version conflicts
  });

  const tba = await tokenboundClient.getAccount({
    tokenContract: contractAddress,
    tokenId: tokenId.toString()
  });

  return tba as `0x${string}`;
}

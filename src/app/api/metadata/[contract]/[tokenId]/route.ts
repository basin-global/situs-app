import { getMetadata } from '@/modules/metadata/handlers';
import { generateAccountImage } from '@/modules/metadata/ImageGenerator';
import { createPublicClient, http, Address } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '@/abi/SitusOG.json';
import { calculateTBA } from '@/utils/tba';
import { sql } from '@vercel/postgres';
import { sanitizeOGName } from '@/lib/database';
import { MetadataResponse } from '@/types';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// First, define a type for the return value of getOnChainData
type OnChainData = {
  exists: true;
  domainName: string;
  ogName: string;
  fullName: string;
  tba: string;
} | {
  exists: false;
};

async function getOnChainData(contract: string, tokenId: string): Promise<OnChainData> {
  try {
    const address = contract as Address;
    const bigIntTokenId = BigInt(tokenId);

    // Get the current idCounter
    const idCounter = await publicClient.readContract({
      address,
      abi: SitusOGAbi,
      functionName: 'idCounter',
      args: [],
    }) as bigint;

    if (bigIntTokenId <= idCounter) {
      // Get the domain name from contract
      const domainName = await publicClient.readContract({
        address,
        abi: SitusOGAbi,
        functionName: 'domainIdsNames',
        args: [bigIntTokenId],
      }) as string;

      // Get the OG name
      const ogName = await publicClient.readContract({
        address,
        abi: SitusOGAbi,
        functionName: 'name',
        args: [],
      }) as string;

      // Calculate TBA
      const tba = await calculateTBA(address, Number(tokenId));

      return { 
        exists: true,
        domainName,
        ogName,
        fullName: `${domainName}${ogName}`,
        tba
      };
    }

    return { exists: false };
  } catch (error) {
    console.error('Token verification error:', error);
    return { exists: false };
  }
}

async function syncWithDatabase(
  contract: string, 
  tokenId: number,
  domainName: string,
  fullName: string,
  tba: string,
  ogName: string
) {
  try {
    // Ensure ogName is not undefined
    if (!ogName) {
      console.error('OG name is undefined');
      return;
    }

    const sanitizedOG = sanitizeOGName(ogName);

    // Check if record exists and if data matches
    const { rows } = await sql.query(`
      SELECT account_name, full_account_name, tba_address
      FROM situs_accounts_${sanitizedOG}
      WHERE token_id = $1
    `, [tokenId]);

    if (rows.length === 0) {
      // Insert new record
      await sql.query(`
        INSERT INTO situs_accounts_${sanitizedOG}
        (token_id, account_name, full_account_name, tba_address)
        VALUES ($1, $2, $3, $4)
      `, [tokenId, domainName, fullName, tba]);
      console.log('Inserted new record for:', fullName);
    } else if (
      rows[0].account_name !== domainName ||
      rows[0].full_account_name !== fullName ||
      rows[0].tba_address !== tba
    ) {
      // Update if any data doesn't match
      await sql.query(`
        UPDATE situs_accounts_${sanitizedOG}
        SET 
          account_name = $2,
          full_account_name = $3,
          tba_address = $4
        WHERE token_id = $1
      `, [tokenId, domainName, fullName, tba]);
      console.log('Updated record for:', fullName);
    }
  } catch (error) {
    console.error('Database sync error:', error);
  }
}

export async function GET(
  request: Request,
  { params }: { params: { contract: string; tokenId: string } }
) {
  try {
    console.log('Metadata request for:', params);
    
    // Get all onchain data
    const onChainData = await getOnChainData(params.contract, params.tokenId);
    
    if (!onChainData.exists) {
      return new Response(JSON.stringify({ 
        error: 'Token does not exist'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Now TypeScript knows these values exist
    const { domainName, ogName, fullName, tba } = onChainData;

    // Get base metadata first (which includes the correct base image URL)
    let metadata: MetadataResponse;
    try {
      metadata = await getMetadata(params.contract, params.tokenId);
    } catch (error) {
      metadata = {
        name: 'Unknown',
        description: '', // Empty until DB has more data
        animation_url: '',
        image: `${process.env.NEXT_PUBLIC_BLOB_URL}/default.png`, // Default image
        tba_address: '0x0000000000000000000000000000000000000000', // Zero address
        og_name: '',
        full_account_name: 'Unknown',
      };
    }

    // Generate/refresh the image using metadata.image as base
    const generatedImageUrl = await generateAccountImage(
      metadata.image,
      metadata.full_account_name || fullName,  // Use DB value first, fallback to onchain
      ogName.replace('.', ''), 
      params.tokenId
    );

    // Sync with database
    await syncWithDatabase(
      params.contract,
      Number(params.tokenId),
      domainName,  // Now TypeScript knows this is defined
      fullName,    // And this
      tba,         // And this
      ogName       // And this
    );

    return new Response(JSON.stringify({
      ...metadata,
      name: fullName, // Always use onchain data
      image: generatedImageUrl,
      animation_url: `https://iframe-tokenbound.vercel.app/${params.contract}/${params.tokenId}/8453`,
      tba_address: tba, // Include TBA in response
      cached_at: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error in metadata route:', error);
    return new Response(JSON.stringify({ 
      error: 'Error generating metadata'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

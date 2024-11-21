import { sql } from '@vercel/postgres';
import { sanitizeOGName } from '@/lib/database';

interface MetadataResponse {
  name: string;
  description: string;
  animation_url: string;
  image: string;
  tba_address: string;
  og_name: string;
  error?: string;
  isUsingFallback?: boolean;
}

async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

const METADATA_BASE_URL = process.env.NEXT_PUBLIC_METADATA_URL || 'https://ensitus.xyz';

export async function getMetadata(contract: string, tokenId: string): Promise<MetadataResponse> {
  try {
    console.log('Getting metadata for:', { contract, tokenId });

    // 1. Get OG info from contract address
    const { rows: [og] } = await sql`
      SELECT * FROM situs_ogs 
      WHERE decode(replace(contract_address, '0x', ''), 'hex') = decode(replace(${contract}, '0x', ''), 'hex')
      LIMIT 1
    `;

    if (!og) {
      console.error('OG not found for contract:', contract);
      throw new Error('OG not found');
    }

    console.log('Found OG:', og);

    // Use the existing sanitizeOGName helper from database.ts
    const sanitizedOG = sanitizeOGName(og.og_name);
    const tableName = `situs_accounts_${sanitizedOG}`;

    console.log('Looking up account in table:', tableName);

    // 2. Get account info using raw query to handle dynamic table name
    try {
      const accountQuery = await sql.query(
        `SELECT 
          token_id,
          convert_from(convert_to(account_name, 'UTF8'), 'UTF8') as account_name,
          description,
          tba_address
        FROM "${tableName}" 
        WHERE token_id = $1 
        LIMIT 1`,
        [tokenId]
      );
      
      const account = accountQuery.rows[0];

      if (!account) {
        console.error('Account not found for tokenId:', tokenId);
        throw new Error('Account not found');
      }

      console.log('Found account:', account);

      // 3. Construct and check image URLs
      const baseUrl = process.env.NEXT_PUBLIC_BLOB_URL;
      const tokenImageUrl = `${baseUrl}/${sanitizedOG}/${tokenId}.png`;
      const defaultImageUrl = `${baseUrl}/${sanitizedOG}/0.png`;
      const fallbackImageUrl = `${baseUrl}/default.png`;

      // Check images in order: token specific -> OG default -> global default
      let imageUrl = tokenImageUrl;
      let isUsingFallback = false;
      
      if (!(await checkImageExists(tokenImageUrl))) {
        console.log('Token-specific image not found, checking OG default');
        if (await checkImageExists(defaultImageUrl)) {
          imageUrl = defaultImageUrl;
        } else {
          console.log('OG default image not found, using global fallback');
          imageUrl = fallbackImageUrl;
          isUsingFallback = true;
        }
      }

      const metadata = {
        name: `${account.account_name}${og.og_name}`,
        description: account.description || '',
        animation_url: `${process.env.NEXT_PUBLIC_METADATA_URL || 'http://localhost:3000'}/metadata/${contract}/${tokenId}`,
        image: imageUrl,
        og_name: isUsingFallback ? 'default' : sanitizedOG,
        tba_address: account.tba_address,
        isUsingFallback
      };

      console.log('Generated metadata:', metadata);
      return metadata;

    } catch (dbError) {
      console.error('Database error details:', {
        error: dbError,
        tableName,
        tokenId,
        query: `SELECT * FROM "${tableName}" WHERE token_id = ${tokenId}`
      });
      throw dbError;
    }

  } catch (error) {
    console.error('Error in getMetadata:', error);
    throw error;
  }
}

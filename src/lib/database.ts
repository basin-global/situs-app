import { createPublicClient, http, getContract, PublicClient, Address } from 'viem';
import { base } from 'viem/chains';
import { sql } from '@vercel/postgres';

const FACTORY_ADDRESS = '0x67c814835E1920324634Fd6da416a0E79c949970' as const;
const FACTORY_ABI = [
  'function getTldsArray() view returns (string[] memory)',
  'function tldNamesAddresses(string memory) view returns (address)'
] as const;

const client = createPublicClient({
  chain: base,
  transport: http()
});

const factoryContract = getContract({
  address: FACTORY_ADDRESS,
  abi: FACTORY_ABI,
  client,
});

export async function updateOGs() {
  try {
    const ogs = await factoryContract.read.getTldsArray() as string[];

    for (const og of ogs) {
      const contractAddress = await factoryContract.read.tldNamesAddresses([og]) as Address;

      await sql`
        INSERT INTO situs_ogs (og_name, contract_address, last_updated)
        VALUES (${og}, ${contractAddress as string}, CURRENT_TIMESTAMP)
        ON CONFLICT (og_name) DO UPDATE SET
          contract_address = ${contractAddress as string},
          last_updated = CURRENT_TIMESTAMP
      `;

      await sql`SELECT create_og_accounts_table(${og})`;
    }

    console.log('OGs updated successfully');
  } catch (error) {
    console.error('Error updating OGs:', error);
    throw error;
  }
}

export async function getAccountsForOG(og: string) {
  try {
    const tableName = `situs_accounts_${og.replace('.', '_')}`;
    const result = await sql.query(`SELECT * FROM "${tableName}"`);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching accounts for OG ${og}:`, error);
    throw error;
  }
}

export async function updateSitusDatabase() {
  try {
    await updateOGs();
    console.log('Situs database updated successfully');
  } catch (error) {
    console.error('Error updating Situs database:', error);
    throw error;
  }
}

export async function getAllOGs() {
  try {
    const result = await sql`
      SELECT * FROM situs_ogs ORDER BY og_name
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching all OGs:', error);
    throw error;
  }
}
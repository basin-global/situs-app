import { sql } from '@vercel/postgres';
import { createPublicClient, http, getContract } from 'viem';
import { base } from 'viem/chains';

const FACTORY_ADDRESS = '0x67c814835E1920324634Fd6da416a0E79c949970';
const FACTORY_ABI = [
  'function getTldsArray() view returns (string[] memory)',
  'function tldNamesAddresses(string memory) view returns (address)'
];
const SITUS_OG_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)',
  'function buyingEnabled() view returns (bool)',
  'function price() view returns (uint256)',
  'function nameMaxLength() view returns (uint256)',
  'function royalty() view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function domainIdsNames(uint256) view returns (string)',
  'function domains(string) view returns (string, uint256, address, string)'
];

const client = createPublicClient({
  chain: base,
  transport: http()
});

const factoryContract = getContract({
  address: FACTORY_ADDRESS,
  abi: FACTORY_ABI,
  publicClient: client,
});

export async function updateOGs() {
  const ogs = await factoryContract.read.getTldsArray();

  for (const og of ogs) {
    const contractAddress = await factoryContract.read.tldNamesAddresses([og]);

    await sql`
      INSERT INTO situs_ogs (og_name, contract_address, last_updated)
      VALUES (${og}, ${contractAddress}, CURRENT_TIMESTAMP)
      ON CONFLICT (og_name) DO UPDATE SET
        contract_address = ${contractAddress},
        last_updated = CURRENT_TIMESTAMP
    `;

    await sql`SELECT create_og_accounts_table(${og})`;
  }
}

export async function updateAccountsForOG(ogName: string) {
  const ogResult = await sql`SELECT contract_address FROM situs_ogs WHERE og_name = ${ogName}`;
  if (ogResult.rows.length === 0) {
    throw new Error(`OG ${ogName} not found`);
  }
  const contractAddress = ogResult.rows[0].contract_address;
  const ogContract = getContract({
    address: contractAddress,
    abi: SITUS_OG_ABI,
    publicClient: client,
  });

  const tableName = `situs_accounts_${ogName.replace('.', '_')}`;
  const totalSupply = await ogContract.read.totalSupply();

  for (let i = 1n; i <= totalSupply; i++) {
    const tokenId = i;
    const domainName = await ogContract.read.domainIdsNames([tokenId]);

    await sql`
      INSERT INTO ${sql(tableName)} (token_id, account_name)
      VALUES (${tokenId.toString()}, ${domainName})
      ON CONFLICT (token_id) DO NOTHING
    `;
  }
}

export async function getAllOGs() {
  return await sql`SELECT * FROM situs_ogs ORDER BY og_name`;
}

export async function getAccountsForOG(ogName: string) {
  const tableName = `situs_accounts_${ogName.replace('.', '_')}`;
  return await sql`SELECT * FROM ${sql(tableName)} ORDER BY account_name`;
}

export async function getAccount(ogName: string, accountName: string) {
  const tableName = `situs_accounts_${ogName.replace('.', '_')}`;
  const result = await sql`
    SELECT * FROM ${sql(tableName)}
    WHERE account_name = ${accountName}
  `;
  return result.rows[0];
}

export async function updateSitusDatabase() {
  await updateOGs();
  const ogs = await getAllOGs();
  for (const og of ogs.rows) {
    await updateAccountsForOG(og.og_name);
  }
}
import { createPublicClient, http, parseAbi, PublicClient, HttpTransport, Chain } from 'viem';
import { base } from 'viem/chains';
import { sql } from '@vercel/postgres';
import OGABI from '@/abi/SitusOG.json';
import { useOG } from '@/contexts/og-context';

// Define a type alias for Ethereum addresses
type Address = `0x${string}`;

const FACTORY_ADDRESS = '0x67c814835E1920324634Fd6da416a0E79c949970' as const;
const FACTORY_ABI = parseAbi([
  'function getTldsArray() view returns (string[] memory)',
  'function tldNamesAddresses(string) view returns (address)'
]);

// For general use (Privy, etc.)
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

function getClient(): PublicClient<HttpTransport, Chain> {
  try {
    const client = createPublicClient<HttpTransport, Chain>({
      chain: base,
      transport: http()
    });
    console.log('Client created successfully');
    return client;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

function sanitizeOGName(og: string): string {
  return og.startsWith('.') ? og.slice(1) : og;
}

export async function updateOGs() {
  const client = getClient();

  try {
    const ogs = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'getTldsArray',
    }) as string[];

    for (const og of ogs) {
      const contractAddress = await client.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'tldNamesAddresses',
        args: [og],
      }) as Address;

      await sql`
        INSERT INTO situs_ogs (og_name, contract_address, last_updated)
        VALUES (${og}, ${contractAddress}, CURRENT_TIMESTAMP)
        ON CONFLICT (og_name) DO UPDATE SET
          contract_address = ${contractAddress},
          last_updated = CURRENT_TIMESTAMP
      `;

      const sanitizedOG = sanitizeOGName(og);
      await sql.query(`
        CREATE TABLE IF NOT EXISTS situs_accounts_${sanitizedOG} (
          token_id INTEGER PRIMARY KEY,
          account_name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          tba_address VARCHAR(42) UNIQUE,
          owner_of VARCHAR(42)
        )
      `);
    }

    console.log('OGs updated successfully');
  } catch (error) {
    console.error('Error updating OGs:', error);
    throw error;
  }
}

export async function getAccountsForOG(og: string) {
  try {
    const sanitizedOG = sanitizeOGName(og);
    const tableName = `situs_accounts_${sanitizedOG}`;
    const result = await sql.query(`
      SELECT token_id, account_name
      FROM "${tableName}"
      ORDER BY token_id ASC
    `);
    return result.rows;
  } catch (error) {
    console.error(`Error fetching accounts for OG ${og}:`, error);
    throw error;
  }
}

async function fetchAccountsForOG(client: PublicClient, ogAddress: Address, ogName: string) {
  console.log(`Fetching accounts for OG ${ogName} at address ${ogAddress}`);
  try {
    console.log(`3.1: Getting total supply for ${ogName}`);
    const totalSupply = await client.readContract({
      address: ogAddress,
      abi: OGABI,
      functionName: 'totalSupply',
    }) as bigint;

    console.log(`Total supply for ${ogName}: ${totalSupply}`);

    if (totalSupply === BigInt(0)) {
      console.log(`No tokens minted for ${ogName}`);
      return [];
    }

    const accounts = [];
    // Start from 1 instead of 0
    for (let i = BigInt(1); i <= totalSupply; i++) {
      try {
        console.log(`3.2: Fetching domain name for token ID ${i} for ${ogName}`);
        const name = await client.readContract({
          address: ogAddress,
          abi: OGABI,
          functionName: 'domainIdsNames',
          args: [i],
        }) as string;

        console.log(`Domain name ${name} fetched for token ID ${i} of ${ogName}`);

        accounts.push({ token_id: Number(i), account_name: name });
      } catch (error) {
        console.error(`Error fetching domain for token ID ${i} of ${ogName}:`, error);
        // Continue to the next token if there's an error
      }
    }

    console.log(`3.3: Fetched ${accounts.length} accounts for OG ${ogName}`);
    return accounts;
  } catch (error) {
    console.error(`Error in fetchAccountsForOG for ${ogName}:`, error);
    throw error;
  }
}

async function getTokenOwner(client: PublicClient, contractAddress: Address, tokenId: bigint): Promise<string> {
  try {
    const owner = await client.readContract({
      address: contractAddress,
      abi: OGABI,
      functionName: 'ownerOf',
      args: [tokenId],
    }) as string;
    return owner;
  } catch (error) {
    console.error(`Error getting owner for token ${tokenId} at ${contractAddress}:`, error);
    return '';
  }
}

export async function updateSitusDatabase() {
  console.log('updateSitusDatabase function called');
  const client = getClient();

  try {
    console.log('Step 1: Calling getTldsArray...');
    const ogs = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'getTldsArray',
    }) as string[];
    console.log(`Retrieved ${ogs.length} OGs from the factory contract:`, ogs);
    
    let totalAccountsProcessed = 0;
    let totalNewAccountsAdded = 0;

    for (const og of ogs) {
      try {
        console.log(`\nProcessing OG: ${og}`);
        const contractAddress = await client.readContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: 'tldNamesAddresses',
          args: [og],
        }) as Address;
        console.log(`Contract address for ${og}: ${contractAddress}`);
        
        // Update situs_ogs table
        await sql`
          INSERT INTO situs_ogs (og_name, contract_address, last_updated)
          VALUES (${og}, ${contractAddress}, CURRENT_TIMESTAMP)
          ON CONFLICT (og_name) DO UPDATE SET
            contract_address = ${contractAddress},
            last_updated = CURRENT_TIMESTAMP
        `;
        
        const sanitizedOG = sanitizeOGName(og);
        // Ensure the accounts table exists with the new columns
        await sql.query(`
          CREATE TABLE IF NOT EXISTS situs_accounts_${sanitizedOG} (
            token_id INTEGER PRIMARY KEY,
            account_name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            tba_address VARCHAR(42) UNIQUE,
            owner_of VARCHAR(42)
          )
        `);

        // Add new columns if they don't exist
        await sql.query(`
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE situs_accounts_${sanitizedOG} ADD COLUMN tba_address VARCHAR(42);
            EXCEPTION
              WHEN duplicate_column THEN NULL;
            END;
            BEGIN
              ALTER TABLE situs_accounts_${sanitizedOG} ADD COLUMN owner_of VARCHAR(42);
            EXCEPTION
              WHEN duplicate_column THEN NULL;
            END;
          END $$;
        `);

        // Fetch all accounts for this OG
        const accounts = await fetchAccountsForOG(client, contractAddress, og);
        console.log(`Retrieved ${accounts.length} accounts for OG ${og}`);

        // Get existing accounts
        const existingAccounts = await sql.query(`
          SELECT token_id, account_name, tba_address, owner_of FROM situs_accounts_${sanitizedOG}
        `);
        const existingAccountMap = new Map(existingAccounts.rows.map(row => [row.token_id, { name: row.account_name, tba: row.tba_address, owner: row.owner_of }]));

        // Insert or update accounts
        for (const account of accounts) {
          const existingAccount = existingAccountMap.get(account.token_id);
          const owner = await getTokenOwner(client, contractAddress, BigInt(account.token_id));

          if (!existingAccount) {
            await sql.query(`
              INSERT INTO situs_accounts_${sanitizedOG} (token_id, account_name, owner_of)
              VALUES ($1, $2, $3)
              ON CONFLICT (token_id) DO UPDATE SET
                account_name = EXCLUDED.account_name,
                owner_of = EXCLUDED.owner_of
            `, [Number(account.token_id), account.account_name, owner]);
            totalNewAccountsAdded++;
            console.log(`Added new account: ${account.account_name} (${account.token_id}) for OG ${og} with Owner: ${owner}`);
          } else {
            // Update if owner has changed
            if (existingAccount.owner !== owner) {
              await sql.query(`
                UPDATE situs_accounts_${sanitizedOG}
                SET owner_of = $2
                WHERE token_id = $1
              `, [Number(account.token_id), owner]);
              console.log(`Updated account: ${account.account_name} (${account.token_id}) for OG ${og} with Owner: ${owner}`);
            }
          }
        }

        totalAccountsProcessed += accounts.length;
        console.log(`Processed ${accounts.length} accounts for OG ${og}`);

      } catch (error) {
        console.error(`Error processing OG ${og}:`, error);
        // Continue to the next OG if there's an error
      }
    }
    
    console.log(`Situs database update completed. Total accounts processed: ${totalAccountsProcessed}, New accounts added: ${totalNewAccountsAdded}`);
    return { totalAccountsProcessed, totalNewAccountsAdded };
  } catch (error) {
    console.error('Error in updateSitusDatabase:', error);
    throw error;
  }
}

export async function getAllOGs() {
  console.log('Database: Executing getAllOGs query...');
  try {
    const { rows } = await sql`SELECT * FROM situs_ogs ORDER BY id ASC`;
    console.log('Database: getAllOGs result:', JSON.stringify(rows, null, 2));
    console.log('Database: Number of OGs returned:', rows.length);
    return rows;
  } catch (error) {
    console.error('Database: Error in getAllOGs:', error);
    throw error;
  }
}

export async function getOGByName(name: string) {
  const { rows } = await sql`
    SELECT 
      og_name,
      contract_address,
      name_front,
      tagline,
      description,
      email,
      website,
      chat,
      total_supply
    FROM situs_ogs 
    WHERE og_name = ${name}
  `;
  return rows[0];
}

export async function getOGByAddress(address: string) {
  const { rows } = await sql`SELECT * FROM situs_ogs WHERE contract_address = ${address}`;
  return rows[0];
}

export async function getAccountByName(og: string, accountName: string) {
  try {
    const sanitizedOG = sanitizeOGName(og);
    const tableName = `situs_accounts_${sanitizedOG}`;
    const result = await sql.query(`
      SELECT 
        token_id,
        account_name, 
        created_at, 
        tba_address, 
        owner_of
      FROM "${tableName}"
      WHERE account_name = $1
      LIMIT 1
    `, [accountName]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const account = result.rows[0];
    // Ensure token_id is returned as a number
    account.token_id = Number(account.token_id);

    return account;
  } catch (error) {
    console.error(`Error fetching account ${accountName} for OG ${og}:`, error);
    throw error;
  }
}

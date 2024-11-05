import { createPublicClient, http, parseAbi, PublicClient, HttpTransport, Chain } from 'viem';
import { base } from 'viem/chains';
import { sql } from '@vercel/postgres';
import OGABI from '@/abi/SitusOG.json';
import { useOG } from '@/contexts/og-context';
import { calculateTBA } from '@/utils/tba';
import type { ValidationReport } from '@/types';

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

export function sanitizeOGName(og: string): string {
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
      
      // Get total supply from contract
      const totalSupply = await client.readContract({
        address: contractAddress,
        abi: OGABI,
        functionName: 'totalSupply',
      }) as bigint;

      // Update OGs table with total supply
      await sql`
        INSERT INTO situs_ogs (og_name, contract_address, total_supply)
        VALUES (${og}, ${contractAddress}, ${Number(totalSupply)})
        ON CONFLICT (og_name) DO UPDATE SET
          contract_address = ${contractAddress},
          total_supply = ${Number(totalSupply)}
      `;
      
      const sanitizedOG = sanitizeOGName(og);

      // Verify database matches contract state
      const dbAccounts = await sql.query(`
        SELECT token_id, account_name, tba_address 
        FROM situs_accounts_${sanitizedOG}
        ORDER BY token_id ASC
      `);

      // Check if database count matches totalSupply
      if (dbAccounts.rows.length !== Number(totalSupply)) {
        console.log(`Mismatch found for ${og}: DB has ${dbAccounts.rows.length} accounts, contract has ${totalSupply}`);
      }

      // Verify each token ID and name matches the contract
      for (let i = BigInt(1); i <= totalSupply; i++) {
        const contractName = await client.readContract({
          address: contractAddress,
          abi: OGABI,
          functionName: 'domainIdsNames',
          args: [i],
        }) as string;

        const dbAccount = dbAccounts.rows.find(row => Number(row.token_id) === Number(i));
        
        if (!dbAccount) {
          // Missing account in DB
          const tba = await calculateTBA(contractAddress, Number(i));
          await sql.query(`
            INSERT INTO situs_accounts_${sanitizedOG} 
              (token_id, account_name, tba_address)
            VALUES ($1, $2, $3)
          `, [Number(i), contractName, tba]);
          console.log(`Added missing account ${contractName} (${i}) to DB`);
        } else if (dbAccount.account_name !== contractName) {
          // Name mismatch
          console.error(`Name mismatch for token ${i}: DB has ${dbAccount.account_name}, contract has ${contractName}`);
          // Update to match contract
          await sql.query(`
            UPDATE situs_accounts_${sanitizedOG}
            SET account_name = $2
            WHERE token_id = $1
          `, [Number(i), contractName]);
        }

        // Ensure TBA exists and is correct
        if (!dbAccount?.tba_address) {
          const tba = await calculateTBA(contractAddress, Number(i));
          await sql.query(`
            UPDATE situs_accounts_${sanitizedOG}
            SET tba_address = $2
            WHERE token_id = $1
          `, [Number(i), tba]);
        }
      }

      // Remove any accounts that don't exist in contract
      await sql.query(`
        DELETE FROM situs_accounts_${sanitizedOG}
        WHERE token_id > $1
      `, [Number(totalSupply)]);
    }

    return { success: true, message: 'Database synchronized with contract state' };
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
      total_supply,
      group_ensurance
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

export async function verifyDatabaseState(): Promise<ValidationReport> {
  console.log('Starting database verification...');
  const client = getClient();
  const report = {
    ogs: { 
      total: 0, 
      missing: [] as string[], 
      invalid: [] as string[],
      totalSupplyMismatch: [] as string[]
    },
    accounts: { total: 0, missing: [] as string[], invalid: [] as string[], missingTBA: [] as string[] },
    summary: ''
  };

  try {
    console.log('Fetching OGs from blockchain...');
    const onchainOGs = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'getTldsArray',
    }) as string[];
    console.log(`Found ${onchainOGs.length} OGs on chain:`, onchainOGs);

    console.log('Fetching OGs from database...');
    const dbOGs = await sql`SELECT og_name, contract_address, total_supply FROM situs_ogs`;
    console.log(`Found ${dbOGs.rows.length} OGs in database`);
    
    report.ogs.total = onchainOGs.length;

    for (const og of onchainOGs) {
      console.log(`\nVerifying OG: ${og}`);
      const contractAddress = await client.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'tldNamesAddresses',
        args: [og],
      }) as Address;

      // Get total supply from contract
      const contractTotalSupply = await client.readContract({
        address: contractAddress,
        abi: OGABI,
        functionName: 'totalSupply',
      }) as bigint;

      // Get OG data from database and check everything at once
      const dbOG = dbOGs.rows.find(row => row.og_name === og);
      if (!dbOG) {
        report.ogs.missing.push(og);
      } else {
        // Check contract address
        if (dbOG.contract_address.toLowerCase() !== contractAddress.toLowerCase()) {
          report.ogs.invalid.push(`${og} (DB: ${dbOG.contract_address}, Chain: ${contractAddress})`);
        }
        // Check total supply
        if (dbOG.total_supply !== Number(contractTotalSupply)) {
          report.ogs.totalSupplyMismatch.push(
            `${og} (DB: ${dbOG.total_supply || 'null'}, Chain: ${contractTotalSupply})`
          );
        }
      }

      // Check accounts
      const sanitizedOG = sanitizeOGName(og);
      const totalSupply = await client.readContract({
        address: contractAddress,
        abi: OGABI,
        functionName: 'totalSupply',
      }) as bigint;

      // Get all accounts from database
      const dbAccounts = await sql.query(`
        SELECT token_id, account_name, tba_address 
        FROM situs_accounts_${sanitizedOG}
        ORDER BY token_id ASC
      `);

      report.accounts.total += Number(totalSupply);

      // Check each token ID
      for (let i = BigInt(1); i <= totalSupply; i++) {
        const contractName = await client.readContract({
          address: contractAddress,
          abi: OGABI,
          functionName: 'domainIdsNames',
          args: [i],
        }) as string;

        const dbAccount = dbAccounts.rows.find(row => Number(row.token_id) === Number(i));
        
        if (!dbAccount) {
          report.accounts.missing.push(`${og}:${contractName} (ID: ${i})`);
        } else {
          if (dbAccount.account_name !== contractName) {
            report.accounts.invalid.push(
              `${og}:${dbAccount.account_name} (DB) vs ${contractName} (Chain) - ID: ${i}`
            );
          }
          if (!dbAccount.tba_address) {
            report.accounts.missingTBA.push(`${og}:${contractName} (ID: ${i})`);
          }
        }
      }

      // Check for extra accounts in database
      const extraAccounts = dbAccounts.rows.filter(row => Number(row.token_id) > Number(totalSupply));
      if (extraAccounts.length > 0) {
        report.accounts.invalid.push(
          ...extraAccounts.map(acc => `${og}:${acc.account_name} (Extra in DB, ID: ${acc.token_id})`)
        );
      }
    }

    console.log('\nVerification complete. Generating report...');
    // Generate summary
    report.summary = `
Database Verification Report:
----------------------------
OGs Total: ${report.ogs.total}
Missing OGs: ${report.ogs.missing.length}
Invalid OG Addresses: ${report.ogs.invalid.length}
Total Supply Mismatches: ${report.ogs.totalSupplyMismatch.length}

Accounts Total: ${report.accounts.total}
Missing Accounts: ${report.accounts.missing.length}
Invalid Accounts: ${report.accounts.invalid.length}
Missing TBA Addresses: ${report.accounts.missingTBA.length}

${report.ogs.missing.length > 0 ? `\nMissing OGs:\n${report.ogs.missing.join('\n')}` : ''}
${report.ogs.invalid.length > 0 ? `\nInvalid OG Addresses:\n${report.ogs.invalid.join('\n')}` : ''}
${report.ogs.totalSupplyMismatch.length > 0 ? `\nTotal Supply Mismatches:\n${report.ogs.totalSupplyMismatch.join('\n')}` : ''}
${report.accounts.missing.length > 0 ? `\nMissing Accounts:\n${report.accounts.missing.join('\n')}` : ''}
${report.accounts.invalid.length > 0 ? `\nInvalid Accounts:\n${report.accounts.invalid.join('\n')}` : ''}
${report.accounts.missingTBA.length > 0 ? `\nMissing TBA Addresses:\n${report.accounts.missingTBA.join('\n')}` : ''}
    `;

    return report;
  } catch (error) {
    console.error('Error verifying database state:', error);
    throw error;
  }
}

export async function fixMismatches(report: ValidationReport) {
  console.log('Starting fixMismatches with report:', {
    missingAccounts: report.accounts.missing.length,
    invalidAccounts: report.accounts.invalid.length,
    totalSupplyMismatches: report.ogs.totalSupplyMismatch.length
  });

  const client = getClient();
  const results = {
    fixed: {
      accounts: [] as string[],
      totalSupply: [] as string[],
      tbaAddresses: [] as string[],
    },
    failed: [] as string[],
    total: 0
  };

  try {
    const accountsToFix = Array.from(new Set([...report.accounts.missing, ...report.accounts.invalid]));
    console.log('Accounts to fix:', accountsToFix);
    
    for (const accountInfo of accountsToFix) {
      console.log('\nProcessing account:', accountInfo);
      const [og, accountDetails] = accountInfo.split(':');
      try {
        console.log('Getting contract address for OG:', og);
        const contractAddress = await client.readContract({
          address: FACTORY_ADDRESS,
          abi: FACTORY_ABI,
          functionName: 'tldNamesAddresses',
          args: [og],
        }) as Address;
        console.log('Contract address:', contractAddress);

        // Try to extract token ID from the account info
        let tokenId = Number(accountInfo.match(/ID: (\d+)\)$/)?.[1]);
        let contractName: string;

        // If we couldn't get the token ID from the string, try using domains method
        if (!tokenId || isNaN(tokenId)) {
          console.log('Token ID not found in string, trying domains method');
          const accountName = accountDetails.split(' ')[0]; // Get the name part
          console.log('Looking up domain:', accountName);
          
          const domainInfo = await client.readContract({
            address: contractAddress,
            abi: OGABI,
            functionName: 'domains',
            args: [accountName],
          }) as { name: string; tokenId: bigint; holder: string; data: string };

          console.log('Domain info:', domainInfo);
          
          if (domainInfo && domainInfo.tokenId) {
            tokenId = Number(domainInfo.tokenId);
            contractName = domainInfo.name;
            console.log('Found token ID from domains:', tokenId);
          } else {
            console.warn('Failed to get token info from domains method');
            results.failed.push(`Failed to get info: ${accountInfo}`);
            continue;
          }
        } else {
          // Get the name from contract if we had the token ID
          contractName = await client.readContract({
            address: contractAddress,
            abi: OGABI,
            functionName: 'domainIdsNames',
            args: [BigInt(tokenId)],
          }) as string;
        }

        console.log('Calculating TBA...');
        const tba = await calculateTBA(contractAddress, tokenId);
        console.log('TBA calculated:', tba);
        
        const sanitizedOG = sanitizeOGName(og);
        console.log('Inserting into database for OG:', sanitizedOG);
        
        await sql.query(`
          INSERT INTO situs_accounts_${sanitizedOG} 
            (token_id, account_name, tba_address)
          VALUES ($1, $2, $3)
          ON CONFLICT (token_id) DO UPDATE SET
            account_name = $2,
            tba_address = $3
        `, [tokenId, contractName, tba]);

        results.fixed.accounts.push(`${og}:${contractName}`);
        results.total++;
        console.log('Successfully fixed account:', `${og}:${contractName}`);
      } catch (error) {
        console.error(`Failed to fix account ${accountInfo}:`, error);
        results.failed.push(`Account: ${accountInfo}`);
      }
    }

    console.log('\nFix results:', {
      totalFixed: results.total,
      accountsFixed: results.fixed.accounts.length,
      failed: results.failed.length
    });

    return results;
  } catch (error) {
    console.error('Error in fixMismatches:', error);
    throw error;
  }
}

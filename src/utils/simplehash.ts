import { getSitusOGs } from '../config/situs';
import { getChainBySimplehashName } from '@/config/chains';

// Updated NFT interface
export interface NFT {
  id: string;
  name: string;
  image: string;
  description?: string;
  attributes: Array<{ trait_type: string; value: string }>;
  contract_address: string;
}

async function callSimpleHash(endpoint: string, params: Record<string, string | string[]>) {
  const url = new URL('/api/simplehash', window.location.origin);
  url.searchParams.append('endpoint', endpoint);
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      url.searchParams.append(key, value.join(','));
    } else {
      url.searchParams.append(key, value);
    }
  });

  console.log("Local API route URL:", url.toString());
  
  // Log what the SimpleHash URL should look like
  const simpleHashUrl = new URL(`https://api.simplehash.com/api/v0/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      simpleHashUrl.searchParams.append(key, value.join(','));
    } else {
      simpleHashUrl.searchParams.append(key, value);
    }
  });
  console.log("Expected SimpleHash API URL:", simpleHashUrl.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    console.error('SimpleHash API error:', response.status, errorText);
    throw new Error(`SimpleHash API error: ${response.status} ${response.statusText}\n${errorText}`);
  }
  return response.json();
}

export async function fetchNFTsFromContract(
  contractAddress: string,
  cursor?: string,
  limit: number = 50,
  search?: string
): Promise<{ nfts: NFT[], next_cursor: string | null }> {
  const params: Record<string, string> = {
    contractAddress,
    chain: 'base',
    limit: limit.toString()
  };
  if (cursor) params.cursor = cursor;
  if (search) params.search = search;

  try {
    const data = await callSimpleHash('nfts/contract', params);
    
    const nfts: NFT[] = data.nfts.map((nft: any) => ({
      id: nft.token_id,
      name: nft.name || `#${nft.token_id}`,
      description: nft.description,
      image: nft.image_url || nft.image_original_url,
      attributes: nft.attributes || [],
      contract_address: nft.contract_address,
    }));

    return { nfts, next_cursor: data.next_cursor };
  } catch (error) {
    console.error('Error in fetchNFTsFromContract:', error);
    throw error;
  }
}

export async function fetchNFTByTokenId(
  contractAddress: string,
  tokenId: string
): Promise<NFT | null> {
  try {
    const nft = await callSimpleHash('nfts/token', {
      contractAddress,
      tokenId,
      chain: 'base'
    });

    return {
      id: nft.token_id,
      name: nft.name || `#${nft.token_id}`,
      description: nft.description,
      image: nft.image_url || nft.image_original_url,
      attributes: nft.attributes || [],
      contract_address: nft.contract_address,
    };
  } catch (error) {
    console.error('Error in fetchNFTByTokenId:', error);
    return null;
  }
}

export async function fetchNFTsForOwner(
  ownerAddress: string,
  cursor?: string
): Promise<{ nfts: NFT[], next_cursor: string | null }> {
  const params: Record<string, string> = {
    chains: 'base',
    wallet_addresses: ownerAddress
  };
  if (cursor) params.cursor = cursor;

  try {
    const data = await callSimpleHash('nfts/owners', params);

    const nfts: NFT[] = data.nfts.map((nft: any) => ({
      id: nft.token_id,
      name: nft.name || `#${nft.token_id}`,
      description: nft.description,
      image: nft.image_url || nft.image_original_url,
      attributes: nft.attributes || [],
      contract_address: nft.contract_address,
    }));

    return {
      nfts,
      next_cursor: data.next_cursor,
    };
  } catch (error) {
    console.error('Error in fetchNFTsForOwner:', error);
    throw error;
  }
}

interface NFTAsset {
  contract_address: string;
  token_id: string;
  name: string;
  image_url: string;
  token_type: 'ERC721' | 'ERC1155';
  balance: string;
}

interface TokenAsset {
  contract_address: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export interface TBAAssets {
  nfts: NFTAsset[];
  tokens: TokenAsset[];
}

export async function fetchTBAAssets(tbaAddress: string, chain: string): Promise<TBAAssets> {
  console.log(`Fetching TBA assets for address: ${tbaAddress} on chain: ${chain}`);

  const selectedChain = getChainBySimplehashName(chain);
  if (!selectedChain) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  try {
    // Fetch NFTs (ERC721 and ERC1155)
    const nftData = await callSimpleHash('nfts/owners', {
      chains: selectedChain.simplehashName,
      wallet_addresses: tbaAddress
    });

    // Fetch ERC20 tokens
    const tokenData = await callSimpleHash('fungibles/balances', {
      chains: selectedChain.simplehashName,
      wallet_addresses: tbaAddress
    });

    // Fetch native token balance
    const nativeTokenData = await callSimpleHash('native_tokens/balances', {
      chains: selectedChain.simplehashName,
      wallet_addresses: tbaAddress
    });

    const nfts: NFTAsset[] = nftData.nfts?.map((asset: any) => ({
      contract_address: asset.contract.address,
      token_id: asset.token_id,
      name: asset.name || `#${asset.token_id}`,
      image_url: asset.image_url || asset.contract.image_url,
      token_type: asset.contract.type,
      balance: asset.owned_quantity || '1',
    })) || [];

    const tokens: TokenAsset[] = tokenData.fungibles?.map((fungible: any) => {
      const balance = fungible.queried_wallet_balances.find((b: any) => b.address.toLowerCase() === tbaAddress.toLowerCase());
      return {
        contract_address: fungible.fungible_id.split('.')[1],
        name: fungible.name,
        symbol: fungible.symbol,
        balance: balance ? balance.quantity_string : '0',
        decimals: fungible.decimals,
      };
    }) || [];

    // Add native token to tokens array
    if (nativeTokenData.balances && nativeTokenData.balances.length > 0) {
      const nativeBalance = nativeTokenData.balances[0];
      tokens.unshift({
        contract_address: 'native',
        name: selectedChain.nativeCurrency.name,
        symbol: selectedChain.nativeCurrency.symbol,
        balance: nativeBalance.quantity_string,
        decimals: selectedChain.nativeCurrency.decimals,
      });
    }

    console.log(`Processed assets for ${chain}:`, { nfts, tokens });

    return { nfts, tokens };
  } catch (error) {
    console.error(`Error fetching TBA assets from SimpleHash for ${chain}:`, error);
    throw error;
  }
}

export async function fetchNFTsByContract(contractAddress: string, cursor?: string, limit: number = 20) {
  const params: Record<string, string> = {
    contractAddress,
    chain: 'base',
    limit: limit.toString()
  };
  if (cursor) params.cursor = cursor;

  const data = await callSimpleHash('nfts/contract', params);
  
  const nfts = data.nfts.map((nft: any) => ({
    id: nft.token_id,
    name: nft.name || `#${nft.token_id}`,
    image: nft.image_url || nft.image_original_url || '',
    description: nft.description,
    attributes: nft.attributes || [],
    contract_address: nft.contract_address,
  }));

  return { nfts, next_cursor: data.next_cursor };
}

export async function resolveENS(address: string): Promise<string> {
  console.log(`resolveENS function called with address: ${address}`);
  
  try {
    const data = await callSimpleHash('ens/reverse_lookup', {
      wallet_addresses: address
    });

    if (Array.isArray(data) && data.length > 0 && data[0].ens) {
      console.log(`ENS domain found: ${data[0].ens}`);
      return data[0].ens;
    } else {
      console.log(`No ENS domain found for address: ${address}`);
      return address;
    }
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return address;
  }
}

export function getContractAddressFromOGName(ogName: string): string {
  const situsOGs = getSitusOGs();
  const situsOG = situsOGs.find(og => og.name === ogName || og.name === `.${ogName}`);
  if (!situsOG) {
    throw new Error(`No matching Situs OG found for the given OG name: ${ogName}`);
  }
  return situsOG.contractAddress;
}

export async function checkUserOGs(walletAddress: string, contractAddresses: string[]) {
  console.log("checkUserOGs called with:", walletAddress, contractAddresses);

  try {
    const params = {
      chains: 'base',
      wallet_addresses: walletAddress,
      contract_addresses: contractAddresses.join(',')
    };
    console.log("Params being sent to SimpleHash:", params);

    const data = await callSimpleHash('nfts/owners', params);
    
    console.log("SimpleHash API response:", data);

    // The API should only return NFTs from the specified contracts
    const ownedOGs = data.nfts.map(nft => nft.contract_address);
    console.log("Owned Situs OG contracts:", ownedOGs);

    return ownedOGs;
  } catch (error) {
    console.error("Error in checkUserOGs:", error);
    return []; // Return an empty array if there's an error
  }
}

export async function getNFTMetadata(chain: string, contractAddress: string, tokenId: string) {
  return callSimpleHash(`nfts/${chain}/${contractAddress}/${tokenId}`, {});
}

export async function getCollectionMetadata(chain: string, contractAddress: string) {
  return callSimpleHash(`nfts/collections/${chain}/${contractAddress}`, {});
}
const SIMPLEHASH_API_KEY = process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY;

// Updated NFT interface
export interface NFT {
  id: string;
  name: string;
  image: string; // Make sure this property exists
  description?: string;
  attributes: Array<{ trait_type: string; value: string }>;
  contract_address: string; // Added this property
}

export async function fetchNFTsFromContract(
  contractAddress: string,
  cursor?: string,
  limit: number = 50,
  search?: string
): Promise<{ nfts: NFT[], next_cursor: string | null }> {
  const url = new URL(`https://api.simplehash.com/api/v0/nfts/base/${contractAddress}`);
  url.searchParams.append('limit', limit.toString());
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }
  if (search) {
    url.searchParams.append('search', search);
  }

  console.log('Fetching NFTs from URL:', url.toString());
  console.log('API Key present:', !!SIMPLEHASH_API_KEY);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-KEY': SIMPLEHASH_API_KEY || '',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SimpleHash API error:', response.status, errorText);
      throw new Error(`SimpleHash API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('SimpleHash API response:', JSON.stringify(data, null, 2));

    if (!data.nfts || !Array.isArray(data.nfts)) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Unexpected API response structure');
    }

    console.log('Number of NFTs returned:', data.nfts.length);

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
  const url = new URL(`https://api.simplehash.com/api/v0/nfts/base/${contractAddress}/${tokenId}`);

  console.log('Fetching NFT from URL:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-KEY': SIMPLEHASH_API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SimpleHash API error:', response.status, errorText);
      throw new Error(`SimpleHash API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const nft = await response.json();
    console.log('SimpleHash API response:', JSON.stringify(nft, null, 2));

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

const API_BASE_URL = 'https://api.simplehash.com/api/v0/nfts';

export async function fetchNFTsForOwner(
  ownerAddress: string,
  cursor?: string,
  limit: number = 50
): Promise<{ nfts: NFT[], next_cursor: string | null }> {
  const url = new URL(`${API_BASE_URL}/owners`);
  url.searchParams.append('chains', 'base');
  url.searchParams.append('wallet_addresses', ownerAddress);
  url.searchParams.append('limit', limit.toString());
  if (cursor) {
    url.searchParams.append('cursor', cursor);
  }

  console.log('Fetching NFTs from URL:', url.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-KEY': SIMPLEHASH_API_KEY || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SimpleHash API error:', response.status, errorText);
      throw new Error(`SimpleHash API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('SimpleHash API response:', JSON.stringify(data, null, 2));

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

// Add this import if not already present
import axios from 'axios';

import { getChainBySimplehashName } from '@/config/chains';

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

  const apiKey = process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY;
  if (!apiKey) {
    throw new Error('SimpleHash API key is not set');
  }

  const selectedChain = getChainBySimplehashName(chain);
  if (!selectedChain) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  console.log(`Fetching TBA assets for address: ${tbaAddress} on chain: ${chain}`);

  try {
    // Fetch NFTs (ERC721 and ERC1155)
    const nftResponse = await axios.get(`https://api.simplehash.com/api/v0/nfts/owners?chains=${selectedChain.simplehashName}&wallet_addresses=${tbaAddress}`, {
      headers: { 'X-API-KEY': apiKey },
    });

    // Fetch ERC20 tokens
    const tokenResponse = await axios.get(`https://api.simplehash.com/api/v0/fungibles/balances?chains=${selectedChain.simplehashName}&wallet_addresses=${tbaAddress}`, {
      headers: { 'X-API-KEY': apiKey },
    });

    // Fetch native token balance
    const nativeTokenResponse = await axios.get(`https://api.simplehash.com/api/v0/native_tokens/balances?chains=${selectedChain.simplehashName}&wallet_addresses=${tbaAddress}`, {
      headers: { 'X-API-KEY': apiKey },
    });

    console.log('Raw SimpleHash NFT response:', JSON.stringify(nftResponse.data, null, 2));
    console.log('Raw SimpleHash Token response:', JSON.stringify(tokenResponse.data, null, 2));
    console.log('Raw SimpleHash Native Token response:', JSON.stringify(nativeTokenResponse.data, null, 2));

    const nfts: NFTAsset[] = nftResponse.data.nfts?.map((asset: any) => ({
      contract_address: asset.contract.address,
      token_id: asset.token_id,
      name: asset.name || `#${asset.token_id}`,
      image_url: asset.image_url || asset.contract.image_url,
      token_type: asset.contract.type,
      balance: asset.owned_quantity || '1',
    })) || [];

    const tokens: TokenAsset[] = tokenResponse.data.fungibles?.map((fungible: any) => {
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
    if (nativeTokenResponse.data.balances && nativeTokenResponse.data.balances.length > 0) {
      const nativeBalance = nativeTokenResponse.data.balances[0];
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
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    throw error; // Re-throw the error instead of returning empty arrays
  }
}

export async function fetchNFTsByContract(contractAddress: string, cursor?: string, limit: number = 20) {
  const apiKey = process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY;
  const chain = 'base';  // Adjust this if needed
  const url = `https://api.simplehash.com/api/v0/nfts/${chain}/${contractAddress}?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'X-API-KEY': apiKey || '',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Map the API response to your NFT interface
  const nfts = data.nfts.map((nft: any) => ({
    id: nft.token_id,
    name: nft.name || `#${nft.token_id}`,
    image: nft.image_url || nft.image_original_url || '',  // Fallback to empty string if both are undefined
    description: nft.description,
    attributes: nft.attributes || [],
    contract_address: nft.contract_address,
  }));

  return { nfts, next_cursor: data.next_cursor };
}

export async function resolveENS(address: string): Promise<string> {
  console.log(`resolveENS function called with address: ${address}`);
  console.log('NEXT_PUBLIC_SIMPLEHASH_API_KEY:', process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY ? 'Set' : 'Not set');
  
  if (!process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY) {
    console.error('SimpleHash API key is not set');
    return address;
  }

  try {
    const url = `https://api.simplehash.com/api/v0/ens/reverse_lookup?wallet_addresses=${address}`;
    console.log(`Fetching from URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': SIMPLEHASH_API_KEY || '',
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return address; // Return the original address if there's an error
    }

    const data = await response.json();
    console.log(`SimpleHash API response:`, data);

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
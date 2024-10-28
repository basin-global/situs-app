import axios from 'axios';
import { getActiveChains } from '@/config/chains';
import { isSpamContract } from '@/config/spamContracts';

const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY;
const ACTIVE_CHAINS = getActiveChains().map(chain => chain.simplehashName).join(',');

console.log('SIMPLEHASH_API_KEY is present:', !!SIMPLEHASH_API_KEY);
console.log('Initializing simpleHashApi with API Key:', SIMPLEHASH_API_KEY ? 'Present' : 'Missing');
console.log('Active chains:', ACTIVE_CHAINS);

export const simpleHashApi = axios.create({
  baseURL: 'https://api.simplehash.com/api/v0',
  headers: {
    'X-API-KEY': SIMPLEHASH_API_KEY,
  },
});

export type ActiveChain = string; // Rename this type

export async function fetchNFTsByTBA(tbaAddress: string, chain?: ActiveChain) {
  try {
    const params: any = {
      wallet_addresses: tbaAddress,
      limit: 50,
      chains: chain || ACTIVE_CHAINS,
    };

    console.log('Fetching NFTs with params:', params);

    const response = await simpleHashApi.get('/nfts/owners', { params });
    const allNfts = response.data.nfts;

    // Filter out NFTs from spam contracts
    const filteredNfts = allNfts.filter((nft: any) => {
      return !isSpamContract(nft.chain, nft.contract_address);
    });

    console.log('Filtered NFTs:', filteredNfts);

    return filteredNfts;
  } catch (error) {
    console.error('Error fetching NFTs by TBA:', error);
    throw error;
  }
}

export async function fetchNFTDetails(chain: ActiveChain, contractAddress: string, tokenId: string) {
  try {
    const response = await simpleHashApi.get(`/nfts/${chain}/${contractAddress}/${tokenId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw error;
  }
}

export async function fetchERC20Balances(tbaAddress: string) {
  console.log('fetchERC20Balances: Called with tbaAddress:', tbaAddress);
  try {
    console.log('Chains to query:', ACTIVE_CHAINS);

    const url = `/fungibles/balances?chains=${ACTIVE_CHAINS}&wallet_addresses=${tbaAddress}&include_prices=1`;
    console.log('SimpleHash API URL:', `${simpleHashApi.defaults.baseURL}${url}`);

    const response = await simpleHashApi.get(url);
    const data = response.data;

    const chainsInResponse = Array.from(new Set(data.fungibles.map((token: any) => token.chain)));
    console.log('Chains in response:', chainsInResponse);

    const missingChains = ACTIVE_CHAINS.split(',').filter(chain => !chainsInResponse.includes(chain));
    console.log('Missing chains:', missingChains);

    // Log all Polygon tokens before filtering
    const polygonTokens = data.fungibles.filter((token: any) => token.chain === 'polygon');
    console.log('All Polygon tokens before filtering:', polygonTokens);

    // Filter out spam tokens
    const filteredTokens = data.fungibles.filter((token: any) => {
      const isSpam = isSpamContract(token.chain, token.fungible_id);
      if (token.chain === 'polygon') {
        console.log(`Polygon token ${token.fungible_id}: isSpam = ${isSpam}`);
      }
      return !isSpam;
    });

    // Log Polygon tokens after filtering
    const filteredPolygonTokens = filteredTokens.filter((token: any) => token.chain === 'polygon');
    console.log('Filtered Polygon tokens:', filteredPolygonTokens);

    console.log('Filtered tokens count:', filteredTokens.length);

    // Add empty arrays for missing chains
    const result = { ...data, fungibles: filteredTokens };
    missingChains.forEach(chain => {
      if (!result[chain]) {
        result[chain] = [];
      }
    });

    return result;
  } catch (error) {
    console.error('Error fetching ERC20 balances:', error);
    throw error;
  }
}

export async function fetchNativeBalances(tbaAddress: string) {
  console.log('fetchNativeBalances: Called with tbaAddress:', tbaAddress);
  try {
    const url = `/native_tokens/balances?chains=${ACTIVE_CHAINS}&wallet_addresses=${tbaAddress}`;
    console.log('SimpleHash API URL for native tokens:', `${simpleHashApi.defaults.baseURL}${url}`);

    const response = await simpleHashApi.get(url);
    const data = response.data;

    console.log('Native tokens count:', data.native_tokens.length);

    return data.native_tokens;
  } catch (error) {
    console.error('Error fetching native balances:', error);
    throw error;
  }
}

export async function fetchAllBalances(tbaAddress: string) {
  try {
    const [erc20Data, nativeTokens] = await Promise.all([
      fetchERC20Balances(tbaAddress),
      fetchNativeBalances(tbaAddress)
    ]);

    // Combine ERC20 and native tokens
    const combinedTokens = [...nativeTokens, ...erc20Data.fungibles];

    // Group tokens by chain
    const groupedTokens = combinedTokens.reduce((acc, token) => {
      if (!acc[token.chain]) {
        acc[token.chain] = [];
      }
      acc[token.chain].push(token);
      return acc;
    }, {} as Record<string, any[]>);

    return { ...erc20Data, fungibles: combinedTokens, groupedBalances: groupedTokens };
  } catch (error) {
    console.error('Error fetching all balances:', error);
    throw error;
  }
}

export async function fetchNFTsByContract(chain: string, contractAddress: string) {
  try {
    const response = await simpleHashApi.get(`/nfts/${chain}/${contractAddress}`);
    
    if (!response.data || !response.data.nfts) {
      throw new Error('Invalid response format from SimpleHash API');
    }

    // Transform the data to match the format expected by AssetCard
    const transformedNfts = response.data.nfts.map((nft: any) => ({
      ...nft,
      // Ensure all required fields are present
      nft_id: nft.nft_id || `${chain}-${contractAddress}-${nft.token_id}`,
      name: nft.name || 'Unnamed NFT',
      image_url: nft.image_url || '',
      collection: nft.collection || { name: 'Unknown Collection' },
      contract_address: nft.contract_address || contractAddress,
      token_id: nft.token_id || '',
      chain: nft.chain || chain,
      contract: nft.contract || { type: 'ERC1155' },
      owners: nft.owners || []
    }));

    console.log('Transformed NFTs:', transformedNfts);
    return transformedNfts;
  } catch (error) {
    console.error(`Error fetching NFTs for ${chain}/${contractAddress}:`, error);
    throw error;
  }
}

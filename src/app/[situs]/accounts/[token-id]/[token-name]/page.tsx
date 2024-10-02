'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchNFTByTokenId, fetchTBAAssets, NFT, resolveENS, TBAAssets as SimplehashTBAAssets } from '@/utils/simplehash';
import { TokenboundClient } from '@tokenbound/sdk';
import { createPublicClient, http, Address } from 'viem';
import { usePrivy } from '@privy-io/react-auth';
import { supportedChains, getChainById } from '@/config/chains';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AccountsNavigation } from '@/components/accounts-navigation';
import { getOGByName, SitusOG } from '@/config/situs';

interface ERC721Asset {
  contractAddress: string;
  tokenId: string;
  name: string;
  imageUrl: string;
}

interface ERC1155Asset {
  contractAddress: string;
  tokenId: string;
  name: string;
  imageUrl: string;
  balance: string;
}

interface ERC20Token {
  contractAddress: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
}

interface TBAAssets extends SimplehashTBAAssets {}

interface ChainAssets {
  [chain: string]: TBAAssets | undefined;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface PageProps {
  params: {
    situs: string;
    'token-id': string;
    'token-name': string;
  };
}

export default function NFTPage({ params }: PageProps) {
  console.log('NFTPage render start, params:', params);
  const [nft, setNFT] = useState<NFT | null>(null);
  const [tbaAddress, setTbaAddress] = useState<Address | null>(null);
  const [stewardAddress, setStewardAddress] = useState<Address | null>(null);
  const [tbaAssets, setTbaAssets] = useState<ChainAssets>({});
  const [selectedChain, setSelectedChain] = useState<string>('Base');
  const { login, authenticated, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedHoldAddress, setResolvedHoldAddress] = useState<string>('');
  const [resolvedTendAddress, setResolvedTendAddress] = useState<string>('');
  const [situsOG, setSitusOG] = useState<SitusOG | null>(null);

  const tokenId = params['token-id'];
  const tokenName = params['token-name'];

  useEffect(() => {
    async function fetchSitusOG() {
      try {
        console.log('Fetching Situs OG for:', params.situs);
        const og = await getOGByName(params.situs);
        console.log('Fetched Situs OG:', og);
        if (og) {
          setSitusOG(og);
        } else {
          console.error('No Situs OG found for:', params.situs);
          setError('Invalid situs specified.');
        }
      } catch (error) {
        console.error('Error fetching Situs OG:', error);
        setError('Failed to load Situs OG information');
      }
    }
    fetchSitusOG();
  }, [params.situs]);

  useEffect(() => {
    if (!situsOG) return;

    const fetchNFTData = async () => {
      try {
        console.log('Fetching NFT data for contract:', situsOG.contractAddress, 'and tokenId:', tokenId);
        const fetchedNFT = await fetchNFTByTokenId(situsOG.contractAddress, tokenId);
        console.log('Fetched NFT:', fetchedNFT);
        if (fetchedNFT) {
          setNFT(fetchedNFT);
          await fetchTBAAndStewardAddresses(situsOG.contractAddress, tokenId);
        } else {
          setError('NFT not found');
        }
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        setError('Error fetching NFT data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTData();
  }, [situsOG, tokenId]);

  const fetchTBAAndStewardAddresses = async (contractAddress: string, tokenId: string) => {
    const baseChain = getChainById(8453);
    if (!baseChain) {
      throw new Error('Base chain not found');
    }
    const basePublicClient = createPublicClient({
      chain: baseChain,
      transport: http()
    });

    const tokenboundClient = new TokenboundClient({ 
      chainId: 8453,
      publicClient: basePublicClient
    });

    const tba = await tokenboundClient.getAccount({
      tokenContract: contractAddress as Address,
      tokenId: tokenId
    });
    setTbaAddress(tba);

    const steward = await basePublicClient.readContract({
      address: contractAddress as Address,
      abi: [{ 
        name: 'ownerOf', 
        type: 'function', 
        inputs: [{ name: 'tokenId', type: 'uint256' }], 
        outputs: [{ name: '', type: 'address' }] 
      }],
      functionName: 'ownerOf',
      args: [BigInt(tokenId)]
    });
    setStewardAddress(steward as Address);
  };

  useEffect(() => {
    if (tbaAddress) {
      fetchTBAAssets(tbaAddress, selectedChain).then(assets => {
        setTbaAssets(prev => ({ ...prev, [selectedChain]: assets }));
      }).catch(console.error);
    }
  }, [tbaAddress, selectedChain]);

  useEffect(() => {
    if (tbaAddress) {
      resolveENS(tbaAddress).then(setResolvedHoldAddress);
    }
    if (stewardAddress) {
      resolveENS(stewardAddress).then(setResolvedTendAddress);
    }
  }, [tbaAddress, stewardAddress]);

  const isConnectedUserSteward = useMemo(() => {
    return user?.wallet?.address?.toLowerCase() === stewardAddress?.toLowerCase();
  }, [user, stewardAddress]);

  const sortedChains = useMemo(() => {
    return ['Base', 'All Chains', ...supportedChains.filter(chain => chain.name !== 'Base').map(chain => chain.name).sort()];
  }, []);

  const getMarketplaceLink = (marketplace: string, contractAddress: string, tokenId: string) => {
    switch (marketplace) {
      case 'opensea':
        return `https://opensea.io/assets/base/${contractAddress}/${tokenId}`;
      case 'rarible':
        return `https://rarible.com/token/base/${contractAddress}:${tokenId}`;
      case 'basescan':
        return `https://basescan.org/token/${contractAddress}?a=${tokenId}`;
      default:
        return '#';
    }
  };

  console.log('Component state:', { isLoading, error, nft, situsOG, tbaAddress, stewardAddress, tbaAssets });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!nft || !situsOG) {
    return <div>NFT or Situs OG not found</div>;
  }

  // Add this type guard function
  function isTBAAssets(assets: any): assets is TBAAssets {
    return assets && typeof assets === 'object' && 'nfts' in assets && 'tokens' in assets;
  }

  return (
    <>
      <AccountsNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Image src={nft.image} alt={nft.name} width={400} height={400} className="w-full rounded-lg shadow-lg mb-4" />
            {tbaAddress && (
              <div className="mb-2">
                <span className="font-semibold">HOLD: </span>
                <span 
                  className="cursor-pointer text-blue-500 hover:text-blue-700 border-b border-dotted border-blue-500"
                  onClick={() => navigator.clipboard.writeText(tbaAddress)}
                  title="Click to copy"
                >
                  {resolvedHoldAddress || truncateAddress(tbaAddress)}
                </span>
              </div>
            )}
            {stewardAddress && (
              <div className="mb-4">
                <span className="font-semibold">TEND: </span>
                <span 
                  className="cursor-pointer text-blue-500 hover:text-blue-700 border-b border-dotted border-blue-500"
                  onClick={() => navigator.clipboard.writeText(stewardAddress)}
                  title="Click to copy"
                >
                  {resolvedTendAddress || truncateAddress(stewardAddress)}
                </span>
              </div>
            )}
            <div className="flex justify-start space-x-4 mb-4">
              <a href={getMarketplaceLink('opensea', situsOG.contractAddress, tokenId)} target="_blank" rel="noopener noreferrer">
                <Image src="/assets/icons/opensea.svg" alt="OpenSea" width={24} height={24} />
              </a>
              <a href={getMarketplaceLink('rarible', situsOG.contractAddress, tokenId)} target="_blank" rel="noopener noreferrer">
                <Image src="/assets/icons/rarible.svg" alt="Rarible" width={24} height={24} />
              </a>
              <a href={getMarketplaceLink('basescan', situsOG.contractAddress, tokenId)} target="_blank" rel="noopener noreferrer">
                <Image src="/assets/icons/basescan.svg" alt="Basescan" width={24} height={24} />
              </a>
            </div>
          </div>
          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold mb-6">{nft.name}</h1>
            <div className="mb-8">
              <p className="text-lg mb-4">{nft.description}</p>
              <ul className="list-disc list-inside mb-4">
                {nft.attributes?.map((attr, index) => (
                  <li key={index}>
                    <span className="font-semibold">{attr.trait_type}:</span> {attr.value}
                  </li>
                ))}
              </ul>
            </div>
            
            {tbaAddress && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Assets & Currency</h2>
                <div className="mb-4 flex items-center">
                  <span className="mr-2 text-xl">⛓️</span>
                  <select 
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="border rounded p-2"
                  >
                    {sortedChains.map((chain) => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
                {(selectedChain === 'All Chains' ? Object.entries(tbaAssets) : [[selectedChain, tbaAssets[selectedChain]]]).map(([chain, assets]) => (
                  isTBAAssets(assets) && (
                    <div key={chain} className="mb-8 p-4 border rounded">
                      <h3 className="text-xl font-semibold mb-4">{chain}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Assets (NFTs)</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {assets.nfts.map((asset, index) => (
                              <div key={index} className="border p-2 rounded">
                                <img src={asset.image_url} alt={asset.name} className="w-full h-32 object-cover mb-2" />
                                <p className="text-sm truncate">{asset.name}</p>
                                {asset.token_type === 'ERC1155' && <p className="text-xs">Balance: {asset.balance}</p>}
                              </div>
                            ))}
                          </div>
                          {assets.nfts.length === 0 && <p>No NFTs found for this chain.</p>}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Currency (ERC20 Tokens)</h4>
                          <ul className="space-y-2">
                            {assets.tokens.map((token, index) => (
                              <li key={index} className="bg-gray-100 p-2 rounded">
                                {token.symbol}: {parseFloat(token.balance) / Math.pow(10, token.decimals)}
                              </li>
                            ))}
                          </ul>
                          {assets.tokens.length === 0 && <p>No tokens found for this chain.</p>}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
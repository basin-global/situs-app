'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getSitusOGByName } from '@/config/situs';
import { fetchNFTByTokenId, fetchTBAAssets, NFT, resolveENS } from '@/utils/simplehash';
import { TokenboundClient } from '@tokenbound/sdk';
import { createPublicClient, http, Address } from 'viem';
import { usePrivy } from '@privy-io/react-auth';
import { supportedChains, getChainById } from '@/config/chains';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AccountsNavigation } from '@/components/accounts-navigation';

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

interface TBAAsset {
  nfts: any[];
  tokens: any[];
}

interface ChainAssets {
  [chain: string]: TBAAsset;
}

export default function NFTPage({ params }: PageProps) {
  const [nft, setNFT] = useState<NFT | null>(null);
  const [tbaAddress, setTbaAddress] = useState<Address | null>(null);
  const [stewardAddress, setStewardAddress] = useState<Address | null>(null);
  const [tbaAssets, setTbaAssets] = useState<ChainAssets>({});
  const [activeTab, setActiveTab] = useState<'assets' | 'currency'>('assets');
  const [selectedChain, setSelectedChain] = useState<string>('Base');
  const { login, authenticated, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [resolvedHoldAddress, setResolvedHoldAddress] = useState<string>('');
  const [resolvedTendAddress, setResolvedTendAddress] = useState<string>('');

  const tokenId = params['token-id'];
  const tokenName = params['token-name'];

  const isConnectedUserSteward = useMemo(() => {
    return user?.wallet?.address?.toLowerCase() === stewardAddress?.toLowerCase();
  }, [user, stewardAddress]);

  const getChainIcon = (chainName: string) => {
    const chain = supportedChains.find(c => c.name === chainName);
    if (!chain) {
      console.error(`Chain not found: ${chainName}`);
      return '';
    }
    
    const iconName = chain.simplehashName;
    let iconPath = `/assets/icons/${iconName}.svg`;
    
    // Special cases for PNG files
    if (iconName === 'arbitrum' || iconName === 'zora') {
      iconPath = `/assets/icons/${iconName}.png`;
    }
    
    console.log(`Icon path for ${chainName}: ${iconPath}`);
    return iconPath;
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const situsOG = getSitusOGByName(params.situs);
        if (!situsOG) {
          setError('Invalid Situs');
          return;
        }

        if (!tokenId) {
          setError('Invalid token ID');
          return;
        }

        console.log('Fetching NFT with contract:', situsOG.contractAddress, 'and tokenId:', tokenId);
        const fetchedNFT = await fetchNFTByTokenId(situsOG.contractAddress, tokenId);
        console.log('Fetched NFT:', fetchedNFT);
        setNFT(fetchedNFT);

        if (fetchedNFT) {
          // Generate TBA address only once
          if (!tbaAddress) {
            const baseChain = getChainById(8453); // Base chain
            const basePublicClient = createPublicClient({
              chain: baseChain,
              transport: http()
            });

            const tokenboundClient = new TokenboundClient({ 
              chainId: 8453, // Base chain ID
              publicClient: basePublicClient
            });

            const tba = await tokenboundClient.getAccount({
              tokenContract: situsOG.contractAddress as Address,
              tokenId: tokenId
            });
            setTbaAddress(tba);
            console.log('TBA address set:', tba);
          }

          // Fetch the steward address
          const baseChain = getChainById(8453); // Base chain
          const basePublicClient = createPublicClient({
            chain: baseChain,
            transport: http()
          });

          const steward = await basePublicClient.readContract({
            address: situsOG.contractAddress as Address,
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
          console.log('Steward address set:', steward);

          // Fetch assets for all chains
          if (tbaAddress) {
            console.log('Fetching TBA assets for address:', tbaAddress);
            const allAssets: { chain: string; assets: TBAAsset }[] = await Promise.all(
              supportedChains.map(async (chain) => {
                console.log(`Fetching assets for chain: ${chain.name}`);
                const assets = await fetchTBAAssets(tbaAddress, chain.simplehashName);
                console.log(`Assets for ${chain.name}:`, assets);
                return { chain: chain.name, assets };
              })
            );
            console.log('All fetched assets:', allAssets);
            setTbaAssets(allAssets.reduce((acc, { chain, assets }) => {
              acc[chain] = assets;
              return acc as ChainAssets;
            }, {} as ChainAssets));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching NFT data: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params, tokenId, tbaAddress]);

  useEffect(() => {
    console.log('useEffect for resolving addresses triggered');
    async function resolveAddresses() {
      console.log('resolveAddresses function called');
      console.log('Resolving addresses...');
      console.log('NEXT_PUBLIC_SIMPLEHASH_API_KEY:', process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY ? 'Set' : 'Not set');
      
      if (tbaAddress) {
        console.log(`Resolving HOLD address: ${tbaAddress}`);
        const resolved = await resolveENS(tbaAddress);
        console.log(`Resolved HOLD address: ${resolved}`);
        setResolvedHoldAddress(resolved);
      } else {
        console.log('tbaAddress is not set');
      }
      
      if (stewardAddress) {
        console.log(`Resolving TEND address: ${stewardAddress}`);
        const resolved = await resolveENS(stewardAddress);
        console.log(`Resolved TEND address: ${resolved}`);
        setResolvedTendAddress(resolved);
      } else {
        console.log('stewardAddress is not set');
      }
    }
    resolveAddresses();
  }, [tbaAddress, stewardAddress]);

  const handleSendAsset = async (assetAddress: Address, amount: string) => {
    if (!authenticated || !tbaAddress || !user) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Implement the actual sending logic here
      // For now, we'll just show a success toast
      toast.success('Asset sent successfully');
    } catch (error) {
      console.error('Error sending asset:', error);
      toast.error('Failed to send asset');
    }
  };

  const handleConnectWithNFT = async () => {
    if (!authenticated) {
      await login();
    }
    
    if (user && tbaAddress) {
      try {
        // Implement the actual connection logic here
        // For now, we'll just show a success toast
        toast.success('Connected as NFT');
      } catch (error) {
        console.error('Error connecting as NFT:', error);
        toast.error('Failed to connect as NFT');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }, (err) => {
      toast.error('Failed to copy', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Could not copy text: ', err);
    });
  };

  const filteredAssets = useMemo(() => {
    if (selectedChain === 'all') {
      return tbaAssets;
    }
    return { [selectedChain]: tbaAssets[selectedChain] };
  }, [tbaAssets, selectedChain]);

  const sortedChains = useMemo(() => {
    return supportedChains.sort((a, b) => {
      if (a.name === 'Base') return -1;
      if (b.name === 'Base') return 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Add this near the top of your NFTPage component, after the state declarations
  useEffect(() => {
    console.log("supportedChains:", supportedChains.map(chain => chain.name));
    console.log("sortedChains:", sortedChains.map(chain => chain.name));
    console.log("tbaAssets chains:", Object.keys(tbaAssets));
  }, [tbaAssets, sortedChains]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!nft) {
    return <div>NFT not found</div>;
  }

  const og = getSitusOGByName(params.situs);
  if (!og) {
    return <div>Invalid Situs</div>;
  }

  console.log('tbaAssets before rendering:', tbaAssets);
  console.log("Supported chains:", supportedChains.map(chain => chain.name));
  console.log("Chain names from tbaAssets:", Object.keys(tbaAssets));

  // Just before the return statement in your render function
  console.log("Final render - tbaAssets chains:", Object.keys(tbaAssets));
  console.log("Final render - sortedChains:", sortedChains.map(chain => chain.name));

  const chainEmoji = '⛓️'; // Chain emoji to display outside the dropdown

  return (
    <>
      <AccountsNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <Image src={nft?.image} alt={nft?.name} width={400} height={400} className="w-full rounded-lg shadow-lg mb-4" />
            {tbaAddress && (
              <div className="mb-2">
                <span className="font-semibold">HOLD: </span>
                <span 
                  className="cursor-pointer text-blue-500 hover:text-blue-700 border-b border-dotted border-blue-500"
                  onClick={() => copyToClipboard(tbaAddress)}
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
                  onClick={() => copyToClipboard(stewardAddress)}
                  title="Click to copy"
                >
                  {resolvedTendAddress || truncateAddress(stewardAddress)}
                </span>
              </div>
            )}
            <div className="flex justify-start space-x-4 mb-4">
              <a href={getMarketplaceLink('opensea', og.contractAddress, tokenId)} target="_blank" rel="noopener noreferrer">
                <Image 
                  src="/assets/icons/opensea.svg" 
                  alt="OpenSea" 
                  width={24} 
                  height={24} 
                  onError={(e) => {
                    console.error('Failed to load OpenSea icon', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
              <a href={getMarketplaceLink('rarible', og.contractAddress, tokenId)} target="_blank" rel="noopener noreferrer">
                <Image 
                  src="/assets/icons/rarible.svg" 
                  alt="Rarible" 
                  width={24} 
                  height={24} 
                  onError={(e) => {
                    console.error('Failed to load Rarible icon', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
              <a href={getMarketplaceLink('basescan', og.contractAddress, tokenId)} target="_blank" rel="noopener noreferrer">
                <Image 
                  src="/assets/icons/basescan.svg"
                  alt="Basescan" 
                  width={24} 
                  height={24} 
                  onError={(e) => {
                    console.error('Failed to load Basescan icon', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
            </div>
            <button 
              onClick={handleConnectWithNFT}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Connect with NFT
            </button>
          </div>
          <div className="md:w-3/4">
            <h1 className="text-3xl font-bold mb-6">{nft?.name || tokenName}</h1>
            <div className="mb-8">
              <p className="text-lg mb-4">{nft?.description}</p>
              <ul className="list-disc list-inside mb-4">
                {nft?.attributes?.map((attr, index) => (
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
                  <span className="mr-2 text-xl">{chainEmoji}</span>
                  <select 
                    value={selectedChain}
                    onChange={(e) => setSelectedChain(e.target.value)}
                    className="border rounded p-2"
                  >
                    <option value="Base">
                      <div className="flex items-center">
                        <Image src="/assets/icons/base.svg" alt="Base" width={16} height={16} className="mr-2" />
                        Base
                      </div>
                    </option>
                    <option value="all">All Chains</option>
                    {sortedChains.filter(chain => chain.name !== 'Base').map((chain) => (
                      <option key={chain.id} value={chain.name}>
                        <div className="flex items-center">
                          <Image src={`/assets/icons/${chain.simplehashName}.svg`} alt={chain.name} width={16} height={16} className="mr-2" />
                          {chain.name}
                        </div>
                      </option>
                    ))}
                  </select>
                </div>
                {Object.entries(filteredAssets || {})
                  .sort(([a], [b]) => {
                    if (a === 'Base') return -1;
                    if (b === 'Base') return 1;
                    return a.localeCompare(b);
                  })
                  .map(([chain, assets]) => (
                    <div key={chain} className="mb-8 p-4 border rounded">
                      <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <Image 
                          src={getChainIcon(chain)}
                          alt={chain} 
                          width={24} 
                          height={24} 
                          unoptimized
                          className="object-contain"
                          onError={(e) => {
                            console.error(`Failed to load icon for ${chain}`, e);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                          onLoad={() => {
                            console.log(`Successfully loaded icon for ${chain}`);
                          }}
                        />
                        <span className="ml-2 hidden">{chain.charAt(0)}</span>
                        <span className="ml-2">{chain}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                          <h4 className="text-lg font-semibold mb-2">Assets</h4>
                          {assets?.nfts?.length > 0 ? (
                            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {assets.nfts.map((asset, index) => (
                                <li key={index} className="relative">
                                  <div className="relative aspect-square overflow-hidden">
                                    <img 
                                      src={asset.image_url} 
                                      alt={asset.name} 
                                      className="w-full h-full object-cover rounded"
                                    />
                                    {asset.contract_type === 'ERC1155' && asset.balance !== '1' && (
                                      <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white px-2 py-1 rounded-bl">
                                        x{asset.balance}
                                      </div>
                                    )}
                                  </div>
                                  <p className="mt-1 text-sm truncate">{asset.name}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No assets found for this chain.</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-2">Currency</h4>
                          {assets?.tokens?.length > 0 ? (
                            <ul className="space-y-2">
                              {assets.tokens.map((token, index) => (
                                <li key={index} className="bg-gray-100 p-2 rounded">
                                  <div>
                                    {(parseFloat(token.balance) / Math.pow(10, token.decimals)).toLocaleString(undefined, {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 6
                                    })} {token.symbol}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No currency found for this chain.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
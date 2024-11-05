'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isSpamContract } from '@/config/spamContracts';
import Image from 'next/image';
import CustomAudioPlayer from '@/components/CustomAudioPlayer';
import { usePrivy } from '@privy-io/react-auth';
import { Maximize2, Minimize2, Send, RefreshCw, DollarSign, ArrowLeftRight, Trash2, EyeOff, Plus, ArrowLeft } from 'lucide-react';
import { useOG } from '@/contexts/og-context';
import ReactMarkdown from 'react-markdown';
import { EnsureMenu } from '@/modules/ensure/ensure-menu';
import { Button } from "@/components/ui/button"
import { EnsureModal } from '@/modules/ensure/ensure-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { isEnsuranceToken } from '@/modules/ensurance/config'
import { Asset, EnsureOperation } from '@/types';

export default function AssetDetailPage({ params }: { params: { chain: string; contract: string; tokenId: string } }) {
  const router = useRouter();
  const [assetDetails, setAssetDetails] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const isSpam = isSpamContract(params.chain, params.contract);
  const { user, authenticated, login } = usePrivy();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEnsureModal, setShowEnsureModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<EnsureOperation | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [address, setAddress] = useState<string>('');

  const isEnsurance = isEnsuranceToken(params.chain, params.contract);
  const quantity = assetDetails?.owners?.[0]?.quantity || 0;
  const isOwner = useMemo(() => {
    if (!user?.wallet?.address || !assetDetails?.owners?.[0]) return false;
    return user.wallet.address.toLowerCase() === assetDetails.owners[0].owner_address.toLowerCase();
  }, [user?.wallet?.address, assetDetails?.owners]);

  const fetchAssetDetails = useMemo(() => async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/simplehash/nft?chain=${params.chain}&contractAddress=${params.contract}&tokenId=${params.tokenId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Asset details:', data);
      setAssetDetails(data);
    } catch (error) {
      console.error('Error fetching asset details:', error);
      setError('Failed to fetch asset details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [params.chain, params.contract, params.tokenId]);

  useEffect(() => {
    const checkForRedirect = async () => {
      if (hasRedirected) return;

      // Skip redirect if we're on the ensurance path
      if (window.location.pathname.includes('/ensurance/')) {
        fetchAssetDetails();
        return;
      }

      // Only redirect to ensurance path if this is an ensurance token
      if (isEnsuranceToken(params.chain, params.contract)) {
        console.log('Asset: Redirecting to ensurance path:', `/assets/${params.chain}/ensurance/${params.tokenId}`);
        setHasRedirected(true);
        router.replace(`/assets/${params.chain}/ensurance/${params.tokenId}`);
        return;
      }
      
      // Then check for OG account (existing logic)
      console.log('Asset: Checking for OG account with params:', { contract: params.contract, tokenId: params.tokenId });
      try {
        const response = await fetch(`/api/getAccountByToken?contract=${params.contract}&tokenId=${params.tokenId}`);
        console.log('Asset: API response status:', response.status);
        
        if (!response.ok) throw new Error('Failed to fetch account');
        const data = await response.json();
        console.log('Asset: Received data:', data);
        
        if (data?.og_name && data?.account_name) {
          const redirectPath = `/${data.og_name.replace(/^\./, '')}/${data.account_name}`;
          console.log('Asset: Redirecting to:', redirectPath);
          setHasRedirected(true);
          router.replace(redirectPath);
          return;
        }
        
        fetchAssetDetails();
      } catch (error) {
        console.error('Asset Error:', error);
        fetchAssetDetails();
      }
    };

    checkForRedirect();
  }, [params.contract, params.tokenId, router, hasRedirected, fetchAssetDetails, params.chain]);

  useEffect(() => {
    if (user?.wallet?.address) {
      setAddress(user.wallet.address);
    }
  }, [user?.wallet?.address]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOperation = useCallback((operation: string) => {
    if (!authenticated) {
      setShowLoginModal(true);
      return;
    }
    setSelectedOperation(operation as EnsureOperation);
    setShowEnsureModal(true);
  }, [authenticated]);

  const handleBack = () => {
    // Try to get referrer
    const referrer = document.referrer;
    
    // If we have a referrer and it's from our site, use it
    if (referrer && referrer.includes(window.location.host)) {
      router.back();
    } else {
      // Otherwise go home
      router.push('/');
    }
  };

  const ensureMenuComponent = useMemo(() => (
    authenticated && (
      <EnsureMenu
        isTokenbound={false}
        onOperationSelect={handleOperation}
        asset={{
          chain: params.chain,
          contract_address: params.contract,
        }}
      />
    )
  ), [authenticated, params.chain, params.contract, handleOperation]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading asset details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (!assetDetails) {
    return <div className="flex justify-center items-center h-screen">Asset not found</div>;
  }

  return (
    <div className="flex justify-center min-h-screen bg-background dark:bg-background-dark">
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'container max-w-4xl mx-auto px-4 py-8'}`}>
        {isSpam && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Warning!</strong>
            <span className="block sm:inline"> This contract has been marked as spam.</span>
          </div>
        )}
        
        <div className={`${isFullscreen ? 'h-full' : 'bg-white dark:bg-gray-800 rounded-lg shadow-md'}`}>
          {!isFullscreen && (
            <div className="flex flex-col items-center p-6 border-b border-gray-700">
              <div className="w-full flex items-center mb-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-200">
                  {assetDetails?.name || 'Unnamed Asset'}
                </h1>
                {authenticated && isOwner && isEnsurance && (
                  <div className="px-2 py-1 rounded text-xs font-bold text-yellow-300 border border-yellow-300/50">
                    ENSURED
                  </div>
                )}
                {ensureMenuComponent}
              </div>
              {assetDetails?.collection?.name && (
                <p className="text-gray-400 mt-1">{assetDetails.collection.name}</p>
              )}
            </div>
          )}

          <div className="relative">
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
            >
              {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>

            {isOwner && quantity > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gray-800 px-2 py-1 rounded text-xs font-bold text-white">
                  Owned: {quantity}
                </div>
              </div>
            )}

            <div className="p-6 flex flex-col items-center">
              {assetDetails?.video_url ? (
                <div className="inline-block">
                  <video
                    className={`${isFullscreen ? 'h-screen' : 'h-[60vh]'} object-contain rounded-lg`}
                    controls
                    autoPlay
                    loop
                    muted
                    src={assetDetails.video_url}
                  />
                </div>
              ) : (
                <div className={`relative ${isFullscreen ? 'h-screen w-screen' : 'h-[60vh] w-full'} flex flex-col items-center`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={assetDetails?.image_url || ''}
                      alt={assetDetails?.name || 'Asset Image'}
                      fill
                      className="rounded-lg object-contain"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    />
                  </div>
                  {assetDetails?.audio_url && (
                    <div className="w-full max-w-md mt-4">
                      <CustomAudioPlayer src={assetDetails.audio_url} />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons - Only ENSURE for ensurance assets */}
              {!isFullscreen && isEnsurance && (
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={() => handleOperation('ensure')}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
                  >
                    <Plus className="h-6 w-6" />
                    ENSURE
                  </Button>
                </div>
              )}
            </div>

            {!isFullscreen && (
              <>
                {assetDetails?.description && (
                  <div className="px-6 py-4 border-t border-gray-700">
                    <div className="prose dark:prose-invert max-w-none text-gray-300">
                      <ReactMarkdown>{assetDetails.description}</ReactMarkdown>
                    </div>
                  </div>
                )}

                <div className="px-6 py-4 border-t border-gray-700">
                  <h2 className="text-xl font-semibold mb-3 text-gray-200">Data</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Contract</p>
                        <p className="text-gray-200 text-sm font-mono">
                          {truncateAddress(assetDetails.contract_address || '')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">ID</p>
                        <p className="text-gray-200 text-sm font-mono">{assetDetails.token_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <a
                        href={`https://rarible.com/token/base/${params.contract}:${params.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src="/assets/icons/rarible.svg"
                          alt="View on Rarible"
                          width={24}
                          height={24}
                        />
                      </a>
                      <a
                        href={`https://opensea.io/assets/${params.chain}/${params.contract}/${params.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <Image
                          src="/assets/icons/opensea.svg"
                          alt="View on OpenSea"
                          width={24}
                          height={24}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="bg-gray-900 border border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono font-bold text-white text-center">
              Login Required
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="mb-6 text-gray-300">
              Please login to perform this action.
            </p>
            <Button 
              onClick={() => {
                login();
                setShowLoginModal(false);
              }}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold transition-all duration-200"
            >
              Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ensure Modal */}
      {showEnsureModal && (
        <EnsureModal
          isOpen={showEnsureModal}
          onClose={() => setShowEnsureModal(false)}
          operation={selectedOperation || 'ensure'}
          asset={assetDetails || {
            chain: params.chain,
            contract_address: params.contract,
            token_id: params.tokenId,
            queried_wallet_balances: [{
              quantity_string: '0',
              value_usd_string: '0'
            }]
          } as Asset}
          address={address}
          isTokenbound={false}
          onAction={async () => ({ hash: '' })}
        />
      )}
    </div>
  );
}

// Helper function to truncate address
const truncateAddress = (address: string) => {
  if (!address || address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

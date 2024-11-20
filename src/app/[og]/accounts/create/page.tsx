'use client'

import React, { useState, useEffect } from 'react';
import { useOG } from '@/contexts/og-context';
import { SubNavigation } from '@/components/sub-navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther, parseEther, encodeFunctionData, getAddress, keccak256, toHex } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '@/abi/SitusOG.json';
import { toast } from 'react-toastify';
import { validateDomainName } from '@/utils/account-validation';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getReferral, clearReferral } from '@/utils/referralUtils';
import { calculateTBA } from '@/utils/tba';
import Link from 'next/link';
import { GroupEnsurance } from '@/components/group-ensurance';
import { AccountFeatures } from '@/components/account-features';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// Add this helper function at the top level
async function parseDomainCreatedEvent(receipt: any, contractAddress: `0x${string}`) {
  console.log('Parsing receipt logs:', receipt.logs);
  
  // Find the event from our contract
  const domainCreatedEvent = receipt.logs.find((log: any) => 
    log.address.toLowerCase() === contractAddress.toLowerCase()
  );

  if (!domainCreatedEvent) {
    console.error('Available logs:', receipt.logs);
    throw new Error('DomainCreated event not found in transaction logs');
  }

  // Get token ID from totalSupply since it's sequential
  const tokenId = await publicClient.readContract({
    address: domainCreatedEvent.address as `0x${string}`,  // Use the address from the log
    abi: SitusOGAbi,
    functionName: 'totalSupply',
  }) as bigint;

  console.log('Found token ID:', tokenId.toString());
  return Number(tokenId);
}

const CreateAccountPage = () => {
  const router = useRouter();
  const { currentOG } = useOG();
  const { login, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [priceWei, setPriceWei] = useState<bigint>(BigInt(0));
  const [buyingEnabled, setBuyingEnabled] = useState<boolean>(false);
  const [desiredName, setDesiredName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [ethUsdPrice, setEthUsdPrice] = useState<number | null>(null);

  console.log('OG Data:', currentOG);

  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!ready || !currentOG || !currentOG.contract_address) {
        console.log('Not ready to fetch data');
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching data for contract:', currentOG.contract_address);
        
        const [priceResult, buyingEnabledResult] = await Promise.all([
          publicClient.readContract({
            address: currentOG.contract_address as `0x${string}`,
            abi: SitusOGAbi,
            functionName: 'price',
          }),
          publicClient.readContract({
            address: currentOG.contract_address as `0x${string}`,
            abi: SitusOGAbi,
            functionName: 'buyingEnabled',
          })
        ]);

        console.log('Price from contract (wei):', priceResult);

        if (typeof priceResult === 'bigint') {
          console.log('Price from contract (ETH):', formatEther(priceResult));
          setPriceWei(priceResult);
        } else {
          console.error('Unexpected price result type:', typeof priceResult);
        }

        if (typeof buyingEnabledResult === 'boolean') {
          setBuyingEnabled(buyingEnabledResult);
        } else {
          console.error('Unexpected buyingEnabled result type:', typeof buyingEnabledResult);
        }

        // Fetch ETH price in USD
        const ethPriceResponse = await axios.get('/api/eth-price');
        if (ethPriceResponse.data.price) {
          setEthUsdPrice(ethPriceResponse.data.price);
        } else {
          console.error('Error fetching ETH price:', ethPriceResponse.data.error);
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error(`Failed to load initial data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentOG, ready]);

  useEffect(() => {
    console.log('Component mounted or auth/wallet changed');
    console.log('Authenticated:', authenticated);
    console.log('Connected Wallets:', wallets);
  }, [authenticated, wallets]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setDesiredName(name);
    const { isValid, message } = validateDomainName(name);
    setValidationMessage(message);
  };

  const handleCreateAccount = async () => {
    console.log('Authenticated:', authenticated);
    console.log('Connected Wallets:', wallets);

    if (!authenticated || wallets.length === 0) {
      console.log('Authentication or wallet missing');
      toast.error('Please connect your wallet first');
      return;
    }

    const wallet = wallets[0]; // Use the first connected wallet
    const provider = await wallet.getEthereumProvider();

    if (!desiredName || validationMessage) {
      toast.error('Please enter a valid name');
      return;
    }

    if (!currentOG || !currentOG.contract_address) {
      toast.error('Contract address is not available');
      return;
    }

    try {
      setLoading(true);

      // Check balance before proceeding
      const balance = await publicClient.getBalance({
        address: wallet.address as `0x${string}`
      });

      // Add a buffer for gas (roughly 0.001 ETH)
      const estimatedGas = BigInt('1000000000000000'); // 0.001 ETH in wei
      const totalNeeded = priceWei + estimatedGas;
      
      if (balance < totalNeeded) {
        setLoading(false);
        toast.error(
          <div>
            <p>Insufficient ETH balance.</p>
            <p className="mt-2 text-sm">
              You need at least {formatEther(priceWei)} ETH plus gas fees (~0.001 ETH).
              <br />
              Get ETH from{' '}
              <a 
                href="https://www.coinbase.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline"
                onClick={(e) => e.stopPropagation()} // Prevent toast from closing when clicking link
              >
                Coinbase
              </a>
              {' '}or another exchange.
            </p>
          </div>,
          { 
            autoClose: false,
            closeOnClick: false // Prevent toast from closing when clicking inside
          }
        );
        return;
      }

      // Get the current referral
      const referralAddress = getReferral();
      console.log('Current referral address:', referralAddress);

      // Log wallet information
      console.log('Wallet details:', {
        address: wallet.address,
        chainId: wallet.chainId,
      });

      // Log the current OG details
      console.log('Current OG:', currentOG);

      // Check if the name is already taken
      const holder = await publicClient.readContract({
        address: currentOG.contract_address as `0x${string}`,
        abi: SitusOGAbi,
        functionName: 'getDomainHolder',
        args: [desiredName],
      });

      if (holder !== '0x0000000000000000000000000000000000000000') {
        const ogName = currentOG.og_name.startsWith('.') ? currentOG.og_name.slice(1) : currentOG.og_name;
        const toastId = toast.error(
          <div>
            This name is already taken. Try another.
            <br />
            <a 
              href={`/${ogName}/accounts/all`} 
              className="text-blue-500 hover:text-blue-700 underline"
              onClick={(e) => {
                e.preventDefault();
                toast.dismiss(toastId);
                router.push(`/${ogName}/accounts/all`);
              }}
            >
              Search existing names
            </a>
          </div>,
          { autoClose: false, closeOnClick: false }
        );
        setLoading(false);
        return;
      }

      toast.info('Creating account...', { autoClose: false });

      // Check the current chain ID
      const currentChainId = await provider.request({ method: 'eth_chainId' });

      // If not on Base, switch to Base
      if (currentChainId !== `0x${base.id.toString(16)}`) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${base.id.toString(16)}` }],
          });
        } catch (switchError) {
          // Type guard for the switchError
          if (
            switchError && 
            typeof switchError === 'object' && 
            'code' in switchError && 
            switchError.code === 4902
          ) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${base.id.toString(16)}`,
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org/'],
                },
              ],
            });
          } else {
            throw new Error("Couldn't switch to the Base network.");
          }
        }
      }

      // Ensure addresses are properly formatted
      const formattedWalletAddress = getAddress(wallet.address);
      const formattedContractAddress = getAddress(currentOG.contract_address);
      const formattedReferralAddress = getAddress(referralAddress || '0x0000000000000000000000000000000000000000');

      // Log formatted addresses
      console.log('Formatted addresses:', {
        wallet: formattedWalletAddress,
        contract: formattedContractAddress,
        referral: formattedReferralAddress,
      });

      // Encode the function call data using viem
      const data = encodeFunctionData({
        abi: SitusOGAbi,
        functionName: 'mint',
        args: [
          desiredName, 
          formattedWalletAddress, 
          formattedReferralAddress // Use the referral address here
        ]
      });

      // Prepare the transaction
      const transaction = {
        to: formattedContractAddress,
        data,
        value: `0x${priceWei.toString(16)}`,
        from: formattedWalletAddress,
        chainId: base.id, // Explicitly set the chain ID to Base
      };

      // Log the complete transaction details
      console.log('Complete transaction details:', {
        ...transaction,
        chainId: base.id, // Explicitly log the intended chain ID
        chainName: base.name,
      });

      // Log provider details if available
      if (provider.request) {
        try {
          const chainId = await provider.request({ method: 'eth_chainId' });
          console.log('Provider chain ID:', chainId);
        } catch (error) {
          console.error('Error getting chain ID from provider:', error);
        }
      }

      // Send the transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      const basescanUrl = `${base.blockExplorers.default.url}/tx/${txHash}`;

      toast.dismiss();
      toast.success(
        <div>
          Account creation transaction sent!
          <br />
          <a href={basescanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">
            View on Basescan
          </a>
        </div>,
        {
          autoClose: 3000,  // 3 seconds
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        }
      );
      setDesiredName('');

      console.log('Transaction hash:', txHash);

      // Wait for transaction confirmation
      if (provider.request) {
        let receipt = null;
        let attempts = 0;
        const maxAttempts = 30; // Adjust as needed
        const delay = 5000; // 5 seconds delay between checks

        while (!receipt && attempts < maxAttempts) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, delay));
          receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });
        }

        if (receipt) {
          console.log('Transaction confirmed:', receipt);
          try {
            const tokenId = await parseDomainCreatedEvent(
              receipt, 
              currentOG.contract_address as `0x${string}`
            );
            await updateDatabase(tokenId);
            
            // Get the account name from contract
            const name = await publicClient.readContract({
              address: currentOG.contract_address as `0x${string}`,
              abi: SitusOGAbi,
              functionName: 'domainIdsNames',
              args: [tokenId],
            }) as string;

            // Success toast with account link and dismiss on click
            const toastId = toast.success(
              <div className="text-center">
                <p className="font-bold mb-2">Success! Your account is ready.</p>
                <Link 
                  href={`/${currentOG.og_name.slice(1)}/${name}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => toast.dismiss(toastId)}
                >
                  View Your Account
                </Link>
              </div>,
              {
                autoClose: false,
                closeOnClick: true,  // Will close when clicking anywhere on toast
                closeButton: true    // Shows an X button
              }
            );
          } catch (error) {
            console.error('Error processing transaction receipt:', error);
            toast.error('Account created but database update failed');
          }
        } else {
          console.log('Transaction not confirmed after maximum attempts');
          toast.warning(
            <div>
              Transaction sent, but confirmation is taking longer than expected. 
              <br />
              Please check your wallet or 
              <a href={basescanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">
                view on Basescan
              </a> 
              for the final status.
            </div>,
            {
              autoClose: false,
              closeOnClick: false,
            }
          );
        }
      }

      // After successful transaction confirmation
      clearReferral(); // Clear the referral after successful account creation

    } catch (error) {
      console.error('Error creating account:', error);
      toast.dismiss();
      toast.error(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFullName = () => {
    if (!desiredName) {
      const ogName = currentOG?.og_name?.startsWith('.') ? currentOG.og_name.slice(1) : currentOG?.og_name;
      return <><span className="text-gray-400">your-account-name-here</span>.{ogName}</>;
    }
    const ogName = currentOG?.og_name?.startsWith('.') ? currentOG.og_name.slice(1) : currentOG?.og_name;
    return `${desiredName}.${ogName}`;
  };

  const formatUsdPrice = (ethPrice: number, usdPrice: number) => {
    const priceInUsd = ethPrice * usdPrice;
    if (priceInUsd < 0.01) {
      return priceInUsd.toFixed(4).replace(/\.?0+$/, '');
    } else {
      return priceInUsd.toFixed(2);
    }
  };

  // Move updateDatabase inside the component
  const updateDatabase = async (tokenId: number) => {
    if (!currentOG?.contract_address) {
      throw new Error('No OG contract address available');
    }

    // Get name from contract to ensure accuracy
    const name = await publicClient.readContract({
      address: currentOG.contract_address as `0x${string}`,
      abi: SitusOGAbi,
      functionName: 'domainIdsNames',
      args: [tokenId],
    }) as string;

    const tba = await calculateTBA(currentOG.contract_address as `0x${string}`, tokenId);
    
    await fetch('/api/update-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        og: currentOG.og_name,
        accountName: name,
        tokenId,
        tbaAddress: tba
      })
    });
  };

  if (!ready) {
    return <div>Loading Privy...</div>;
  }

  if (!searchParams) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4 flex justify-center">
        <SubNavigation type="accounts" />
      </div>

      <h2 className="text-5xl font-mono font-bold mb-4 text-center">
        Create{' '}
        <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500 text-transparent bg-clip-text">
          .{currentOG?.og_name.replace(/^\./, '')}
        </span>
        {' '}Account
      </h2>

      {buyingEnabled ? (
        authenticated && wallets.length > 0 ? (
          <div className="mt-6 space-y-4 flex flex-col items-center">
            <div className="w-full max-w-md">
              <input
                type="text"
                value={desiredName}
                onChange={handleNameChange}
                placeholder="Enter desired name"
                className="w-full p-3 border rounded-lg text-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white text-center"
              />
            </div>
            {validationMessage && <p className="text-red-500 text-lg text-center">{validationMessage}</p>}
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 text-center">
              {formatFullName()}
            </p>
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Price: <span className="font-semibold">{formatEther(priceWei)} ETH</span>
                {ethUsdPrice && (
                  <span className="ml-2 text-sm">
                    (~${formatUsdPrice(parseFloat(formatEther(priceWei)), ethUsdPrice)} USD)
                  </span>
                )}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium italic">
                One-time purchase, no renewal fees
              </p>
            </div>
            <button
              onClick={handleCreateAccount}
              disabled={loading || !!validationMessage}
              className="w-full max-w-md bg-blue-600 text-white p-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Creating...' : 'CREATE ACCOUNT'}
            </button>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">Please login and connect a wallet to create an account</p>
            <button
              onClick={login}
              className="bg-green-600 text-white p-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              LOGIN
            </button>
          </div>
        )
      ) : (
        <div className="mt-6 text-center">
          <p className="text-xl text-red-500">
            This Group is by invite, application, or referral only.{' '}
            {currentOG?.website ? (
              <>
                Please contact them at{' '}
                <Link 
                  href={currentOG.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
                >
                  {currentOG.website.replace(/^https?:\/\//, '')}
                </Link>
                {' '}for more info.
              </>
            ) : (
              'Please contact them for more info.'
            )}
          </p>
        </div>
      )}

      {buyingEnabled && (
        <>
          <div className="w-full mt-12" id="distribution">
            <GroupEnsurance 
              ogName={currentOG?.og_name?.startsWith('.') ? currentOG.og_name.slice(1) : currentOG?.og_name || ''} 
              groupEnsuranceText={typeof currentOG?.group_ensurance === 'string' ? currentOG.group_ensurance : undefined}
            />
          </div>

          <div className="w-full">
            <AccountFeatures 
              ogName={currentOG?.og_name?.startsWith('.') ? currentOG.og_name.slice(1) : currentOG?.og_name || ''} 
              tagline={currentOG?.tagline}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CreateAccountPage;

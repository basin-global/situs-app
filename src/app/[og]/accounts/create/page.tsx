'use client'

import React, { useState, useEffect } from 'react';
import { useOG } from '@/contexts/og-context';
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther, parseEther, encodeFunctionData, getAddress } from 'viem';
import { base } from 'viem/chains';
import SitusOGAbi from '@/abi/SitusOG.json';
import { toast } from 'react-toastify';
import { validateDomainName } from '@/utils/account-validation';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import OGContractInfo from '@/components/admin/og-contract-info';
import { isAdmin } from '@/utils/adminUtils';
import { getReferral, clearReferral } from '@/utils/referralUtils';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

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

  const searchParams = useSearchParams();

  const userIsAdmin = isAdmin(user?.wallet?.address);

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
          // Handle the error case appropriately, maybe set a default price or show an error message
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setDesiredName(name);
    const { isValid, message } = validateDomainName(name);
    setValidationMessage(message);
  };

  const handleCreateAccount = async () => {
    if (!authenticated || wallets.length === 0) {
      toast.error('Please connect your wallet first');
      return;
    }

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

      // Get the current referral
      const referralAddress = getReferral();
      console.log('Current referral address:', referralAddress);

      // Log wallet information
      console.log('Wallet details:', {
        address: wallets[0].address,
        chainId: wallets[0].chainId,
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

      const wallet = wallets[0];
      
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
        value: `0x${priceWei.toString(16)}`, // Convert to hexadecimal
        from: formattedWalletAddress,
      };

      // Log the complete transaction details
      console.log('Complete transaction details:', {
        ...transaction,
        chainId: base.id, // Explicitly log the intended chain ID
        chainName: base.name,
      });

      // Get the Ethereum provider
      const provider = await wallet.getEthereumProvider();

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
          autoClose: false,
          closeOnClick: false,
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
          toast.success(
            <div>
              Account creation confirmed!
              <br />
              <a href={basescanUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">
                View on Basescan
              </a>
            </div>,
            {
              autoClose: false,
              closeOnClick: false,
            }
          );
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
      // Show up to 4 decimal places for very small amounts
      return priceInUsd.toFixed(4).replace(/\.?0+$/, '');
    } else {
      // Show 2 decimal places for larger amounts
      return priceInUsd.toFixed(2);
    }
  };

  if (!ready) {
    return <div>Loading Privy...</div>;
  }

  if (!searchParams) {
    return null; // or a loading indicator
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="mb-8 flex justify-center">
        <AccountsSubNavigation />
      </div>
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Create a {currentOG?.og_name} Account 
      </h1>

      {buyingEnabled ? (
        authenticated ? (
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
            <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">Please login to create an account</p>
            <button
              onClick={login}
              className="bg-green-600 text-white p-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300"
            >
              LOGIN
            </button>
          </div>
        )
      ) : (
        <p className="mt-6 text-xl text-center text-red-500">Account creation is currently disabled for this OG.</p>
      )}
      
      {/* Add OGContractInfo for admin users */}
      {userIsAdmin && (
        <div className="mt-8 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Admin: Contract Information</h3>
          <OGContractInfo />
        </div>
      )}
    </div>
  );
};

export default CreateAccountPage;
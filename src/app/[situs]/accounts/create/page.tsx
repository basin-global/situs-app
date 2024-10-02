'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ethers, Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useSitus } from '@/contexts/situs-context'
import situsOGAbi from '@/abi/SitusOG.json'
import { validateDomainName } from '@/utils/domain-validation'
import { AccountsNavigation } from '@/components/accounts-navigation'
import { SitusOG } from '@/config/situs'  // Add this import

interface PageProps {
  params: { situs: string }
}

interface ContractInfo {
  buyingEnabled: boolean;
  minter: string;
  tldOwner: string;
  price: { wei: string; eth: string };
  referral: { bps: number; percentage: string };
  royalty: { bps: number; percentage: string };
  royaltyFeeReceiver: string;
  royaltyFeeUpdater: string;
}

export default function CreateAccountPage({ params }: PageProps) {
  const { login, logout, authenticated, user, getEthersProvider, ready } = usePrivy()
  const { getOGByName } = useSitus()
  const [accountName, setAccountName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [accountPrice, setAccountPrice] = useState<string | null>(null);
  const [selectedOG, setSelectedOG] = useState<SitusOG | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [buyingEnabled, setBuyingEnabled] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);

  useEffect(() => {
    async function fetchOG() {
      const og = await getOGByName(params.situs);
      setSelectedOG(og || null);
    }
    fetchOG();
  }, [params.situs, getOGByName]);

  useEffect(() => {
    if (authenticated && selectedOG) {
      checkIfOwnerAndFetchContractInfo()
    }
  }, [authenticated, selectedOG])

  const checkIfOwnerAndFetchContractInfo = async () => {
    if (!user?.wallet?.address || !selectedOG) return;

    try {
      const provider = await getEthersProvider();
      const contract = new Contract(selectedOG.contractAddress, situsOGAbi, provider as unknown as ethers.Provider);

      const tldOwner = await contract.owner();
      const isOwner = tldOwner.toLowerCase() === user.wallet.address.toLowerCase();
      setIsOwner(isOwner);

      if (isOwner) {
        const [
          buyingEnabled,
          minter,
          price,
          referral,
          royalty,
          royaltyFeeReceiver,
          royaltyFeeUpdater
        ] = await Promise.all([
          contract.buyingEnabled(),
          contract.minter(),
          contract.price(),
          contract.referral(),
          contract.royalty(),
          contract.royaltyFeeReceiver(),
          contract.royaltyFeeUpdater()
        ]);

        setContractInfo({
          buyingEnabled,
          minter,
          tldOwner,
          price: {
            wei: price.toString(),
            eth: ethers.formatUnits(price, 'ether')
          },
          referral: {
            bps: Number(referral),
            percentage: (Number(referral) / 100).toFixed(2) + '%'
          },
          royalty: {
            bps: Number(royalty),
            percentage: (Number(royalty) / 100).toFixed(2) + '%'
          },
          royaltyFeeReceiver,
          royaltyFeeUpdater
        });
      }
    } catch (error) {
      console.error('Error checking owner status or fetching contract info:', error);
    }
  };

  const fetchAccountPrice = async () => {
    if (!selectedOG) return;

    try {
      const provider = await getEthersProvider();
      const contract = new Contract(selectedOG.contractAddress, situsOGAbi, provider as unknown as ethers.Provider);
      const priceWei = await contract.price();
      const priceEth = ethers.formatUnits(priceWei, 'ether');
      setAccountPrice(priceEth);
      console.log('Fetched account price:', priceEth, 'ETH');

      // Check if buying is enabled
      const isBuyingEnabled = await contract.buyingEnabled();
      setBuyingEnabled(isBuyingEnabled);
      console.log('Buying enabled:', isBuyingEnabled);
    } catch (error) {
      console.error('Error fetching account price or buying status:', error);
    }
  };

  useEffect(() => {
    if (selectedOG) {
      fetchAccountPrice();
    }
  }, [selectedOG]);

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setAccountName(newName);
    const { isValid, message } = validateDomainName(newName);
    setNameError(isValid ? null : message);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!selectedOG) {
      toast.error('Invalid OG selected')
      return
    }

    const { isValid, message } = validateDomainName(accountName);
    if (!isValid) {
      setNameError(message);
      return;
    }

    setIsLoading(true)
    let mintingToast: React.ReactText | null = null;
    let transactionToast: React.ReactText | null = null;

    try {
      const provider = await getEthersProvider()
      const network = await provider.getNetwork()
      if (network.chainId !== 8453) {
        toast.error('Please connect to the Base network')
        setIsLoading(false)
        return
      }

      console.log('Starting account creation process')
      const signer = provider.getSigner()
      console.log('Signer obtained:', signer)
      console.log('Contract address:', selectedOG.contractAddress)
      console.log('ABI functions:', situsOGAbi.filter(item => item.type === 'function').map(item => item.name))
      const contract = new Contract(selectedOG.contractAddress, situsOGAbi, signer as unknown as ethers.Signer)
      console.log('Full contract object:', contract)
      
      console.log('Mint function:', contract.mint)
      console.log('Price function:', contract.price)
      
      let price;
      try {
        price = await contract.price()
        console.log('Price from contract (Wei):', price.toString())
        console.log('Price from contract (ETH):', ethers.formatUnits(price, 'ether'))
      } catch (error) {
        console.error('Error calling price function:', error)
        toast.error('Failed to fetch account price. Please try again.')
        return
      }
      
      if (!contract.mint) {
        console.error('Mint function not found in contract')
        toast.error('Contract initialization failed. Please try again.')
        return
      }
      
      const referrer = localStorage.getItem("referral") || ethers.ZeroAddress
      console.log('Minting with params:', { accountName, userAddress: user?.wallet?.address, referrer, price: ethers.formatUnits(price, 'ether') })
      
      mintingToast = toast.info('Minting account... Please wait and confirm the transaction in your wallet.', { autoClose: false })
      
      const tx = await contract.mint(accountName, user?.wallet?.address, referrer, { value: price })
      console.log('Transaction sent:', tx.hash)
      
      if (mintingToast) toast.dismiss(mintingToast);
      transactionToast = toast.info(`Transaction sent. Waiting for confirmation...`, { autoClose: false })
      
      // Wait for the transaction to be mined
      await provider.waitForTransaction(tx.hash, 1) // Wait for 1 confirmation
      console.log('Transaction confirmed')
      
      if (transactionToast) toast.dismiss(transactionToast);
      toast.success(`Successfully created account ${accountName}${selectedOG.name}!`)
      setAccountName('')
    } catch (error) {
      console.error('Error creating account:', error)
      if (mintingToast) toast.dismiss(mintingToast);
      if (transactionToast) toast.dismiss(transactionToast);
      
      let errorMessage = 'Account creation failed. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message)
        console.error('Error stack:', error.stack)
        
        if (error.message.includes('user rejected transaction')) {
          errorMessage = 'Transaction was cancelled.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to complete the transaction.';
        } else if (error.message.includes('execution reverted')) {
          // Check for specific error messages from the contract
          if (error.message.includes('0x846ec056')) {
            errorMessage = 'This account name is already taken. Please choose a different name.';
          } else {
            errorMessage = 'Transaction failed. The account name might already be taken or there might be an issue with the contract.';
          }
        } else if (error.message.includes('UNPREDICTABLE_GAS_LIMIT')) {
          errorMessage = 'Unable to estimate gas. The account name might already be taken or there might be an issue with the contract.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-gray-600">Loading Privy configuration...</p>
        </div>
      </div>
    )
  }

  const loginMessage = (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Connect Your Wallet</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">
          To create an account, you need to connect your wallet first.
        </p>
        <button
          onClick={login}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  )

  const accountCreationContent = (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {buyingEnabled === null ? (
          <p>Loading...</p>
        ) : buyingEnabled ? (
          <>
            {accountPrice !== null && (
              <p className="text-center mb-4 text-sm text-gray-600">
                Account Price: {parseFloat(accountPrice).toFixed(10)} ETH - one time, no renewal fees
              </p>
            )}
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="accountName"
                    id="accountName"
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                    placeholder="youraccountname"
                    value={accountName}
                    onChange={handleAccountNameChange}
                    maxLength={140}
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {selectedOG?.name || '.og'}
                  </span>
                </div>
                {nameError && (
                  <p className="mt-2 text-sm text-red-600">{nameError}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !selectedOG}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="text-center text-lg">
            This group is by application, invite, or referral only.
          </p>
        )}
      </div>
    </div>
  )

  useEffect(() => {
    const checkNetwork = async () => {
      if (authenticated) {
        try {
          const provider = await getEthersProvider()
          const network = await provider.getNetwork()
          console.log('Connected to network:', network.name, network.chainId)
          if (network.chainId !== 8453) {
            toast.error('Please connect to the Base network')
          }
        } catch (error) {
          console.error('Error checking network:', error)
          toast.error('Unable to detect network. Please check your wallet connection.')
        }
      }
    }
    checkNetwork()
  }, [authenticated, getEthersProvider])

  useEffect(() => {
    console.log('situsOG ABI:', situsOGAbi)
  }, [])

  useEffect(() => {
    console.log('Selected OG:', selectedOG)
  }, [selectedOG])

  useEffect(() => {
    return () => {
      // Cleanup function
      const cleanup = async () => {
        try {
          const provider = await getEthersProvider()
          provider.removeAllListeners()
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      }
      cleanup()
    }
  }, [getEthersProvider])

  const truncateAddress = (address: string) => 
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <>
      <AccountsNavigation />
      <div className="min-h-screen bg-gray-100 flex flex-col py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a {selectedOG?.name.toLowerCase()} account
          </h2>
        </div>
        {authenticated ? accountCreationContent : loginMessage}
        
        {isOwner && contractInfo && (
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">Buying Enabled:</span>
                  <span className={`px-2 py-1 rounded ${contractInfo.buyingEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {contractInfo.buyingEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="col-span-2 flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">Price:</span>
                  <span>{parseFloat(contractInfo.price.eth).toFixed(6)} ETH</span>
                </div>
                <div className="col-span-2 flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">Referral:</span>
                  <span>{contractInfo.referral.percentage}</span>
                </div>
                <div className="col-span-2 flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">Royalty:</span>
                  <span>{contractInfo.royalty.percentage}</span>
                </div>
                <div className="col-span-2 py-2">
                  <span className="font-semibold">Minter:</span>
                  <span className="block mt-1 text-sm text-gray-600 break-all">
                    {truncateAddress(contractInfo.minter)}
                  </span>
                </div>
                <div className="col-span-2 py-2">
                  <span className="font-semibold">TLD Owner:</span>
                  <span className="block mt-1 text-sm text-gray-600 break-all">
                    {truncateAddress(contractInfo.tldOwner)}
                  </span>
                </div>
                <div className="col-span-2 py-2">
                  <span className="font-semibold">Royalty Fee Receiver:</span>
                  <span className="block mt-1 text-sm text-gray-600 break-all">
                    {truncateAddress(contractInfo.royaltyFeeReceiver)}
                  </span>
                </div>
                <div className="col-span-2 py-2">
                  <span className="font-semibold">Royalty Fee Updater:</span>
                  <span className="block mt-1 text-sm text-gray-600 break-all">
                    {truncateAddress(contractInfo.royaltyFeeUpdater)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
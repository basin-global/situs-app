'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ethers, Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useOG } from '@/contexts/og-context'
import OGAbi from '@/abi/SitusOG.json'
import { validateDomainName } from '@/utils/domain-validation'
import { AccountsSubNavigation } from '@/components/accounts-sub-navigation'
import { isAdmin } from '@/utils/adminUtils'
import { OG } from '@/types/index'
import { useParams } from 'next/navigation'

export default function CreateAccountPage() {
  const params = useParams();
  const { login, logout, authenticated, user, getEthersProvider, ready } = usePrivy()
  const { currentOG, getOGByName, setCurrentOG } = useOG()
  const [accountName, setAccountName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [accountPrice, setAccountPrice] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [buyingEnabled, setBuyingEnabled] = useState<boolean | null>(null)
  const [contractInfo, setContractInfo] = useState<any | null>(null)
  const [isTimedOut, setIsTimedOut] = useState(false)

  const userIsAdmin = isAdmin(user?.wallet?.address)

  const fetchContractInfo = useCallback(async () => {
    if (!currentOG || !currentOG.contract_address || !authenticated || !ready) {
      console.log('Not ready to fetch contract info');
      return;
    }

    setIsLoading(true);
    try {
      const provider = await getEthersProvider();
      
      // Check if the provider is connected to the correct network
      const network = await provider.getNetwork();
      if (network.chainId !== 8453) {
        console.error('Wrong network detected. Expected Base (chainId: 8453), got:', network.chainId);
        setIsLoading(false);
        return;
      }

      const contract = new Contract(currentOG.contract_address, OGAbi, provider);

      const [priceWei, isBuyingEnabled] = await Promise.all([
        contract.price(),
        contract.buyingEnabled()
      ]);

      const priceEth = ethers.formatUnits(priceWei, 'ether');
      setAccountPrice(priceEth);
      setBuyingEnabled(isBuyingEnabled);

      if (userIsAdmin) {
        // Fetch additional admin information
        const [
          minter,
          referral,
          royalty,
          royaltyFeeReceiver,
          royaltyFeeUpdater,
          tldOwner
        ] = await Promise.all([
          contract.minter(),
          contract.referral(),
          contract.royalty(),
          contract.royaltyFeeReceiver(),
          contract.royaltyFeeUpdater(),
          contract.owner()
        ]);

        setContractInfo({
          buyingEnabled: isBuyingEnabled,
          minter,
          price: {
            wei: priceWei.toString(),
            eth: priceEth
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
          royaltyFeeUpdater,
          tldOwner
        });
      }
    } catch (error) {
      console.error('Error fetching contract info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOG, authenticated, getEthersProvider, userIsAdmin, ready]);

  useEffect(() => {
    if (currentOG && currentOG.contract_address && authenticated && ready) {
      fetchContractInfo();
    }
  }, [currentOG, authenticated, fetchContractInfo, ready]);

  useEffect(() => {
    console.log('OG ABI:', OGAbi)
  }, [])

  useEffect(() => {
    console.log('Current OG:', currentOG)
  }, [currentOG])

  useEffect(() => {
    return () => {
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

  useEffect(() => {
    console.log('CreateAccountPage: Authentication status', { authenticated, user });
  }, [authenticated, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) {
        setIsTimedOut(true)
      }
    }, 10000) // 10 seconds timeout

    return () => clearTimeout(timer)
  }, [ready])

  const handleAccountNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setAccountName(newName)
    const { isValid, message } = validateDomainName(newName)
    setNameError(isValid ? null : message)
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!currentOG) {
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
        toast.error('This operation is only available on the Base network. Please switch to Base in your wallet.')
        setIsLoading(false)
        return
      }

      console.log('Starting account creation process')
      const signer = provider.getSigner()
      console.log('Signer obtained:', signer)
      console.log('Contract address:', currentOG.contract_address)
      console.log('ABI functions:', OGAbi.filter(item => item.type === 'function').map(item => item.name))
      const contract = new Contract(currentOG.contract_address, OGAbi, signer as unknown as ethers.Signer)
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
      toast.success(`Successfully created account ${accountName}${currentOG.og_name}!`)
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

  if (!ready && !isTimedOut) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-gray-600">Loading Privy configuration...</p>
        </div>
      </div>
    )
  }

  if (isTimedOut) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg text-red-600">Failed to load Privy configuration. Please refresh the page and try again.</p>
        </div>
      </div>
    )
  }

  const loginMessage = (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Login Required</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">
          To create an account, you need to log in first.
        </p>
        <button
          onClick={login}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Log In
        </button>
      </div>
    </div>
  )

  const accountCreationContent = (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
      <div className="bg-white py-12 px-8 shadow-lg sm:rounded-xl">
        {buyingEnabled === null ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : buyingEnabled ? (
          <>
            {accountPrice !== null && (
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Price</h3>
                <p className="text-4xl font-extrabold text-indigo-600">
                  {parseFloat(accountPrice).toFixed(20).replace(/\.?0+$/, '')} ETH
                </p>
                <p className="mt-2 text-sm text-gray-600">One-time fee, no renewals</p>
              </div>
            )}
            <form onSubmit={handleCreateAccount} className="space-y-8">
              <div>
                <label htmlFor="accountName" className="block text-xl font-medium text-gray-700 mb-2">
                  Choose Your Account Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="accountName"
                    id="accountName"
                    className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-l-md text-lg border-gray-300 p-4"
                    placeholder="youraccountname"
                    value={accountName}
                    onChange={handleAccountNameChange}
                    maxLength={140}
                  />
                  <span className="inline-flex items-center px-4 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-lg">
                    {currentOG?.og_name || '.og'}
                  </span>
                </div>
                {nameError && (
                  <p className="mt-2 text-sm text-red-600">{nameError}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !currentOG}
                  className="w-full flex justify-center py-4 px-6 border border-transparent rounded-md shadow-sm text-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    'Create Your Account'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Contact {currentOG?.name || 'the administrator'} for more info
            </h3>
            <p className="text-lg text-gray-600 mb-4">
              This group is by application, invite, or referral only.
            </p>
            {currentOG?.email ? (
              <a
                href={`mailto:${currentOG.email}?subject=${encodeURIComponent(`${currentOG.og_name} account inquiry`)}`}
                className="inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
              >
                Contact {currentOG.name || 'Administrator'}
              </a>
            ) : (
              <p className="text-sm text-gray-500">Contact information not available</p>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const truncateAddress = (address: string) => 
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const navItems = [
    { label: 'All Accounts', path: '' },
    { label: 'Create Account', path: '/create' },
  ];

  const adminContent = userIsAdmin && contractInfo ? (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
      <div className="bg-white py-8 px-6 shadow sm:rounded-lg">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Contract Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium text-gray-700">Buying Enabled:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${contractInfo.buyingEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {contractInfo.buyingEnabled ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-medium text-gray-700">Price:</span>
            <span className="text-indigo-600 font-semibold">{parseFloat(contractInfo.price.eth).toFixed(6)} ETH</span>
          </div>
          {contractInfo.referral && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-gray-700">Referral:</span>
              <span>{contractInfo.referral.percentage}</span>
            </div>
          )}
          {contractInfo.royalty && (
            <div className="flex justify-between items-center py-3 border-b">
              <span className="font-medium text-gray-700">Royalty:</span>
              <span>{contractInfo.royalty.percentage}</span>
            </div>
          )}
          <div className="py-3 border-b">
            <span className="font-medium text-gray-700">Minter:</span>
            <span className="block mt-1 text-sm text-gray-600 break-all">
              {truncateAddress(contractInfo.minter)}
            </span>
          </div>
          <div className="py-3 border-b">
            <span className="font-medium text-gray-700">TLD Owner:</span>
            <span className="block mt-1 text-sm text-gray-600 break-all">
              {truncateAddress(contractInfo.tldOwner)}
            </span>
          </div>
          <div className="py-3 border-b">
            <span className="font-medium text-gray-700">Royalty Fee Receiver:</span>
            <span className="block mt-1 text-sm text-gray-600 break-all">
              {truncateAddress(contractInfo.royaltyFeeReceiver)}
            </span>
          </div>
          <div className="py-3">
            <span className="font-medium text-gray-700">Royalty Fee Updater:</span>
            <span className="block mt-1 text-sm text-gray-600 break-all">
              {truncateAddress(contractInfo.royaltyFeeUpdater)}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 flex flex-col pt-8 pb-16 sm:px-6 lg:px-8">
      <AccountsSubNavigation />
      {authenticated && (
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <h2 className="text-center text-4xl font-extrabold text-indigo-900 dark:text-indigo-300 mb-4">
            {buyingEnabled ? (
              `Create Your ${currentOG?.og_name || ''} Account`
            ) : (
              `${currentOG?.og_name || ''} is by application, invite, or referral only`
            )}
          </h2>
        </div>
      )}
      {authenticated ? (
        <>
          {accountCreationContent}
          {adminContent}
        </>
      ) : (
        loginMessage
      )}
    </div>
  );
}
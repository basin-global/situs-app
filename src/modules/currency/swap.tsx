'use client';

import dynamic from 'next/dynamic';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

// Dynamically import Uniswap components with ssr disabled
const SwapWidget = dynamic(
  async () => {
    const { SwapWidget, darkTheme } = await import('@uniswap/widgets');
    return { default: (props: any) => <SwapWidget {...props} theme={darkTheme} /> };
  },
  { ssr: false }
);

// Inline token list for Base chain - using chainId 8453
const BASE_TOKENS = [
  {
    chainId: 8453,
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
  },
  {
    chainId: 8453,
    address: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png"
  },
  {
    chainId: 8453,
    address: "0x0578d8a44db98b23bf096a382e016e29a5ce0ffe",
    name: "HIGHER",
    symbol: "HIGHER",
    decimals: 18,
    logoURI: "https://www.higher.party/logo.png"
  },
  {
    chainId: 8453,
    address: "0x0c66d591d1ff5944a44aebb65c33f6b6e82a124f",
    name: "ENSURE",
    symbol: "ENSURE",
    decimals: 18,
    logoURI: "https://situs.world/logo.png"
  },
  {
    chainId: 8453,
    address: "0x20b048fA035D5763685D695e66aDF62c5D9F5055",
    name: "CHAR",
    symbol: "CHAR",
    decimals: 18,
    logoURI: "https://char.org/logo.png"
  },
  {
    chainId: 8453,
    address: "0xdcefd8c8fcc492630b943abcab3429f12ea9fea2",
    name: "Klima DAO",
    symbol: "KLIMA",
    decimals: 18,
    logoURI: "https://assets.klimadao.finance/klima-logo.png"
  },
  {
    chainId: 8453,
    address: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
    name: "USD Global",
    symbol: "USDGLO",
    decimals: 18,
    logoURI: "https://usdglobal.co/logo.png"
  }
];

// Default token addresses
const ENSURE_ADDRESS = "0x0c66d591d1ff5944a44aebb65c33f6b6e82a124f";
const DEFAULT_ETH_AMOUNT = "0.25"; // 0.25 ETH

export function SwapModule() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    const setupProvider = async () => {
      if (authenticated && wallets.length > 0) {
        const ethProvider = await wallets[0].getEthersProvider();
        setProvider(ethProvider);
      }
    };

    setupProvider();
  }, [authenticated, wallets]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-200">Token Swap on Base</h3>
      </div>
      <div className="min-h-[400px] flex items-center justify-center">
        {authenticated && provider ? (
          <SwapWidget 
            provider={provider}
            width="100%"
            tokenList={BASE_TOKENS}
            defaultChain="base"
            defaultInputAmount={DEFAULT_ETH_AMOUNT}
            defaultInputTokenAddress="NATIVE"
            defaultOutputTokenAddress={ENSURE_ADDRESS}
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-400 mb-2">
              Please connect your wallet to swap tokens
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 
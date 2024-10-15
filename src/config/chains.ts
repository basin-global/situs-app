import { Chain } from 'viem';

interface PrivyChain extends Chain {
  simplehashName: string;
  isTestnet: boolean;
}

export const supportedChains: PrivyChain[] = [
  {
    id: 1,
    name: 'Ethereum',
    simplehashName: 'ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://eth-mainnet.g.alchemy.com/v2/your-api-key'] },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://etherscan.io' },
    },
    isTestnet: false,
  },
  {
    id: 10,
    name: 'Optimism',
    simplehashName: 'optimism',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.optimism.io'] },
    },
    blockExplorers: {
      default: { name: 'OptimismScan', url: 'https://optimism.io' },
    },
    isTestnet: false,
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    simplehashName: 'arbitrum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://arb1.arbitrum.io/rpc'] },
    },
    blockExplorers: {
      default: { name: 'ArbitrumScan', url: 'https://arbiscan.io' },
    },
    isTestnet: false,
  },
  {
    id: 7777777,
    name: 'Zora',
    simplehashName: 'zora',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc.zora.energy'] },
    },
    blockExplorers: {
      default: { name: 'ZoraScan', url: 'https://zorascan.io' },
    },
    isTestnet: false,
  },
  {
    id: 42220,
    name: 'Celo',
    simplehashName: 'celo',
    nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://forno.celo.org'] },
    },
    blockExplorers: {
      default: { name: 'CeloScan', url: 'https://celoscan.org' },
    },
    isTestnet: false,
  },
  {
    id: 137,
    name: 'Polygon',
    simplehashName: 'polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://polygon-rpc.com'] },
    },
    blockExplorers: {
      default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
    },
    isTestnet: false,
  },
  {
    id: 8453,
    name: 'Base',
    simplehashName: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
    isTestnet: false,
  },
];

export const getChainById = (id: number) => supportedChains.find(chain => chain.id === id);
export const getChainBySimplehashName = (name: string) => supportedChains.find(chain => chain.simplehashName === name);

// Situs Types
// This file defines TypeScript interfaces and types specific to the Situs project.
// These types are used throughout the application to ensure type safety and provide
// better developer experience with autocompletion and error checking.

export interface OG {
    contract_address: string;
    og_name: string; // Expected to always start with a dot (e.g., ".example")
    name: string;  // OG Name from OGs.json
    email: string; // OG Email from OGs.json
    name_front?: string; // Add this line, making it optional
    tagline?: string; // Add this line, making it optional
    description?: string; // Add this line, making it optional
    chat?: string; // Add this line, making it optional
    total_supply: number; // Add this line, making it required
    website?: string; // Add this line, making it optional
    group_ensurance?: string | boolean; // Update to allow both string and boolean
    // ... other properties
  };
  
  export interface OgAccount {
    tba_address: string;
    account_name: string;
    token_id: number;
    created_at?: string;
    owner_of?: string;
    description?: string;
    // ... any other fields from database
  }

  export interface ValidationReport {
    ogs: {
      total: number;
      missing: string[];
      invalid: string[];
      totalSupplyMismatch: string[];
    };
    accounts: {
      total: number;
      missing: string[];
      invalid: string[];
      missingTBA: string[];
    };
    chains: {
      [key: string]: {
        // Add specific chain properties here
        total?: number;
        valid?: number;
        invalid?: number;
      };
    };
    summary: string;
  }

  // If needed, we can keep OgConfig as an alias for OG
  export type OgConfig = OG;

  // Add or update the AllAccountsProps interface
  export interface AllAccountsProps {
    og: string;
    accounts: OgAccount[];
    searchQuery: string;
    hideOgSuffix?: boolean;
    showCreateOption?: boolean;
    getAccountUrl?: (account: OgAccount) => string;  // Add this line
  }

  // Base interface for any digital asset
  interface BaseAsset {
    chain: string;
    contract_address: string;
    token_id: string;
    queried_wallet_balances?: Array<{
      quantity_string: string;
      value_usd_string?: string;
      address?: string;
      first_acquired_date?: string;
      last_acquired_date?: string;
      quantity?: number;
    }>;
  }

  // Regular NFT Asset
  export interface Asset extends BaseAsset {
    name?: string;
    image_url?: string;
    video_url?: string;
    audio_url?: string;
    description?: string;
    nft_id?: string;
    isTokenbound?: boolean;
    isNative?: boolean;
    mime_type?: string;
    collection?: {
      name?: string;
    };
    contract?: {
      type?: string;
    };
    owners?: Array<{
      owner_address: string;
      quantity: number;
    }>;
    extra_metadata?: {
      animation_original_url?: string;
    };
    symbol?: string;
  }

  // Currency specific
  export interface TokenBalance {
    chain: string;
    symbol: string;
    fungible_id?: string;
    decimals: number;
    name?: string;
    queried_wallet_balances: Array<{
      quantity_string: string;
      value_usd_string: string;
    }>;
    prices?: Array<{
      value_usd_string: string;
      marketplace_name: string;
    }>;
  }

  export type EnsureOperation = 'send' | 'buy' | 'sell' | 'convert' | 'ensure' | 'hide' | 'burn' | 'swap' | 'profile';

  export interface EnsureModalProps {
    isOpen: boolean;
    onClose: () => void;
    operation: EnsureOperation;
    asset: Asset;
    address: string;
    isTokenbound: boolean;
    onAction: () => Promise<{ hash: string }>;
  }

  export interface EnsurancePreviewProps {
    contractAddress: string;
    og: string;
  }

  // Import from tokenbound SDK
  import type { TokenboundClient } from "@tokenbound/sdk";

  // Define just what we need for TokenboundActions
  export interface TokenboundActions {
    isAccountDeployed: (params: { accountAddress: string }) => Promise<boolean>;
    createAccount?: (params: { tokenContract: string; tokenId: string }) => Promise<string>;
    executeCall?: (params: { account: string; to: string; value: string; data: string }) => Promise<{ hash: string }>;
  }

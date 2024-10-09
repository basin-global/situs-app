 // Situs Types
// This file defines TypeScript interfaces and types specific to the Situs project.
// These types are used throughout the application to ensure type safety and provide
// better developer experience with autocompletion and error checking.

export interface OG {
    contract_address: string;
    og_name: string; // Expected to always start with a dot (e.g., ".example")
    name: string;  // OG Name from OGs.json
    email: string; // OG Email from OGs.json
    // ... other properties
  };
  
  export interface OgAccount {
    token_id: string;
    account_name: string;
    created_at: string;
  }

  // If needed, we can keep OgConfig as an alias for OG
  export type OgConfig = OG;


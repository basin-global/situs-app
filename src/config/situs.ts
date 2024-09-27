// config/situs.ts

export interface SitusOG {
    name: string;
    contractAddress: string;
  }
  
  export const situsOGs: SitusOG[] = [
    { name: '.basin', contractAddress: '0x76AC406218413950DB2b050f7C3449AB5E24AABc' },
    { name: '.situs', contractAddress: '0xcFD18A8eD73087C8c6ABbf6edcdB30aD2fa0FEc7' },
    { name: '.boulder', contractAddress: '0xd93F89217FcF5F51414e90F62CFe7EeB549a13bc' },
    { name: '.regen', contractAddress: '0x3f06d9abaa7eef71a4f8017dc24cd6bb38fd779d' },
    { name: '.mumbai', contractAddress: '0x79987d81FC1a3Fb89df60aBefeC5cFb9b75Cc2D9' },
    { name: '.refi', contractAddress: '0x6a4B6A20C0910A8A7B11A5F7DCF40CdB088B6622' }
  ];
  
  export const situsConfig = {
    boulder: {
      // ... other properties
      chainName: 'base',
    },
    // ... other situs configurations
  };
  
  export function getSitusOGs(): SitusOG[] {
    return situsOGs;
  }
  
  export function getSitusOGByName(name: string): SitusOG | undefined {
    return situsOGs.find(og => og.name === `.${name}` || og.name === name);
  }
  
  export function getSitusOGByAddress(address: string): SitusOG | undefined {
    return situsOGs.find(og => og.contractAddress.toLowerCase() === address.toLowerCase());
  }
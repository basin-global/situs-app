const SIMPLEHASH_API_KEY = process.env.SIMPLEHASH_API_KEY;

export async function resolveENS(address: string): Promise<string> {
  console.log(`resolveENS function called with address: ${address}`);
  console.log('SIMPLEHASH_API_KEY:', process.env.SIMPLEHASH_API_KEY ? 'Set' : 'Not set');
  
  if (!process.env.SIMPLEHASH_API_KEY) {
    console.error('SimpleHash API key is not set');
    return address;
  }

  try {
    const url = `https://api.simplehash.com/api/v0/ens/reverse_lookup?address=${address}`;
    console.log(`Fetching from URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': SIMPLEHASH_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`SimpleHash API response:`, data);

    if (data.ens_domain) {
      console.log(`ENS domain found: ${data.ens_domain}`);
      return data.ens_domain;
    } else {
      console.log(`No ENS domain found for address: ${address}`);
      return address;
    }
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return address;
  }
}
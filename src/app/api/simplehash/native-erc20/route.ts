import { NextResponse } from 'next/server';
import { fetchAllBalances } from '@/lib/simplehash';
import { getActiveChainNames } from '@/config/chains';
import axios from 'axios';

async function getEthPrice() {
  try {
    const response = await axios.get('http://localhost:3000/api/eth-price');
    return response.data.price;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tbaAddress = searchParams.get('tbaAddress');
  const activeChains = getActiveChainNames();

  console.log('Native-ERC20 route - Active chains:', activeChains);
  console.log('Native-ERC20 route - TBA Address:', tbaAddress);

  if (!tbaAddress) {
    return NextResponse.json({ error: 'TBA address is required' }, { status: 400 });
  }

  try {
    console.log('Fetching all balances for TBA:', tbaAddress, 'Chains:', activeChains);
    const [data, ethPrice] = await Promise.all([
      fetchAllBalances(tbaAddress),
      getEthPrice()
    ]);

    console.log('All balances data received:', JSON.stringify(data, null, 2));
    console.log('Number of tokens returned:', data.fungibles.length);
    console.log('Chains present in response:', Object.keys(data.groupedBalances));
    console.log('Current ETH price:', ethPrice);

    // Add ETH price to the response
    const responseData = {
      ...data,
      ethPrice: ethPrice
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching all balances:', error);
    return NextResponse.json({ error: 'Error fetching all balances' }, { status: 500 });
  }
}

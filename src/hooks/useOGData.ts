import { useState, useEffect } from 'react';
import { useOG } from '@/contexts/og-context';

interface OGData {
  og_name: string;
  contract_address: string;
  name_front: string;
  tagline: string;
  description: string;
  email: string;
  website: string;
  total_supply: number;
  chat: string;
  group_ensurance: string;
  // Add any other fields you need
}

export function useOGData() {
  const { currentOG } = useOG();
  const [ogData, setOgData] = useState(currentOG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (currentOG) {
      setOgData(currentOG); // Set initial data immediately
      setIsLoading(true);
      
      // Fetch additional data
      fetch(`/api/getOGData?og=${currentOG.og_name}`)
        .then(response => response.json())
        .then(data => {
          setOgData(prevData => ({ ...prevData, ...data.ogData }));
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching OG data:', err);
          setError(err);
          setIsLoading(false);
        });
    }
  }, [currentOG]);

  return { ogData, isLoading, error };
}

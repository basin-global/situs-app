import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface NameAvailabilityCheckProps {
  og: string;
  name: string;
  onAvailabilityChange: (isAvailable: boolean | null) => void;
}

export const NameAvailabilityCheck: React.FC<NameAvailabilityCheckProps> = ({ og, name, onAvailabilityChange }) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const debouncedName = useDebounce(name, 500);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedName) {
        setIsAvailable(null);
        onAvailabilityChange(null);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch(`/api/checkNameAvailability?og=${og}&name=${debouncedName}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setIsAvailable(data.isAvailable);
        onAvailabilityChange(data.isAvailable);
      } catch (error) {
        console.error('Error checking name availability:', error);
        setIsAvailable(null);
        onAvailabilityChange(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedName, og, onAvailabilityChange]);

  if (!name) return null;

  return (
    <div>
      {isChecking ? (
        <p className="text-gray-500">Checking availability...</p>
      ) : (
        isAvailable !== null && (
          <p className={`text-lg font-semibold ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>
            {isAvailable ? 'Available' : 'Taken'}
          </p>
        )
      )}
    </div>
  );
};
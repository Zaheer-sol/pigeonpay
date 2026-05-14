import { useEffect, useState } from 'react';
import { fetchTokenPrices } from '../lib/prices';
import { updateTokenPrices } from '../lib/tokens';

export function usePrices(autoRefreshInterval: number = 60000) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const prices = await fetchTokenPrices();
      updateTokenPrices(prices);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch prices on mount
    refreshPrices();

    // Set up auto-refresh interval
    const interval = setInterval(refreshPrices, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  return { refreshPrices, loading, error, lastUpdate };
}

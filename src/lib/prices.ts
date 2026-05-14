// CoinGecko API for real-time token prices
// No API key required for public endpoints

export interface PriceData {
  [symbol: string]: number;
}

// Map token symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  'USDC': 'usd-coin',
  'SOL': 'solana',
  'USDT': 'tether',
  'BONK': 'bonk',
  'PYTH': 'pyth-network',
  'JUP': 'jupiter-exchange-solana',
  'ORCA': 'orca',
};

const CACHE_DURATION = 30000; // 30 seconds

let priceCache: PriceData = {};
let lastFetchTime = 0;

export async function fetchTokenPrices(): Promise<PriceData> {
  const now = Date.now();

  // Return cached prices if still fresh
  if (now - lastFetchTime < CACHE_DURATION && Object.keys(priceCache).length > 0) {
    return priceCache;
  }

  try {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    // Map response back to symbol prices
    const prices: PriceData = {};
    Object.entries(COINGECKO_IDS).forEach(([symbol, cgId]) => {
      prices[symbol] = data[cgId]?.usd ?? 0;
    });

    priceCache = prices;
    lastFetchTime = now;

    return prices;
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    // Return cached prices even if stale, or fallback defaults
    return priceCache;
  }
}

export async function getTokenPrice(symbol: string): Promise<number> {
  const prices = await fetchTokenPrices();
  return prices[symbol] ?? 0;
}

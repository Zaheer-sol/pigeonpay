export type TokenInfo = {
  symbol: string;
  name: string;
  color: string;
  bgColor: string;
  usdPrice: number;
};

// Default tokens with fallback prices
const TOKEN_DEFAULTS: Record<string, Partial<TokenInfo>> = {
  'USDC': { name: 'USD Coin', color: '#2775CA', bgColor: '#EBF4FF', usdPrice: 1.0 },
  'SOL': { name: 'Solana', color: '#9945FF', bgColor: '#F5EEFF', usdPrice: 180.0 },
  'USDT': { name: 'Tether', color: '#26A17B', bgColor: '#EDFAF5', usdPrice: 1.0 },
  'BONK': { name: 'Bonk', color: '#F7931A', bgColor: '#FFF7ED', usdPrice: 0.0000125 },
  'PYTH': { name: 'Pyth', color: '#6B7280', bgColor: '#F3F4F6', usdPrice: 0.085 },
  'JUP': { name: 'Jupiter', color: '#16A34A', bgColor: '#F0FDF4', usdPrice: 0.30 },
  'ORCA': { name: 'Orca', color: '#0EA5E9', bgColor: '#F0F9FF', usdPrice: 0.90 },
};

export let TOKENS: TokenInfo[] = Object.entries(TOKEN_DEFAULTS).map(([symbol, data]) => ({
  symbol,
  name: data.name || '',
  color: data.color || '#000000',
  bgColor: data.bgColor || '#FFFFFF',
  usdPrice: data.usdPrice || 0,
}));

export function updateTokenPrices(priceMap: Record<string, number>): void {
  TOKENS = TOKENS.map(token => ({
    ...token,
    usdPrice: priceMap[token.symbol] ?? token.usdPrice,
  }));
}

export function getToken(symbol: string): TokenInfo {
  return TOKENS.find(t => t.symbol === symbol) ?? TOKENS[0];
}

export function formatAmount(amount: number, token: string): string {
  const t = getToken(token);
  if (t.usdPrice < 0.001) {
    return amount.toLocaleString();
  }
  if (token === 'USDC' || token === 'USDT') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount % 1 === 0 ? amount : amount.toFixed(4)} ${token}`;
}

export function toUsd(amount: number, token: string): number {
  const t = getToken(token);
  return amount * t.usdPrice;
}

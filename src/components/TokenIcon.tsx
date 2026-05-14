import { getToken } from '../lib/tokens';

interface TokenIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function TokenIcon({ symbol, size = 'md' }: TokenIconProps) {
  const token = getToken(symbol);
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: token.bgColor, color: token.color }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

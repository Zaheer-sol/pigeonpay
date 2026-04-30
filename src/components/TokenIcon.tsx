interface TokenIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<TokenIconProps['size']>, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const colorMap: Record<string, string> = {
  USDC: 'bg-emerald-500 text-white',
  USDT: 'bg-sky-500 text-white',
  SOL: 'bg-cyan-500 text-white',
  BONK: 'bg-orange-500 text-white',
  PYTH: 'bg-violet-500 text-white',
  JUP: 'bg-lime-500 text-white',
  ORCA: 'bg-sky-700 text-white',
};

export default function TokenIcon({ symbol, size = 'md' }: TokenIconProps) {
  const style = colorMap[symbol] ?? 'bg-gray-500 text-white';
  return (
    <div className={`flex items-center justify-center rounded-full ${sizeClasses[size]} ${style}`}>
      <span className="font-semibold">{symbol.slice(0, 3).toUpperCase()}</span>
    </div>
  );
}

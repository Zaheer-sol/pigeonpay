import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Download, Inbox, ChevronRight, TrendingUp, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TokenIcon from '../components/TokenIcon';
import TestnetBadge from '../components/TestnetBadge';
import { supabase, Transaction, Balance } from '../lib/supabase';
import { getToken, toUsd } from '../lib/tokens';
import { maskPhone, relativeTime } from '../lib/format';
import { usePrices } from '../hooks/usePrices';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, balances, refreshBalances } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { refreshPrices, lastUpdate } = usePrices(60000); // Refresh every 60 seconds


  useEffect(() => {
    if (!user) return;
    supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${user?.uid},recipient_phone.eq.${profile?.phone ?? ''}`)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setTransactions(data ?? []));
  }, [user, profile]);

  const totalUsd = balances.reduce((sum: number, b: Balance) => sum + toUsd(b.amount, b.token), 0);

  const sortedBalances = [...balances].sort((a, b) => toUsd(b.amount, b.token) - toUsd(a.amount, a.token));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 h-14 flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</span>
          <TestnetBadge />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={refreshPrices}
            aria-label="Refresh prices"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Refresh prices'}
          >
            <RotateCw size={18} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-emerald-100 text-sm font-medium">Your Balance</span>
            <TrendingUp size={16} className="text-emerald-200" />
          </div>
          <div className="text-5xl font-bold tracking-tight mb-1">
            ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-emerald-200 text-sm">
            {profile?.phone ?? ''}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/send')}
            className="flex flex-col items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <Send size={22} />
            <span className="font-semibold text-sm">Send Money</span>
          </button>
          <button
            onClick={() => navigate('/receive')}
            className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 text-gray-900 dark:text-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all"
          >
            <Download size={22} />
            <span className="font-semibold text-sm">Receive Money</span>
          </button>
        </div>

        {/* Tokens */}
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-base mb-3">Your Tokens</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            {sortedBalances.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No tokens yet</div>
            ) : (
              sortedBalances.map((bal, i) => {
                const token = getToken(bal.token);
                const usd = toUsd(bal.amount, bal.token);
                const isLast = i === sortedBalances.length - 1;
                return (
                  <div
                    key={bal.id}
                    className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!isLast ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}
                  >
                    <TokenIcon symbol={bal.token} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{token.name}</div>
                      <div className="text-xs text-gray-400">{bal.token}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {bal.token === 'USDC' || bal.token === 'USDT'
                          ? `$${bal.amount.toFixed(2)}`
                          : bal.token === 'BONK'
                          ? bal.amount.toLocaleString()
                          : `${bal.amount} ${bal.token}`}
                      </div>
                      <div className="text-xs text-gray-400">${usd.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white text-base">Recent Activity</h2>
            {transactions.length > 0 && (
              <button onClick={() => navigate('/history')} className="text-emerald-500 text-sm font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm">
              <Inbox size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet. Send or receive money to get started.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              {transactions.map((tx, i) => {
                const isSender = tx.sender_id === user?.uid;
                const isLast = i === transactions.length - 1;
                return (
                  <div
                    key={tx.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-gray-50 dark:border-gray-700' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${isSender ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                      {isSender ? '📤' : '📥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {isSender ? `Sent to ${maskPhone(tx.recipient_phone)}` : `Received from ${maskPhone(tx.recipient_phone)}`}
                      </div>
                      <div className="text-xs text-gray-400">{relativeTime(tx.created_at)}</div>
                    </div>
                    <div className={`text-sm font-semibold ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isSender ? '-' : '+'}${tx.usd_value.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Testnet notice */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-amber-700 dark:text-amber-300 text-xs text-center">
            Using test tokens on Solana Devnet. Not real money.
          </p>
        </div>
      </div>
    </div>
  );
}

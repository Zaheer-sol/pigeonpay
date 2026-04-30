import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Download, Inbox, ChevronRight, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import TokenIcon from '../components/TokenIcon';
import TestnetBadge from '../components/TestnetBadge';
import Button from '../components/Buttons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { supabase, Transaction } from '../lib/supabase';
import { TOKENS, getToken, toUsd } from '../lib/tokens';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, balances, loading, refreshBalances } = useAuth();
  const { show } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;

    refreshBalances();
    const loadRecent = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_phone.eq.${profile?.phone}`)
        .order('created_at', { ascending: false })
        .limit(5);
      setTransactions(data ?? []);
    };

    loadRecent();
  }, [user, profile, refreshBalances]);

  const totalBalance = balances.reduce((sum, bal) => sum + toUsd(bal.amount, bal.token), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Dashboard" />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300 font-semibold">Welcome back</p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{profile?.phone ?? 'PigeonPay User'}</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">Your balance and recent activity are updated in real time.</p>
            </div>
            <TestnetBadge />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-gray-100 dark:border-gray-700 bg-emerald-500/5 dark:bg-emerald-500/10 p-5">
              <p className="text-sm text-emerald-700 dark:text-emerald-200">Total Value</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${totalBalance.toFixed(2)}</p>
            </div>
            {balances.map(balance => {
              const token = getToken(balance.token);
              return (
                <div key={balance.token} className="rounded-3xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex items-center gap-4">
                  <TokenIcon symbol={balance.token} size="md" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{token.name}</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{balance.token === 'USDC' || balance.token === 'USDT' ? `$${balance.amount.toFixed(2)}` : `${balance.amount.toFixed(4)} ${balance.token}`}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Recent activity</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latest transactions from your account</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</p>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="rounded-3xl border border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <TokenIcon symbol={tx.token} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{tx.token} {tx.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{tx.recipient_phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">${toUsd(tx.amount, tx.token).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick actions</p>
            <div className="space-y-3">
              <Button fullWidth variant="secondary" onClick={() => navigate('/send')}>
                <Send size={16} /> Send money
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/receive')}>
                <Download size={16} /> Receive money
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/history')}>
                <Inbox size={16} /> Transaction history
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

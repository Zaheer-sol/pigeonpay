import { useState, useEffect } from 'react';
import { Inbox, Copy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Button from '../components/Buttons';
import TokenIcon from '../components/TokenIcon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { supabase, Transaction } from '../lib/supabase';
import { maskPhone, relativeTime, fullDate } from '../lib/format';

type Filter = 'all' | 'sent' | 'received';

export default function History() {
  const { user, profile } = useAuth();
  const { show } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;
    setLoading(true);
    supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${user?.uid},recipient_phone.eq.${profile.phone}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTransactions(data ?? []);
        setLoading(false);
      });
  }, [user, profile]);

  const filtered = transactions.filter(tx => {
    const isSender = tx.sender_id === user?.uid;
    if (filter === 'sent') return isSender;
    if (filter === 'received') return !isSender;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBack title="Activity" />

      {/* Filter tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-14 z-20">
        <div className="max-w-lg mx-auto flex">
          {(['all', 'sent', 'received'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                filter === f
                  ? 'text-emerald-600 border-emerald-500'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-10">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Inbox size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No transactions yet. Start by sending or receiving money.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(tx => {
              const isSender = tx.sender_id === user?.uid;
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelected(tx)}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3.5 flex items-center gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${isSender ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                    {isSender ? '📤' : '📥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {isSender ? `Sent to ${maskPhone(tx.recipient_phone)}` : `Received from ${maskPhone(tx.recipient_phone)}`}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{relativeTime(tx.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                      {isSender ? '-' : '+'}${tx.usd_value.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{tx.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={selected.sender_id === user?.uid ? `Sent $${selected.usd_value.toFixed(2)} ${selected.token}` : `Received $${selected.usd_value.toFixed(2)} ${selected.token}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <TokenIcon symbol={selected.token} size="lg" />
              <div>
                <div className="font-bold text-xl text-gray-900 dark:text-white">
                  ${selected.usd_value.toFixed(2)} {selected.token}
                </div>
                <div className={`text-sm font-medium flex items-center gap-1 ${selected.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {selected.status === 'completed' ? '✓ Completed' : selected.status}
                </div>
              </div>
            </div>

            {[
              { label: 'To', value: selected.recipient_phone },
              { label: 'Token', value: selected.token },
              { label: 'Amount', value: `$${selected.amount.toFixed(2)}` },
              { label: 'Fee', value: `$${selected.fee.toFixed(4)}` },
              { label: 'Date', value: fullDate(selected.created_at) },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <span className="text-gray-400 text-sm">{row.label}</span>
                <span className="text-gray-900 dark:text-white text-sm font-medium text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}

            {/* Reference */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Reference ID</div>
                <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{selected.reference_id}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(selected.reference_id); show('Reference ID copied'); }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Copy size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

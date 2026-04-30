import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Button from '../components/Buttons';
import Input from '../components/Input';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';
import TokenIcon from '../components/TokenIcon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { TOKENS, toUsd, getToken } from '../lib/tokens';
import { generateRefId } from '../lib/format';

export default function Send() {
  const navigate = useNavigate();
  const { user, profile, balances, refreshBalances } = useAuth();
  const { show } = useToast();

  const [selectedToken, setSelectedToken] = useState('USDC');
  const [recipient, setRecipient] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [refId, setRefId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const tokenBalance = balances.find(b => b.token === selectedToken);
  const balance = tokenBalance?.amount ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum > 0 ? Math.max(0.01, amountNum * 0.001) : 0;
  const total = amountNum + fee;
  const usdValue = toUsd(amountNum, selectedToken);

  const amountError = amountNum > balance ? 'Not enough balance' : amountNum < 0 ? 'Enter a valid amount' : '';
  const allValid = isValidPhone(recipient) && amountNum > 0 && !amountError;

  async function handleSend() {
    if (!allValid || !user || !profile) return;
    setLoading(true);
    const ref = generateRefId();
    setRefId(ref);

    const { error } = await supabase.from('transactions').insert({
      sender_id: user.id,
      recipient_phone: recipient,
      token: selectedToken,
      amount: amountNum,
      usd_value: usdValue,
      fee,
      status: 'completed',
      reference_id: ref,
    });

    if (!error) {
      // Deduct from sender balance
      await supabase
        .from('balances')
        .update({ amount: balance - total })
        .eq('user_id', user.id)
        .eq('token', selectedToken);
      await refreshBalances();
    }

    setLoading(false);
    if (error) { setErrorMsg(error.message); setResult('error'); }
    else setResult('success');
  }

  if (result === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader showBack title="Send Money" />
        <div className="max-w-lg mx-auto px-4 pt-16 pb-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Money sent!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">They'll get a text message soon</p>
          <div className="text-3xl font-bold text-emerald-500 mb-6">
            +${usdValue.toFixed(2)} {selectedToken}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6 inline-flex items-center gap-3">
            <span className="text-xs text-gray-400">Ref:</span>
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{refId}</span>
            <button onClick={() => { navigator.clipboard.writeText(refId); show('Copied to clipboard'); }} className="text-gray-400 hover:text-gray-600">
              <Copy size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <Button fullWidth onClick={() => { setResult(null); setAmount(''); setRecipient(''); }}>Send Another</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (result === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <PageHeader showBack title="Send Money" />
        <div className="max-w-lg mx-auto px-4 pt-16 pb-10 text-center">
          <div className="text-5xl mb-6">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops, something went wrong</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{errorMsg || 'Connection error. Try again.'}</p>
          <div className="space-y-3">
            <Button fullWidth variant="danger" onClick={() => setResult(null)}>Try Again</Button>
            <Button fullWidth variant="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBack title="Send Money" />

      <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-5">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">What token?</label>
          <div className="relative">
            <select
              value={selectedToken}
              onChange={e => setSelectedToken(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pr-10 text-base text-gray-900 dark:text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 appearance-none cursor-pointer"
            >
              {TOKENS.map(t => {
                const bal = balances.find(b => b.token === t.symbol);
                const amount = bal?.amount ?? 0;
                return (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol} — {t.symbol === 'USDC' || t.symbol === 'USDT' ? `$${amount.toFixed(2)}` : `${amount} ${t.symbol}`} available
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Balance: {selectedToken === 'USDC' || selectedToken === 'USDT' ? `$${balance.toFixed(2)}` : `${balance} ${selectedToken}`}
          </p>
        </div>

        {/* Recipient */}
        <div>
          <PhoneInput
            label="Send To"
            value={recipient}
            onChange={setRecipient}
            error={recipientError}
          />
          {recipient && !isValidPhone(recipient) && (
            <p className="mt-1 text-xs text-red-500">Enter a valid phone number</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xl pointer-events-none">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full bg-white dark:bg-gray-800 border rounded-xl pl-8 pr-4 py-3 text-2xl text-center font-bold text-gray-900 dark:text-white outline-none transition-all
                ${amountError
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
                  : 'border-gray-200 dark:border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900'}`}
            />
          </div>
          {amountError && <p className="mt-1 text-xs text-red-500">{amountError}</p>}
          {amountNum > 0 && !amountError && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
              You're sending ${usdValue.toFixed(2)} {selectedToken}
            </p>
          )}
        </div>

        {/* Summary */}
        {allValid && amountNum > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-2 shadow-sm">
            {[
              { label: 'To', value: recipient },
              { label: 'Token', value: selectedToken },
              { label: 'Amount', value: `$${amountNum.toFixed(2)}` },
              { label: 'Fee', value: `$${fee.toFixed(2)}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-gray-400">{row.label}</span>
                <span className="text-gray-900 dark:text-white font-medium">{row.value}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">Fee covers network costs</p>
          </div>
        )}

        <Button
          fullWidth size="lg"
          loading={loading}
          disabled={!allValid}
          onClick={handleSend}
        >
          {loading ? 'Sending...' : 'Send Now'}
        </Button>
      </div>
    </div>
  );
}

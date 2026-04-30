import { useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import PageHeader from '../components/PageHeader';
import Button from '../components/Buttons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Receive() {
  const { profile } = useAuth();
  const { show } = useToast();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const phone = profile?.phone ?? '';
  const payLink = `https://pigeonpay.app/pay/${phone.replace(/\D/g, '')}`;

  function copyPhone() {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    show('Phone number copied!');
    setTimeout(() => setCopiedPhone(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(payLink);
    setCopiedLink(true);
    show('Link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBack title="Receive Money" />

      <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-6">
        {/* Phone Number */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm text-center">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Your Phone Number</h2>
          <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white tracking-wide mb-2">{phone}</div>
          <p className="text-sm text-gray-400 mb-4">Anyone can send you money with this</p>
          <Button
            variant={copiedPhone ? 'primary' : 'secondary'}
            onClick={copyPhone}
            className="gap-2"
          >
            <Copy size={16} />
            {copiedPhone ? 'Copied!' : 'Copy Number'}
          </Button>
        </div>

        {/* QR Code */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm text-center">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Or Share QR Code</h2>
          <div className="bg-white p-4 rounded-xl inline-block mb-4 shadow-inner border border-gray-100">
            <QRCode value={payLink} size={220} />
          </div>
          <p className="text-sm text-gray-400 mb-4">Anyone can scan this to send you money</p>
          <div className="flex gap-3 justify-center">
            <Button variant={copiedLink ? 'primary' : 'secondary'} onClick={copyLink} className="gap-2">
              <Copy size={16} />
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="outline" onClick={() => navigator.share?.({ title: 'Pay me on PigeonPay', url: payLink })} className="gap-2">
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm mb-2">How to receive money</h3>
          <ol className="space-y-1.5 text-sm text-emerald-700 dark:text-emerald-400">
            <li>1. Share your phone number or QR code</li>
            <li>2. Sender enters your phone and sends money</li>
            <li>3. Funds appear instantly in your balance</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

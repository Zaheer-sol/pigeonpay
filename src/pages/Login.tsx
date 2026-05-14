import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bird } from 'lucide-react';
import Button from '../components/Buttons';
import Input from '../components/Input';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePhoneNext(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    setLoading(true);
    setError('');

    const { error: err, verificationId: vid } = await sendOTP(phone);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (vid) {
      setSessionId(vid);
      setStep('otp');
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }
    setOtpError('');
    setLoading(true);
    setError('');

    const { error: err } = await verifyOTP(sessionId, otp, phone);
    setLoading(false);

    if (err) {
      setOtpError(err);
      return;
    }

    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Bird size={28} className="text-emerald-500" />
          <span className="font-bold text-xl text-gray-900 dark:text-white">PigeonPay</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">Login to PigeonPay</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-7">Enter your phone number</p>

        {step === 'phone' && (
          <form onSubmit={handlePhoneNext} className="space-y-5">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              error={phoneError}
            />

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button fullWidth size="lg" loading={loading} type="submit">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              Phone: <span className="font-semibold text-gray-900 dark:text-white">{phone}</span>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); }}
                className="ml-2 text-emerald-500 hover:underline text-xs"
              >
                Change
              </button>
            </div>

            <div>
              <Input
                label="Enter OTP"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                error={otpError}
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">Check your browser console (F12) for the SMS code</p>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              fullWidth size="lg"
              loading={loading}
              disabled={otp.length !== 6}
              type="submit"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>

            <button
              type="button"
              onClick={handlePhoneNext}
              className="w-full text-sm text-emerald-500 hover:underline font-medium"
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-500 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

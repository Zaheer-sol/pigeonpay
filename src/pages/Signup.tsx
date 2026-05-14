import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bird, CheckCircle2 } from 'lucide-react';
import Button from '../components/Buttons';
import Input from '../components/Input';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';

type Step = 'phone' | 'otp' | 'success';

export default function Signup() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePhoneNext() {
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

  async function handleVerifyOTP() {
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
    
    setStep('success');
    setTimeout(() => navigate('/dashboard'), 3000);
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account created!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Redirecting to your dashboard...</p>
          <Button fullWidth onClick={() => navigate('/dashboard')}>Continue to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Bird size={28} className="text-emerald-500" />
          <span className="font-bold text-xl text-gray-900 dark:text-white">PigeonPay</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">Create your account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-7">Sign up with your phone number</p>

        {step === 'phone' && (
          <div className="space-y-5">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              error={phoneError}
            />
            <p className="text-xs text-gray-400">We'll send you a verification code via SMS</p>
            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}
            <Button fullWidth size="lg" loading={loading} onClick={handlePhoneNext}>
              Send OTP
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-5">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              Phone: <span className="font-semibold text-gray-900 dark:text-white">{phone}</span>
              <button onClick={() => setStep('phone')} className="ml-2 text-emerald-500 hover:underline text-xs">Change</button>
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

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}

            <Button
              fullWidth size="lg"
              loading={loading}
              disabled={otp.length !== 6}
              onClick={handleVerifyOTP}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </Button>

            <button
              onClick={handlePhoneNext}
              className="w-full text-sm text-emerald-500 hover:underline font-medium"
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-500 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

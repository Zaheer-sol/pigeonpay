import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bird, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Button from '../components/Buttons';
import Input from '../components/Input';
import PhoneInput, { isValidPhone } from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

type Step = 'phone' | 'password' | 'success';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { show } = useToast();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwChecks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
  };
  const pwValid = Object.values(pwChecks).every(Boolean);

  function handlePhoneNext() {
    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setPhoneError('');
    setStep('password');
  }

  async function handleSubmit() {
    if (!pwValid) return;
    if (!agreed) { setError('You must accept the Terms of Service'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await signUp(phone, password);
    setLoading(false);
    if (err) {
      if (err.includes('already registered') || err.includes('already exists')) {
        setError('Phone number already exists. Try logging in instead.');
      } else {
        setError(err);
      }
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
        {/* Logo */}
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
            <p className="text-xs text-gray-400">We'll send you a verification code</p>
            <Button fullWidth size="lg" onClick={handlePhoneNext}>
              Continue
            </Button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-5">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              Phone: <span className="font-semibold text-gray-900 dark:text-white">{phone}</span>
              <button onClick={() => setStep('phone')} className="ml-2 text-emerald-500 hover:underline text-xs">Change</button>
            </div>

            <div>
              <Input
                label="Create password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                rightEl={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div className="mt-2 space-y-1">
                {[
                  { ok: pwChecks.length, label: 'At least 8 characters' },
                  { ok: pwChecks.number, label: 'Contains a number' },
                  { ok: pwChecks.special, label: 'Contains a special character' },
                ].map((c, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${c.ok ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <CheckCircle2 size={13} className={c.ok ? 'text-emerald-500' : 'text-gray-300'} />
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <a href="#" className="text-emerald-500 underline hover:text-emerald-600">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-emerald-500 underline hover:text-emerald-600">Privacy Policy</a>
              </span>
            </label>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">{error}</p>}

            <Button
              fullWidth size="lg"
              loading={loading}
              disabled={!pwValid || !agreed}
              onClick={handleSubmit}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
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

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bird, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Buttons';
import Input from '../components/Input';
import PhoneInput from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(phone, password);
    setLoading(false);
    if (err) { setError(err); return; }
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
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-7">Enter your phone number and password</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PhoneInput value={phone} onChange={setPhone} />

          <div>
            <Input
              label="Password"
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
            <div className="mt-1 text-right">
              <a href="#" className="text-xs text-emerald-500 hover:underline">Forgot password?</a>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              {error}
              {error.includes('not found') && (
                <Link to="/signup" className="ml-1 underline font-semibold">Create one instead.</Link>
              )}
            </div>
          )}

          <Button fullWidth size="lg" loading={loading} type="submit">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-500 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Bird, UserPlus, Wallet, Send, Star, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import Button from '../components/Buttons';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bird size={26} className="text-emerald-500" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">PigeonPay</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:border-emerald-400 hover:text-emerald-600 transition-all"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-emerald-50/30 to-gray-50 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-8">
            <Zap size={14} />
            Built on Solana — instant, cheap, decentralized
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Send money with just a{' '}
            <span className="text-emerald-500">phone number</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            No wallet address. No complicated setup. Just send.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm sm:max-w-none mx-auto">
            <Button size="lg" onClick={() => navigate('/signup')} className="sm:w-48">
              Get Started <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })} className="sm:w-48">
              See how it works
            </Button>
          </div>

          {/* Phone illustration */}
          <div className="mt-16 flex justify-center gap-6 items-center">
            <PhoneCard from="+234 803..." amount="$50" token="USDC" dir="send" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-0.5 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
              <Bird size={24} className="text-emerald-400 animate-bounce" />
              <div className="w-12 h-0.5 bg-emerald-300 dark:bg-emerald-700 rounded-full" />
            </div>
            <PhoneCard from="+1 415..." amount="+$50" token="USDC" dir="receive" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">How it works</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Three simple steps, no crypto knowledge needed</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <UserPlus size={28} />, title: 'Create Account', desc: 'Sign up with your phone number. Takes 30 seconds.' },
              { icon: <Wallet size={28} />, title: 'Add Funds', desc: 'Load your wallet with USDC, SOL, or other tokens.' },
              { icon: <Send size={28} />, title: 'Send to Anyone', desc: 'Send money using just their phone number.' },
            ].map((step, i) => (
              <div key={i} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                  {step.icon}
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features row */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Shield size={24} />, title: 'Self-Custodial', desc: 'Your keys, your money. No middleman.' },
              { icon: <Zap size={24} />, title: 'Instant', desc: 'Transactions settle in under 1 second.' },
              { icon: <Globe size={24} />, title: 'Global', desc: 'Send to anyone, anywhere in the world.' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Trusted by real people</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-14">
            {[
              { stat: '100+', label: 'Users' },
              { stat: '$50k', label: 'Volume' },
              { stat: '$0', label: 'Fees' },
            ].map((s, i) => (
              <div key={i} className="text-center bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 sm:p-6">
                <div className="text-2xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400">{s.stat}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { text: '"Faster than PayPal"', author: 'Sarah, Nigeria' },
              { text: '"My mom figured it out"', author: 'James, India' },
              { text: '"No wallet address nonsense"', author: 'Mike, US' },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{t.text}</p>
                <p className="text-gray-400 text-sm">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600 dark:bg-emerald-700">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-emerald-100 text-lg mb-8">Join thousands sending money the smarter way.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-lg"
            >
              Create Account
            </button>
            <button
              onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white hover:bg-white/10 active:scale-95 transition-all"
            >
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bird size={20} className="text-emerald-400" />
              <span className="text-white font-semibold">PigeonPay</span>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm">
            © 2026 PigeonPay. Send money your way.
          </div>
        </div>
      </footer>
    </div>
  );
}

function PhoneCard({ from, amount, token, dir }: { from: string; amount: string; token: string; dir: 'send' | 'receive' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 w-36 sm:w-44">
      <div className={`text-xs font-semibold mb-2 ${dir === 'send' ? 'text-gray-400' : 'text-emerald-500'}`}>
        {dir === 'send' ? 'Sending' : 'Receiving'}
      </div>
      <div className="font-bold text-gray-900 dark:text-white text-lg">{amount}</div>
      <div className="text-xs text-gray-400 mt-0.5">{token}</div>
      <div className="text-xs text-gray-400 mt-2 truncate">{from}</div>
    </div>
  );
}

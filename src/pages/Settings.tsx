import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Button from '../components/Buttons';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { show } = useToast();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  async function handleChangePassword() {
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return; }
    if (newPw.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    setPwError('');
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwLoading(false);
    if (error) { setPwError(error.message); return; }
    show('Password updated!');
    setShowPwModal(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader showBack title="Settings" />

      <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-6">
        {/* Account */}
        <Section title="Account">
          <InfoRow label="Phone number" value={profile?.phone ?? ''} />
          <InfoRow label="Account created" value={createdAt} />
          <InfoRow
            label="Account status"
            value={<span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full">Active</span>}
          />
        </Section>

        {/* Security */}
        <Section title="Security" icon={<Shield size={16} />}>
          <ActionRow
            label="Change Password"
            desc="Update your account password"
            onClick={() => setShowPwModal(true)}
          />
          <ActionRow
            label="Backup Account"
            desc="Backup your account (coming soon)"
            disabled
            badge="Soon"
          />
        </Section>

        {/* Payment Methods */}
        <Section title="Payment Methods" icon={<CreditCard size={16} />}>
          <ActionRow label="Add funds from bank" desc="Link your bank account" disabled badge="Soon" />
          <ActionRow label="Withdraw to bank" desc="Move funds to your bank" disabled badge="Soon" />
        </Section>

        {/* Legal & Support */}
        <Section title="Legal & Support" icon={<HelpCircle size={16} />}>
          <LinkRow label="Privacy Policy" href="#" />
          <LinkRow label="Terms of Service" href="#" />
          <LinkRow label="Contact Support" href="#" />
        </Section>

        {/* Logout */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-red-500"
          >
            <LogOut size={18} />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Sign Out">
        <p className="text-gray-500 dark:text-gray-400 mb-5">Are you sure you want to log out of PigeonPay?</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowLogoutModal(false)}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleLogout}>Sign Out</Button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPwModal} onClose={() => setShowPwModal(false)} title="Change Password">
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
          />
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowPwModal(false)}>Cancel</Button>
            <Button fullWidth loading={pwLoading} onClick={handleChangePassword}>Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm divide-y divide-gray-50 dark:divide-gray-700">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white font-medium">{value}</span>
    </div>
  );
}

function ActionRow({ label, desc, onClick, disabled, badge }: {
  label: string; desc: string; onClick?: () => void; disabled?: boolean; badge?: string;
}) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer'}`}
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
      </div>
      {badge && (
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">{badge}</span>
      )}
      {!disabled && <ChevronRight size={16} className="text-gray-400" />}
    </button>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <span className="text-sm font-semibold text-blue-500">{label}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </a>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, Profile, Balance } from '../lib/supabase';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential, signOut as firebaseSignOut } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

type AuthContextType = {
  user: FirebaseUser | null;
  profile: Profile | null;
  balances: Balance[];
  loading: boolean;
  sendOTP: (phone: string) => Promise<{ error: string | null; verificationId?: string }>;
  verifyOTP: (verificationId: string, otp: string, phone: string) => Promise<{ error: string | null }>;
  addPhone: (phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshBalances: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is not configured, don't try to listen to auth changes
    if (!auth) {
      setLoading(false);
      return;
    }

    // Listen to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Load Supabase profile using Firebase UID
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
        setBalances([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data);
    if (data) await fetchBalances(userId);
    setLoading(false);
  }

  async function fetchBalances(userId: string) {
    const { data } = await supabase.from('balances').select('*').eq('user_id', userId);
    setBalances(data ?? []);
  }

  async function refreshBalances() {
    if (user) await fetchBalances(user.uid);
  }

  async function sendOTP(phone: string): Promise<{ error: string | null; verificationId?: string }> {
    if (!auth) {
      return { error: 'Firebase not configured. Add credentials to .env file. See FIREBASE_SETUP.md' };
    }

    try {
      // Format phone number with + prefix
      const formattedPhone = phone.startsWith('+') ? phone : '+' + phone.replace(/\D/g, '');
      
      // Setup reCAPTCHA verifier
      const windowWithRecaptcha = window as any;
      if (!windowWithRecaptcha.recaptchaVerifier) {
        windowWithRecaptcha.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log('✅ reCAPTCHA verified');
          },
        });
      }

      // Send SMS OTP via Firebase
      const result = await signInWithPhoneNumber(auth, formattedPhone, windowWithRecaptcha.recaptchaVerifier);
      
      console.log(`📱 OTP sent to ${phone}`);
      return { error: null, verificationId: result.verificationId };
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      return { error: error.message || 'Failed to send OTP' };
    }
  }

  async function verifyOTP(verificationId: string, otp: string, phone: string): Promise<{ error: string | null }> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Verify OTP code with Firebase
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', result.user.uid)
        .maybeSingle();
      
      if (!existingProfile) {
        // New user - create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: result.user.uid,
          phone: cleanPhone,
          email: result.user.email || `${cleanPhone}@pigeonpay.local`,
        });
        
        if (profileError) return { error: profileError.message };
        
        // Create initial balances
        const { error: balanceError } = await supabase.from('balances').insert([
          { user_id: result.user.uid, token: 'USDC', amount: 0 },
          { user_id: result.user.uid, token: 'SOL', amount: 0 },
        ]);
        
        if (balanceError) console.error('Error creating balances:', balanceError);
      } else {
        // Update last login
        await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', result.user.uid);
      }
      
      console.log('✅ User authenticated:', result.user.uid);
      return { error: null };
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      return { error: error.message || 'Invalid OTP' };
    }
  }

  async function addPhone(phone: string): Promise<{ error: string | null }> {
    if (!user) return { error: 'Not authenticated' };
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if phone already exists for another user
    const { data: existingPhone } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();
    
    if (existingPhone && existingPhone.id !== user.uid) {
      return { error: 'This phone number is already registered' };
    }
    
    // Update user's profile with phone
    const { error } = await supabase
      .from('profiles')
      .update({ phone: cleanPhone })
      .eq('id', user.uid);
    
    if (error) return { error: error.message };
    
    // Reload profile
    await loadProfile(user.uid);
    
    return { error: null };
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, profile, balances, loading, sendOTP, verifyOTP, addPhone, signOut, refreshBalances }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

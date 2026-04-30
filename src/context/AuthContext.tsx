import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile, Balance } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  balances: Balance[];
  loading: boolean;
  signUp: (phone: string, password: string) => Promise<{ error: string | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshBalances: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) loadProfile(session.user.id);
        else setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => { await loadProfile(session.user.id); })();
      } else {
        setProfile(null);
        setBalances([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
    if (user) await fetchBalances(user.id);
  }

  async function signUp(phone: string, password: string): Promise<{ error: string | null }> {
    const email = `${phone.replace(/\D/g, '')}@pigeonpay.app`;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, phone });
      if (profileError) return { error: profileError.message };
    }
    return { error: null };
  }

  async function signIn(phone: string, password: string): Promise<{ error: string | null }> {
    const email = `${phone.replace(/\D/g, '')}@pigeonpay.app`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return { error: 'Phone number or password incorrect' };
      return { error: error.message };
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, balances, loading, signUp, signIn, signOut, refreshBalances }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

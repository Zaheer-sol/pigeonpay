import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  phone: string;
  created_at: string;
};

export type Balance = {
  id: string;
  user_id: string;
  token: string;
  amount: number;
  updated_at: string;
};

export type Transaction = {
  id: string;
  sender_id: string;
  recipient_phone: string;
  recipient_id: string | null;
  token: string;
  amount: number;
  usd_value: number;
  fee: number;
  status: string;
  reference_id: string;
  created_at: string;
};

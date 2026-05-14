import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize database schema on app start
export async function initializeDatabase() {
  try {
    // Check if otp_sessions table exists
    const { data, error } = await supabase
      .from('otp_sessions')
      .select('id')
      .limit(1);

    if (error && error.message?.includes('does not exist')) {
      console.log('Creating otp_sessions table...');
      
      // Create the table using raw SQL via an admin function or direct query
      // For now, log a helpful message
      console.warn(
        '⚠️  otp_sessions table does not exist. Please run this SQL in your Supabase dashboard:\n\n' +
        'CREATE TABLE IF NOT EXISTS otp_sessions (\n' +
        '  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n' +
        '  session_id text NOT NULL UNIQUE,\n' +
        '  phone text NOT NULL,\n' +
        '  otp text NOT NULL,\n' +
        '  expires_at timestamptz NOT NULL,\n' +
        '  created_at timestamptz DEFAULT now()\n' +
        ');\n' +
        'ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;\n' +
        'CREATE POLICY "Anyone can create OTP sessions" ON otp_sessions FOR INSERT WITH CHECK (true);\n' +
        'CREATE POLICY "Anyone can read OTP sessions" ON otp_sessions FOR SELECT USING (true);\n' +
        'CREATE POLICY "Anyone can delete own OTP sessions" ON otp_sessions FOR DELETE USING (true);'
      );
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

export type Profile = {
  id: string;
  phone: string;
  email?: string | null;
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

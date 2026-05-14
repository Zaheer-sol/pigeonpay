#!/usr/bin/env node

/**
 * Database Setup Script for PigeonPay
 * This script creates all necessary tables and policies in Supabase
 * 
 * Usage: node setup-db.js
 * 
 * Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Please create it with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf-8');
const supabaseUrl = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1];
const supabaseAnonKey = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const migrationSQL = `
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- OTP Sessions table (for SMS verification)
CREATE TABLE IF NOT EXISTS otp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create OTP sessions" ON otp_sessions;
CREATE POLICY "Anyone can create OTP sessions"
  ON otp_sessions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read OTP sessions" ON otp_sessions;
CREATE POLICY "Anyone can read OTP sessions"
  ON otp_sessions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can delete own OTP sessions" ON otp_sessions;
CREATE POLICY "Anyone can delete own OTP sessions"
  ON otp_sessions FOR DELETE
  USING (true);

-- Balances table
CREATE TABLE IF NOT EXISTS balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL DEFAULT 'USDC',
  amount numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own balances" ON balances;
CREATE POLICY "Users can view own balances"
  ON balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own balances" ON balances;
CREATE POLICY "Users can insert own balances"
  ON balances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own balances" ON balances;
CREATE POLICY "Users can update own balances"
  ON balances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  token text NOT NULL DEFAULT 'USDC',
  amount numeric NOT NULL,
  usd_value numeric NOT NULL DEFAULT 0,
  fee numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  reference_id text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Senders can view their transactions" ON transactions;
CREATE POLICY "Senders can view their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Recipients can view transactions sent to their phone" ON transactions;
CREATE POLICY "Recipients can view transactions sent to their phone"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.phone = transactions.recipient_phone
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON transactions;
CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Senders can update their transactions" ON transactions;
CREATE POLICY "Senders can update their transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Seed demo balances via trigger when profile is created
CREATE OR REPLACE FUNCTION seed_demo_balances()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO balances (user_id, token, amount) VALUES
    (NEW.id, 'USDC', 100),
    (NEW.id, 'SOL', 2),
    (NEW.id, 'USDT', 50)
  ON CONFLICT (user_id, token) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION seed_demo_balances();
`;

async function setupDatabase() {
  console.log('🚀 Setting up PigeonPay database schema...\n');

  try {
    // The Supabase anon key doesn't have permission to run raw SQL
    // We need to show the user instructions to run this manually
    console.log('📋 To set up your database, please follow these steps:\n');
    console.log('1. Open: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"');
    console.log('5. Copy and paste the SQL below:');
    console.log('\n' + '='.repeat(80) + '\n');
    console.log(migrationSQL);
    console.log('\n' + '='.repeat(80) + '\n');
    console.log('6. Click "Run" button');
    console.log('7. Wait for "Query successful" message');
    console.log('\n✅ Once done, your database will be ready!\n');

    // Alternative: Try to verify the connection works
    console.log('🔍 Verifying Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    if (!error) {
      console.log('✅ Connection to Supabase successful!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

setupDatabase();

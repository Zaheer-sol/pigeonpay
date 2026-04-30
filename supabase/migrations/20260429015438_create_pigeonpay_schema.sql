/*
  # PigeonPay Schema

  1. New Tables
    - `profiles` - User profile linked to auth.users
      - `id` (uuid, FK to auth.users)
      - `phone` (text, unique) - user's phone number
      - `created_at` (timestamptz)
    - `transactions` - All send/receive records
      - `id` (uuid, PK)
      - `sender_id` (uuid, FK to profiles)
      - `recipient_phone` (text) - recipient phone number
      - `recipient_id` (uuid, nullable FK to profiles)
      - `token` (text) - token symbol e.g. USDC
      - `amount` (numeric) - amount sent
      - `usd_value` (numeric) - USD equivalent
      - `fee` (numeric) - transaction fee
      - `status` (text) - pending, completed, failed
      - `reference_id` (text) - short reference code
      - `created_at` (timestamptz)
    - `balances` - User token balances
      - `id` (uuid, PK)
      - `user_id` (uuid, FK to profiles)
      - `token` (text)
      - `amount` (numeric)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Users can view own balances"
  ON balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balances"
  ON balances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Senders can view their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

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

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

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
    (NEW.id, 'USDC', 125.50),
    (NEW.id, 'SOL', 2.5),
    (NEW.id, 'USDT', 50.00),
    (NEW.id, 'BONK', 1000000),
    (NEW.id, 'PYTH', 100),
    (NEW.id, 'JUP', 50),
    (NEW.id, 'ORCA', 25)
  ON CONFLICT (user_id, token) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION seed_demo_balances();

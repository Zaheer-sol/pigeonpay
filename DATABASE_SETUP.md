# PigeonPay Database Setup - Bolt to Supabase Migration

## Step 1: Create Tables in Supabase

Your app is already configured to use Supabase. Now you need to create the missing tables.

### Method 1: SQL Editor (Recommended - 5 minutes)

1. Open https://app.supabase.com
2. Select your **qaxtzytoobsunlbofzzz** project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. **Copy and paste the entire SQL below** (all tables at once)
6. Click **Run** (or Ctrl+Enter)

```sql
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  email text,
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

CREATE POLICY "Anyone can create OTP sessions"
  ON otp_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read OTP sessions"
  ON otp_sessions FOR SELECT
  USING (true);

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
```

7. ✅ Wait for "Query successful" message

## Step 2: Verify Tables Created

In the Supabase dashboard:
1. Click **Table Editor** (left sidebar)
2. You should see: `profiles`, `otp_sessions`, `balances`, `transactions`

## Step 3: Test the App

1. Return to http://localhost:5174
2. Click **"Get Started"** or **"Create Account"**
3. Enter a phone number
4. Click **"Send OTP"**
5. Check browser console (F12 → Console) for the OTP code
6. Enter the OTP to create account

## Step 4: Migrate Data from Bolt (If Applicable)

If you have existing data in Bolt:

### Option A: Manual Export/Import
1. Export data from Bolt (CSV format)
2. Import into Supabase via Table Editor

### Option B: Contact Support
Email support if you need data migration assistance

## Troubleshooting

**Error: "Could not find the table 'public.otp_sessions' in schema cache"**
- The SQL hasn't been run yet, or the browser cached old data
- Run the SQL above
- Hard refresh browser (Ctrl+Shift+R)

**Error: "User already exists"**
- This means Supabase Auth already has a user record
- This is normal - proceed with login instead

**Why all these tables?**
- `profiles` - Stores user phone numbers
- `otp_sessions` - Temporary OTP codes (10 min expiry)
- `balances` - User token balances (USDC, SOL, etc.)
- `transactions` - Send/receive history
- Auto-seeding - Each new user gets test balances automatically

## Next: SMS/WhatsApp Integration

The OTP code currently prints to console. For real SMS/WhatsApp:
- Need Twilio integration (paid service)
- Update `sendOTP()` in `src/context/AuthContext.tsx`
- Add Twilio API keys to `.env`

For now, testing via console OTP is fine!

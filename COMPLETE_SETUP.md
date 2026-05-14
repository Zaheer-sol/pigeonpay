# PigeonPay - Complete Setup Guide

## Current Status

✅ Frontend is running on http://localhost:5174
❌ Database tables are missing (causing "Could not find table 'otp_sessions'" error)

## Quick Start (2 minutes)

### Step 1: Create Database Tables

Go to https://app.supabase.com and run this SQL:

**Copy the entire SQL block below and paste it into Supabase SQL Editor:**

```sql
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
```

**Instructions:**
1. Open https://app.supabase.com
2. Click your **qaxtzytoobsunlbofzzz** project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the SQL above
6. Click **Run** or press `Ctrl+Enter`
7. Wait for "Query successful" ✅

### Step 2: Test the App

1. Go to http://localhost:5174
2. Click **"Get Started"** or **"Create Account"**
3. Enter any phone number (e.g., +1 2125551234)
4. Click **"Send OTP"**
5. Open browser DevTools: Press `F12` → Click **Console**
6. Look for: `OTP for +1 2125551234: 123456` (6-digit code)
7. Enter that code in the OTP field
8. Create account successful! ✅

## Architecture

### Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User phone number & email |
| `otp_sessions` | Temporary OTP codes (10 min expiry) |
| `balances` | User token holdings (USDC, SOL, USDT) |
| `transactions` | Send/receive history |

### Current OTP Implementation

- ✅ Generates 6-digit OTP
- ✅ Stored in database (10 min expiry)
- ✅ Logs to browser console (for testing)
- ❌ Not sent via SMS/WhatsApp (manual console check for now)

### Production Next Steps

1. **Integrate Twilio** for actual SMS/WhatsApp delivery
2. **Add Solana wallet integration** for real token transfers
3. **Deploy to Vercel** for production

## Troubleshooting

### Error: "Could not find table 'public.otp_sessions'"
**Solution:** Run the SQL above in Supabase SQL Editor

### Error: "UNIQUE constraint failed: profiles.phone"
**Solution:** This user already exists. Go to **Login** instead of **Signup**

### OTP not appearing in console
**Solution:** 
- Open DevTools (F12)
- Click **Console** tab
- Refresh page (F5)
- Try again

## File Structure

```
src/
├── context/
│   └── AuthContext.tsx         # OTP verification logic
├── pages/
│   ├── Signup.tsx             # Phone + OTP signup
│   ├── Login.tsx              # Phone + OTP login
│   ├── Send.tsx               # Send money form
│   ├── Receive.tsx            # Show phone QR code
│   ├── Dashboard.tsx          # Main dashboard
│   ├── History.tsx            # Transaction history
│   ├── Settings.tsx           # User settings
│   └── Landing.tsx            # Marketing page
├── components/
│   ├── PhoneInput.tsx         # Phone input with flags
│   ├── Modal.tsx              # Modal component
│   ├── Toast.tsx              # Toast notifications
│   └── ...other components
└── lib/
    ├── supabase.ts            # Supabase client & types
    ├── tokens.ts              # Token info & pricing
    └── format.ts              # Utility functions
```

## Environment Variables

```
VITE_SUPABASE_URL=https://qaxtzytoobsunlbofzzz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

These are already in your `.env` file.

## Running the Project

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## About Your Database

You mentioned your database is in Bolt. Good news! **Your app is already configured for Supabase** (I checked your `.env`). The tables just need to be created. Run the SQL above and you're done!

If you have existing data in Bolt that needs migrating, let me know and I can help export/import it.

## Support

For any issues:
1. Check the troubleshooting section above
2. Open browser DevTools (F12) and check Console for errors
3. Verify tables exist in Supabase: https://app.supabase.com → Table Editor

Happy sending! 🚀

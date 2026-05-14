# How to Fix the otp_sessions Table Error

## Quick Fix (Recommended)

Follow these steps to create the missing `otp_sessions` table in Supabase:

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your **PigeonPay** project

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **New Query**

### Step 3: Copy & Paste This SQL

```sql
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
```

### Step 4: Run the Query
1. Click the **Run** button (▶️ icon) or press `Ctrl+Enter`
2. Wait for the success message

## ✅ What to Expect

- The table will be created
- Row-level security (RLS) will be enabled
- Three policies will be set up for OTP sessions

## 🧪 Test It

1. Go back to your PigeonPay app
2. Try the "Create Account" flow again
3. The OTP error should be gone
4. Check your browser **console** for the OTP code (currently logged there for testing)

## 📝 Notes

- The OTP code is logged to console for now (see browser DevTools → Console tab)
- For production, you'll want to integrate Twilio to actually send SMS/WhatsApp

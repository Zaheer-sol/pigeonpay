# WhatsApp OTP Authentication - Complete Implementation Guide

## What You Have Now

✅ **Supabase Database** - Fully configured with tables
✅ **Phone-based OTP Flow** - Generate, store, and verify OTP codes
✅ **WhatsApp Integration** - Ready to send OTP via WhatsApp
✅ **Frontend** - Signup, Login, Dashboard, Send Money

## Setup Steps (5 minutes)

### Step 1: Create Supabase Database Tables
Open https://app.supabase.com and run the SQL from the migration file:

**Path:** `supabase/migrations/20260429015438_create_pigeonpay_schema.sql`

Copy the entire SQL and run it in Supabase SQL Editor.

If you don't have the tables yet, use this SQL:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS otp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create OTP sessions" ON otp_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read OTP sessions" ON otp_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can delete OTP sessions" ON otp_sessions FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL DEFAULT 'USDC',
  amount numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balances" ON balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own balances" ON balances FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own balances" ON balances FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Senders can view their transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = sender_id);
CREATE POLICY "Recipients can view transactions" ON transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.phone = transactions.recipient_phone)
);
CREATE POLICY "Authenticated users can insert transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Senders can update their transactions" ON transactions FOR UPDATE TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

CREATE OR REPLACE FUNCTION seed_demo_balances() RETURNS TRIGGER AS $$
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
CREATE TRIGGER on_profile_created AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION seed_demo_balances();
```

### Step 2: Create Supabase Edge Function for WhatsApp

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **Create a new function**
3. Name it: `send-otp-whatsapp`
4. Replace the code with:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;

serve(async (req) => {
  if (req.method === "POST") {
    const { phone, otp } = await req.json();

    try {
      const whatsappPhone = `whatsapp:${phone}`;
      const fromNumber = `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${auth}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: whatsappPhone,
            Body: `Your PigeonPay verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
          }).toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: data.message || "Failed to send OTP" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, sid: data.sid }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response("Not Found", { status: 404 });
});
```

5. Click **Deploy**

### Step 3: Add Twilio Secrets to Edge Function

1. In Supabase Dashboard, go to **Settings → Edge Functions → Secrets**
2. Add these secrets:

| Name | Value |
|------|-------|
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | Your WhatsApp number (e.g., +1 415 523 8886) |

### Step 4: Get Twilio Credentials

1. Go to https://www.twilio.com → Sign up (free)
2. Go to Twilio Console: https://console.twilio.com
3. Copy your **Account SID** and **Auth Token**
4. Go to **Messaging → WhatsApp**
5. Set up WhatsApp Sandbox or Business Account
6. Get your WhatsApp number

### Step 5: Update Frontend .env

Add to your `.env` file:

```
VITE_SUPABASE_URL=https://qaxtzytoobsunlbofzzz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_EDGE_FUNCTION_URL=https://qaxtzytoobsunlbofzzz.supabase.co/functions/v1/send-otp-whatsapp
```

To get the Edge Function URL:
- Supabase Dashboard → Edge Functions
- Click `send-otp-whatsapp`
- Copy the URL shown

### Step 6: Test

```bash
# Start frontend
npm run dev
```

Visit http://localhost:5174:
1. Click **Create Account**
2. Enter your WhatsApp-enabled phone number
3. Click **Send OTP**
4. Check WhatsApp for the verification code
5. Enter the code and create account ✅

## How It Works

```
User enters phone
    ↓
Clicks "Send OTP"
    ↓
Frontend calls sendOTP() in AuthContext
    ↓
AuthContext stores OTP in Supabase otp_sessions table
    ↓
AuthContext calls Supabase Edge Function
    ↓
Edge Function calls Twilio API
    ↓
Twilio sends OTP via WhatsApp
    ↓
User receives WhatsApp message
    ↓
User enters code
    ↓
Frontend calls verifyOTP()
    ↓
Code verified ✅ Account created!
```

## Testing Without Twilio (Development Mode)

If you don't have Twilio set up yet:
1. Remove `VITE_SUPABASE_EDGE_FUNCTION_URL` from `.env`
2. OTP will be logged to browser console instead
3. Copy the code from console to test
4. Later, add Twilio when ready

## Troubleshooting

### "OTP not received"
- Check Twilio Console Logs for errors
- Verify WhatsApp number format (+1 2125551234)
- Ensure Twilio secrets are correct

### "VITE_SUPABASE_EDGE_FUNCTION_URL not set"
- Add the URL to `.env`
- Get it from Supabase → Edge Functions → Your function

### "Failed to create account"
- Check browser DevTools (F12 → Console) for errors
- Verify Supabase tables exist
- Check RLS policies are not blocking operations

## Production Deployment

### Frontend
```bash
npm run build
# Deploy to Vercel, Netlify, or your hosting
```

### Supabase
- Already managed in cloud
- Edge Function automatically scales

### Twilio
- Upgrade from Sandbox to Business
- Complete WhatsApp verification with Meta
- Update TWILIO_WHATSAPP_NUMBER to production number

## Files Modified

- `src/context/AuthContext.tsx` - Added Twilio integration
- `src/pages/Signup.tsx` - Updated UI to mention WhatsApp
- `src/pages/Login.tsx` - Updated UI to mention WhatsApp
- `.env` - Added Edge Function URL

## Next Steps (Optional)

1. Add SMS fallback if WhatsApp fails
2. Implement email notifications
3. Add transaction history export
4. Implement Solana wallet integration
5. Add multi-language support

## Support

For issues:
1. Check the troubleshooting section above
2. Open browser DevTools (F12)
3. Check Twilio Console for error logs
4. Check Supabase Edge Function logs

# Supabase Setup Guide for PigeonPay

## Step 1: Create New Supabase Project

1. Navigate to https://supabase.com
2. Sign in or create an account
3. Click **"New Project"**
4. Configure:
   - **Project name:** `pigeonpay`
   - **Database password:** Create and save a strong password
   - **Region:** Select closest to your location
5. Click **"Create new project"** and wait ~2 minutes for deployment

## Step 2: Retrieve Your API Credentials

Once project is created:

1. Open your project dashboard
2. Navigate to **Settings** → **API** (left sidebar)
3. Copy and save these values:
   - **Project URL** (format: `https://xxxxx.supabase.co`)
   - **anon public key** (under "Project API keys")
   - **service_role secret** (keep private - only for server use)

## Step 3: Configure Environment Variables

Update or create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key_here
```

**Do NOT commit `.env` to git** - add to `.gitignore`

## Step 4: Create Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New Query"** button
3. Open file: `supabase/migrations/20260429015438_create_pigeonpay_schema.sql`
4. Copy all SQL content
5. Paste into Supabase SQL editor
6. Click **"Run"** button (or Cmd/Ctrl + Enter)
7. Wait for success message

**Verify tables created:**
- Go to **Table Editor** in left sidebar
- You should see these 4 tables:
  - ✅ `profiles`
  - ✅ `otp_sessions`
  - ✅ `balances`
  - ✅ `transactions`

## Step 5: Test the Setup

```bash
npm run dev
```

1. Open http://localhost:5173
2. Go to Signup page
3. Enter a test phone number (e.g., +15551234567)
4. Click "Send Code"
5. **Check browser console** (F12) - you should see the 6-digit OTP code
6. Enter the code in the verification field
7. ✅ Account created successfully

At this point, the app is fully functional for testing! You can:
- Create accounts
- Send/receive money
- View transaction history
- Check balances

## Step 6: (Optional) Set Up WhatsApp via Twilio

Only do this when ready to send real WhatsApp messages.

### 6a. Create Twilio Account
1. Go to https://www.twilio.com/console
2. Sign up or sign in
3. Create new project
4. Copy your **Account SID** and **Auth Token**

### 6b. Set Up WhatsApp Sandbox
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send an SMS**
2. Click **WhatsApp** tab
3. Request WhatsApp Sandbox
4. Follow Twilio's setup wizard
5. Get your **WhatsApp sandbox number** (format: `whatsapp:+1234567890`)

### 6c. Create Supabase Edge Function

1. In Supabase dashboard, go to **Edge Functions** (left sidebar)
2. Click **Create a new function**
3. Name: `send-otp-whatsapp`
4. Keep Typescript selected
5. Delete default code and paste:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error("Missing Twilio credentials");
    }

    const to = phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
    const from = twilioNumber.startsWith("whatsapp:")
      ? twilioNumber
      : `whatsapp:${twilioNumber}`;

    const auth = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: `Your PigeonPay verification code is: ${otp}`,
        }).toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio error: ${data.message}`);
    }

    return new Response(JSON.stringify({ success: true, sid: data.sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

6. Click **Deploy**

### 6d. Add Twilio Secrets

1. After deployment, go to function settings
2. Click **Secrets** tab
3. Add these secrets:
   - `TWILIO_ACCOUNT_SID`: your Account SID
   - `TWILIO_AUTH_TOKEN`: your Auth Token
   - `TWILIO_WHATSAPP_NUMBER`: your WhatsApp sandbox number

### 6e. Update .env

Add to `.env`:

```env
VITE_SUPABASE_EDGE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/send-otp-whatsapp
```

### 6f. Test WhatsApp

1. Restart dev server: `npm run dev`
2. Go to Signup
3. Enter your phone number
4. You should receive the OTP code via WhatsApp!

## Troubleshooting

**"Could not find table 'public.otp_sessions'"**
- Run Step 4 again - tables may not have created
- Check Table Editor to verify all 4 tables exist

**WhatsApp messages not sending**
- Check Supabase Edge Function logs (Edge Functions → select function → Logs tab)
- Verify Twilio secrets are set correctly
- Check Twilio account has WhatsApp enabled

**OTP code not appearing in console**
- Open browser DevTools (F12)
- Go to Console tab
- Refresh page and try signup again

**Environment variables not loading**
- Restart dev server: `npm run dev`
- Verify `.env` file is in project root (not in src/)
- Variables must start with `VITE_` to be accessible in frontend

## Project Structure

```
pigeonpay/
├── .env                          ← Your Supabase credentials
├── .env.example                  ← Template (commit this)
├── src/
│   ├── context/AuthContext.tsx   ← Handles OTP flow
│   ├── pages/
│   │   ├── Signup.tsx           ← Phone signup
│   │   ├── Login.tsx            ← Phone login
│   │   ├── Send.tsx             ← Send money
│   │   └── ...
│   └── lib/supabase.ts          ← Supabase client setup
├── supabase/
│   └── migrations/
│       └── 20260429015438_create_pigeonpay_schema.sql  ← Database schema
└── SUPABASE_SETUP_GUIDE.md      ← This file
```

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

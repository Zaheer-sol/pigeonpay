# WhatsApp OTP Authentication Setup with Twilio + Supabase

## Overview
This guide helps you set up WhatsApp-based OTP authentication for PigeonPay using Twilio and Supabase.

## Step 1: Set Up Twilio Account

### 1.1 Create Twilio Account
1. Go to https://www.twilio.com
2. Click **Sign Up** (free account to start)
3. Fill in details and verify email
4. Create a Twilio account

### 1.2 Get Twilio Credentials
1. Go to Twilio Console: https://console.twilio.com
2. Copy your **Account SID** (looks like: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
3. Copy your **Auth Token** (hidden by default - click eye icon to reveal)

### 1.3 Set Up WhatsApp Sandbox
1. In Twilio Console, go to **Messaging → WhatsApp**
2. Click **Try it out**
3. You'll see your WhatsApp Sandbox Number (e.g., +1 415 523 8886)
4. Follow the instructions to join the sandbox:
   - Send `join friendly-shark` to the sandbox number
5. Once confirmed, your number is ready for testing

### 1.4 Get Twilio WhatsApp Number
1. Go to **Messaging → Programmable SMS** (in Twilio Console)
2. Purchase a phone number (or use the sandbox)
3. Enable WhatsApp on that number
4. Save the number (e.g., +1 415 523 8886)

## Step 2: Create Supabase Edge Function

Edge Functions run on Supabase and call Twilio to send messages.

### 2.1 Create the Function
In your Supabase dashboard:

1. Click **Edge Functions** (left sidebar)
2. Click **Create a new function** → Name it `send-otp-whatsapp`
3. Replace the code with this:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_WHATSAPP_NUMBER = Deno.env.get("TWILIO_WHATSAPP_NUMBER")!;

serve(async (req) => {
  if (req.method === "POST") {
    const { phone, otp } = await req.json();

    try {
      // Format phone number for WhatsApp (must include country code)
      const whatsappPhone = `whatsapp:${phone}`;
      const fromNumber = `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;

      // Create Basic Auth for Twilio
      const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

      // Send message via Twilio
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

### 2.2 Add Secrets to Supabase
1. In Supabase Dashboard, go to **Settings → Edge Functions**
2. Click **Add Secret** and add these:
   - Key: `TWILIO_ACCOUNT_SID`, Value: (your Account SID)
   - Key: `TWILIO_AUTH_TOKEN`, Value: (your Auth Token)
   - Key: `TWILIO_WHATSAPP_NUMBER`, Value: (your WhatsApp number, e.g., +1 415 523 8886)

## Step 3: Update Frontend (.env file)

Add this to your `.env` file:

```
VITE_SUPABASE_URL=https://qaxtzytoobsunlbofzzz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_EDGE_FUNCTION_URL=https://qaxtzytoobsunlbofzzz.supabase.co/functions/v1/send-otp-whatsapp
```

To find your Edge Function URL:
- Supabase Dashboard → Edge Functions
- Click your function
- Copy the URL at the top

## Step 4: Test WhatsApp Integration

### For Testing (Sandbox Mode)
1. Open http://localhost:5174
2. Go to **Create Account**
3. Enter the WhatsApp sandbox number (e.g., +1 415 523 8886)
4. Click **Send OTP**
5. Check your WhatsApp for the code!

### For Production
1. Verify your WhatsApp Business Account with Twilio
2. Purchase a production WhatsApp number
3. Update `TWILIO_WHATSAPP_NUMBER` in Edge Function secrets
4. Users can now use real phone numbers

## Twilio Pricing

| Service | Cost |
|---------|------|
| WhatsApp Sandbox (Testing) | **FREE** |
| WhatsApp Business Messages | $0.0015 - $0.003 per message |
| Monthly account | $1 minimum |

Start with sandbox for free testing!

## Complete WhatsApp User Journey

1. User enters phone number
2. Clicks "Send OTP"
3. **Backend calls Twilio Edge Function**
4. **Twilio sends OTP via WhatsApp**
5. User receives WhatsApp message with code
6. User enters code
7. Account created ✅

## Troubleshooting

### "Failed to send OTP" Error
- Check Twilio credentials in Edge Function secrets
- Verify phone number format (must have + and country code)
- Ensure WhatsApp Sandbox is active

### Not receiving WhatsApp messages
- Did you join the sandbox? (Send `join friendly-shark`)
- Check Twilio Console → Logs for errors
- Make sure phone number format is correct (+1 2125551234)

### Production Setup
- Verify Twilio Business Account
- Apply for WhatsApp Business API access
- Get approved by WhatsApp
- Update production phone numbers

## Next Steps (Optional)

1. Add SMS fallback if WhatsApp fails
2. Add rate limiting to prevent abuse
3. Add message template management
4. Add multilingual support

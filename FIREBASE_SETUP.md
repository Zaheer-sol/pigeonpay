# Firebase SMS Authentication Setup Guide

## Step-by-Step Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing project
3. Name it "PigeonPay" (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Phone Authentication
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click the **Sign-in method** tab
3. Click **Phone** and toggle it **ON**
4. Add your test phone numbers (optional, for testing)
5. Click **Save**

### 3. Get Your Web App Credentials
1. In Firebase Console, go to **Project Settings** (gear icon, top right)
2. Click the **General** tab
3. Scroll down to "Your apps" section
4. Click the **Web** icon (</> symbol) if no web app exists, or select your web app
5. You'll see the configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 4. Update Your .env File
Copy your credentials from Firebase and paste them into `.env`:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### 5. Enable Phone Numbers for Testing
For development/testing:
1. Go back to **Authentication** → **Sign-in method** → **Phone**
2. Scroll to "Phone numbers for testing (optional)"
3. Click "Add number"
4. Enter a test number and its code (e.g., `+1 234 567 8900` → `123456`)
5. This lets you test without actually sending SMS

### 6. Restart Your Dev Server
After updating `.env`, restart the development server:
```bash
npm run dev
```

### 7. Test the Flow
1. Navigate to `http://localhost:5173/login`
2. Enter a test phone number (from step 5)
3. Click "Send OTP"
4. Firebase will prompt for SMS (or show the test code you set)
5. Enter the OTP
6. You should be logged in!

## Important Notes

- **Firebase Free Tier**: Allows ~100 SMS per day for new projects
- **Production**: Request higher quota from Firebase support
- **reCAPTCHA**: Firebase automatically handles bot detection
- **Phone Format**: Use international format like `+1 2125551234`

## Troubleshooting

**Issue**: "Configuration is incomplete" message
- **Solution**: Make sure all Firebase credentials are in `.env`

**Issue**: Can't send OTP
- **Solution**: Check Firebase console for errors in **Logs** section

**Issue**: Test number not working
- **Solution**: Verify the number is added correctly in Firebase console

## Next Steps

Once Firebase is configured:
1. Test with real phone numbers (Firebase will send actual SMS)
2. Update database schema if needed
3. Consider adding multi-factor authentication

---

**Documentation**: https://firebase.google.com/docs/auth/web/phone-auth

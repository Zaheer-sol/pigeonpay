import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential, signOut } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Check if configuration is complete
const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain;

export let auth: any = null;

if (!isConfigured) {
  console.error('❌ Firebase configuration is incomplete!');
  console.error('Please add these to your .env file:');
  console.error('  VITE_FIREBASE_API_KEY');
  console.error('  VITE_FIREBASE_AUTH_DOMAIN');
  console.error('  VITE_FIREBASE_PROJECT_ID');
  console.error('  VITE_FIREBASE_STORAGE_BUCKET');
  console.error('  VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.error('  VITE_FIREBASE_APP_ID');
  console.error('');
  console.error('See FIREBASE_SETUP.md for instructions');
} else {
  // Initialize Firebase only if config is complete
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = 'en';
}

export { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential, signOut };


// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration using environment variables
// Development (.env) uses ddd-spark
// Production (.env.production) uses dans-dichter-db
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Critical: Validate Firebase config before initialization
console.log('🔥 Firebase Environment:', import.meta.env.MODE);
console.log('🔥 Firebase Project:', firebaseConfig.projectId);
console.log('🔥 Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '❌ MISSING',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '❌ MISSING',
  projectId: firebaseConfig.projectId ? '✓ Set' : '❌ MISSING'
});

// Throw error if config is invalid
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const error = new Error('❌ CRITICAL: Firebase configuration is missing! Check .env file and Vite build process.');
  console.error(error);
  console.error('Current config:', firebaseConfig);
  throw error;
}

// Initialize Firebase
console.log('🔥 Initializing Firebase with projectId:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase initialized successfully');

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance as well (if needed elsewhere)
export default app;
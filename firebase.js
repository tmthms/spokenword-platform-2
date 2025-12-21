// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration via Vite environment variables
// Build command determines which .env file is loaded:
// - "vite build --mode staging" loads .env.staging (ddd-spark)
// - "vite build --mode production" loads .env.production (dans-dichter-db)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Critical: Validate and log Firebase config
console.log('🔥 Vite Mode:', import.meta.env.MODE);
console.log('🔥 Firebase Project:', firebaseConfig.projectId);
console.log('🔥 Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '❌ MISSING',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '❌ MISSING',
  projectId: firebaseConfig.projectId ? '✓ Set' : '❌ MISSING'
});

// RUNTIME ENVIRONMENT GUARD: Comprehensive validation
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missing = requiredKeys.filter(k => !firebaseConfig[k] || firebaseConfig[k] === '❌ MISSING' || firebaseConfig[k].length < 5);

if (missing.length > 0) {
  const errorMsg = `FATAL: Environment variables missing or invalid (${missing.join(', ')}).`;
  console.error('❌', errorMsg);
  console.error('Current config:', firebaseConfig);
  console.error('Mode:', import.meta.env.MODE);

  // Show user-friendly error page
  document.body.innerHTML = `
    <div style="
      color: #dc2626;
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 600px;
      margin: 100px auto;
      background: #fef2f2;
      border: 2px solid #dc2626;
      border-radius: 8px;
    ">
      <h1 style="margin-top: 0;">⚠️ Configuration Error</h1>
      <p><strong>${errorMsg}</strong></p>
      <p style="font-size: 14px; color: #991b1b;">
        The application cannot start because required environment variables are not configured correctly.
      </p>
      <details style="margin-top: 20px; font-size: 12px; color: #7f1d1d;">
        <summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
        <pre style="background: white; padding: 10px; border-radius: 4px; margin-top: 10px; overflow-x: auto;">Mode: ${import.meta.env.MODE}
Missing: ${missing.join(', ')}
Project ID: ${firebaseConfig.projectId || 'NOT SET'}</pre>
      </details>
    </div>
  `;

  throw new Error(errorMsg);
}

// FIX 4: Environment guard - Staging warning for ddd-spark
// Show badge only when hostname contains 'ddd-spark'
if (window.location.hostname.includes('ddd-spark')) {
  console.warn(
    '%c⚠️ STAGING - DB: DDD-SPARK ⚠️',
    'background: #ff9800; color: #000; font-size: 20px; font-weight: bold; padding: 10px;'
  );
  console.warn('This is NOT production. Project:', firebaseConfig.projectId);

  // Add visual badge to page
  window.addEventListener('DOMContentLoaded', () => {
    const badge = document.createElement('div');
    badge.id = 'staging-badge';
    badge.style.cssText = `
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
      color: white;
      padding: 8px 20px;
      font-weight: bold;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      border-radius: 0 0 8px 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    badge.textContent = '⚠️ STAGING - DB: DDD-SPARK';
    document.body.appendChild(badge);
  });
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
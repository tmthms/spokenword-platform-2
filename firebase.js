// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Staging Configuration (ddd-spark)
const stagingConfig = {
  apiKey: "AIzaSyDGsfwimJfPv_seC7aR5UZXOwIj7H9zoX4",
  authDomain: "ddd-spark.firebaseapp.com",
  projectId: "ddd-spark",
  storageBucket: "ddd-spark.firebasestorage.app",
  messagingSenderId: "356297618243",
  appId: "1:356297618243:web:6f5c5bc2d56665b87775f6"
};

// Production Configuration (dans-dichter-db)
const productionConfig = {
  apiKey: "AIzaSyBUId9LHYCGIJgXAXBFhxn9-68_PFzQ5oo",
  authDomain: "dans-dichter-db.firebaseapp.com",
  projectId: "dans-dichter-db",
  storageBucket: "dans-dichter-db.firebasestorage.app",
  messagingSenderId: "112694272627",
  appId: "1:112694272627:web:2758ed2393181aff320006"
};

// Runtime hostname-based environment detection
const hostname = window.location.hostname;
const isStaging = hostname.includes('ddd-spark') || hostname.includes('localhost') || hostname.includes('127.0.0.1');
const firebaseConfig = isStaging ? stagingConfig : productionConfig;
const environment = isStaging ? 'STAGING (ddd-spark)' : 'PRODUCTION (dans-dichter-db)';

// Critical: Log environment detection
console.log('🌍 Hostname:', hostname);
console.log('🔥 Environment Detected:', environment);
console.log('🔥 Firebase Project:', firebaseConfig.projectId);
console.log('🔥 Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '❌ MISSING',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '❌ MISSING',
  projectId: firebaseConfig.projectId ? '✓ Set' : '❌ MISSING'
});

// Throw error if config is invalid
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const error = new Error('❌ CRITICAL: Firebase configuration is missing!');
  console.error(error);
  console.error('Current config:', firebaseConfig);
  throw error;
}

// FIX 4: Environment guard - Prominent staging warning
if (isStaging) {
  console.warn(
    '%c⚠️ RUNNING ON STAGING ENVIRONMENT (ddd-spark) ⚠️',
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
    badge.textContent = '⚠️ STAGING ENVIRONMENT (ddd-spark)';
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
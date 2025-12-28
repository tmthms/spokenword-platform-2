/**
 * run-once-normalize-genres.js
 *
 * One-time script to normalize all genre values in the database
 * Converts: "performance poetry", "Performance-Poetry", "PERFORMANCE_POETRY"
 * All to: "Performance Poetry"
 *
 * Usage:
 *   node run-once-normalize-genres.js           (uses staging by default)
 *   node run-once-normalize-genres.js staging   (uses .env.staging)
 *   node run-once-normalize-genres.js production (uses .env.production)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Determine which environment to use
const environment = process.argv[2] || 'staging';
const envFile = environment === 'production' ? '.env.production' : '.env.staging';

console.log(`📝 Loading environment from: ${envFile}\n`);

// Load environment variables from the specified file
const envConfig = {};
try {
  const envContent = readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      envConfig[key.trim()] = value;
    }
  });
} catch (error) {
  console.error(`❌ Error loading ${envFile}:`, error.message);
  process.exit(1);
}

// Initialize Firebase with the loaded config
const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envConfig.VITE_FIREBASE_APP_ID
};

console.log(`🔥 Connecting to Firebase project: ${firebaseConfig.projectId}\n`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function normalizeGenre(genre) {
  return genre
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function normalizeAllGenres() {
  try {
    console.log('🔄 Starting genre normalization...\n');

    const snapshot = await getDocs(collection(db, 'artists'));
    console.log(`📊 Found ${snapshot.size} artist documents\n`);

    let updatedCount = 0;
    let unchangedCount = 0;

    for (const artistDoc of snapshot.docs) {
      const data = artistDoc.data();
      const originalGenres = data.genres || [];

      // Normaliseer alle genres en verwijder duplicaten
      const normalizedGenres = [...new Set(
        originalGenres.map(g => normalizeGenre(g))
      )];

      // Check of er iets veranderd is
      const changed = JSON.stringify(originalGenres.sort()) !== JSON.stringify(normalizedGenres.sort());

      if (changed) {
        await updateDoc(doc(db, 'artists', artistDoc.id), {
          genres: normalizedGenres
        });

        updatedCount++;
        console.log(`✅ Updated ${artistDoc.id} (${data.stageName || data.firstName || 'Unknown'}):`);
        console.log(`   Before: ${originalGenres.join(', ')}`);
        console.log(`   After:  ${normalizedGenres.join(', ')}\n`);
      } else {
        unchangedCount++;
      }
    }

    console.log('\n✨ Genre normalization complete!');
    console.log(`   Updated: ${updatedCount} artists`);
    console.log(`   Unchanged: ${unchangedCount} artists`);
    console.log(`   Total: ${snapshot.size} artists`);

  } catch (error) {
    console.error('❌ Error normalizing genres:', error);
    throw error;
  }
}

// Run the normalization
normalizeAllGenres()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

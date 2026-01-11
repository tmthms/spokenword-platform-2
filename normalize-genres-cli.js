/**
 * normalize-genres-cli.js
 *
 * One-time script to normalize all genre values in the database
 * Uses Firebase CLI authentication (no service account key needed)
 *
 * Usage:
 *   firebase use staging && node normalize-genres-cli.js
 *   firebase use production && node normalize-genres-cli.js
 *
 * Make sure you're logged in: firebase login
 */

import { execSync } from 'child_process';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { readFileSync } from 'fs';

// Get current Firebase project from CLI
let currentProject;
try {
  const result = execSync('firebase use', { encoding: 'utf-8' });
  const match = result.match(/Active Project: (.+?) \(/);
  if (match) {
    currentProject = match[1];
  } else {
    throw new Error('Could not determine current project');
  }
} catch (error) {
  console.error('❌ Error: Could not get current Firebase project');
  console.error('   Make sure you run: firebase use <project-name>');
  console.error('   Available: staging (ddd-spark) or production (dans-dichter-db)');
  process.exit(1);
}

console.log(`📝 Current Firebase project: ${currentProject}\n`);

// Load environment config based on project
const envFile = currentProject === 'dans-dichter-db' ? '.env.production' : '.env.staging';
console.log(`📝 Loading environment from: ${envFile}\n`);

// Load environment variables
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

// Initialize Firebase with config
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
    console.log('🔄 Starting genre normalization...');
    console.log('⚠️  Note: This requires appropriate Firestore permissions\n');

    const snapshot = await getDocs(collection(db, 'artists'));
    console.log(`📊 Found ${snapshot.size} artist documents\n`);

    let updatedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (const artistDoc of snapshot.docs) {
      const data = artistDoc.data();
      const originalGenres = data.genres || [];

      // Skip if no genres
      if (originalGenres.length === 0) {
        unchangedCount++;
        continue;
      }

      // Normaliseer alle genres en verwijder duplicaten
      const normalizedGenres = [...new Set(
        originalGenres.map(g => normalizeGenre(g))
      )];

      // Check of er iets veranderd is
      const changed = JSON.stringify(originalGenres.sort()) !== JSON.stringify(normalizedGenres.sort());

      if (changed) {
        try {
          await updateDoc(doc(db, 'artists', artistDoc.id), {
            genres: normalizedGenres
          });

          updatedCount++;
          console.log(`✅ Updated ${artistDoc.id} (${data.stageName || data.firstName || 'Unknown'}):`);
          console.log(`   Before: ${originalGenres.join(', ')}`);
          console.log(`   After:  ${normalizedGenres.join(', ')}\n`);
        } catch (updateError) {
          errorCount++;
          console.error(`❌ Failed to update ${artistDoc.id}:`, updateError.message);
        }
      } else {
        unchangedCount++;
      }
    }

    console.log('\n✨ Genre normalization complete!');
    console.log(`   Updated: ${updatedCount} artists`);
    console.log(`   Unchanged: ${unchangedCount} artists`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount} artists`);
    }
    console.log(`   Total: ${snapshot.size} artists`);

  } catch (error) {
    console.error('❌ Error normalizing genres:', error);

    if (error.code === 'permission-denied') {
      console.error('\n🔒 Permission denied. Options:');
      console.error('   1. Use the Admin SDK version: node normalize-genres-admin.js');
      console.error('   2. Temporarily adjust Firestore security rules');
      console.error('   3. Make sure you have the right permissions in Firebase Console');
    }

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
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });

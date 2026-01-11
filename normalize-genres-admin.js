/**
 * normalize-genres-admin.js
 *
 * One-time script to normalize all genre values in the database using Firebase Admin SDK
 * Converts: "performance poetry", "Performance-Poetry", "PERFORMANCE_POETRY"
 * All to: "Performance Poetry"
 *
 * Usage:
 *   node normalize-genres-admin.js staging
 *   node normalize-genres-admin.js production
 *
 * Requirements:
 *   - Service account key file (see instructions below if not present)
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';

// Determine which environment to use
const environment = process.argv[2] || 'staging';

// Service account key file paths
const serviceAccountPaths = {
  staging: './serviceAccountKey-staging.json',
  production: './serviceAccountKey-production.json'
};

const serviceAccountPath = serviceAccountPaths[environment];

// Check if service account key exists
if (!existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found: ${serviceAccountPath}\n`);
  console.log('📋 To download the service account key:\n');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log(`2. Select project: ${environment === 'production' ? 'dans-dichter-db' : 'ddd-spark'}`);
  console.log('3. Click gear icon ⚙️  → Project settings');
  console.log('4. Go to "Service accounts" tab');
  console.log('5. Click "Generate new private key"');
  console.log('6. Save the downloaded JSON file as:', serviceAccountPath);
  console.log('\n7. Run this script again: node normalize-genres-admin.js', environment);
  console.log('\n⚠️  IMPORTANT: Add the service account key to .gitignore to keep it private!\n');
  process.exit(1);
}

// Load service account key
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  console.log(`📝 Loaded service account from: ${serviceAccountPath}`);
  console.log(`🔥 Project ID: ${serviceAccount.project_id}\n`);
} catch (error) {
  console.error(`❌ Error loading service account key:`, error.message);
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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

    const snapshot = await db.collection('artists').get();
    console.log(`📊 Found ${snapshot.size} artist documents\n`);

    let updatedCount = 0;
    let unchangedCount = 0;

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
        await artistDoc.ref.update({
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

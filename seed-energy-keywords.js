/**
 * Seed script to add energyLevel and keywords to existing artists
 *
 * Usage:
 * 1. Ensure Firebase is configured in your environment
 * 2. Run: node seed-energy-keywords.js
 *
 * Or run directly in Firebase Console:
 * - Go to Firestore > artists collection
 * - Add these fields manually to each document:
 *   - energyLevel: "intiem" | "interactief" | "high energy"
 *   - keywords: ["maatschappelijk", "liefde", "humor", ...]
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase config - Replace with your actual config or import from firebase.js
const firebaseConfig = {
  // Add your Firebase config here
  // Or import from: import { db } from './src/services/firebase.js';
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data options
const energyLevels = ['intiem', 'interactief', 'high energy'];
const keywordOptions = [
  'maatschappelijk',
  'liefde',
  'protest',
  'humor',
  'persoonlijk',
  'politiek',
  'natuur',
  'urban',
  'storytelling',
  'experimenteel'
];

/**
 * Get random item from array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random subset of array
 */
function getRandomSubset(array, minCount = 1, maxCount = 4) {
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Seed artist data with energyLevel and keywords
 */
async function seedArtistData() {
  try {
    console.log('🌱 Starting seed process...');

    const snapshot = await getDocs(collection(db, 'artists'));
    console.log(`📊 Found ${snapshot.size} artists to update`);

    let updateCount = 0;

    for (const artistDoc of snapshot.docs) {
      const artistData = artistDoc.data();

      // Skip if already has energyLevel and keywords
      if (artistData.energyLevel && artistData.keywords) {
        console.log(`⏭️  Skipping ${artistDoc.id} - already has data`);
        continue;
      }

      // Generate random data
      const randomEnergy = getRandomItem(energyLevels);
      const randomKeywords = getRandomSubset(keywordOptions, 1, 4);

      // Update document
      await updateDoc(doc(db, 'artists', artistDoc.id), {
        energyLevel: randomEnergy,
        keywords: randomKeywords
      });

      updateCount++;
      console.log(`✅ Updated ${artistDoc.id}:`);
      console.log(`   - Energy: ${randomEnergy}`);
      console.log(`   - Keywords: [${randomKeywords.join(', ')}]`);
    }

    console.log(`\n🎉 Done! Updated ${updateCount} artists`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run the seed function
seedArtistData()
  .then(() => {
    console.log('✨ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed failed:', error);
    process.exit(1);
  });

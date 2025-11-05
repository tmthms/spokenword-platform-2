/**
 * seed-test-data.js
 * 
 * Script om test users en conversations aan te maken voor platform testing
 * 
 * GEBRUIK:
 * 1. Plaats dit bestand in je project root
 * 2. Run: node seed-test-data.js
 * 
 * BELANGRIJK: Dit script gebruikt Firebase Admin SDK
 * Je hebt je service account key nodig!
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Read service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Test data configuratie
const TEST_PASSWORD = 'TestPassword123!'; // Alle test users krijgen dit password

const TEST_PROGRAMMERS = [
  {
    email: 'programmer1@test.com',
    firstName: 'Jan',
    lastName: 'Janssen',
    organizationName: 'EventCo Amsterdam',
    status: 'pro', // Pro user - kan messages sturen
    phone: '+31612345671',
    website: 'https://eventco.nl',
    organizationAbout: 'Wij organiseren culturele evenementen in Amsterdam'
  },
  {
    email: 'programmer2@test.com',
    firstName: 'Marie',
    lastName: 'de Vries',
    organizationName: 'Festival Productions',
    status: 'trial', // Trial user - kan ook messages sturen
    phone: '+31612345672',
    website: 'https://festivalproductions.nl',
    organizationAbout: 'Muziekfestivals door heel Nederland'
  },
  {
    email: 'programmer3@test.com',
    firstName: 'Peter',
    lastName: 'Bakker',
    organizationName: 'Theater de Kleine Komedie',
    status: 'pending', // Pending - kan GEEN messages sturen
    phone: '+31612345673',
    website: 'https://kleinekomedie.nl',
    organizationAbout: 'Intiem theater in hartje Rotterdam'
  },
  {
    email: 'programmer4@test.com',
    firstName: 'Lisa',
    lastName: 'van Dijk',
    organizationName: 'Poetry Night Events',
    status: 'pro',
    phone: '+31612345674',
    website: 'https://poetrynight.nl',
    organizationAbout: 'Spoken word events in Utrecht'
  },
  {
    email: 'programmer5@test.com',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    organizationName: 'Multicultureel Festival Den Haag',
    status: 'trial',
    phone: '+31612345675',
    website: 'https://mcfestival.nl',
    organizationAbout: 'Diverse cultural events in The Hague'
  }
];

const TEST_ARTISTS = [
  {
    email: 'artist1@test.com',
    firstName: 'Emma',
    lastName: 'Peters',
    stageName: 'Emma Speaks',
    phone: '+31687654321',
    dob: '1995-03-15',
    gender: 'f',
    location: 'Amsterdam',
    genres: ['Performance Poetry', 'Slam Poetry'],
    languages: ['nl', 'en'],
    paymentMethods: ['bank', 'cash'],
    bio: 'Performance poet uit Amsterdam met focus op maatschappelijke thema\'s',
    pitch: 'Krachtige spoken word over identiteit en sociale rechtvaardigheid. Perfect voor festivals en culturele evenementen.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    audioUrl: 'https://soundcloud.com/example',
    textContent: 'Sample poem text here...',
    published: true
  },
  {
    email: 'artist2@test.com',
    firstName: 'Jamal',
    lastName: 'Williams',
    stageName: 'J-Flow',
    phone: '+31687654322',
    dob: '1992-07-22',
    gender: 'm',
    location: 'Rotterdam',
    genres: ['Hip Hop Poetry', 'Rap'],
    languages: ['nl', 'en'],
    paymentMethods: ['bank', 'paypal'],
    bio: 'Hip hop poet combining rhythm and storytelling',
    pitch: 'Energieke shows met een mix van rap en poetry. Ideaal voor jongeren events.',
    published: true
  },
  {
    email: 'artist3@test.com',
    firstName: 'Fatima',
    lastName: 'El Amrani',
    stageName: 'Fatima Flames',
    phone: '+31687654323',
    dob: '1998-11-08',
    gender: 'f',
    location: 'Utrecht',
    genres: ['Slam Poetry', 'Performance Poetry'],
    languages: ['nl', 'ar', 'fr'],
    paymentMethods: ['bank'],
    bio: 'Meertalige spoken word artist met Marokkaanse roots',
    pitch: 'Krachtige performances in Nederlands, Arabisch en Frans over identiteit en cultuur.',
    published: true
  },
  {
    email: 'artist4@test.com',
    firstName: 'Sophie',
    lastName: 'van Bergen',
    stageName: 'Sophie Softly',
    phone: '+31687654324',
    dob: '1990-05-30',
    gender: 'f',
    location: 'Den Haag',
    genres: ['Lyrical Poetry', 'Storytelling'],
    languages: ['nl', 'en'],
    paymentMethods: ['bank', 'cash'],
    bio: 'Intieme verhalen verteller met focus op persoonlijke groei',
    pitch: 'Zachte, emotionele poetry voor intieme settings en workshops.',
    published: true
  },
  {
    email: 'artist5@test.com',
    firstName: 'Marcus',
    lastName: 'Johnson',
    stageName: 'MC Truth',
    phone: '+31687654325',
    dob: '1988-01-12',
    gender: 'm',
    location: 'Amsterdam',
    genres: ['Hip Hop Poetry', 'Political Poetry'],
    languages: ['en', 'nl'],
    paymentMethods: ['bank', 'paypal'],
    bio: 'Political spoken word artist addressing social issues',
    pitch: 'Thought-provoking performances about equality and justice.',
    published: true
  },
  {
    email: 'artist6@test.com',
    firstName: 'Yuki',
    lastName: 'Tanaka',
    stageName: 'Yuki Words',
    phone: '+31687654326',
    dob: '1996-09-25',
    gender: 'x',
    location: 'Rotterdam',
    genres: ['Experimental Poetry', 'Performance Poetry'],
    languages: ['nl', 'en', 'ja'],
    paymentMethods: ['bank'],
    bio: 'Experimental artist blending Japanese and Dutch poetry traditions',
    pitch: 'Unique multicultural performances exploring identity and belonging.',
    published: true
  },
  {
    email: 'artist7@test.com',
    firstName: 'David',
    lastName: 'Cohen',
    stageName: 'David Verse',
    phone: '+31687654327',
    dob: '1985-12-03',
    gender: 'm',
    location: 'Utrecht',
    genres: ['Lyrical Poetry', 'Slam Poetry'],
    languages: ['nl', 'en', 'he'],
    paymentMethods: ['bank', 'cash'],
    bio: 'Veteran spoken word artist with 10+ years experience',
    pitch: 'Experienced performer for any occasion. Workshop facilitator.',
    published: true
  },
  {
    email: 'artist8@test.com',
    firstName: 'Nina',
    lastName: 'Kowalski',
    stageName: 'Nina Rhythm',
    phone: '+31687654328',
    dob: '1993-04-18',
    gender: 'f',
    location: 'Den Haag',
    genres: ['Performance Poetry', 'Musical Poetry'],
    languages: ['nl', 'pl', 'en'],
    paymentMethods: ['bank'],
    bio: 'Poetry with live music and beatbox elements',
    pitch: 'Dynamic shows combining spoken word with music and rhythm.',
    published: true
  },
  {
    email: 'artist9@test.com',
    firstName: 'Lucas',
    lastName: 'Silva',
    stageName: 'Lucas Flow',
    phone: '+31687654329',
    dob: '1991-08-07',
    gender: 'm',
    location: 'Amsterdam',
    genres: ['Hip Hop Poetry', 'Rap'],
    languages: ['nl', 'pt', 'es'],
    paymentMethods: ['bank', 'paypal'],
    bio: 'Brazilian-Dutch artist blending cultures through rap poetry',
    pitch: 'Energetic multilingual performances celebrating diversity.',
    published: true
  },
  {
    email: 'artist10@test.com',
    firstName: 'Amira',
    lastName: 'Hassan',
    stageName: 'Amira Voice',
    phone: '+31687654330',
    dob: '1997-02-14',
    gender: 'f',
    location: 'Rotterdam',
    genres: ['Political Poetry', 'Slam Poetry'],
    languages: ['nl', 'ar', 'en'],
    paymentMethods: ['bank'],
    bio: 'Activist poet focusing on refugee stories and integration',
    pitch: 'Powerful narratives about migration, belonging and hope.',
    published: true
  }
];

// Helper functions
async function createAuthUser(email, password) {
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true // Skip email verification for test accounts
    });
    console.log(`✅ Auth user created: ${email}`);
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  User already exists: ${email}, fetching UID...`);
      const userRecord = await auth.getUserByEmail(email);
      return userRecord.uid;
    }
    throw error;
  }
}

async function createProgrammer(programmerData) {
  try {
    const uid = await createAuthUser(programmerData.email, TEST_PASSWORD);
    
    // Create user role document
    await db.collection('users').doc(uid).set({
      role: 'programmer',
      email: programmerData.email,
      status: programmerData.status
    });
    
    // Create programmer profile
    await db.collection('programmers').doc(uid).set({
      uid: uid,
      email: programmerData.email,
      firstName: programmerData.firstName,
      lastName: programmerData.lastName,
      phone: programmerData.phone,
      organizationName: programmerData.organizationName,
      organizationAbout: programmerData.organizationAbout,
      website: programmerData.website,
      notifyEmail: true,
      createdAt: new Date().toISOString(),
      status: programmerData.status,
      trialStartedAt: new Date().toISOString()
    });
    
    console.log(`✅ Programmer created: ${programmerData.email} (${programmerData.status})`);
    return uid;
  } catch (error) {
    console.error(`❌ Error creating programmer ${programmerData.email}:`, error.message);
    return null;
  }
}

async function createArtist(artistData) {
  try {
    const uid = await createAuthUser(artistData.email, TEST_PASSWORD);
    
    // Create user role document
    await db.collection('users').doc(uid).set({
      role: 'artist',
      email: artistData.email,
      status: 'active'
    });
    
    // Create artist profile
    await db.collection('artists').doc(uid).set({
      uid: uid,
      email: artistData.email,
      firstName: artistData.firstName,
      lastName: artistData.lastName,
      stageName: artistData.stageName,
      phone: artistData.phone,
      dob: artistData.dob,
      gender: artistData.gender,
      location: artistData.location,
      genres: artistData.genres,
      languages: artistData.languages,
      paymentMethods: artistData.paymentMethods,
      bio: artistData.bio,
      pitch: artistData.pitch,
      videoUrl: artistData.videoUrl || '',
      audioUrl: artistData.audioUrl || '',
      textContent: artistData.textContent || '',
      notifyEmail: true,
      notifySms: false,
      createdAt: new Date().toISOString(),
      profilePicUrl: '',
      published: artistData.published
    });
    
    console.log(`✅ Artist created: ${artistData.stageName} (${artistData.email})`);
    return uid;
  } catch (error) {
    console.error(`❌ Error creating artist ${artistData.email}:`, error.message);
    return null;
  }
}

async function createTestConversation(programmerUid, programmerData, artistUid, artistData, messageCount = 3) {
  try {
    const conversationData = {
      participants: [programmerUid, artistUid],
      participantNames: {
        [programmerUid]: `${programmerData.firstName} ${programmerData.lastName}`,
        [artistUid]: artistData.stageName || `${artistData.firstName} ${artistData.lastName}`
      },
      participantRoles: {
        [programmerUid]: 'programmer',
        [artistUid]: 'artist'
      },
      participantEmails: {
        [programmerUid]: programmerData.email,
        [artistUid]: artistData.email
      },
      subject: `Booking inquiry for ${artistData.stageName}`,
      lastMessage: '',
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      unreadBy: [artistUid], // Artist has not read yet
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const conversationRef = await db.collection('conversations').add(conversationData);
    console.log(`✅ Conversation created between ${programmerData.firstName} and ${artistData.stageName}`);
    
    // Add test messages
    const messages = [
      {
        senderId: programmerUid,
        senderName: `${programmerData.firstName} ${programmerData.lastName}`,
        senderRole: 'programmer',
        text: `Hi ${artistData.firstName}! I'm organizing an event and would love to have you perform. Are you available in December?`,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000 * 24 * 2)), // 2 days ago
        read: false
      },
      {
        senderId: artistUid,
        senderName: artistData.stageName,
        senderRole: 'artist',
        text: `Hi ${programmerData.firstName}! Thanks for reaching out. Yes, I have some availability in December. What dates were you thinking?`,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000 * 24 * 1)), // 1 day ago
        read: false
      },
      {
        senderId: programmerUid,
        senderName: `${programmerData.firstName} ${programmerData.lastName}`,
        senderRole: 'programmer',
        text: `Great! We're looking at December 15th. It's an evening event with about 200 attendees. Would that work for you?`,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000 * 12)), // 12 hours ago
        read: false
      }
    ];
    
    for (let i = 0; i < Math.min(messageCount, messages.length); i++) {
      await db.collection(`conversations/${conversationRef.id}/messages`).add(messages[i]);
    }
    
    // Update conversation with last message
    await conversationRef.update({
      lastMessage: messages[Math.min(messageCount, messages.length) - 1].text.substring(0, 100),
      lastMessageAt: messages[Math.min(messageCount, messages.length) - 1].createdAt
    });
    
    console.log(`✅ Added ${messageCount} messages to conversation`);
    
    return conversationRef.id;
  } catch (error) {
    console.error(`❌ Error creating conversation:`, error.message);
    return null;
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('\n🌱 Starting database seeding...\n');
  
  try {
    // Create programmers
    console.log('👨‍💻 Creating programmers...');
    const programmerUids = [];
    for (const programmer of TEST_PROGRAMMERS) {
      const uid = await createProgrammer(programmer);
      if (uid) {
        programmerUids.push({ uid, data: programmer });
      }
    }
    console.log(`\n✅ Created ${programmerUids.length} programmers\n`);
    
    // Create artists
    console.log('🎤 Creating artists...');
    const artistUids = [];
    for (const artist of TEST_ARTISTS) {
      const uid = await createArtist(artist);
      if (uid) {
        artistUids.push({ uid, data: artist });
      }
    }
    console.log(`\n✅ Created ${artistUids.length} artists\n`);
    
    // Create test conversations
    console.log('💬 Creating test conversations...');
    let conversationCount = 0;
    
    // Create conversations between first 2 PRO programmers and various artists
    const proOrTrialProgrammers = programmerUids.filter(p => p.data.status === 'pro' || p.data.status === 'trial');
    
    for (let i = 0; i < Math.min(2, proOrTrialProgrammers.length); i++) {
      for (let j = 0; j < Math.min(3, artistUids.length); j++) {
        await createTestConversation(
          proOrTrialProgrammers[i].uid,
          proOrTrialProgrammers[i].data,
          artistUids[j].uid,
          artistUids[j].data,
          3
        );
        conversationCount++;
      }
    }
    
    console.log(`\n✅ Created ${conversationCount} conversations with messages\n`);
    
    // Summary
    console.log('\n📊 SEEDING COMPLETE!\n');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ ${programmerUids.length} Programmers created`);
    console.log(`✅ ${artistUids.length} Artists created`);
    console.log(`✅ ${conversationCount} Conversations created`);
    console.log('═══════════════════════════════════════════\n');
    
    console.log('🔑 TEST LOGIN CREDENTIALS:\n');
    console.log('All users have password: ' + TEST_PASSWORD + '\n');
    
    console.log('👨‍💻 PROGRAMMERS:');
    programmerUids.forEach(p => {
      console.log(`  - ${p.data.email} (${p.data.status}) - ${p.data.organizationName}`);
    });
    
    console.log('\n🎤 ARTISTS:');
    artistUids.forEach(a => {
      console.log(`  - ${a.data.email} - ${a.data.stageName}`);
    });
    
    console.log('\n✨ Ready to test! Log in with any email above.\n');
    
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
  }
  
  process.exit(0);
}

// Run the seeding
seedDatabase();
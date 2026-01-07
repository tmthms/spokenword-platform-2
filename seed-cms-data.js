/**
 * seed-cms-data.js
 * Script to seed CMS data in Firestore using Firebase Admin SDK
 * Run with: node seed-cms-data.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey-staging.json', 'utf8')
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Dutch content
 */
const content_nl = {
  home: {
    hero: {
      title: 'Welkom bij Community',
      subtitle: 'Verbind artiesten met programmeurs',
      cta: 'Begin nu'
    }
  },
  auth: {
    login: {
      title: 'Inloggen',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      button: 'Inloggen',
      forgotPassword: 'Wachtwoord vergeten?',
      noAccount: 'Nog geen account?',
      signupLink: 'Registreren'
    },
    register: {
      title: 'Registreren',
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      confirmPassword: 'Bevestig wachtwoord',
      button: 'Registreren',
      hasAccount: 'Al een account?',
      loginLink: 'Inloggen'
    }
  },
  search: {
    title: 'Zoek Artiesten',
    placeholder: 'Zoek op naam, genre, locatie...',
    filters: 'Filters',
    noResults: 'Geen resultaten gevonden'
  },
  profile: {
    edit: 'Profiel bewerken',
    save: 'Opslaan',
    cancel: 'Annuleren',
    about: 'Over mij',
    contact: 'Contact',
    genres: 'Genres',
    location: 'Locatie'
  },
  messages: {
    title: 'Berichten',
    send: 'Versturen',
    placeholder: 'Type een bericht...',
    noConversations: 'Geen gesprekken',
    newMessage: 'Nieuw bericht'
  },
  common: {
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    success: 'Succesvol opgeslagen',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    close: 'Sluiten',
    save: 'Opslaan',
    cancel: 'Annuleren',
    search: 'Zoeken',
    filter: 'Filteren'
  }
};

/**
 * English content
 */
const content_en = {
  home: {
    hero: {
      title: 'Welcome to Community',
      subtitle: 'Connect artists with programmers',
      cta: 'Get started'
    }
  },
  auth: {
    login: {
      title: 'Login',
      email: 'Email address',
      password: 'Password',
      button: 'Login',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      signupLink: 'Sign up'
    },
    register: {
      title: 'Register',
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      button: 'Register',
      hasAccount: 'Already have an account?',
      loginLink: 'Login'
    }
  },
  search: {
    title: 'Search Artists',
    placeholder: 'Search by name, genre, location...',
    filters: 'Filters',
    noResults: 'No results found'
  },
  profile: {
    edit: 'Edit profile',
    save: 'Save',
    cancel: 'Cancel',
    about: 'About me',
    contact: 'Contact',
    genres: 'Genres',
    location: 'Location'
  },
  messages: {
    title: 'Messages',
    send: 'Send',
    placeholder: 'Type a message...',
    noConversations: 'No conversations',
    newMessage: 'New message'
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Successfully saved',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter'
  }
};

/**
 * Styles
 */
const styles = {
  gradient: {
    from: '#667eea',
    to: '#764ba2'
  },
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  }
};

/**
 * Email templates
 */
const email_templates = {
  welcome_artist: {
    subject: 'Welkom bij Community, {firstName}!',
    body: `Hallo {firstName},

Welkom bij Community! Je account is succesvol aangemaakt.

Je kunt nu:
- Je profiel aanvullen
- Gezocht worden door programmeurs
- Berichten ontvangen

Veel succes!

Het Community Team`
  },
  welcome_programmer: {
    subject: 'Welkom bij Community, {firstName}!',
    body: `Hallo {firstName},

Welkom bij Community! Je {organizationName} account is succesvol aangemaakt.

Je kunt nu:
- Artiesten zoeken
- Profielen bekijken
- Contact opnemen

Veel succes!

Het Community Team`
  },
  booking_request: {
    subject: 'Nieuwe boekingsaanvraag van {programmerName}',
    body: `Hallo {artistName},

{programmerName} van {organizationName} heeft interesse in een samenwerking.

Bericht:
{message}

Log in om te reageren.

Het Community Team`
  },
  booking_confirmed: {
    subject: 'Boeking bevestigd: {eventTitle}',
    body: `Hallo {artistName},

Je boeking voor {eventTitle} is bevestigd!

Datum: {eventDate}
Locatie: {eventLocation}
Programmeur: {programmerName}

Meer details vind je in je dashboard.

Het Community Team`
  },
  message_notification: {
    subject: 'Nieuw bericht van {senderName}',
    body: `Hallo {recipientName},

Je hebt een nieuw bericht ontvangen van {senderName}:

"{messagePreview}"

Log in om te reageren.

Het Community Team`
  },
  password_reset: {
    subject: 'Wachtwoord reset aanvraag',
    body: `Hallo {firstName},

Je hebt een wachtwoord reset aangevraagd.

Klik op de volgende link om je wachtwoord te resetten:
{resetLink}

Als je dit niet hebt aangevraagd, negeer dan deze email.

Het Community Team`
  }
};

/**
 * Seed the data
 */
async function seedCMSData() {
  try {
    console.log('🌱 Seeding CMS data...');

    // Create content_nl
    await db.collection('cms').doc('content_nl').set(content_nl);
    console.log('✓ Created cms/content_nl');

    // Create content_en
    await db.collection('cms').doc('content_en').set(content_en);
    console.log('✓ Created cms/content_en');

    // Create styles
    await db.collection('cms').doc('styles').set(styles);
    console.log('✓ Created cms/styles');

    // Create email_templates
    await db.collection('cms').doc('email_templates').set(email_templates);
    console.log('✓ Created cms/email_templates');

    console.log('✅ CMS data seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding CMS data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCMSData();

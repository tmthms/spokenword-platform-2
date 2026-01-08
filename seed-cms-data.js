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
      title: 'SPOKEN WORD PLATFORM',
      subtitle: 'Find Your Voice.',
      cta_artist: 'Registreer als Artiest',
      cta_programmer: 'Registreer als Programmeur',
      cta_login: 'Inloggen'
    }
  },
  auth: {
    login: {
      title: 'Welkom terug',
      subtitle: 'Log in op je account',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      button: 'Inloggen',
      forgot_password: 'Wachtwoord vergeten?',
      no_account: 'Nog geen account?',
      register_link: 'Registreer hier'
    },
    signup: {
      title: 'Account aanmaken',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      confirm_password: 'Bevestig wachtwoord',
      role_artist: 'Artiest',
      role_programmer: 'Programmeur',
      button: 'Registreren'
    }
  },
  nav: {
    home: 'Home',
    search: 'Zoeken',
    messages: 'Berichten',
    profile: 'Profiel',
    dashboard: 'Dashboard',
    settings: 'Instellingen',
    logout: 'Uitloggen'
  },
  dashboard: {
    welcome: 'Welkom bij je Dashboard',
    edit_profile: 'Profiel bewerken',
    search_artists: 'Zoek artiesten'
  },
  search: {
    title: 'Zoek Artiesten',
    placeholder: 'Zoek op naam...',
    location_placeholder: 'Locatie...',
    filters_title: 'Filters',
    apply_filters: 'Filters toepassen',
    reset_filters: 'Reset',
    no_results: 'Geen artiesten gevonden',
    loading: 'Artiesten laden...',
    genre: 'Genre',
    language: 'Taal',
    age: 'Leeftijd'
  },
  profile: {
    edit: 'Profiel bewerken',
    save: 'Wijzigingen opslaan',
    cancel: 'Annuleren',
    basics: 'Basisgegevens',
    media: 'Media',
    contact: 'Contact',
    success: 'Profiel opgeslagen!',
    error: 'Fout bij opslaan'
  },
  messages: {
    title: 'Berichten',
    send: 'Verstuur',
    placeholder: 'Typ je bericht...',
    no_messages: 'Nog geen berichten',
    no_conversations: 'Nog geen gesprekken'
  },
  settings: {
    title: 'Account Instellingen',
    language: 'Taal',
    change_email: 'Email wijzigen',
    change_password: 'Wachtwoord wijzigen',
    current_password: 'Huidig wachtwoord',
    new_password: 'Nieuw wachtwoord',
    update_email: 'Email bijwerken',
    update_password: 'Wachtwoord bijwerken'
  },
  common: {
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    success: 'Gelukt!',
    confirm: 'Bevestigen',
    cancel: 'Annuleren',
    save: 'Opslaan',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    close: 'Sluiten',
    back: 'Terug',
    required: '*',
    view: 'Bekijken',
    search: 'Zoeken'
  },
  createdAt: new Date().toISOString()
};

/**
 * English content
 */
const content_en = {
  home: {
    hero: {
      title: 'SPOKEN WORD PLATFORM',
      subtitle: 'Find Your Voice.',
      cta_artist: 'Register as Artist',
      cta_programmer: 'Register as Programmer',
      cta_login: 'Login'
    }
  },
  auth: {
    login: {
      title: 'Welcome back',
      email: 'Email address',
      password: 'Password',
      button: 'Login'
    },
    signup: {
      title: 'Create account',
      button: 'Register'
    }
  },
  nav: {
    home: 'Home',
    search: 'Search',
    messages: 'Messages',
    profile: 'Profile',
    dashboard: 'Dashboard',
    logout: 'Logout'
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close'
  },
  createdAt: new Date().toISOString()
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

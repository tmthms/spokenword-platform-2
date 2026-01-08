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
 * Dutch content - Comprehensive translations
 */
const content_nl = {
  home: {
    hero: {
      title: 'SPOKEN WORD PLATFORM',
      subtitle: 'Find Your Voice.',
      cta_artist: 'Registreer als Artiest',
      cta_programmer: 'Registreer als Programmeur',
      cta_login: 'Inloggen'
    },
    features: {
      title: 'Waarom Community?',
      item1_title: 'Uitgebreide Profielen',
      item1_desc: 'Bekijk video\'s, luister naar audio en lees reviews van artiesten.',
      item2_title: 'Direct Contact',
      item2_desc: 'Neem direct contact op met artiesten voor je evenement.',
      item3_title: 'Betrouwbaar',
      item3_desc: 'Geverifieerde artiesten en programmeurs.'
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
      register_link: 'Registreer hier',
      error_invalid: 'Ongeldige inloggegevens',
      error_generic: 'Er is een fout opgetreden'
    },
    signup: {
      title: 'Account aanmaken',
      subtitle: 'Registreer je gratis',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      confirm_password: 'Bevestig wachtwoord',
      role_label: 'Ik ben een',
      role_artist: 'Artiest',
      role_programmer: 'Programmeur',
      button: 'Registreren',
      has_account: 'Al een account?',
      login_link: 'Log hier in',
      terms_prefix: 'Door te registreren ga je akkoord met onze',
      terms_link: 'voorwaarden',
      error_mismatch: 'Wachtwoorden komen niet overeen',
      error_weak: 'Wachtwoord moet minimaal 6 karakters zijn',
      error_exists: 'Dit e-mailadres is al in gebruik'
    },
    artist_signup: {
      title: 'Artiest Registratie',
      subtitle: 'Maak je artiest profiel aan',
      stage_name: 'Artiestennaam',
      first_name: 'Voornaam',
      last_name: 'Achternaam',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      genres_label: 'Genres (selecteer meerdere)',
      languages_label: 'Talen (selecteer meerdere)',
      button: 'Registreren als Artiest'
    },
    programmer_signup: {
      title: 'Programmeur Registratie',
      subtitle: 'Maak je programmeur account aan',
      first_name: 'Voornaam',
      last_name: 'Achternaam',
      organization: 'Organisatie naam',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      button: 'Registreren als Programmeur'
    },
    reset_password: {
      title: 'Wachtwoord resetten',
      subtitle: 'Voer je e-mailadres in om een reset link te ontvangen',
      email: 'E-mailadres',
      button: 'Reset link versturen',
      success: 'Check je inbox voor de reset link',
      back_to_login: 'Terug naar inloggen'
    }
  },
  nav: {
    home: 'Home',
    search: 'Zoeken',
    messages: 'Berichten',
    profile: 'Profiel',
    dashboard: 'Dashboard',
    settings: 'Instellingen',
    logout: 'Uitloggen',
    login: 'Inloggen',
    signup: 'Registreren'
  },
  dashboard: {
    welcome: 'Welkom bij je Dashboard',
    programmer_title: 'Programmeur Dashboard',
    artist_title: 'Artiest Dashboard',
    profile_views: 'Profiel weergaven',
    messages_count: 'Berichten',
    bookings_count: 'Boekingen',
    recommendations_count: 'Aanbevelingen',
    edit_profile: 'Profiel bewerken',
    view_profile: 'Bekijk publiek profiel',
    search_artists: 'Zoek artiesten',
    manage_gigs: 'Beheer optredens',
    pending_approval: 'Je account wacht op goedkeuring',
    pending_message: 'We beoordelen je registratie. Je ontvangt een email zodra je account is geactiveerd.'
  },
  search: {
    title: 'Zoek Artiesten',
    placeholder: 'Zoek op naam...',
    location_placeholder: 'Locatie...',
    filters_title: 'Filters',
    apply_filters: 'Filters toepassen',
    reset_filters: 'Reset',
    no_results: 'Geen artiesten gevonden',
    no_results_hint: 'Pas je filters aan of zoek op een andere term',
    loading: 'Artiesten laden...',
    showing_results: '{count} artiesten gevonden',
    filters: {
      genre: 'Genre',
      location: 'Locatie',
      language: 'Taal',
      age: 'Leeftijd',
      age_min: 'Min',
      age_max: 'Max',
      gender: 'Geslacht',
      all_genders: 'Alle geslachten',
      female: 'Vrouw',
      male: 'Man',
      other: 'Anders',
      energy: 'Energy level',
      keywords: 'Keywords',
      format: 'Format',
      payment: 'Betaling'
    },
    energy_levels: {
      intiem: 'Intiem',
      interactief: 'Interactief',
      high_energy: 'High Energy'
    }
  },
  genres: {
    performance_poetry: 'Performance Poetry',
    slam_poetry: 'Slam Poetry',
    hip_hop_poetry: 'Hip Hop Poetry',
    jazz_poetry: 'Jazz Poetry',
    storytelling: 'Storytelling',
    comedy: 'Comedy',
    rap: 'Rap',
    experimental: 'Experimental',
    musical_poetry: 'Musical Poetry',
    lyrical: 'Lyrical',
    political_poetry: 'Political Poetry',
    one_on_one: '1-op-1 Sessies'
  },
  languages: {
    nl: 'Nederlands',
    en: 'Engels',
    fr: 'Frans',
    de: 'Duits',
    es: 'Spaans',
    other: 'Andere'
  },
  formats: {
    performance: 'Live Performance',
    workshop: 'Workshop',
    hosting: 'Hosting / Presentatie',
    gedichten_op_maat: 'Gedichten op Maat',
    open_mic: 'Open Mic'
  },
  payment: {
    invoice: 'Factuur',
    payrolling: 'Payrolling',
    sbk: 'SBK',
    volunteer_fee: 'Vrijwilligersvergoeding',
    other: 'Anders'
  },
  profile: {
    edit: 'Profiel bewerken',
    save: 'Wijzigingen opslaan',
    cancel: 'Annuleren',
    view_public: 'Bekijk publiek profiel',
    sections: {
      basics: 'Basisgegevens',
      media: 'Media',
      contact: 'Contact',
      services: 'Diensten',
      preferences: 'Voorkeuren'
    },
    fields: {
      stage_name: 'Artiestennaam',
      first_name: 'Voornaam',
      last_name: 'Achternaam',
      email: 'E-mailadres',
      phone: 'Telefoonnummer',
      location: 'Locatie',
      city: 'Stad',
      bio: 'Biografie',
      bio_placeholder: 'Vertel iets over jezelf...',
      about: 'Over',
      about_placeholder: 'Beschrijf je achtergrond en ervaring...',
      website: 'Website',
      instagram: 'Instagram',
      facebook: 'Facebook',
      youtube: 'YouTube',
      genres: 'Genres',
      languages: 'Talen',
      formats: 'Formats / Diensten',
      payment_methods: 'Betaalmethoden',
      price_range: 'Prijsklasse',
      price_from: 'Vanaf',
      price_to: 'Tot',
      birth_date: 'Geboortedatum',
      gender: 'Geslacht',
      organization: 'Organisatie',
      about_organization: 'Over je organisatie',
      language_preference: 'Taalvoorkeur'
    },
    picture: {
      title: 'Profielfoto',
      upload: 'Upload nieuwe foto',
      requirements: 'JPG, PNG of GIF. Max 5MB.',
      change: 'Foto wijzigen',
      remove: 'Foto verwijderen'
    },
    media: {
      photos_title: 'Foto\'s',
      videos_title: 'Video\'s',
      add_photo: 'Foto toevoegen',
      add_video: 'YouTube video toevoegen',
      video_placeholder: 'Plak YouTube URL...',
      max_photos: 'Maximum 10 foto\'s',
      max_videos: 'Maximum 5 video\'s'
    },
    document: {
      upload: 'Document uploaden (PDF, DOC, DOCX)',
      current: 'Huidig document:',
      view: 'Bekijken',
      remove: 'Verwijderen'
    },
    success: 'Profiel succesvol opgeslagen!',
    error: 'Fout bij opslaan profiel'
  },
  messages: {
    title: 'Berichten',
    new_message: 'Nieuw bericht',
    send: 'Verstuur',
    placeholder: 'Typ je bericht...',
    no_messages: 'Nog geen berichten',
    no_conversations: 'Nog geen gesprekken. Stuur een bericht naar een artiest om te beginnen!',
    select_conversation: 'Selecteer een gesprek',
    loading: 'Gesprekken laden...',
    send_first: 'Stuur het eerste bericht!',
    message_sent: 'Bericht verzonden',
    message_failed: 'Bericht verzenden mislukt',
    contact_artist: 'Neem contact op',
    subject: 'Onderwerp',
    subject_placeholder: 'Waar gaat je bericht over?'
  },
  recommendations: {
    title: 'Aanbevelingen',
    write: 'Schrijf een aanbeveling',
    placeholder: 'Deel je ervaring met deze artiest...',
    submit: 'Aanbeveling versturen',
    success: 'Bedankt voor je aanbeveling!',
    pending: 'Je aanbeveling wacht op goedkeuring',
    no_recommendations: 'Nog geen aanbevelingen',
    by: 'Door',
    verified: 'Geverifieerd'
  },
  bookings: {
    title: 'Boekingen',
    upcoming: 'Aankomende optredens',
    past: 'Afgelopen optredens',
    no_bookings: 'Nog geen boekingen',
    add_gig: 'Optreden toevoegen',
    event_name: 'Evenement naam',
    event_date: 'Datum',
    event_location: 'Locatie',
    event_description: 'Beschrijving',
    status: {
      pending: 'In afwachting',
      confirmed: 'Bevestigd',
      completed: 'Afgerond',
      cancelled: 'Geannuleerd'
    }
  },
  settings: {
    title: 'Account Instellingen',
    language: 'Taal',
    language_help: 'Kies je voorkeurstaal voor de interface',
    change_email: 'Email wijzigen',
    current_password: 'Huidig wachtwoord',
    new_email: 'Nieuw e-mailadres',
    update_email: 'Email bijwerken',
    change_password: 'Wachtwoord wijzigen',
    new_password: 'Nieuw wachtwoord',
    confirm_new_password: 'Bevestig nieuw wachtwoord',
    update_password: 'Wachtwoord bijwerken',
    email_updated: 'Email bijgewerkt! Check je inbox voor verificatie.',
    password_updated: 'Wachtwoord succesvol bijgewerkt!',
    error_mismatch: 'Wachtwoorden komen niet overeen',
    error_too_short: 'Nieuw wachtwoord moet minimaal 6 karakters zijn',
    error_invalid_email: 'Voer een geldig e-mailadres in',
    error_reauth: 'Je moet je huidige wachtwoord invoeren',
    delete_account: 'Account verwijderen',
    delete_warning: 'Dit kan niet ongedaan worden gemaakt'
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
    next: 'Volgende',
    previous: 'Vorige',
    yes: 'Ja',
    no: 'Nee',
    or: 'of',
    and: 'en',
    required: '*',
    optional: '(optioneel)',
    view: 'Bekijken',
    download: 'Downloaden',
    upload: 'Uploaden',
    search: 'Zoeken',
    filter: 'Filteren',
    sort: 'Sorteren',
    all: 'Alle',
    none: 'Geen',
    select: 'Selecteer',
    selected: 'geselecteerd',
    show_more: 'Toon meer',
    show_less: 'Toon minder',
    read_more: 'Lees meer',
    see_all: 'Bekijk alles',
    try_again: 'Probeer opnieuw',
    refresh: 'Vernieuwen'
  },
  errors: {
    generic: 'Er is iets misgegaan',
    network: 'Geen internetverbinding',
    not_found: 'Niet gevonden',
    unauthorized: 'Je hebt geen toegang tot deze pagina',
    forbidden: 'Toegang geweigerd',
    validation: 'Controleer je invoer',
    required_field: 'Dit veld is verplicht',
    invalid_email: 'Ongeldig e-mailadres',
    invalid_phone: 'Ongeldig telefoonnummer',
    invalid_url: 'Ongeldige URL',
    file_too_large: 'Bestand is te groot',
    invalid_file_type: 'Ongeldig bestandstype',
    upload_failed: 'Upload mislukt',
    save_failed: 'Opslaan mislukt',
    delete_failed: 'Verwijderen mislukt',
    login_failed: 'Inloggen mislukt',
    register_failed: 'Registratie mislukt'
  },
  footer: {
    copyright: '© 2024 Community. Alle rechten voorbehouden.',
    privacy: 'Privacy',
    terms: 'Voorwaarden',
    contact: 'Contact',
    about: 'Over ons',
    help: 'Help'
  },
  _meta: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
  }
};

/**
 * English content - Comprehensive translations
 */
const content_en = {
  home: {
    hero: {
      title: 'SPOKEN WORD PLATFORM',
      subtitle: 'Find Your Voice.',
      cta_artist: 'Register as Artist',
      cta_programmer: 'Register as Programmer',
      cta_login: 'Login'
    },
    features: {
      title: 'Why Community?',
      item1_title: 'Detailed Profiles',
      item1_desc: 'Watch videos, listen to audio, and read artist reviews.',
      item2_title: 'Direct Contact',
      item2_desc: 'Contact artists directly for your event.',
      item3_title: 'Reliable',
      item3_desc: 'Verified artists and programmers.'
    }
  },
  auth: {
    login: {
      title: 'Welcome back',
      subtitle: 'Log in to your account',
      email: 'Email address',
      password: 'Password',
      button: 'Login',
      forgot_password: 'Forgot password?',
      no_account: 'No account yet?',
      register_link: 'Register here',
      error_invalid: 'Invalid credentials',
      error_generic: 'An error occurred'
    },
    signup: {
      title: 'Create account',
      subtitle: 'Register for free',
      email: 'Email address',
      password: 'Password',
      confirm_password: 'Confirm password',
      role_label: 'I am a',
      role_artist: 'Artist',
      role_programmer: 'Programmer',
      button: 'Register',
      has_account: 'Already have an account?',
      login_link: 'Login here'
    }
  },
  nav: {
    home: 'Home',
    search: 'Search',
    messages: 'Messages',
    profile: 'Profile',
    dashboard: 'Dashboard',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up'
  },
  dashboard: {
    welcome: 'Welcome to your Dashboard',
    programmer_title: 'Programmer Dashboard',
    artist_title: 'Artist Dashboard',
    profile_views: 'Profile views',
    messages_count: 'Messages',
    bookings_count: 'Bookings',
    recommendations_count: 'Recommendations',
    edit_profile: 'Edit profile',
    view_profile: 'View public profile',
    search_artists: 'Search artists'
  },
  search: {
    title: 'Search Artists',
    placeholder: 'Search by name...',
    location_placeholder: 'Location...',
    filters_title: 'Filters',
    apply_filters: 'Apply filters',
    reset_filters: 'Reset',
    no_results: 'No artists found',
    no_results_hint: 'Adjust your filters or try a different search term',
    loading: 'Loading artists...',
    showing_results: '{count} artists found'
  },
  profile: {
    edit: 'Edit profile',
    save: 'Save changes',
    cancel: 'Cancel',
    view_public: 'View public profile',
    sections: {
      basics: 'Basic info',
      media: 'Media',
      contact: 'Contact',
      services: 'Services',
      preferences: 'Preferences'
    },
    success: 'Profile saved successfully!',
    error: 'Error saving profile'
  },
  messages: {
    title: 'Messages',
    new_message: 'New message',
    send: 'Send',
    placeholder: 'Type your message...',
    no_messages: 'No messages yet',
    no_conversations: 'No conversations yet. Send a message to an artist to get started!',
    select_conversation: 'Select a conversation',
    loading: 'Loading conversations...'
  },
  settings: {
    title: 'Account Settings',
    language: 'Language',
    language_help: 'Choose your preferred interface language',
    change_email: 'Change email',
    change_password: 'Change password',
    email_updated: 'Email updated! Check your inbox for verification.',
    password_updated: 'Password updated successfully!'
  },
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    required: '*',
    view: 'View',
    search: 'Search'
  },
  errors: {
    generic: 'Something went wrong',
    network: 'No internet connection',
    not_found: 'Not found',
    unauthorized: 'You do not have access to this page'
  },
  footer: {
    copyright: '© 2024 Community. All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact'
  },
  _meta: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
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

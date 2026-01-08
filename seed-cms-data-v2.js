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
 * Dutch content - Complete v2 based on screenshots
 */
const content_nl = {
  home: {
    hero: {
      title: 'SPOKEN WORD PLATFORM',
      subtitle: 'Vind je stem.',
      tagline: 'Book Your Artist.',
      cta_artist: 'Ik ben een Artiest',
      cta_programmer: 'Ik ben een Programmator',
      cta_login: 'Inloggen'
    },
    featured: {
      title: 'Featured Artists'
    }
  },

  nav: {
    search: 'Zoeken',
    agenda: 'Agenda',
    edit_profile: 'Profiel bewerken',
    messages: 'Berichten',
    gigs: 'Gigs',
    events: 'Evenementen',
    logout: 'Uitloggen',
    settings: 'Instellingen'
  },

  auth: {
    login: {
      title: 'Welkom terug',
      subtitle: 'Log in op je account',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      button: 'Inloggen',
      back_home: '← Terug naar home'
    },

    artist_signup: {
      back: '← Terug',
      title: 'Maak je Artiest Profiel',
      subtitle: 'Vul zoveel mogelijk in. Je kunt later meer toevoegen.',

      account_details: 'Account Details',
      email: 'Email',
      password: 'Wachtwoord (min. 6 tekens)',

      personal_details: 'Persoonlijke Gegevens',
      first_name: 'Voornaam',
      last_name: 'Achternaam',
      stage_name: 'Artiestennaam',
      phone: 'Telefoon',
      birth_date: 'Geboortedatum',
      birth_date_placeholder: 'dd-mm-jjjj',
      gender: 'Geslacht',
      gender_placeholder: 'Selecteer...',
      location: 'Locatie',
      location_placeholder: 'bijv. Amsterdam, Nederland',

      professional_details: 'Professionele Details',
      genres_label: 'Genres (selecteer meerdere)',
      languages_label: 'Talen (selecteer meerdere)',
      payment_methods_label: 'Betaalmethoden',
      bio: 'Bio',
      pitch: 'Pitch',
      pitch_placeholder: 'Korte samenvatting voor programmatoren',

      email_notifications: 'OK om email notificaties te ontvangen',
      sms_notifications: 'OK om SMS notificaties te ontvangen',
      terms_agree: 'Ik ga akkoord met de',
      terms_link: 'Algemene Voorwaarden',

      button: 'Account Aanmaken'
    },

    programmer_signup: {
      back: '← Terug',
      title: 'Maak je Programmator Account',
      subtitle: 'Start je 7-daagse gratis proefperiode.',

      account_details: 'Account Details',
      email: 'Email',
      password: 'Wachtwoord (min. 6 tekens)',

      organization_details: 'Organisatie Details',
      first_name: 'Voornaam',
      last_name: 'Achternaam',
      organization_name: 'Organisatie Naam',
      phone: 'Telefoon',
      website: 'Website',
      website_placeholder: 'https://...',
      about_organization: 'Over Organisatie',

      email_notifications: 'OK om email notificaties te ontvangen',
      terms_agree: 'Ik ga akkoord met de',
      terms_link: 'Algemene Voorwaarden',

      button: 'Start Gratis Proefperiode'
    }
  },

  search: {
    title: 'Zoeken',
    results_count: '{count} gevonden',

    keywords_label: 'Keywords',
    keywords_placeholder: 'bijv. slam, poetry, rap..',
    name_placeholder: 'Zoek op naam...',
    location_placeholder: 'Locatie...',

    filters: {
      genre: 'Genre',
      themes: 'Themes',
      vibe: 'Vibe',
      services: 'Diensten',
      languages: 'Talen'
    },

    select_artist: 'Selecteer een artiest'
  },

  genres: {
    performance_poetry: 'Performance Poetry',
    slam_poetry: 'Slam Poetry',
    hip_hop_poetry: 'Hip Hop Poetry',
    jazz_poetry: 'Jazz Poetry',
    storytelling: 'Storytelling',
    experimental: 'Experimental',
    musical_poetry: 'Musical Poetry',
    lyrical: 'Lyrical',
    political_poetry: 'Political Poetry',
    comedy: 'Comedy',
    rap: 'Rap',
    one_on_one: '1-op-1 Sessies'
  },

  themes: {
    identity: 'Identity',
    social_justice: 'Social Justice',
    mental_health: 'Mental Health',
    love_relationships: 'Love/Relationships',
    politics: 'Politics',
    climate_change: 'Climate Change',
    coming_of_age: 'Coming of Age'
  },

  vibe: {
    intiem: 'Intiem',
    interactief: 'Interactief',
    energiek: 'Energiek'
  },

  services: {
    podiumperformance: 'Podiumperformance',
    workshops: 'Workshops',
    hosting: 'Hosting / Presentatie',
    gedichten_op_maat: 'Gedichten op Maat'
  },

  languages: {
    nl: 'Nederlands',
    en: 'Engels',
    fr: 'Frans',
    de: 'Duits',
    es: 'Spaans'
  },

  payment: {
    factuur: 'Factuur',
    payrolling: 'Payrolling',
    sbk: 'SBK',
    sbk_long: 'Anders (SBK)',
    vrijwilligersvergoeding: 'Vrijwilligersvergoeding',
    anders: 'Anders'
  },

  agenda: {
    title: 'Agenda',
    subtitle: 'Ontdek waar artiesten binnenkort optreden',

    day: 'Dag',
    month: 'Maand',
    list: 'Lijst',
    map: 'Kaart',

    filters_title: 'Filters',
    type_event: 'TYPE EVENT',
    region: 'REGIO',
    all_regions: "Alle regio's",
    clear_filters: 'Filters wissen',

    event_types: {
      slam_finales: 'Slam Finales',
      slams_battles: 'Slams & Battles',
      showcases: 'Showcases',
      optredens: 'Optredens',
      open_mics: 'Open Mics',
      workshops: 'Workshops',
      features: 'Features'
    },

    attending: '✓ Ik ga ook ({count})'
  },

  events: {
    title: 'Evenementen',
    subtitle: 'Ontdek waar andere artiesten optreden'
  },

  programmer_profile: {
    verified_badge: 'Verified Programmer',
    edit_profile: 'Edit Profile',
    view_public: 'View Public Profile',

    contact_info: 'Contact Information',
    about_organization: 'About Organization',
    not_specified: 'Not specified',
    no_description: 'No description available'
  },

  programmer_edit: {
    title: 'Edit Profile',

    personal_details: 'Personal Details',
    change_photo: 'Change Photo',
    first_name: 'First Name',
    last_name: 'Last Name',
    phone_number: 'Phone Number',
    phone_placeholder: 'Enter phone number',

    organization_details: 'Organization Details',
    organization_name: 'Organization Name',
    website: 'Website',
    website_placeholder: 'https://example.com',
    about_organization: 'About Organization',
    about_placeholder: 'Describe your organization...',

    preferences: 'Preferences',
    language: 'Language',

    save: 'Save All Changes',
    cancel: 'Cancel'
  },

  public_preview: {
    back: '‹ Back to Profile',
    title: 'Public Profile Preview',
    subtitle: 'This is how artists see your profile when they view your organization information.',
    footer_note: 'Artists can view this information when you contact them or when they view your messages.'
  },

  artist_profile: {
    media_gallery: 'Media Gallery',
    manage_profile: 'Profiel Beheren',
    edit_profile: 'Bewerk Profiel',

    years_old: 'years old',
    genres: 'Genres',
    languages: 'Languages',
    biography: 'Biography',
    pitch: 'Pitch',
    recommendations: 'Recommendations',
    recommendations_error: 'Kon recommendations niet laden.'
  },

  artist_edit: {
    title: 'Edit Artist Profile',
    subtitle: 'Update your information below.',
    cancel: 'Cancel',

    tabs: {
      basics: 'Basics & Identity',
      media: 'Bio & Media',
      contact: 'Contact & Socials'
    },

    display_name: 'Display Name (Stage Name)',
    location: 'Location (City, Country)',
    genres: 'Genres',
    languages: 'Languages',
    themes_label: "Thema's (selecteer meerdere)",
    vibe_label: 'Vibe (selecteer meerdere)',
    services_label: 'Diensten / Format (selecteer meerdere)',
    pitch: 'Short Pitch',
    pitch_hint: '(max 150 chars)',

    lang_options: {
      nl: 'Dutch (NL)',
      en: 'English (EN)',
      fr: 'French (FR)',
      de: 'German (DE)',
      es: 'Spanish (ES)'
    },

    bio: 'Bio / Background Info',
    youtube_link: 'YouTube/Vimeo Link',
    spotify_link: 'Spotify/SoundCloud Link',
    text_material: 'Text Material',
    text_material_hint: '(up to 2000 words)',
    documents: 'Documents (PDF, DOC, DOCX)',
    add_document: '+ Add Document',
    max_file_size: 'Maximum 10MB per file',
    no_documents: 'No documents uploaded yet',
    gallery_photos: 'Gallery Photos',
    add_photo: '+ Add Photo',
    youtube_videos: 'YouTube Videos',
    add_video: 'Add Video',
    no_videos: 'No videos added yet',

    phone_number: 'Phone Number',
    website: 'Website',
    payment_methods: 'Payment Methods',
    notification_settings: 'Notification Settings',
    email_notifications: 'Receive email notifications',
    sms_notifications: 'Receive SMS notifications',

    photo_hint: 'JPG, PNG or GIF. Max 5MB.',
    view_public: 'View Public Profile',

    save: 'Save All Changes'
  },

  gigs: {
    attendance_notice: '{count} persoon komt naar je shows!',
    view_names: 'Bekijk namen',

    upcoming: 'Upcoming Gigs',
    gigs_planned: '{count} optredens gepland',
    add_gig: '+ Add Gig',

    types: {
      showcase: 'Showcase',
      feature: 'Feature',
      open_mic: 'Open Mic',
      workshop: 'Workshop'
    },

    make_poster: 'Maak Tour Poster',
    shows_count: '({count} shows)'
  },

  add_gig: {
    title: 'Nieuw Optreden',
    date: 'DATUM',
    date_placeholder: 'dd-mm-jjjj',
    city: 'STAD',
    city_placeholder: 'bijv. Gent, Amsterdam',
    venue: 'VENUE',
    venue_placeholder: 'bijv. De Centrale, Paradiso',
    type: 'TYPE',
    type_placeholder: 'Selecteer type...',
    link: 'LINK (OPTIONEEL)',
    link_placeholder: 'https://tickets.example.com',
    cancel: 'Annuleren',
    submit: 'Toevoegen'
  },

  tour_poster: {
    title: 'Tour Poster',
    choose_style: 'Kies een stijl:',
    on_tour: 'ON TOUR',
    download: 'Download PNG',
    close: 'Sluiten',
    format_note: 'Perfect formaat voor Instagram Stories (1080x1920px)'
  },

  messages: {
    title: 'Berichten',
    search_placeholder: 'Zoek in berichten...',
    select_conversation: 'Selecteer een gesprek',
    no_conversations: 'Nog geen gesprekken',
    send: 'Verstuur',
    type_placeholder: 'Typ je bericht...'
  },

  settings: {
    title: 'Account Settings',
    subtitle: 'Manage your email and password',

    change_email: 'Change Email',
    change_email_subtitle: 'Update your account email address',
    new_email: 'New Email Address',
    current_password_email: 'Current Password (for verification)',
    update_email: 'Update Email',

    change_password: 'Change Password',
    change_password_subtitle: 'Update your account password',
    current_password: 'Current Password',
    current_password_placeholder: 'Enter your current password',
    new_password: 'New Password',
    new_password_placeholder: 'Enter new password (min. 6 characters)',
    confirm_password: 'Confirm New Password',
    confirm_password_placeholder: 'Confirm new password',
    update_password: 'Update Password'
  },

  common: {
    required: '*',
    loading: 'Laden...',
    error: 'Er is een fout opgetreden',
    success: 'Gelukt!',
    save: 'Opslaan',
    cancel: 'Annuleren',
    close: 'Sluiten',
    back: 'Terug',
    edit: 'Bewerken',
    delete: 'Verwijderen',
    view: 'Bekijken',
    add: 'Toevoegen',
    remove: 'Verwijderen',
    select: 'Selecteer',
    search: 'Zoeken'
  },

  _meta: {
    version: '2.0.0',
    lastUpdated: new Date().toISOString()
  }
};

/**
 * English content - Complete v2 based on screenshots
 */
const content_en = {
  home: {
    hero: {
      title: 'SPOKEN WORD PLATFORM',
      subtitle: 'Find Your Voice.',
      tagline: 'Book Your Artist.',
      cta_artist: 'I am an Artist',
      cta_programmer: 'I am a Programmer',
      cta_login: 'Login'
    },
    featured: {
      title: 'Featured Artists'
    }
  },

  nav: {
    search: 'Search',
    agenda: 'Agenda',
    edit_profile: 'Edit Profile',
    messages: 'Messages',
    gigs: 'Gigs',
    events: 'Events',
    logout: 'Logout',
    settings: 'Settings'
  },

  auth: {
    login: {
      title: 'Welcome back',
      subtitle: 'Log in to your account',
      email: 'Email address',
      password: 'Password',
      button: 'Login',
      back_home: '← Back to home'
    },
    artist_signup: {
      back: '← Back',
      title: 'Create your Artist Profile',
      subtitle: 'Fill in as much as possible. You can add more later.',
      account_details: 'Account Details',
      email: 'Email',
      password: 'Password (min. 6 characters)',
      personal_details: 'Personal Details',
      first_name: 'First Name',
      last_name: 'Last Name',
      stage_name: 'Stage Name',
      phone: 'Phone',
      birth_date: 'Date of Birth',
      gender: 'Gender',
      gender_placeholder: 'Select...',
      location: 'Location',
      location_placeholder: 'e.g. Amsterdam, Netherlands',
      professional_details: 'Professional Details',
      genres_label: 'Genres (select multiple)',
      languages_label: 'Languages (select multiple)',
      payment_methods_label: 'Payment Methods',
      bio: 'Bio',
      pitch: 'Pitch',
      pitch_placeholder: 'Short summary for programmers',
      email_notifications: 'OK to receive email notifications',
      sms_notifications: 'OK to receive SMS notifications',
      terms_agree: 'I agree to the',
      terms_link: 'Terms and Conditions',
      button: 'Create Account'
    },
    programmer_signup: {
      back: '← Back',
      title: 'Create your Programmer Account',
      subtitle: 'Start your 7-day free trial.',
      account_details: 'Account Details',
      email: 'Email',
      password: 'Password (min. 6 characters)',
      organization_details: 'Organization Details',
      first_name: 'First Name',
      last_name: 'Last Name',
      organization_name: 'Organization Name',
      phone: 'Phone',
      website: 'Website',
      about_organization: 'About Organization',
      email_notifications: 'OK to receive email notifications',
      terms_agree: 'I agree to the',
      terms_link: 'Terms and Conditions',
      button: 'Start Free Trial'
    }
  },

  search: {
    title: 'Search',
    results_count: '{count} found',
    keywords_label: 'Keywords',
    keywords_placeholder: 'e.g. slam, poetry, rap..',
    name_placeholder: 'Search by name...',
    location_placeholder: 'Location...',
    filters: {
      genre: 'Genre',
      themes: 'Themes',
      vibe: 'Vibe',
      services: 'Services',
      languages: 'Languages'
    },
    select_artist: 'Select an artist'
  },

  genres: {
    performance_poetry: 'Performance Poetry',
    slam_poetry: 'Slam Poetry',
    hip_hop_poetry: 'Hip Hop Poetry',
    jazz_poetry: 'Jazz Poetry',
    storytelling: 'Storytelling',
    experimental: 'Experimental',
    musical_poetry: 'Musical Poetry',
    lyrical: 'Lyrical',
    political_poetry: 'Political Poetry',
    comedy: 'Comedy',
    rap: 'Rap',
    one_on_one: '1-on-1 Sessions'
  },

  themes: {
    identity: 'Identity',
    social_justice: 'Social Justice',
    mental_health: 'Mental Health',
    love_relationships: 'Love/Relationships',
    politics: 'Politics',
    climate_change: 'Climate Change',
    coming_of_age: 'Coming of Age'
  },

  vibe: {
    intiem: 'Intimate',
    interactief: 'Interactive',
    energiek: 'Energetic'
  },

  services: {
    podiumperformance: 'Stage Performance',
    workshops: 'Workshops',
    hosting: 'Hosting / Presentation',
    gedichten_op_maat: 'Custom Poetry'
  },

  languages: {
    nl: 'Dutch',
    en: 'English',
    fr: 'French',
    de: 'German',
    es: 'Spanish'
  },

  payment: {
    factuur: 'Invoice',
    payrolling: 'Payrolling',
    sbk: 'SBK',
    vrijwilligersvergoeding: 'Volunteer Fee',
    anders: 'Other'
  },

  agenda: {
    title: 'Agenda',
    subtitle: 'Discover where artists are performing soon',
    day: 'Day',
    month: 'Month',
    list: 'List',
    map: 'Map',
    filters_title: 'Filters',
    type_event: 'EVENT TYPE',
    region: 'REGION',
    all_regions: 'All regions',
    clear_filters: 'Clear filters',
    event_types: {
      slam_finales: 'Slam Finals',
      slams_battles: 'Slams & Battles',
      showcases: 'Showcases',
      optredens: 'Performances',
      open_mics: 'Open Mics',
      workshops: 'Workshops',
      features: 'Features'
    },
    attending: "✓ I'm going ({count})"
  },

  messages: {
    title: 'Messages',
    search_placeholder: 'Search messages...',
    select_conversation: 'Select a conversation',
    no_conversations: 'No conversations yet',
    send: 'Send',
    type_placeholder: 'Type your message...'
  },

  settings: {
    title: 'Account Settings',
    subtitle: 'Manage your email and password',
    change_email: 'Change Email',
    change_email_subtitle: 'Update your account email address',
    new_email: 'New Email Address',
    current_password_email: 'Current Password (for verification)',
    update_email: 'Update Email',
    change_password: 'Change Password',
    change_password_subtitle: 'Update your account password',
    current_password: 'Current Password',
    new_password: 'New Password',
    confirm_password: 'Confirm New Password',
    update_password: 'Update Password'
  },

  common: {
    required: '*',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    add: 'Add',
    search: 'Search'
  },

  _meta: {
    version: '2.0.0',
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
    console.log('🌱 Seeding CMS data (v2.0.0)...');

    // Create content_nl - Force overwrite
    await db.collection('cms').doc('content_nl').set(content_nl);
    console.log('✓ Created/Updated cms/content_nl');

    // Create content_en - Force overwrite
    await db.collection('cms').doc('content_en').set(content_en);
    console.log('✓ Created/Updated cms/content_en');

    // Create styles - Force overwrite
    await db.collection('cms').doc('styles').set(styles);
    console.log('✓ Created/Updated cms/styles');

    // Create email_templates - Force overwrite
    await db.collection('cms').doc('email_templates').set(email_templates);
    console.log('✓ Created/Updated cms/email_templates');

    console.log('✅ CMS data seeded successfully! (v2.0.0)');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding CMS data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCMSData();

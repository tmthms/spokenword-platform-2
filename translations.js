/**
 * translations.js
 * Multi-language support for the SpokenWord platform
 */

import { getStore, setStore } from './store.js';

export const translations = {
  nl: {
    // Navigation
    nav_home: 'Home',
    nav_search: 'Zoeken',
    nav_messages: 'Berichten',
    nav_settings: 'Instellingen',
    nav_logout: 'Uitloggen',
    nav_login: 'Inloggen',
    nav_signup: 'Aanmelden',
    nav_dashboard: 'Dashboard',

    // Dashboard
    dashboard_welcome: 'Welkom op je Dashboard',
    programmer_dashboard: 'Programmeur Dashboard',
    search_for_artists: 'Zoek naar Artiesten',
    loading_artists: 'Artiesten laden...',
    no_artists_found: 'Geen artiesten gevonden. Klik op \'Zoeken\' om alle artiesten te laden of verfijn je filters.',

    // Filters
    filter_name: 'Naam...',
    filter_location: 'Locatie...',
    filter_all_genders: 'Alle Geslachten',
    filter_female: 'Vrouw',
    filter_male: 'Man',
    filter_other: 'Anders',
    filter_age_range: 'Leeftijdsbereik:',
    filter_age_min: 'Min',
    filter_age_max: 'Max',
    filter_genres: 'Genres:',
    filter_languages: 'Talen:',
    filter_payment_methods: 'Betaalmethoden:',
    search_artists_btn: 'Zoek Artiesten',

    // Genres
    genre_performance_poetry: 'Performance Poetry',
    genre_poetry_slam: 'Poetry Slam',
    genre_jazz_poetry: 'Jazz Poetry',
    genre_rap: 'Rap',
    genre_storytelling: 'Storytelling',
    genre_comedy: 'Comedy',
    genre_one_on_one: '1-op-1 Sessies',

    // Languages
    lang_dutch: 'Nederlands (NL)',
    lang_english: 'Engels (EN)',
    lang_french: 'Frans (FR)',

    // Payment Methods
    payment_invoice: 'Factuur',
    payment_payrolling: 'Payrolling',
    payment_sbk: 'Anders (SBK)',
    payment_volunteer_fee: 'Vrijwilligersvergoeding',
    payment_other: 'Anders',

    // Profile/Settings
    settings_title: 'Bewerk je Profiel',
    settings_subtitle: 'Update je profielinformatie en profielfoto hieronder. Vergeet niet je wijzigingen op te slaan.',
    profile_picture: 'Profielfoto',
    upload_new_photo: 'Upload Nieuwe Foto',
    photo_requirements: 'JPG, PNG of GIF. Max 5MB.',
    first_name: 'Voornaam',
    last_name: 'Achternaam',
    phone: 'Telefoon',
    organization_name: 'Organisatienaam',
    about_organization: 'Over je Organisatie',
    about_organization_placeholder: 'Vertel artiesten over je organisatie en welke evenementen je organiseert...',
    website: 'Website',
    language_preference: 'Taalvoorkeur',
    language_preference_help: 'Kies je voorkeurstaal voor de website-interface',
    save_profile_changes: 'Profiel Wijzigingen Opslaan',

    // Messages
    messages_title: 'Berichten',
    loading_conversations: 'Gesprekken laden...',
    no_conversations: 'Nog geen gesprekken. Stuur een bericht naar een artiest om een gesprek te starten!',
    select_conversation: 'Selecteer een gesprek om te beginnen met berichten',
    send: 'Verzenden',
    send_message: 'Verstuur Bericht',
    type_message: 'Typ je bericht...',
    no_messages_yet: 'Nog geen berichten.',
    message_subject: 'Onderwerp',
    message_text: 'Bericht',

    // Artist Cards
    view_profile: 'Bekijk Profiel',
    location_not_specified: 'Locatie niet opgegeven',
    age_not_specified: 'Leeftijd niet opgegeven',
    years_old: 'jaar oud',
    no_genres: 'Geen genres',

    // Status Messages
    pending_approval: 'Je account wacht op goedkeuring van de beheerder. Je ontvangt een e-mail zodra het is gepubliceerd.',
    trial_account: 'Je hebt momenteel een <strong>7-daagse Gratis Proefperiode</strong>.',
    pro_account: 'Je hebt een <strong>PRO Account</strong>. Geniet van volledige toegang tot de database.',
    upgrade_to_pro: 'Upgrade naar PRO (Binnenkort beschikbaar)',

    // Errors
    error_loading: 'Fout bij laden. Probeer het later opnieuw.',
    auth_required: 'Je moet ingelogd zijn als een programmeur om deze pagina te bekijken.',

    // Recommendations
    recommendations: 'Aanbevelingen',
    write_recommendation: 'Schrijf Aanbeveling',
    write_recommendation_for: 'Schrijf Aanbeveling voor',
    your_recommendation: 'Jouw Aanbeveling',
    recommendation_placeholder: 'Deel je positieve ervaring met deze artiest...',
    recommendation_help: 'Minimaal 10 karakters. Wees specifiek en positief!',
    submit_recommendation: 'Verstuur Aanbeveling',
    submitting: 'Versturen...',
    recommendation_success: '✓ Aanbeveling succesvol verstuurd!',
    no_recommendations_yet: 'Nog geen aanbevelingen. Wees de eerste om deze artiest aan te bevelen!',
    confirm_delete_recommendation: 'Weet je zeker dat je deze aanbeveling wilt verwijderen?',
    error_only_programmers_recommend: 'Alleen programmeurs kunnen aanbevelingen schrijven.',
    error_recommendation_required: 'Vul alsjeblieft een aanbeveling in.',
    error_recommendation_too_short: 'Aanbeveling moet minimaal 10 karakters bevatten.',
    error_must_be_logged_in: 'Je moet ingelogd zijn om deze actie uit te voeren.',
    cancel: 'Annuleren',

    // User Settings
    user_settings_title: 'Account Instellingen',
    settings_language: 'Taal',
    settings_language_help: 'Kies je voorkeurstaal voor de interface',
    settings_change_email: 'Email Adres Wijzigen',
    settings_change_password: 'Wachtwoord Wijzigen',
    settings_current_password: 'Huidig Wachtwoord',
    settings_new_email: 'Nieuw Email Adres',
    settings_new_password: 'Nieuw Wachtwoord',
    settings_confirm_password: 'Bevestig Nieuw Wachtwoord',
    settings_update_email: 'Email Bijwerken',
    settings_update_password: 'Wachtwoord Bijwerken',
    settings_email_updated: 'Email adres succesvol bijgewerkt! Check je nieuwe inbox voor een verificatie email.',
    settings_password_updated: 'Wachtwoord succesvol bijgewerkt!',
    settings_password_mismatch: 'Wachtwoorden komen niet overeen',
    settings_password_too_short: 'Nieuw wachtwoord moet minimaal 6 karakters bevatten',
    settings_invalid_email: 'Voer een geldig email adres in',
    settings_reauth_required: 'Voor deze wijziging moet je je huidige wachtwoord invoeren',

    // Common
    required: '*',
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succes',
    login_title: 'Inloggen',
    profile: 'Profiel',
    edit_profile: 'Bewerk Profiel',
    upload_document: 'Upload Document (PDF, DOC, DOCX)',
    current_document: 'Huidig document:',
    view: 'Bekijken',
    welcome_dashboard: 'Welkom op je Dashboard',
    edit_your_profile: 'Bewerk je Profiel',
    update_info_below: 'Update je informatie hieronder. Velden gemarkeerd met * zijn verplicht.'
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_search: 'Search',
    nav_messages: 'Messages',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_signup: 'Sign Up',
    nav_dashboard: 'Dashboard',

    // Dashboard
    dashboard_welcome: 'Welcome to your Dashboard',
    programmer_dashboard: 'Programmer Dashboard',
    search_for_artists: 'Search for Artists',
    loading_artists: 'Loading artists...',
    no_artists_found: 'No artists found. Click \'Search\' to load all artists or refine your filters.',

    // Filters
    filter_name: 'Name...',
    filter_location: 'Location...',
    filter_all_genders: 'All Genders',
    filter_female: 'Female',
    filter_male: 'Male',
    filter_other: 'Other',
    filter_age_range: 'Age Range:',
    filter_age_min: 'Min',
    filter_age_max: 'Max',
    filter_genres: 'Genres:',
    filter_languages: 'Languages:',
    filter_payment_methods: 'Payment Methods:',
    search_artists_btn: 'Search Artists',

    // Genres
    genre_performance_poetry: 'Performance Poetry',
    genre_poetry_slam: 'Poetry Slam',
    genre_jazz_poetry: 'Jazz Poetry',
    genre_rap: 'Rap',
    genre_storytelling: 'Storytelling',
    genre_comedy: 'Comedy',
    genre_one_on_one: '1-on-1 Sessions',

    // Languages
    lang_dutch: 'Dutch (NL)',
    lang_english: 'English (EN)',
    lang_french: 'French (FR)',

    // Payment Methods
    payment_invoice: 'Invoice',
    payment_payrolling: 'Payrolling',
    payment_sbk: 'Other (SBK)',
    payment_volunteer_fee: 'Volunteer Fee',
    payment_other: 'Other',

    // Profile/Settings
    settings_title: 'Edit Your Profile',
    settings_subtitle: 'Update your profile information and profile picture below. Remember to save your changes.',
    profile_picture: 'Profile Picture',
    upload_new_photo: 'Upload New Photo',
    photo_requirements: 'JPG, PNG or GIF. Max 5MB.',
    first_name: 'First Name',
    last_name: 'Last Name',
    phone: 'Phone',
    organization_name: 'Organization Name',
    about_organization: 'About Your Organization',
    about_organization_placeholder: 'Tell artists about your organization and what events you organize...',
    website: 'Website',
    language_preference: 'Language Preference',
    language_preference_help: 'Choose your preferred language for the website interface',
    save_profile_changes: 'Save Profile Changes',

    // Messages
    messages_title: 'Messages',
    loading_conversations: 'Loading conversations...',
    no_conversations: 'No conversations yet. Send a message to an artist to start a conversation!',
    select_conversation: 'Select a conversation to start messaging',
    send: 'Send',
    send_message: 'Send Message',
    type_message: 'Type your message...',
    no_messages_yet: 'No messages yet.',
    message_subject: 'Subject',
    message_text: 'Message',

    // Artist Cards
    view_profile: 'View Profile',
    location_not_specified: 'Location not specified',
    age_not_specified: 'Age not specified',
    years_old: 'years old',
    no_genres: 'No genres',

    // Status Messages
    pending_approval: 'Your account is <strong>pending admin approval</strong>. You will be notified by email once it\'s published.',
    trial_account: 'You are currently on your <strong>7-Day Free Trial</strong>.',
    pro_account: 'You have a <strong>PRO Account</strong>. Enjoy full access to the database.',
    upgrade_to_pro: 'Upgrade to PRO (Coming Soon)',

    // Errors
    error_loading: 'Error loading. Please try again later.',
    auth_required: 'You must be logged in as a programmer to access this page.',

    // Recommendations
    recommendations: 'Recommendations',
    write_recommendation: 'Write Recommendation',
    write_recommendation_for: 'Write Recommendation for',
    your_recommendation: 'Your Recommendation',
    recommendation_placeholder: 'Share your positive experience working with this artist...',
    recommendation_help: 'Minimum 10 characters. Be specific and positive!',
    submit_recommendation: 'Submit Recommendation',
    submitting: 'Submitting...',
    recommendation_success: '✓ Recommendation submitted successfully!',
    no_recommendations_yet: 'No recommendations yet. Be the first to recommend this artist!',
    confirm_delete_recommendation: 'Are you sure you want to delete this recommendation?',
    error_only_programmers_recommend: 'Only programmers can write recommendations.',
    error_recommendation_required: 'Please provide a recommendation.',
    error_recommendation_too_short: 'Recommendation must be at least 10 characters long.',
    error_must_be_logged_in: 'You must be logged in to perform this action.',
    cancel: 'Cancel',

    // User Settings
    user_settings_title: 'Account Settings',
    settings_language: 'Language',
    settings_language_help: 'Choose your preferred language for the interface',
    settings_change_email: 'Change Email Address',
    settings_change_password: 'Change Password',
    settings_current_password: 'Current Password',
    settings_new_email: 'New Email Address',
    settings_new_password: 'New Password',
    settings_confirm_password: 'Confirm New Password',
    settings_update_email: 'Update Email',
    settings_update_password: 'Update Password',
    settings_email_updated: 'Email address successfully updated! Check your new inbox for a verification email.',
    settings_password_updated: 'Password successfully updated!',
    settings_password_mismatch: 'Passwords do not match',
    settings_password_too_short: 'New password must be at least 6 characters',
    settings_invalid_email: 'Please enter a valid email address',
    settings_reauth_required: 'You must enter your current password to make this change',

    // Common
    required: '*',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    login_title: 'Login',
    profile: 'Profile',
    edit_profile: 'Edit Profile',
    upload_document: 'Upload Document (PDF, DOC, DOCX)',
    current_document: 'Current document:',
    view: 'View',
    welcome_dashboard: 'Welcome to your Dashboard',
    edit_your_profile: 'Edit Your Profile',
    update_info_below: 'Update your information below. Fields marked with * are required.'
  }
};

/**
 * Get current language preference
 */
export function getCurrentLanguage() {
  return getStore('language') || 'nl'; // Default to Dutch
}

/**
 * Set language preference
 */
export function setLanguage(lang) {
  if (!translations[lang]) {
    console.warn(`Language '${lang}' not supported, falling back to 'nl'`);
    lang = 'nl';
  }
  setStore('language', lang);
  applyTranslations();
}

/**
 * Get translated string
 */
export function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang][key] || translations['nl'][key] || key;
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
export function applyTranslations() {
  const lang = getCurrentLanguage();
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      if (element.hasAttribute('placeholder')) {
        element.setAttribute('placeholder', translation);
      } else {
        element.value = translation;
      }
    } else {
      element.innerHTML = translation;
    }
  });

  console.log(`Translations applied for language: ${lang}`);
}

/**
 * Initialize translations on page load
 */
export function initTranslations() {
  // Set default language if not set
  if (!getStore('language')) {
    setStore('language', 'nl'); // Default to Dutch
  }

  // Apply translations
  applyTranslations();
}

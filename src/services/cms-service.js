/**
 * cms-service.js
 * CMS Service for managing content, styles, and email templates
 */

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';

// Global CMS state
let currentContent = {};
let currentStyles = {};
let currentLanguage = 'nl';

/**
 * Default content structure (fallback)
 */
const DEFAULT_CONTENT = {
  nl: {
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
      cancel: 'Annuleren'
    },
    messages: {
      title: 'Berichten',
      send: 'Versturen',
      placeholder: 'Type een bericht...',
      noConversations: 'Geen gesprekken'
    },
    common: {
      loading: 'Laden...',
      error: 'Er is een fout opgetreden',
      success: 'Succesvol opgeslagen',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      close: 'Sluiten'
    }
  },
  en: {
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
      cancel: 'Cancel'
    },
    messages: {
      title: 'Messages',
      send: 'Send',
      placeholder: 'Type a message...',
      noConversations: 'No conversations'
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Successfully saved',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close'
    }
  }
};

/**
 * Default styles (fallback)
 */
const DEFAULT_STYLES = {
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
 * Default email templates (fallback)
 */
const DEFAULT_EMAIL_TEMPLATES = {
  welcome_artist: {
    subject: 'Welkom bij Community, {firstName}!',
    body: 'Hallo {firstName},\n\nWelkom bij Community! Je account is succesvol aangemaakt.\n\nJe kunt nu:\n- Je profiel aanvullen\n- Gezocht worden door programmeurs\n- Berichten ontvangen\n\nVeel succes!\n\nHet Community Team'
  },
  welcome_programmer: {
    subject: 'Welkom bij Community, {firstName}!',
    body: 'Hallo {firstName},\n\nWelkom bij Community! Je {organizationName} account is succesvol aangemaakt.\n\nJe kunt nu:\n- Artiesten zoeken\n- Profielen bekijken\n- Contact opnemen\n\nVeel succes!\n\nHet Community Team'
  },
  booking_request: {
    subject: 'Nieuwe boekingsaanvraag van {programmerName}',
    body: 'Hallo {artistName},\n\n{programmerName} van {organizationName} heeft interesse in een samenwerking.\n\nBericht:\n{message}\n\nLog in om te reageren.\n\nHet Community Team'
  },
  booking_confirmed: {
    subject: 'Boeking bevestigd: {eventTitle}',
    body: 'Hallo {artistName},\n\nJe boeking voor {eventTitle} is bevestigd!\n\nDatum: {eventDate}\nLocatie: {eventLocation}\nProgrammeur: {programmerName}\n\nMeer details vind je in je dashboard.\n\nHet Community Team'
  },
  message_notification: {
    subject: 'Nieuw bericht van {senderName}',
    body: 'Hallo {recipientName},\n\nJe hebt een nieuw bericht ontvangen van {senderName}:\n\n"{messagePreview}"\n\nLog in om te reageren.\n\nHet Community Team'
  },
  password_reset: {
    subject: 'Wachtwoord reset aanvraag',
    body: 'Hallo {firstName},\n\nJe hebt een wachtwoord reset aangevraagd.\n\nKlik op de volgende link om je wachtwoord te resetten:\n{resetLink}\n\nAls je dit niet hebt aangevraagd, negeer dan deze email.\n\nHet Community Team'
  }
};

/**
 * Load CMS content from Firestore
 * @param {string} language - Language code (nl, en)
 * @returns {Promise<object>}
 */
export async function loadCMSContent(language = 'nl') {
  try {
    const docRef = doc(db, 'cms', `content_${language}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn(`[CMS] No content found for ${language}, using defaults`);
      return DEFAULT_CONTENT[language] || DEFAULT_CONTENT.nl;
    }
  } catch (error) {
    console.error('[CMS] Error loading content:', error);
    return DEFAULT_CONTENT[language] || DEFAULT_CONTENT.nl;
  }
}

/**
 * Update CMS content in Firestore
 * @param {string} language - Language code
 * @param {object} content - Content object
 * @returns {Promise<void>}
 */
export async function updateCMSContent(language, content) {
  try {
    const docRef = doc(db, 'cms', `content_${language}`);
    await setDoc(docRef, content, { merge: true });

    // Update local cache
    if (language === currentLanguage) {
      currentContent = content;
    }

    console.log('[CMS] Content updated successfully');
  } catch (error) {
    console.error('[CMS] Error updating content:', error);
    throw error;
  }
}

/**
 * Load CMS styles from Firestore
 * @returns {Promise<object>}
 */
export async function loadCMSStyles() {
  try {
    const docRef = doc(db, 'cms', 'styles');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn('[CMS] No styles found, using defaults');
      return DEFAULT_STYLES;
    }
  } catch (error) {
    console.error('[CMS] Error loading styles:', error);
    return DEFAULT_STYLES;
  }
}

/**
 * Update CMS styles in Firestore
 * @param {object} styles - Styles object
 * @returns {Promise<void>}
 */
export async function updateCMSStyles(styles) {
  try {
    const docRef = doc(db, 'cms', 'styles');
    await setDoc(docRef, styles, { merge: true });

    // Update local cache and apply
    currentStyles = styles;
    applyGlobalStyles(styles);

    console.log('[CMS] Styles updated successfully');
  } catch (error) {
    console.error('[CMS] Error updating styles:', error);
    throw error;
  }
}

/**
 * Apply global styles to document
 * @param {object} styles - Styles object
 */
export function applyGlobalStyles(styles) {
  if (!styles) return;

  const root = document.documentElement;

  // Apply gradient
  if (styles.gradient) {
    root.style.setProperty('--gradient-from', styles.gradient.from);
    root.style.setProperty('--gradient-to', styles.gradient.to);
  }

  // Apply theme colors
  if (styles.colors) {
    root.style.setProperty('--color-primary', styles.colors.primary);
    root.style.setProperty('--color-secondary', styles.colors.secondary);
    root.style.setProperty('--color-accent', styles.colors.accent);
    root.style.setProperty('--color-success', styles.colors.success);
    root.style.setProperty('--color-error', styles.colors.error);
    root.style.setProperty('--color-warning', styles.colors.warning);
  }
}

/**
 * Load email templates from Firestore
 * @returns {Promise<object>}
 */
export async function loadEmailTemplates() {
  try {
    const docRef = doc(db, 'cms', 'email_templates');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn('[CMS] No email templates found, using defaults');
      return DEFAULT_EMAIL_TEMPLATES;
    }
  } catch (error) {
    console.error('[CMS] Error loading email templates:', error);
    return DEFAULT_EMAIL_TEMPLATES;
  }
}

/**
 * Update email template in Firestore
 * @param {string} templateId - Template ID
 * @param {object} template - Template object with subject and body
 * @returns {Promise<void>}
 */
export async function updateEmailTemplate(templateId, template) {
  try {
    const docRef = doc(db, 'cms', 'email_templates');
    await updateDoc(docRef, {
      [templateId]: template
    });

    console.log('[CMS] Email template updated successfully');
  } catch (error) {
    console.error('[CMS] Error updating email template:', error);
    throw error;
  }
}

/**
 * Get CMS text by nested key path
 * @param {string} keyPath - Dot-separated key path (e.g., 'home.hero.title')
 * @param {string} fallback - Fallback text if not found
 * @returns {string}
 */
export function getCMSText(keyPath, fallback = '') {
  if (!keyPath) return fallback;

  const keys = keyPath.split('.');
  let value = currentContent;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback || keyPath;
    }
  }

  return typeof value === 'string' ? value : fallback || keyPath;
}

/**
 * Initialize CMS system
 * @param {string} language - Initial language
 * @returns {Promise<void>}
 */
export async function initCMS(language = 'nl') {
  try {
    currentLanguage = language;

    // Load content, styles, and email templates in parallel
    const [content, styles] = await Promise.all([
      loadCMSContent(language),
      loadCMSStyles()
    ]);

    currentContent = content;
    currentStyles = styles;

    // Apply styles to document
    applyGlobalStyles(styles);

    console.log('[CMS] Initialized successfully', { language });
  } catch (error) {
    console.error('[CMS] Error initializing CMS:', error);

    // Use defaults on error
    currentContent = DEFAULT_CONTENT[language] || DEFAULT_CONTENT.nl;
    currentStyles = DEFAULT_STYLES;
    applyGlobalStyles(DEFAULT_STYLES);
  }
}

/**
 * Get current CMS content
 * @returns {object}
 */
export function getCurrentContent() {
  return currentContent;
}

/**
 * Get current CMS styles
 * @returns {object}
 */
export function getCurrentStyles() {
  return currentStyles;
}

/**
 * Get current language
 * @returns {string}
 */
export function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Set language and reload content
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
export async function setLanguage(language) {
  currentLanguage = language;
  currentContent = await loadCMSContent(language);
  console.log('[CMS] Language changed to', language);
}

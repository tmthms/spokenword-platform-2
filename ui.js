/**
 * ui.js
 * Beheert alle UI-interacties: pagina's tonen/verbergen,
 * navigatieknoppen en de status van de UI bijwerken.
 */

// Importeer de "store" (globale state) om de data van de ingelogde gebruiker te lezen
import { getStore } from './store.js';

// Importeer de functies die we nodig hebben van andere modules
import { handleLogout, handleLogin, handleArtistSignup, handleProgrammerSignup } from './auth.js';
import { renderArtistDashboard, populateArtistEditor, setupArtistDashboard } from './artist-dashboard.js';
import { renderProgrammerDashboard, setupProgrammerDashboard } from './programmer-dashboard.js';
import { loadArtists, renderArtistSearch } from './artist-search.js';
import { loadConversations } from './messaging.js';
import { populateProgrammerEditor, renderProgrammerProfileEditor, setupProfileFormHandlers } from './programmer-profile.js';
import { setNavigationVisibility, updateDesktopNav, updateMobileNavActive } from './navigation.js';

// Importeer de view renderers
import {
  renderHome,
  renderLogin,
  renderSignup,
  renderArtistSignup,
  renderProgrammerSignup,
  renderMessages as renderMessagesView,
  renderDashboard as renderDashboardView
} from './view-renderers.js'; 

// --- DOM Elementen ---
// We slaan alle belangrijke UI-elementen één keer op voor snelle toegang
const elements = {
  // Pagina-secties
  pageSections: document.querySelectorAll('.page-section'),
  loadingView: document.getElementById('loading-view'),
  homeView: document.getElementById('home-view'),
  loginView: document.getElementById('login-view'),
  signupView: document.getElementById('signup-view'),
  artistSignupView: document.getElementById('artist-signup-view'),
  programmerSignupView: document.getElementById('programmer-signup-view'),
  dashboardView: document.getElementById('dashboard-view'),

  // Navigatie & Gebruikersmenu
  navButtons: document.querySelectorAll('.nav-button'),
  navHome: document.getElementById('nav-home'),
  navLogin: document.getElementById('nav-login'),
  navSignup: document.getElementById('nav-signup'),
  navDashboard: document.getElementById('nav-dashboard'),
  navMessages: document.getElementById('nav-messages'),
  navSettings: document.getElementById('nav-settings'),
  navLogout: document.getElementById('nav-logout'),
  authLinks: document.getElementById('auth-links'),
  userMenu: document.getElementById('user-menu'),
  userEmailSpan: document.getElementById('user-email'),

  // Knoppen op de Homepagina
  homeCtaArtist: document.getElementById('home-cta-artist'),
  homeCtaProgrammer: document.getElementById('home-cta-programmer'),

  // Knoppen op de Aanmeld-keuzepagina
  signupChoiceArtist: document.getElementById('signup-choice-artist'),
  signupChoiceProgrammer: document.getElementById('signup-choice-programmer'),

  // Dashboard Specifieke Views
  artistDashboard: document.getElementById('artist-dashboard'),
  programmerDashboard: document.getElementById('programmer-dashboard'),
  programmerPendingView: document.getElementById('programmer-pending-view'),
  programmerProfileEditor: document.getElementById('programmer-profile-editor'),
  artistSearchSection: document.getElementById('artist-search-section'),
};

/**
 * Toont één specifieke pagina-sectie en verbergt alle andere.
 * NIEUWE ARCHITECTUUR: Alle content wordt dynamisch gerenderd in #app-content
 * @param {string} pageId - De ID van de pagina-sectie die getoond moet worden.
 */
export function showPage(pageId) {
  const appContent = document.getElementById('app-content');

  // KRITIEK: Maak de container ALTIJD leeg voordat we nieuwe content renderen
  // Dit voorkomt dat oude views zichtbaar blijven
  if (appContent) {
    appContent.innerHTML = '';
  }

  // Render de juiste view op basis van pageId
  switch(pageId) {
    case 'home-view':
      renderHome();
      break;
    case 'login-view':
      renderLogin();
      break;
    case 'signup-view':
      renderSignup();
      break;
    case 'artist-signup-view':
      renderArtistSignup();
      break;
    case 'programmer-signup-view':
      renderProgrammerSignup();
      break;
    case 'messages-view':
      renderMessagesView();
      break;
    case 'dashboard-view':
      renderDashboardView();
      break;
    default:
      console.warn(`Unknown page: ${pageId}`);
      renderHome();
  }

  // Re-initialize Lucide icons after rendering new content
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Setup global form handlers with event delegation
 * Handles all auth forms (login, signup) regardless of when they're rendered
 * Uses capture phase to intercept events before any other handlers
 */
let globalFormHandlersInitialized = false;

export function setupGlobalFormHandlers() {
  if (globalFormHandlersInitialized) {
    console.log('[UI] Global form handlers already initialized, skipping');
    return;
  }

  console.log('[UI] Setting up global form handlers with capture phase');

  // PRIMARY: Use event delegation on document (highest level) with capture phase
  document.addEventListener('submit', async (e) => {
    console.log('⚡️ Global SUBMIT caught:', e.target.tagName, 'id:', e.target.id);

    const form = e.target;

    // Login form
    if (form.id === 'login-form') {
      console.log('[UI] ✅ Login form submit intercepted - calling handleLogin');
      await handleLogin(e);
      return;
    }

    // Artist signup form
    if (form.id === 'artist-signup-form') {
      console.log('[UI] ✅ Artist signup form submit intercepted');
      await handleArtistSignup(e);
      return;
    }

    // Programmer signup form
    if (form.id === 'programmer-signup-form') {
      console.log('[UI] ✅ Programmer signup form submit intercepted');
      await handleProgrammerSignup(e);
      return;
    }
  }, { capture: true }); // CRITICAL: Capture phase ensures we intercept FIRST

  globalFormHandlersInitialized = true;
  console.log('[UI] ✅ Global form handlers initialized successfully');
}


/**
 * Werkt de navigatiebalk bij op basis van de inlogstatus.
 * @param {object | null} user - Het Firebase user-object (of null als uitgelogd).
 */
export function updateNav(user) {
  const appHeader = document.getElementById('app-header');
  const navLogoutMobile = document.getElementById('nav-logout-mobile');
  const userEmailMobile = document.getElementById('user-email-mobile');

  if (user) {
    // Ingelogd - Show navigation using centralized function
    setNavigationVisibility(true);

    // Update desktop nav with current user data
    updateDesktopNav();

    // Show app header
    if (appHeader) {
      appHeader.classList.remove('hidden');
    }

    // Show mobile logout button
    if (navLogoutMobile) {
      navLogoutMobile.classList.remove('hidden');
    }

    // Update mobile email
    if (userEmailMobile) {
      userEmailMobile.textContent = user.email;
      userEmailMobile.classList.remove('hidden');
    }

    // Re-initialize icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  } else {
    // Uitgelogd - Hide navigation using centralized function
    setNavigationVisibility(false);

    // Hide app header
    if (appHeader) {
      appHeader.classList.add('hidden');
    }

    // Hide mobile elements
    if (navLogoutMobile) {
      navLogoutMobile.classList.add('hidden');
    }

    if (userEmailMobile) {
      userEmailMobile.textContent = '';
      userEmailMobile.classList.add('hidden');
    }
  }
}

/**
 * Helper: Show/hide artist search section consistently
 * @param {boolean} show - Whether to show (true) or hide (false) the search section
 */
function toggleArtistSearchSection(show) {
  const artistSearchSection = document.getElementById('artist-search-section');
  if (artistSearchSection) {
    if (show) {
      artistSearchSection.style.display = 'block';
      artistSearchSection.classList.remove('hidden');
      console.log('[UI] Artist search section shown');
    } else {
      artistSearchSection.style.display = 'none';
      artistSearchSection.classList.add('hidden');
      console.log('[UI] Artist search section hidden');
    }
  }
}

/**
 * Helper: Show/hide profile sections (overview, preview, editor)
 * @param {boolean} show - Whether to show (true) or hide (false)
 */
function toggleProfileSections(show) {
  const profileOverview = document.getElementById('programmer-profile-overview');
  const publicPreview = document.getElementById('programmer-public-preview');

  if (profileOverview) {
    if (show) {
      profileOverview.style.display = 'block';
      profileOverview.classList.remove('hidden');
    } else {
      profileOverview.style.display = 'none';
      profileOverview.classList.add('hidden');
    }
  }

  if (publicPreview) {
    if (show) {
      publicPreview.style.display = 'block';
      publicPreview.classList.remove('hidden');
    } else {
      publicPreview.style.display = 'none';
      publicPreview.classList.add('hidden');
    }
  }
}

/**
 * Toont het juiste dashboard (Artiest of Programmeur) op basis van de rol.
 */
export function showDashboard() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData) {
    console.warn("Geen gebruikersdata gevonden, kan dashboard niet tonen. Terug naar home.");
    showPage('home-view');
    return;
  }

  // STAP 1: Render de dashboard container structuur
  showPage('dashboard-view');

  // STAP 2: Render de specifieke dashboard content op basis van rol
  const { role, status } = currentUserData;

  if (role === 'artist') {
    // Get the dynamically rendered containers
    const artistDashboard = document.getElementById('artist-dashboard');
    const programmerDashboard = document.getElementById('programmer-dashboard');

    if (artistDashboard) {
      artistDashboard.style.display = 'block';
      artistDashboard.classList.remove('hidden');
    }
    if (programmerDashboard) {
      programmerDashboard.style.display = 'none';
      programmerDashboard.classList.add('hidden');
    }

    // Render the artist dashboard HTML
    renderArtistDashboard();
    // Setup dashboard AFTER rendering HTML (so form exists)
    setupArtistDashboard();
    // Vul de "Edit Profile" velden met de data van de artiest
    populateArtistEditor();
  } else if (role === 'programmer') {
    // Get the dynamically rendered containers
    const artistDashboard = document.getElementById('artist-dashboard');
    const programmerDashboard = document.getElementById('programmer-dashboard');

    if (artistDashboard) {
      artistDashboard.style.display = 'none';
      artistDashboard.classList.add('hidden');
    }
    if (programmerDashboard) {
      programmerDashboard.style.display = 'block';
      programmerDashboard.classList.remove('hidden');
    }

    // Render the programmer dashboard HTML
    renderProgrammerDashboard();
    // Setup dashboard AFTER rendering HTML (so elements exist)
    setupProgrammerDashboard();

    // Get pending view dynamically
    const pendingView = document.getElementById('programmer-pending-view');

    // Get profile editor dynamically
    const programmerProfileEditor = document.getElementById('programmer-profile-editor');
    if (programmerProfileEditor) {
      programmerProfileEditor.classList.add('hidden');
      programmerProfileEditor.style.display = 'none';
    }

    // ✅ FIX: Show profile sections in dashboard view
    toggleProfileSections(true);

    if (status === 'pending') {
      // Verberg de zoekfilters, toon "pending" bericht
      if (pendingView) pendingView.style.display = 'block';
      // ✅ FIX: Hide artist search in pending state
      toggleArtistSearchSection(false);
    } else {
      // Toon de zoekfilters en verberg "pending"
      if (pendingView) pendingView.style.display = 'none';

      // ✅ FIX: Show artist search section
      toggleArtistSearchSection(true);

      // Render the artist search view dynamically
      renderArtistSearch();

      // Auto-load all artists when dashboard loads
      loadArtists();
    }
  }

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows programmer settings (profile editor)
 */
export function showProgrammerSettings() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn("Only programmers can access settings");
    return;
  }

  console.log('[UI] Showing programmer settings view');

  // STAP 1: Render de dashboard container structuur
  showPage('dashboard-view');

  // STAP 2: Get the dynamically rendered containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  // Show programmer dashboard
  if (artistDashboard) {
    artistDashboard.style.display = 'none';
    artistDashboard.classList.add('hidden');
  }
  if (programmerDashboard) {
    programmerDashboard.style.display = 'block';
    programmerDashboard.classList.remove('hidden');
  }

  // Render the programmer dashboard HTML first
  renderProgrammerDashboard();
  // Setup dashboard AFTER rendering HTML
  setupProgrammerDashboard();

  // Get dynamically rendered elements
  const pendingView = document.getElementById('programmer-pending-view');

  // Hide the pending view
  if (pendingView) pendingView.style.display = 'none';

  // ✅ FIX: Hide artist search section in Settings view
  toggleArtistSearchSection(false);

  // ✅ FIX: Show profile sections in Settings view
  toggleProfileSections(true);

  // Get the profile editor dynamically
  const programmerProfileEditor = document.getElementById('programmer-profile-editor');

  // Show the profile editor
  if (programmerProfileEditor) {
    // Render the editor HTML first
    renderProgrammerProfileEditor();

    programmerProfileEditor.classList.remove('hidden');
    programmerProfileEditor.style.display = 'block';

    // Setup form handlers after rendering
    setupProfileFormHandlers();

    // Populate the editor with current data
    populateProgrammerEditor();

    // Scroll to the profile editor
    setTimeout(() => {
      programmerProfileEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Toont de messages/conversations pagina
 */
export function showMessages() {
  console.log("Showing messages view");

  // Render the messages view
  showPage('messages-view');

  // Laad conversaties AFTER rendering the view
  loadConversations();
}

/**
 * Voegt alle event listeners toe voor de navigatieknoppen.
 * Wordt één keer uitgevoerd bij het laden van de app.
 * ✅ Uses event delegation for all dynamically rendered elements
 */
export function initNavigation() {
  // ✅ Global click handler with event delegation
  document.body.addEventListener('click', (e) => {
    // Mobile logout button
    if (e.target.closest('#nav-logout-mobile')) {
      console.log('[UI] Mobile logout clicked');
      handleLogout();
      return;
    }

    // Home CTA buttons
    if (e.target.closest('#home-cta-artist')) {
      showPage('artist-signup-view');
      return;
    }

    if (e.target.closest('#home-cta-programmer')) {
      showPage('programmer-signup-view');
      return;
    }

    // Home login button
    if (e.target.closest('#home-login-btn')) {
      showPage('login-view');
      return;
    }

    // Signup choice buttons
    if (e.target.closest('#signup-choice-artist')) {
      showPage('artist-signup-view');
      return;
    }

    if (e.target.closest('#signup-choice-programmer')) {
      showPage('programmer-signup-view');
      return;
    }

    // Back buttons
    if (e.target.closest('#back-to-home-from-login')) {
      showPage('home-view');
      return;
    }

    if (e.target.closest('#back-to-home-from-signup')) {
      showPage('home-view');
      return;
    }

    if (e.target.closest('#back-from-artist-signup')) {
      showPage('signup-view');
      return;
    }

    if (e.target.closest('#back-from-programmer-signup')) {
      showPage('signup-view');
      return;
    }
  });

  // Bottom Navigation
  setupBottomNavigation();

  // Desktop Navigation
  setupDesktopNavigation();

  console.log('[UI] Navigation initialization complete with event delegation');
}

/**
 * Setup bottom navigation with event delegation
 */
function setupBottomNavigation() {
  const bottomNav = document.getElementById('bottom-nav');
  if (!bottomNav) return;

  // Use event delegation on the bottom nav container
  bottomNav.addEventListener('click', (e) => {
    const navItem = e.target.closest('.bottom-nav-item');
    if (!navItem) return;

    const navAction = navItem.dataset.nav;

    // Update active state
    updateBottomNavActive(navAction);

    // ⭐ BUG FIX 3: Update URL hash when navigating on mobile bottom nav
    // Handle navigation
    switch(navAction) {
      case 'search':
        window.location.hash = '#search';
        showDashboard(); // Show search (dashboard for programmers)
        break;
      case 'messages':
        window.location.hash = '#messages';
        showMessages();
        break;
      case 'profile':
        // Show profile (dashboard for artists, settings for programmers)
        const currentUserData = getStore('currentUserData');
        if (currentUserData?.role === 'artist') {
          window.location.hash = '#profile';
          showDashboard();
        } else if (currentUserData?.role === 'programmer') {
          window.location.hash = '#settings';
          showProgrammerSettings();
        }
        break;
    }

    // Re-initialize icons after navigation
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  });
}

/**
 * Update active state of bottom navigation items
 * (Wrapper function - delegates to navigation.js)
 */
function updateBottomNavActive(activeNav) {
  updateMobileNavActive(activeNav);
}

/**
 * Setup desktop navigation with dropdown and search
 * ✅ FIX: Uses event delegation to handle dynamically rendered navigation
 */
function setupDesktopNavigation() {
  // ✅ Use event delegation on document body to catch clicks from dynamically rendered nav
  document.body.addEventListener('click', (e) => {
    // Desktop Search
    if (e.target.closest('#desktop-nav-search')) {
      window.location.hash = '#search';
      showDashboard();
      return;
    }

    // Desktop Messages
    if (e.target.closest('#desktop-nav-messages')) {
      window.location.hash = '#messages';
      showMessages();
      return;
    }

    // Desktop Settings
    if (e.target.closest('#desktop-settings')) {
      const dropdown = document.getElementById('desktop-profile-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      window.location.hash = '#settings';
      showProgrammerSettings();
      return;
    }

    // ✅ FIX: Desktop Logout with event delegation
    if (e.target.closest('#desktop-logout')) {
      console.log('[UI] Desktop logout clicked');
      const dropdown = document.getElementById('desktop-profile-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      handleLogout();
      return;
    }

    // Desktop Profile Button (toggle dropdown)
    const profileBtn = e.target.closest('#desktop-profile-btn');
    if (profileBtn) {
      e.stopPropagation();
      const dropdown = document.getElementById('desktop-profile-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('hidden');
      }
      return;
    }

    // Close dropdown when clicking outside
    const dropdown = document.getElementById('desktop-profile-dropdown');
    const profileBtnElement = document.getElementById('desktop-profile-btn');
    if (dropdown && profileBtnElement) {
      if (!dropdown.classList.contains('hidden') &&
          !profileBtnElement.contains(e.target) &&
          !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    }
  });

  console.log('[UI] Desktop navigation event delegation setup complete');
}


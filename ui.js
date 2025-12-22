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
      // Attach event listener to login form after rendering
      attachLoginFormListener();
      break;
    case 'signup-view':
      renderSignup();
      break;
    case 'artist-signup-view':
      renderArtistSignup();
      // Attach event listener to artist signup form after rendering
      attachArtistSignupFormListener();
      break;
    case 'programmer-signup-view':
      renderProgrammerSignup();
      // Attach event listener to programmer signup form after rendering
      attachProgrammerSignupFormListener();
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
 * Helper functions to attach form event listeners after rendering
 */
function attachLoginFormListener() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.warn('[UI] login-form element not found after rendering');
  }
}

function attachArtistSignupFormListener() {
  const artistSignupForm = document.getElementById('artist-signup-form');
  if (artistSignupForm) {
    artistSignupForm.addEventListener('submit', handleArtistSignup);
  } else {
    console.warn('[UI] artist-signup-form element not found after rendering');
  }
}

function attachProgrammerSignupFormListener() {
  const programmerSignupForm = document.getElementById('programmer-signup-form');
  if (programmerSignupForm) {
    programmerSignupForm.addEventListener('submit', handleProgrammerSignup);
  } else {
    console.warn('[UI] programmer-signup-form element not found after rendering');
  }
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

    // Get artist search section dynamically
    const artistSearchSection = document.getElementById('artist-search-section');
    if (artistSearchSection) {
      artistSearchSection.style.display = 'block';
      artistSearchSection.classList.remove('hidden');
    }

    if (status === 'pending') {
      // Verberg de zoekfilters, toon "pending" bericht
      if (pendingView) pendingView.style.display = 'block';
      const artistSearchSectionPending = document.getElementById('artist-search-section');
      if (artistSearchSectionPending) artistSearchSectionPending.style.display = 'none';
    } else {
      // Toon de zoekfilters en verberg "pending"
      if (pendingView) pendingView.style.display = 'none';

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
  const artistSearchSection = document.getElementById('artist-search-section');

  // Hide the pending view and artist search section
  if (pendingView) pendingView.style.display = 'none';
  if (artistSearchSection) {
    artistSearchSection.style.display = 'none';
    artistSearchSection.classList.add('hidden');
  }

  // Show the profile overview AND public preview
  const profileOverview = document.getElementById('programmer-profile-overview');
  const publicPreview = document.getElementById('programmer-public-preview');

  if (profileOverview) {
    profileOverview.style.display = 'block';
    profileOverview.classList.remove('hidden');
  }
  if (publicPreview) {
    publicPreview.style.display = 'block';
    publicPreview.classList.remove('hidden');
  }

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
 * DIT IS DE FIX: Exporteert de functie met de juiste naam 'initNavigation'.
 */
export function initNavigation() {
  // Top navigation (deprecated but keep for compatibility)
  if (elements.navHome) elements.navHome.addEventListener('click', () => showPage('home-view'));
  if (elements.navLogin) elements.navLogin.addEventListener('click', () => showPage('login-view'));
  if (elements.navSignup) elements.navSignup.addEventListener('click', () => showPage('signup-view'));
  if (elements.navDashboard) elements.navDashboard.addEventListener('click', showDashboard);
  if (elements.navMessages) elements.navMessages.addEventListener('click', showMessages);
  if (elements.navSettings) elements.navSettings.addEventListener('click', showProgrammerSettings);
  if (elements.navLogout) elements.navLogout.addEventListener('click', handleLogout);

  // Homepagina CTA-knoppen
  if (elements.homeCtaArtist) {
    elements.homeCtaArtist.addEventListener('click', () => showPage('artist-signup-view'));
  } else {
    console.warn('⚠️ Skipped listener for missing element: homeCtaArtist');
  }

  if (elements.homeCtaProgrammer) {
    elements.homeCtaProgrammer.addEventListener('click', () => showPage('programmer-signup-view'));
  } else {
    console.warn('⚠️ Skipped listener for missing element: homeCtaProgrammer');
  }

  // Home login button (nieuwe button)
  const homeLoginBtn = document.getElementById('home-login-btn');
  if (homeLoginBtn) {
    homeLoginBtn.addEventListener('click', () => showPage('login-view'));
  }

  // Signup-keuzeknoppen
  if (elements.signupChoiceArtist) {
    elements.signupChoiceArtist.addEventListener('click', () => showPage('artist-signup-view'));
  } else {
    console.warn('⚠️ Skipped listener for missing element: signupChoiceArtist');
  }

  if (elements.signupChoiceProgrammer) {
    elements.signupChoiceProgrammer.addEventListener('click', () => showPage('programmer-signup-view'));
  } else {
    console.warn('⚠️ Skipped listener for missing element: signupChoiceProgrammer');
  }

  // Back buttons (nieuwe navigatie)
  const backFromLoginBtn = document.getElementById('back-to-home-from-login');
  if (backFromLoginBtn) {
    backFromLoginBtn.addEventListener('click', () => showPage('home-view'));
  }

  const backFromSignupBtn = document.getElementById('back-to-home-from-signup');
  if (backFromSignupBtn) {
    backFromSignupBtn.addEventListener('click', () => showPage('home-view'));
  }

  const backFromArtistSignup = document.getElementById('back-from-artist-signup');
  if (backFromArtistSignup) {
    backFromArtistSignup.addEventListener('click', () => showPage('signup-view'));
  }

  const backFromProgrammerSignup = document.getElementById('back-from-programmer-signup');
  if (backFromProgrammerSignup) {
    backFromProgrammerSignup.addEventListener('click', () => showPage('signup-view'));
  }

  // Mobile logout button
  const navLogoutMobile = document.getElementById('nav-logout-mobile');
  if (navLogoutMobile) {
    navLogoutMobile.addEventListener('click', handleLogout);
  }

  // Bottom Navigation
  setupBottomNavigation();

  // Desktop Navigation
  setupDesktopNavigation();
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
 */
function setupDesktopNavigation() {
  const desktopNav = document.getElementById('desktop-top-nav');
  if (!desktopNav) return;

  // Desktop nav items
  const desktopSearch = document.getElementById('desktop-nav-search');
  const desktopMessages = document.getElementById('desktop-nav-messages');
  const desktopProfileBtn = document.getElementById('desktop-profile-btn');
  const desktopDropdown = document.getElementById('desktop-profile-dropdown');

  // ⭐ BUG FIX 3: Update URL hash when navigating on desktop
  // Menu actions
  if (desktopSearch) desktopSearch.addEventListener('click', () => {
    window.location.hash = '#search';
    showDashboard();
  });
  if (desktopMessages) desktopMessages.addEventListener('click', () => {
    window.location.hash = '#messages';
    showMessages();
  });

  // Profile dropdown toggle
  if (desktopProfileBtn && desktopDropdown) {
    desktopProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!desktopProfileBtn.contains(e.target) && !desktopDropdown.contains(e.target)) {
        desktopDropdown.classList.add('hidden');
      }
    });
  }

  // Dropdown menu items
  const settingsBtn = document.getElementById('desktop-settings');
  const logoutBtn = document.getElementById('desktop-logout');

  // ⭐ BUG FIX 3: Update URL hash for settings
  if (settingsBtn) settingsBtn.addEventListener('click', () => {
    desktopDropdown.classList.add('hidden');
    window.location.hash = '#settings';
    showProgrammerSettings();
  });

  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    desktopDropdown.classList.add('hidden');
    handleLogout();
  });
}


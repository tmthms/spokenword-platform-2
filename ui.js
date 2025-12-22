/**
 * ui.js
 * Beheert alle UI-interacties: pagina's tonen/verbergen,
 * navigatieknoppen en de status van de UI bijwerken.
 */

// Importeer de "store" (globale state) om de data van de ingelogde gebruiker te lezen
import { getStore } from './store.js';

// Importeer de functies die we nodig hebben van andere modules
import { handleLogout } from './auth.js';
import { renderArtistDashboard, populateArtistEditor, setupArtistDashboard } from './artist-dashboard.js';
import { renderProgrammerDashboard, setupProgrammerDashboard } from './programmer-dashboard.js';
import { loadArtists, renderArtistSearch } from './artist-search.js';
import { loadConversations } from './messaging.js';
import { populateProgrammerEditor, renderProgrammerProfileEditor, setupProfileFormHandlers } from './programmer-profile.js'; 

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
  programmerTrialView: document.getElementById('programmer-trial-view'),
  programmerTrialMessage: document.getElementById('programmer-trial-message'),
  programmerProMessage: document.getElementById('programmer-pro-message'),
  programmerProfileEditor: document.getElementById('programmer-profile-editor'),
  artistSearchSection: document.getElementById('artist-search-section'),
};

/**
 * Toont één specifieke pagina-sectie en verbergt alle andere.
 * @param {string} pageId - De ID van de pagina-sectie die getoond moet worden.
 */
export function showPage(pageId) {
  elements.pageSections.forEach(section => {
    section.style.display = (section.id === pageId) ? 'block' : 'none';
  });

  // Speciale afhandeling om dashboard sub-views te verbergen wanneer we weggaan
  if (pageId !== 'dashboard-view') {
    // FIX 3: Null-safe style guards
    if (elements.artistDashboard) elements.artistDashboard.style.display = 'none';
    if (elements.programmerDashboard) elements.programmerDashboard.style.display = 'none';
  }
}

/**
 * Werkt de navigatiebalk bij op basis van de inlogstatus.
 * @param {object | null} user - Het Firebase user-object (of null als uitgelogd).
 */
export function updateNav(user) {
  const bottomNav = document.getElementById('bottom-nav');
  const appHeader = document.getElementById('app-header');
  const navLogoutMobile = document.getElementById('nav-logout-mobile');
  const userEmailMobile = document.getElementById('user-email-mobile');

  if (user) {
    // Ingelogd
    // FIX 3: Null-safe style guards
    if (elements.authLinks) elements.authLinks.style.display = 'none';
    if (elements.userMenu) elements.userMenu.style.display = 'flex';
    if (elements.userEmailSpan) elements.userEmailSpan.textContent = user.email;
    if (elements.navDashboard) elements.navDashboard.style.display = 'block';
    if (elements.navMessages) elements.navMessages.style.display = 'block';

    // Show bottom navigation
    if (bottomNav) {
      bottomNav.classList.remove('hidden');
    }

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

    // ⭐ NEW: Update dashboard button text based on role
    const currentUserData = getStore('currentUserData');
    const navDashboardText = document.getElementById('nav-dashboard-text');

    if (currentUserData) {
      // Update nav-dashboard text
      if (navDashboardText) {
        if (currentUserData.role === 'artist') {
          navDashboardText.textContent = 'Dashboard';
        } else if (currentUserData.role === 'programmer') {
          navDashboardText.textContent = 'Search Artists';
        }
      }

      // Show Settings button only for programmers
      if (currentUserData.role === 'programmer') {
        if (elements.navSettings) {
          elements.navSettings.style.display = 'inline-block';
          elements.navSettings.classList.remove('hidden');
        }
      } else {
        if (elements.navSettings) {
          elements.navSettings.style.display = 'none';
          elements.navSettings.classList.add('hidden');
        }
      }
    }

    // Re-initialize icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  } else {
    // Uitgelogd
    // FIX 3: Null-safe style guards
    if (elements.authLinks) elements.authLinks.style.display = 'block';
    if (elements.userMenu) elements.userMenu.style.display = 'none';
    if (elements.userEmailSpan) elements.userEmailSpan.textContent = '';
    if (elements.navDashboard) elements.navDashboard.style.display = 'none';
    if (elements.navMessages) elements.navMessages.style.display = 'none';
    if (elements.navSettings) elements.navSettings.style.display = 'none';

    // Hide bottom navigation
    if (bottomNav) {
      bottomNav.classList.add('hidden');
    }

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

  const { role, status } = currentUserData;

  if (role === 'artist') {
    // FIX 3: Null-safe style guards
    if (elements.artistDashboard) {
      elements.artistDashboard.style.display = 'block';
      elements.artistDashboard.classList.remove('hidden');
    }
    if (elements.programmerDashboard) {
      elements.programmerDashboard.style.display = 'none';
      elements.programmerDashboard.classList.add('hidden');
    }
    // Render the artist dashboard HTML
    renderArtistDashboard();
    // ⭐ FIX: Setup dashboard AFTER rendering HTML (so form exists)
    setupArtistDashboard();
    // Vul de "Edit Profile" velden met de data van de artiest
    populateArtistEditor();
  } else if (role === 'programmer') {
    // FIX 3: Null-safe style guards
    if (elements.artistDashboard) {
      elements.artistDashboard.style.display = 'none';
      elements.artistDashboard.classList.add('hidden');
    }
    if (elements.programmerDashboard) {
      elements.programmerDashboard.style.display = 'block';
      elements.programmerDashboard.classList.remove('hidden');
    }

    // Render the programmer dashboard HTML
    renderProgrammerDashboard();
    // ⭐ FIX: Setup dashboard AFTER rendering HTML (so elements exist)
    setupProgrammerDashboard();

    const pendingView = elements.programmerPendingView;
    const trialView = elements.programmerTrialView;
    const trialMessage = elements.programmerTrialMessage;
    const proMessage = elements.programmerProMessage;

    // Hide profile editor and show search section
    if (elements.programmerProfileEditor) {
      elements.programmerProfileEditor.classList.add('hidden');
      elements.programmerProfileEditor.style.display = 'none';
    }
    if (elements.artistSearchSection) elements.artistSearchSection.style.display = 'block';

    if (status === 'pending') {
      // Verberg de zoekfilters, toon "pending" bericht
      // FIX 3: Null-safe style guards
      if (pendingView) pendingView.style.display = 'block';
      if (trialView) trialView.style.display = 'none';
      if (elements.artistSearchSection) elements.artistSearchSection.style.display = 'none';
    } else {
      // Toon de zoekfilters en verberg "pending"
      // FIX 3: Null-safe style guards
      if (pendingView) pendingView.style.display = 'none';
      if (trialView) trialView.style.display = 'block';

      // Toon het juiste bericht (Trial of Pro)
      if (status === 'pro') {
        if (trialMessage) trialMessage.style.display = 'none';
        if (proMessage) proMessage.style.display = 'block';
      } else {
        if (trialMessage) trialMessage.style.display = 'block';
        if (proMessage) proMessage.style.display = 'none';
      }

      // Render the artist search view dynamically
      renderArtistSearch();

      // Auto-load all artists when dashboard loads
      loadArtists();
    }
  }

  // Toon ten slotte de hoofd-dashboard pagina
  showPage('dashboard-view');
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

  // Show dashboard page
  showPage('dashboard-view');

  // Show programmer dashboard
  // FIX 3: Null-safe style guards
  if (elements.artistDashboard) {
    elements.artistDashboard.style.display = 'none';
    elements.artistDashboard.classList.add('hidden');
  }
  if (elements.programmerDashboard) {
    elements.programmerDashboard.style.display = 'block';
    elements.programmerDashboard.classList.remove('hidden');
  }

  // Hide the pending/trial views and artist search section
  const pendingView = elements.programmerPendingView;
  const trialView = elements.programmerTrialView;

  if (pendingView) pendingView.style.display = 'none';
  if (trialView) trialView.style.display = 'none';
  if (elements.artistSearchSection) elements.artistSearchSection.style.display = 'none';

  // Show the profile overview
  const profileOverview = document.getElementById('programmer-profile-overview');
  if (profileOverview) {
    profileOverview.style.display = 'block';
    profileOverview.classList.remove('hidden');
  }

  // Show the profile editor
  if (elements.programmerProfileEditor) {
    // Render the editor HTML first
    renderProgrammerProfileEditor();

    elements.programmerProfileEditor.classList.remove('hidden');
    elements.programmerProfileEditor.style.display = 'block';

    // Setup form handlers after rendering
    setupProfileFormHandlers();

    // Populate the editor with current data
    populateProgrammerEditor();

    // Scroll to the profile editor
    setTimeout(() => {
      elements.programmerProfileEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

/**
 * Toont de messages/conversations pagina
 */
export function showMessages() {
  console.log("Showing messages view");
  showPage('messages-view');
  // Laad conversaties
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
  elements.homeCtaArtist.addEventListener('click', () => showPage('artist-signup-view'));
  elements.homeCtaProgrammer.addEventListener('click', () => showPage('programmer-signup-view'));

  // Home login button (nieuwe button)
  const homeLoginBtn = document.getElementById('home-login-btn');
  if (homeLoginBtn) {
    homeLoginBtn.addEventListener('click', () => showPage('login-view'));
  }

  // Signup-keuzeknoppen
  elements.signupChoiceArtist.addEventListener('click', () => showPage('artist-signup-view'));
  elements.signupChoiceProgrammer.addEventListener('click', () => showPage('programmer-signup-view'));

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

    // Handle navigation
    switch(navAction) {
      case 'home':
        showDashboard();
        break;
      case 'search':
        showDashboard(); // Show search (dashboard for programmers)
        break;
      case 'messages':
        showMessages();
        break;
      case 'profile':
        // Show profile (dashboard for artists, settings for programmers)
        const currentUserData = getStore('currentUserData');
        if (currentUserData?.role === 'artist') {
          showDashboard();
        } else if (currentUserData?.role === 'programmer') {
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
 */
function updateBottomNavActive(activeNav) {
  const bottomNav = document.getElementById('bottom-nav');
  if (!bottomNav) return;

  const allItems = bottomNav.querySelectorAll('.bottom-nav-item');
  allItems.forEach(item => {
    if (item.dataset.nav === activeNav) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
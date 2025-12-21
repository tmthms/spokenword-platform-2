/**
 * ui.js
 * Beheert alle UI-interacties: pagina's tonen/verbergen,
 * navigatieknoppen en de status van de UI bijwerken.
 */

// Importeer de "store" (globale state) om de data van de ingelogde gebruiker te lezen
import { getStore } from './store.js';

// Importeer de functies die we nodig hebben van andere modules
import { handleLogout } from './auth.js';
import { renderArtistDashboard, populateArtistEditor } from './artist-dashboard.js';
import { renderProgrammerDashboard } from './programmer-dashboard.js';
import { loadArtists, renderArtistSearch } from './artist-search.js';
import { loadConversations } from './messaging.js';
import { populateProgrammerEditor } from './programmer-profile.js'; 

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
    elements.artistDashboard.style.display = 'none';
    elements.programmerDashboard.style.display = 'none';
  }
}

/**
 * Werkt de navigatiebalk bij op basis van de inlogstatus.
 * @param {object | null} user - Het Firebase user-object (of null als uitgelogd).
 */
export function updateNav(user) {
  if (user) {
    // Ingelogd
    elements.authLinks.style.display = 'none';
    elements.userMenu.style.display = 'flex';
    elements.userEmailSpan.textContent = user.email;
    elements.navDashboard.style.display = 'block';
    elements.navMessages.style.display = 'block';

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
        elements.navSettings.style.display = 'inline-block';
        elements.navSettings.classList.remove('hidden');
      } else {
        elements.navSettings.style.display = 'none';
        elements.navSettings.classList.add('hidden');
      }
    }
  } else {
    // Uitgelogd
    elements.authLinks.style.display = 'block';
    elements.userMenu.style.display = 'none';
    elements.userEmailSpan.textContent = '';
    elements.navDashboard.style.display = 'none';
    elements.navMessages.style.display = 'none';
    elements.navSettings.style.display = 'none';
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
    elements.artistDashboard.style.display = 'block';
    elements.artistDashboard.classList.remove('hidden');
    elements.programmerDashboard.style.display = 'none';
    elements.programmerDashboard.classList.add('hidden');
    // Render the artist dashboard HTML
    renderArtistDashboard();
    // Vul de "Edit Profile" velden met de data van de artiest
    populateArtistEditor();
  } else if (role === 'programmer') {
    elements.artistDashboard.style.display = 'none';
    elements.artistDashboard.classList.add('hidden');
    elements.programmerDashboard.style.display = 'block';
    elements.programmerDashboard.classList.remove('hidden');

    // Render the programmer dashboard HTML
    renderProgrammerDashboard();

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
      pendingView.style.display = 'block';
      trialView.style.display = 'none';
      if (elements.artistSearchSection) elements.artistSearchSection.style.display = 'none';
    } else {
      // Toon de zoekfilters en verberg "pending"
      pendingView.style.display = 'none';
      trialView.style.display = 'block';

      // Toon het juiste bericht (Trial of Pro)
      if (status === 'pro') {
        trialMessage.style.display = 'none';
        proMessage.style.display = 'block';
      } else {
        trialMessage.style.display = 'block';
        proMessage.style.display = 'none';
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
  elements.artistDashboard.style.display = 'none';
  elements.artistDashboard.classList.add('hidden');
  elements.programmerDashboard.style.display = 'block';
  elements.programmerDashboard.classList.remove('hidden');

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
    elements.programmerProfileEditor.classList.remove('hidden');
    elements.programmerProfileEditor.style.display = 'block';

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
  elements.navHome.addEventListener('click', () => showPage('home-view'));
  elements.navLogin.addEventListener('click', () => showPage('login-view'));
  elements.navSignup.addEventListener('click', () => showPage('signup-view'));

  // De Dashboard knop toont het *juiste* dashboard
  elements.navDashboard.addEventListener('click', showDashboard);

  // De Messages knop toont de conversations lijst
  elements.navMessages.addEventListener('click', showMessages);

  // Settings button for programmers
  elements.navSettings.addEventListener('click', showProgrammerSettings);

  elements.navLogout.addEventListener('click', handleLogout);

  // Homepagina CTA-knoppen
  elements.homeCtaArtist.addEventListener('click', () => showPage('artist-signup-view'));
  elements.homeCtaProgrammer.addEventListener('click', () => showPage('programmer-signup-view'));

  // Signup-keuzeknoppen
  elements.signupChoiceArtist.addEventListener('click', () => showPage('artist-signup-view'));
  elements.signupChoiceProgrammer.addEventListener('click', () => showPage('programmer-signup-view'));
}
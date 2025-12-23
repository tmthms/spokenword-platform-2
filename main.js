/**
 * main.js
 * Dit is het HOOFD startpunt van de applicatie.
 * Het importeert alle modules en start de app.
 */

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('❌ GLOBAL ERROR:', event.error);
  const loadingView = document.getElementById('loading-view');
  if (loadingView && loadingView.style.display !== 'none') {
    loadingView.innerHTML = `
      <div class="text-center text-red-500 p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
        <h1 class="text-2xl font-bold mb-4">Application Error</h1>
        <p class="mb-4">Er is een fout opgetreden bij het laden van de applicatie.</p>
        <p class="text-sm font-mono bg-red-100 p-3 rounded break-all mb-4">${event.error?.message || event.message}</p>
        <button onclick="location.reload()" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Probeer opnieuw
        </button>
      </div>
    `;
    loadingView.style.display = 'block';
  }
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ UNHANDLED PROMISE REJECTION:', event.reason);
});

// Importeer de initialisatie-functies van onze modules
import { monitorAuthState } from './src/services/auth.js';
import { initNavigation, setupGlobalFormHandlers, showPage, showDashboard, showMessages, showAccountSettings, showProgrammerSettings } from './src/ui/ui.js';
import { getStore } from './src/utils/store.js';
import { setupProgrammerProfile } from './src/modules/programmer/programmer-profile.js';
// ✅ setupArtistSearch moved to ui.js (imported there)
import { setupMessaging } from './src/modules/messaging/messaging-controller.js';
import { initTranslations } from './src/utils/translations.js';
import { setupRecommendations } from './src/modules/recommendations/recommendations.js';
import { setupUserSettings } from './src/modules/settings/user-settings.js';
import { renderDesktopNav, renderMobileNav } from './src/modules/navigation/navigation.js';

/**
 * initApp
 * De hoofdfunctie die de hele applicatie initialiseert.
 */
function initApp() {
  try {
    console.log("=".repeat(60));
    console.log("🚀 Starting application initialization...");
    console.log("=".repeat(60));

    // Setup global form handlers first (before any UI rendering)
    // This ensures login/signup forms work regardless of when they're rendered
    setupGlobalFormHandlers();

    // Initialize translations (default to Dutch)
    initTranslations();

    // Render navigation components (will be hidden until user logs in)
    renderDesktopNav();
    renderMobileNav();

    // Stel de navigatieknoppen in (Login, Home, etc.)
    initNavigation();

    // Stel de listener in die kijkt of we in- of uitgelogd zijn
    // Deze verbergt ook de lader en toont de homepagina
    monitorAuthState();

    // Stel de listeners in voor het programmeurs-profiel (edit profile)
    setupProgrammerProfile();

    // ✅ FIX: setupArtistSearch() moved to ui.js after renderArtistSearch()
    // This ensures event listeners attach after HTML is rendered

    // Stel de messaging listeners in (send message button, modal)
    setupMessaging();

    // Stel de recommendations listeners in (modal, form)
    setupRecommendations();

    // Stel de user settings listeners in (modal, language, email, password)
    setupUserSettings();

    // Setup browser back/forward button handler
    setupBrowserNavigation();

    console.log("=".repeat(60));
    console.log("✅ Application initialization complete!");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("Fout bij initialiseren van de app:", error);
    // Toon een fatale foutmelding aan de gebruiker
    const loadingView = document.getElementById('loading-view');
    if (loadingView) {
      loadingView.style.display = 'block'; // Zorg dat de lader zichtbaar is
      loadingView.innerHTML = `
        <div class="text-center text-red-500 p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
            <h1 class="text-2xl font-bold mb-4">Fatale Fout</h1>
            <p>Kon de applicatie niet laden. Probeer het later opnieuw.</p>
            <p class="mt-4 text-sm font-mono bg-red-100 p-2 rounded break-all">${error.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Setup browser navigation (back/forward buttons)
 * Handles URL hash changes and browser history
 */
function setupBrowserNavigation() {
  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    console.log('[BROWSER NAV] Popstate event triggered:', event.state);

    const currentUser = getStore('currentUser');
    const hash = window.location.hash.replace('#', '');

    // Auth guard: redirect to login if not authenticated
    const protectedRoutes = ['profile', 'messages', 'account-settings', 'profile-settings', 'dashboard'];
    if (protectedRoutes.includes(hash) && !currentUser) {
      console.warn('[BROWSER NAV] Protected route accessed without auth, redirecting to home');
      showPage('home-view', false);
      return;
    }

    // Route based on hash
    switch(hash) {
      case 'profile':
      case 'dashboard':
        showDashboard();
        break;
      case 'messages':
        showMessages();
        break;
      case 'account-settings':
        showAccountSettings();
        break;
      case 'profile-settings':
        showProgrammerSettings();
        break;
      case 'login':
        showPage('login-view', false);
        break;
      case 'signup':
        showPage('signup-view', false);
        break;
      case 'home':
      case '':
        showPage('home-view', false);
        break;
      default:
        console.warn('[BROWSER NAV] Unknown route:', hash);
        showPage('home-view', false);
    }
  });

  // Handle initial hash on page load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    console.log('[BROWSER NAV] Initial hash detected:', initialHash);
    // Let monitorAuthState handle the initial routing
  }

  console.log('[BROWSER NAV] Browser navigation setup complete');
}

// Start de applicatie zodra de HTML-pagina is geladen
document.addEventListener('DOMContentLoaded', initApp);
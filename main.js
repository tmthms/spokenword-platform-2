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
import { initAuth, monitorAuthState } from './auth.js';
import { initNavigation, showPage } from './ui.js';
import { getArtistSignupData, validateArtistSignupData } from './artist-signup-helpers.js';
import { setupProgrammerProfile } from './programmer-profile.js';
import { setupArtistSearch } from './artist-search.js'; // Artist search & detail view
import { setupMessaging } from './messaging.js';
import { initTranslations } from './translations.js';
import { setupRecommendations } from './recommendations.js';
import { setupUserSettings } from './user-settings.js';
import { renderDesktopNav, renderMobileNav } from './navigation.js';

/**
 * initApp
 * De hoofdfunctie die de hele applicatie initialiseert.
 */
function initApp() {
  try {
    console.log("=".repeat(60));
    console.log("🚀 Starting application initialization...");
    console.log("=".repeat(60));

    // Initialize translations (default to Dutch)
    initTranslations();

    // Render navigation components (will be hidden until user logs in)
    renderDesktopNav();
    renderMobileNav();

    // Stel de navigatieknoppen in (Login, Home, etc.)
    initNavigation();

    // Stel de auth-formulieren in (Login, Signup, Logout knoppen)
    initAuth();

    // Stel de listener in die kijkt of we in- of uitgelogd zijn
    // Deze verbergt ook de lader en toont de homepagina
    monitorAuthState();

    // ⭐ NOTE: setupArtistDashboard() and setupProgrammerDashboard() are now called
    // in ui.js showDashboard() AFTER the HTML is rendered, so event listeners can attach

    // Stel de listeners in voor het programmeurs-profiel (edit profile)
    setupProgrammerProfile();

    // Stel de listeners in voor de artiest-zoekfunctie (filters, search, detail view)
    setupArtistSearch();

    // Stel de messaging listeners in (send message button, modal)
    setupMessaging();

    // Stel de recommendations listeners in (modal, form)
    setupRecommendations();

    // Stel de user settings listeners in (modal, language, email, password)
    setupUserSettings();

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

// Start de applicatie zodra de HTML-pagina is geladen
document.addEventListener('DOMContentLoaded', initApp);
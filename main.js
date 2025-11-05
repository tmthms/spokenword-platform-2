/**
 * main.js
 * Dit is het HOOFD startpunt van de applicatie.
 * Het importeert alle modules en start de app.
 */

// Importeer de initialisatie-functies van onze modules
import { initAuth, monitorAuthState } from './auth.js';
import { initNavigation, showPage } from './ui.js'; 
import { setupArtistDashboard } from './artist-dashboard.js';
import { getArtistSignupData, validateArtistSignupData } from './artist-signup-helpers.js';
import { setupProgrammerDashboard } from './programmer-dashboard.js';
import { setupProgrammerProfile } from './programmer-profile.js'; // ⭐ NEW: Import programmer profile
import { setupMessaging } from './messaging.js';

/**
 * initApp
 * De hoofdfunctie die de hele applicatie initialiseert.
 */
function initApp() {
  try {
    console.log("main.js is succesvol geladen...");
    
    // Stel de navigatieknoppen in (Login, Home, etc.)
    initNavigation(); 
    
    // Stel de auth-formulieren in (Login, Signup, Logout knoppen)
    initAuth(); 
    
    // Stel de listener in die kijkt of we in- of uitgelogd zijn
    // Deze verbergt ook de lader en toont de homepagina
    monitorAuthState();
    
    // Stel de listeners in voor het artiesten-dashboard (foto upload, save knop)
    setupArtistDashboard();

    // Stel de listeners in voor het programmeurs-dashboard (zoekknop)
    setupProgrammerDashboard();
    
    // ⭐ NEW: Stel de listeners in voor het programmeurs-profiel (edit profile)
    setupProgrammerProfile();
    
    // Stel de messaging listeners in (send message button, modal)
    setupMessaging();
    
    console.log("Applicatie succesvol geïnitialiseerd.");

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
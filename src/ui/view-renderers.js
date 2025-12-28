/**
 * view-renderers.js
 * Centralized view rendering functions
 * All views are rendered dynamically into #app-content
 */

/**
 * Renders the Home/Welcome view
 */
export function renderHome() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="home-view" class="min-h-screen flex flex-col">
      <!-- Hero Section -->
      <div class="flex-1 flex flex-col justify-center px-6 py-12 bg-gradient-to-br from-indigo-50 to-white">
        <div class="text-center mb-8">
          <div class="mb-6">
            <svg class="h-16 w-16 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              <path d="M12 5 9 8h6l-3-3Z"/>
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            SPOKEN WORD<br/>PLATFORM
          </h1>
          <p class="text-lg text-gray-600 mb-2">Find Your Voice.</p>
          <p class="text-lg text-indigo-600 font-semibold">Book Your Artist.</p>
        </div>

        <div class="space-y-3 max-w-sm mx-auto w-full px-6">
          <button id="home-cta-artist" class="btn-press w-full bg-indigo-600 text-white px-6 py-4 rounded-xl text-base font-semibold shadow-lg hover:bg-indigo-700 transition duration-200">
            Ik ben een Artiest
          </button>
          <button id="home-cta-programmer" class="btn-press w-full bg-gray-900 text-white px-6 py-4 rounded-xl text-base font-semibold shadow-lg hover:bg-gray-800 transition duration-200">
            Ik ben een Programmator
          </button>
          <button id="home-login-btn" class="btn-press w-full bg-white text-gray-900 px-6 py-4 rounded-xl text-base font-semibold border border-gray-300 hover:bg-gray-50 transition duration-200">
            Inloggen
          </button>
        </div>
      </div>

      <!-- Featured Artists Preview -->
      <div class="px-6 py-8 bg-white">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Featured Artists</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex-shrink-0"></div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">Artist Name</h4>
              <p class="text-sm text-indigo-600">Performance Poetry</p>
              <p class="text-xs text-gray-500 mt-1">Amsterdam</p>
            </div>
          </div>
          <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex-shrink-0"></div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">Stage Name</h4>
              <p class="text-sm text-indigo-600">Poetry Slam</p>
              <p class="text-xs text-gray-500 mt-1">Brussels</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Version Badge -->
      <div class="text-center py-6 text-xs text-gray-400">
        Release v2.5 [Final Build] - 23-12-2025
      </div>
    </div>
  `;
}

/**
 * Renders the Login view
 * Clean, standard implementation with proper form submission
 * Uses global event delegation via setupGlobalFormHandlers()
 */
export function renderLogin() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="login-view" class="min-h-screen flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Welkom terug</h2>
          <p class="text-gray-600">Log in op je account</p>
        </div>

        <form id="login-form" class="space-y-4">
          <div>
            <label for="login-email" class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input id="login-email" name="email" type="email" autocomplete="email" required
              class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <div>
            <label for="login-password" class="block text-sm font-semibold text-gray-700 mb-2">Wachtwoord</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" required
              class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
          </div>
          <button type="submit" id="login-submit-btn"
            class="w-full py-3 px-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-6">
            Inloggen
          </button>
          <p id="login-error" class="text-red-500 text-sm mt-2 text-center"></p>
        </form>

        <div class="mt-6 text-center">
          <button id="back-to-home-from-login" class="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors">
            ← Terug naar home
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Signup Choice view
 */
export function renderSignup() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="signup-view" class="min-h-screen flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-8">Meld je aan als...</h2>
        <div class="space-y-4">
          <button id="signup-choice-artist" class="btn-press w-full py-4 px-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700">
            Artiest / Spoken Word Member
          </button>
          <button id="signup-choice-programmer" class="btn-press w-full py-4 px-4 rounded-xl text-base font-semibold text-white bg-gray-900 hover:bg-gray-800">
            Programmator / Organisatie
          </button>
        </div>
        <div class="mt-6 text-center">
          <button id="back-to-home-from-signup" class="text-indigo-600 text-sm font-medium">
            ← Terug naar home
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Artist Signup Form view
 */
export function renderArtistSignup() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="artist-signup-view">
      <div class="px-6 py-8">
        <div class="mb-6">
          <button id="back-from-artist-signup" class="text-indigo-600 text-sm font-medium mb-4">
            ← Terug
          </button>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Maak je Artiest Profiel</h2>
          <p class="text-gray-600 text-sm">Vul zoveel mogelijk in. Je kunt later meer toevoegen.</p>
        </div>

        <form id="artist-signup-form" class="space-y-6">
          <!-- Account Credentials -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 text-gray-900">Account Details</h3>
            <div class="space-y-4">
              <div>
                <label for="artist-email" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input id="artist-email" type="email" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="artist-password" class="block text-sm font-semibold text-gray-700 mb-2">Wachtwoord (min. 6 tekens) *</label>
                <input id="artist-password" type="password" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
          </div>

          <!-- Personal Details -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 text-gray-900">Persoonlijke Gegevens</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="artist-firstname" class="block text-sm font-semibold text-gray-700 mb-2">Voornaam *</label>
                  <input id="artist-firstname" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label for="artist-lastname" class="block text-sm font-semibold text-gray-700 mb-2">Achternaam *</label>
                  <input id="artist-lastname" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>
              <div>
                <label for="artist-stagename" class="block text-sm font-semibold text-gray-700 mb-2">Artiestennaam</label>
                <input id="artist-stagename" type="text" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="artist-phone" class="block text-sm font-semibold text-gray-700 mb-2">Telefoon *</label>
                <input id="artist-phone" type="tel" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="artist-dob" class="block text-sm font-semibold text-gray-700 mb-2">Geboortedatum *</label>
                <input id="artist-dob" type="date" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="artist-gender" class="block text-sm font-semibold text-gray-700 mb-2">Geslacht *</label>
                <select id="artist-gender" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Selecteer...</option>
                  <option value="f">Vrouw</option>
                  <option value="m">Man</option>
                  <option value="x">Anders / Wil niet zeggen</option>
                </select>
              </div>
              <div>
                <label for="artist-location" class="block text-sm font-semibold text-gray-700 mb-2">Locatie *</label>
                <input id="artist-location" type="text" required placeholder="bijv. Amsterdam, Nederland" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
          </div>

          <!-- Professional Details -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 text-gray-900">Professionele Details</h3>

            <!-- Genres -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-3">Genres (selecteer meerdere) *</label>
              <div class="space-y-2">
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="performance-poetry" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Performance Poetry</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="poetry-slam" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Poetry Slam</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="jazz-poetry" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Jazz Poetry</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="rap" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Rap</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="storytelling" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Storytelling</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="comedy" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Comedy</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-genres" value="1-on-1" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">1-op-1 Sessies</span>
                </label>
              </div>
            </div>

            <!-- Languages -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-3">Talen (selecteer meerdere) *</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-languages" value="nl" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Nederlands</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-languages" value="en" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Engels</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-languages" value="fr" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Frans</span>
                </label>
              </div>
            </div>

            <!-- Payment Methods -->
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-3">Betaalmethoden *</label>
              <div class="space-y-2">
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-payment" value="invoice" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Factuur</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-payment" value="payrolling" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Payrolling</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-payment" value="sbk" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Anders (SBK)</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-payment" value="volunteer-fee" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Vrijwilligersvergoeding</span>
                </label>
                <label class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <input type="checkbox" name="artist-payment" value="other" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500">
                  <span class="text-sm font-medium">Anders</span>
                </label>
              </div>
            </div>

            <!-- Bio & Pitch -->
            <div class="space-y-4">
              <div>
                <label for="artist-bio" class="block text-sm font-semibold text-gray-700 mb-2">Bio *</label>
                <textarea id="artist-bio" rows="4" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
              <div>
                <label for="artist-pitch" class="block text-sm font-semibold text-gray-700 mb-2">Pitch *</label>
                <textarea id="artist-pitch" rows="2" required placeholder="Korte samenvatting voor programmatoren" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="space-y-3">
              <label class="flex items-start space-x-3">
                <input id="artist-notify-email" type="checkbox" checked class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5">
                <span class="text-sm text-gray-700">OK om email notificaties te ontvangen</span>
              </label>
              <label class="flex items-start space-x-3">
                <input id="artist-notify-sms" type="checkbox" class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5">
                <span class="text-sm text-gray-700">OK om SMS notificaties te ontvangen</span>
              </label>
              <label class="flex items-start space-x-3">
                <input id="artist-terms" type="checkbox" required class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5">
                <span class="text-sm text-gray-700">Ik ga akkoord met de <a href="#" class="font-semibold text-indigo-600">Algemene Voorwaarden</a> *</span>
              </label>
            </div>
          </div>

          <button type="submit"
            class="btn-press w-full py-4 px-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
            Account Aanmaken
          </button>
          <p id="artist-signup-error" class="text-red-500 text-sm mt-2 text-center"></p>
        </form>
      </div>
    </div>
  `;
}

/**
 * Renders the Programmer Signup Form view
 */
export function renderProgrammerSignup() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="programmer-signup-view">
      <div class="px-6 py-8">
        <div class="mb-6">
          <button id="back-from-programmer-signup" class="text-indigo-600 text-sm font-medium mb-4">
            ← Terug
          </button>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Maak je Programmator Account</h2>
          <p class="text-gray-600 text-sm">Start je 7-daagse gratis proefperiode.</p>
        </div>

        <form id="programmer-signup-form" class="space-y-6">
          <!-- Account Details -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 text-gray-900">Account Details</h3>
            <div class="space-y-4">
              <div>
                <label for="prog-email" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input id="prog-email" type="email" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="prog-password" class="block text-sm font-semibold text-gray-700 mb-2">Wachtwoord (min. 6 tekens) *</label>
                <input id="prog-password" type="password" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>
          </div>

          <!-- Organization Details -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <h3 class="text-lg font-bold mb-4 text-gray-900">Organisatie Details</h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="prog-firstname" class="block text-sm font-semibold text-gray-700 mb-2">Voornaam *</label>
                  <input id="prog-firstname" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
                <div>
                  <label for="prog-lastname" class="block text-sm font-semibold text-gray-700 mb-2">Achternaam *</label>
                  <input id="prog-lastname" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>
              </div>
              <div>
                <label for="prog-org-name" class="block text-sm font-semibold text-gray-700 mb-2">Organisatie Naam *</label>
                <input id="prog-org-name" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="prog-phone" class="block text-sm font-semibold text-gray-700 mb-2">Telefoon *</label>
                <input id="prog-phone" type="tel" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="prog-website" class="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                <input id="prog-website" type="url" placeholder="https://..." class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label for="prog-org-about" class="block text-sm font-semibold text-gray-700 mb-2">Over Organisatie</label>
                <textarea id="prog-org-about" rows="3" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="space-y-3">
              <label class="flex items-start space-x-3">
                <input id="prog-notify-email" type="checkbox" checked class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5">
                <span class="text-sm text-gray-700">OK om email notificaties te ontvangen</span>
              </label>
              <label class="flex items-start space-x-3">
                <input id="prog-terms" type="checkbox" required class="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5">
                <span class="text-sm text-gray-700">Ik ga akkoord met de <a href="#" class="font-semibold text-indigo-600">Algemene Voorwaarden</a> *</span>
              </label>
            </div>
          </div>

          <button type="submit"
            class="btn-press w-full py-4 px-4 rounded-xl text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none">
            Start Gratis Proefperiode
          </button>
          <p id="programmer-signup-error" class="text-red-500 text-sm mt-2 text-center"></p>
        </form>
      </div>
    </div>
  `;
}

/**
 * Renders the Messages view
 */
export function renderMessages() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="messages-view">
      <div class="h-screen flex flex-col">
        <div class="px-6 py-4 bg-white border-b border-gray-200">
          <h2 class="text-2xl font-bold text-gray-900">Berichten</h2>
        </div>

        <div class="flex flex-1 min-h-0">
          <!-- Conversation List -->
          <div class="w-full md:w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
            <div id="conversations-loading" class="p-4 text-gray-500 text-center">
              <!-- Loading skeleton inserted by JS -->
            </div>
            <div id="conversations-empty" class="p-8 text-center hidden">
              <div class="flex flex-col items-center justify-center py-12">
                <svg class="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Geen berichten</h3>
                <p class="text-sm text-gray-500 max-w-xs">Je hebt nog geen gesprekken. Stuur een bericht naar een artiest om te beginnen!</p>
              </div>
            </div>
            <div id="conversations-list" class="divide-y divide-gray-200 hidden">
              <!-- Conversations will be loaded here -->
            </div>
          </div>

          <!-- Chat Area (hidden on mobile, shown when conversation selected) -->
          <div class="hidden md:flex w-2/3 flex-col min-h-0">
            <div id="chat-placeholder" class="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
              <p>Selecteer een gesprek</p>
            </div>

            <div id="chat-container" class="hidden flex-1 flex flex-col min-h-0">
              <!-- Chat Header -->
              <div id="chat-header" class="p-4 border-b border-gray-200 bg-white">
                <h3 class="text-lg font-semibold text-gray-900">Gesprek</h3>
              </div>

              <!-- Messages -->
              <div id="messages-container" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                <!-- Messages will be inserted here -->
              </div>

              <!-- Message Input -->
              <div class="p-4 border-t border-gray-200 bg-white">
                <form id="message-form" class="flex space-x-2">
                  <input id="message-input" type="text" placeholder="Type je bericht..."
                    class="flex-1 px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                  <button type="submit" class="btn-press bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">
                    Verstuur
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Account Settings view
 */
export function renderAccountSettings() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="account-settings-view" class="min-h-screen bg-gray-50 py-8 px-6">
      <div class="max-w-3xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 tracking-tight mb-2">Account Settings</h1>
          <p class="text-gray-600">Manage your email and password</p>
        </div>

        <!-- Change Email Section -->
        <div class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div class="mb-6 pb-6 border-b border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Change Email</h2>
            <p class="text-sm text-gray-500 mt-1">Update your account email address</p>
          </div>

          <form id="change-email-form" class="space-y-4">
            <div>
              <label for="new-email" class="block text-sm font-semibold text-gray-700 mb-2">New Email Address</label>
              <input id="new-email" type="email" required
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     placeholder="your.new.email@example.com">
            </div>
            <div>
              <label for="confirm-email-password" class="block text-sm font-semibold text-gray-700 mb-2">Current Password (for verification)</label>
              <input id="confirm-email-password" type="password" required
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     placeholder="Enter your current password">
            </div>
            <button type="submit"
                    class="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow">
              Update Email
            </button>
            <p id="email-success" class="text-green-600 text-sm text-center"></p>
            <p id="email-error" class="text-red-600 text-sm text-center"></p>
          </form>
        </div>

        <!-- Change Password Section -->
        <div class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <div class="mb-6 pb-6 border-b border-gray-100">
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">Change Password</h2>
            <p class="text-sm text-gray-500 mt-1">Update your account password</p>
          </div>

          <form id="change-password-form" class="space-y-4">
            <div>
              <label for="current-password" class="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input id="current-password" type="password" required
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     placeholder="Enter your current password">
            </div>
            <div>
              <label for="new-password" class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input id="new-password" type="password" required minlength="6"
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     placeholder="Enter new password (min. 6 characters)">
            </div>
            <div>
              <label for="confirm-password" class="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
              <input id="confirm-password" type="password" required minlength="6"
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     placeholder="Confirm new password">
            </div>
            <button type="submit"
                    class="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-sm hover:shadow">
              Update Password
            </button>
            <p id="password-success" class="text-green-600 text-sm text-center"></p>
            <p id="password-error" class="text-red-600 text-sm text-center"></p>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the Dashboard view (wrapper for artist/programmer dashboards)
 */
export function renderDashboard() {
  const appContent = document.getElementById('app-content');
  appContent.innerHTML = `
    <div id="dashboard-view">
      <!-- Artist Dashboard -->
      <div id="artist-dashboard" class="hidden">
        <!-- Content rendered by renderArtistDashboard() in artist-dashboard.js -->
      </div>

      <!-- Programmer Dashboard -->
      <div id="programmer-dashboard">
        <!-- Content rendered by renderProgrammerDashboard() in programmer-dashboard.js -->
      </div>

      <!-- Artist Detail View -->
      <div id="artist-detail-view" class="hidden">
        <div class="artist-detail-pattern" style="min-height: 100vh; padding: 24px;">
          <div style="max-width: 1400px; margin: 0 auto;">

            <!-- Back Button -->
            <button id="back-to-search-btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              Terug naar zoeken
            </button>

            <!-- MOBILE ARTIST PROFILE LAYOUT -->
            <div id="mobile-artist-detail" class="lg:hidden" style="padding: 0 16px 100px;">

              <!-- Profile Photo -->
              <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                <div style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 3px solid #1a1a2e;">
                  <img id="mobile-detail-photo" src="" alt="Artist" style="width: 100%; height: 100%; object-fit: cover; background: #f3f4f6;">
                </div>
              </div>

              <!-- Name -->
              <h1 id="mobile-detail-name" style="font-size: 28px; font-weight: 700; color: #1a1a2e; text-align: center; margin-bottom: 16px;">Artist Name</h1>

              <!-- Meta Info -->
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; color: #4a4a68; font-size: 15px;">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span id="mobile-detail-age">-- years old</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; color: #4a4a68; font-size: 15px;">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span id="mobile-detail-gender">Gender</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; color: #4a4a68; font-size: 15px;">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span id="mobile-detail-location">Location</span>
                </div>
              </div>

              <!-- Genres -->
              <div style="margin-bottom: 20px;">
                <p style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 10px;">Genres</p>
                <div id="mobile-detail-genres" style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <!-- Genre badges -->
                </div>
              </div>

              <!-- Languages -->
              <div style="margin-bottom: 24px;">
                <p style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 10px;">Languages</p>
                <div id="mobile-detail-languages" style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <!-- Language badges -->
                </div>
              </div>

              <!-- Biography -->
              <div style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Biography</h2>
                <p id="mobile-detail-bio" style="font-size: 15px; color: #4a4a68; line-height: 1.6;">No biography available.</p>
              </div>

              <!-- Pitch -->
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Pitch</h2>
                <p id="mobile-detail-pitch" style="font-size: 15px; color: #4a4a68; line-height: 1.6;">No pitch available.</p>
              </div>

              <!-- Contact Information -->
              <div style="margin-bottom: 24px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px;">Contact Information</h2>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div id="mobile-detail-email-container" style="display: flex; align-items: center; gap: 10px;">
                    <svg width="18" height="18" fill="none" stroke="#4a4a68" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <a id="mobile-detail-email" href="#" style="font-size: 15px; color: #4a4a68; text-decoration: none;">email@example.com</a>
                  </div>
                  <div id="mobile-detail-phone-container" style="display: flex; align-items: center; gap: 10px;">
                    <svg width="18" height="18" fill="none" stroke="#4a4a68" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    <span id="mobile-detail-phone" style="font-size: 15px; color: #4a4a68;">+31 6 12345678</span>
                  </div>
                </div>
              </div>

              <!-- Recommendations -->
              <div>
                <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Recommendations</h2>

                <!-- Write Recommendation Button -->
                <button id="mobile-write-recommendation-btn"
                        style="width: 100%; padding: 14px; background: white; color: #1a1a2e; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 16px;">
                  Write Recommendation
                </button>

                <!-- Recommendation Cards -->
                <div id="mobile-detail-recommendations" style="display: flex; flex-direction: column; gap: 12px;">
                  <!-- Recommendation cards will be injected here -->
                </div>
              </div>

            </div>

            <!-- DESKTOP 3-COLUMN LAYOUT -->
            <div class="hidden lg:grid" style="grid-template-columns: 280px 1fr 320px; gap: 24px; align-items: start;">

              <!-- LEFT COLUMN: Media Gallery -->
              <aside style="background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(128,90,213,0.08); border: 1px solid rgba(128,90,213,0.1);">
                <h2 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px;">Media Gallery</h2>

                <div id="detail-media-gallery" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                  <!-- Media items will be injected here -->
                  <div style="aspect-ratio: 1; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #9ca3af; font-size: 13px;">Geen media</span>
                  </div>
                </div>
              </aside>

              <!-- MIDDLE COLUMN: Artist Profile -->
              <main style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(128,90,213,0.08); border: 1px solid rgba(128,90,213,0.1);">

                <!-- Profile Header -->
                <div style="display: flex; gap: 24px; margin-bottom: 24px;">

                  <!-- Profile Photo -->
                  <div style="flex-shrink: 0;">
                    <div style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 4px solid #805ad5;">
                      <img id="detail-profile-pic" src="" alt="Artist" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                  </div>

                  <!-- Profile Info -->
                  <div style="flex: 1;">
                    <h1 id="detail-artist-name" style="font-size: 32px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px;">Artist Name</h1>

                    <!-- Meta Info -->
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
                      <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span id="detail-age">-- years old</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        <span id="detail-gender">Gender</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        <span id="detail-location">Location</span>
                      </div>
                    </div>

                    <!-- Genres -->
                    <div style="margin-bottom: 12px;">
                      <p style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Genres</p>
                      <div id="detail-genres" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <!-- Genre badges -->
                      </div>
                    </div>

                    <!-- Languages -->
                    <div>
                      <p style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Languages</p>
                      <div id="detail-languages" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        <!-- Language badges -->
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Biography Section -->
                <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e9e3f5;">
                  <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px;">Biography</h3>
                  <p id="detail-bio" style="font-size: 14px; color: #4a4a68; line-height: 1.7;">No biography available.</p>

                  <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 20px 0 12px;">Pitch</h3>
                  <p id="detail-pitch" style="font-size: 14px; color: #4a4a68; line-height: 1.7;">No pitch available.</p>
                </div>

                <!-- Contact Information -->
                <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e9e3f5;">
                  <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Contact Information</h3>
                  <div style="display: flex; flex-wrap: wrap; gap: 24px;">
                    <div id="detail-email-container" style="display: flex; align-items: center; gap: 10px;">
                      <svg width="18" height="18" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <a id="detail-email" href="#" style="font-size: 14px; color: #4a4a68; text-decoration: none;">email@example.com</a>
                    </div>
                    <div id="detail-phone-container" style="display: flex; align-items: center; gap: 10px;">
                      <svg width="18" height="18" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      <span id="detail-phone" style="font-size: 14px; color: #4a4a68;">+31 6 12345678</span>
                    </div>
                  </div>
                </div>

                <!-- Recommendations Section -->
                <div>
                  <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Recommendations</h3>
                  <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                    <button id="write-recommendation-btn" style="padding: 10px 20px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                      Write Recommendation
                    </button>
                    <button id="view-recommendations-btn" style="padding: 10px 20px; background: white; color: #1a1a2e; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                      View All Recommendations
                    </button>
                  </div>
                  <div id="detail-recommendations" style="display: flex; flex-direction: column; gap: 12px;">
                    <!-- Recommendation cards will be injected here -->
                  </div>
                </div>

              </main>

              <!-- RIGHT COLUMN: Chat Panel -->
              <aside style="background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(128,90,213,0.08); border: 1px solid rgba(128,90,213,0.1); display: flex; flex-direction: column; height: calc(100vh - 150px); position: sticky; top: 100px;">

                <!-- Chat Header -->
                <div style="padding: 20px 24px; border-bottom: 1px solid #e9e3f5;">
                  <h2 id="chat-header-name" style="font-size: 18px; font-weight: 700; color: #1a1a2e;">Chat met Artist</h2>
                </div>

                <!-- Chat Messages -->
                <div id="profile-chat-messages" style="flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px;">
                  <!-- Messages will be injected here -->
                  <div id="chat-empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-bottom: 12px; opacity: 0.5;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    <p style="font-size: 14px;">Start een gesprek</p>
                  </div>
                </div>

                <!-- Chat Input -->
                <div style="padding: 16px 24px; border-top: 1px solid #e9e3f5;">
                  <form id="profile-chat-form" style="display: flex; gap: 12px;">
                    <input type="text" id="profile-chat-input" placeholder="Type je bericht..."
                           style="flex: 1; padding: 12px 16px; border: 1px solid #e9e3f5; border-radius: 24px; font-size: 14px; outline: none;">
                    <button type="submit" style="width: 44px; height: 44px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                      <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                  </form>
                </div>

              </aside>

            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

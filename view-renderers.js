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
        Staging v2.0 (Desktop Update) [22-12-2025]
      </div>
    </div>
  `;
}

/**
 * Renders the Login view
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
          <button type="submit"
            class="btn-press w-full py-3 px-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6">
            Inloggen
          </button>
          <p id="login-error" class="text-red-500 text-sm mt-2 text-center"></p>
        </form>

        <div class="mt-6 text-center">
          <button id="back-to-home-from-login" class="text-indigo-600 text-sm font-medium">
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
              Gesprekken laden...
            </div>
            <div id="conversations-empty" class="p-4 text-gray-500 text-center hidden">
              Nog geen gesprekken. Stuur een bericht naar een artiest!
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
      <div id="programmer-dashboard" class="hidden">
        <!-- Content rendered by renderProgrammerDashboard() in programmer-dashboard.js -->
      </div>

      <!-- Artist Detail View -->
      <div id="artist-detail-view" class="hidden">
        <!-- Artist detail content will be rendered here -->
      </div>
    </div>
  `;
}

/**
 * artist-search.js
 * Manages the complete artist search functionality:
 * - Filters (Genres, Payment, Languages, Age, Location, etc.)
 * - Firestore queries with client-side filtering
 * - Artist result cards
 * - Artist detail view with materials
 * - Browser history management
 */

import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from './firebase.js';
import { getStore } from './store.js';
import { openMessageModal } from './messaging.js';
import { loadRecommendations, openRecommendationModal } from './recommendations.js';

/**
 * Security: Check if user is authenticated as a programmer
 * @returns {boolean} True if authenticated programmer, false otherwise
 */
function isAuthenticatedProgrammer() {
  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');
  const userRole = currentUserData?.role;

  // DEBUG: Log wat we hebben
  console.log('[AUTH CHECK] currentUser:', currentUser ? 'EXISTS (uid: ' + currentUser.uid + ')' : 'NULL');
  console.log('[AUTH CHECK] userRole:', userRole);

  if (!currentUser) {
    console.warn("[AUTH CHECK] ❌ Access denied: No currentUser in store");
    return false;
  }

  if (userRole !== 'programmer') {
    console.warn("[AUTH CHECK] ❌ Access denied: userRole is not 'programmer', got:", userRole);
    return false;
  }

  console.log("[AUTH CHECK] ✅ Authentication passed - User is authenticated programmer");
  return true;
}

/**
 * Security: Require authentication for sensitive operations
 * Redirects to login if not authenticated
 */
function requireAuth() {
  console.log("[REQUIRE AUTH] Checking authentication...");

  if (!isAuthenticatedProgrammer()) {
    console.error("[REQUIRE AUTH] ❌ Access denied: Redirecting to login");
    console.error("[REQUIRE AUTH] TIP: Check if auth.js properly sets store values:");
    console.error("[REQUIRE AUTH]   - setStore('currentUser', user)");
    console.error("[REQUIRE AUTH]   - setStore('userRole', 'programmer')");

    alert("You must be logged in as a programmer to access this page.");

    // Hide all content
    const programmerDashboard = document.getElementById('programmer-dashboard');
    const artistDetailView = document.getElementById('artist-detail-view');

    if (programmerDashboard) programmerDashboard.classList.add('hidden');
    if (artistDetailView) artistDetailView.classList.add('hidden');

    // Show login page
    const loginView = document.getElementById('login-view');
    if (loginView) {
      loginView.style.display = 'block';
    }

    return false;
  }

  console.log("[REQUIRE AUTH] ✅ Auth check passed");
  return true;
}

/**
 * Render the artist search view HTML
 * Dynamically injects the search filters and results container
 */
export function renderArtistSearch() {
  const searchSection = document.getElementById('artist-search-section');
  if (!searchSection) {
    console.error('[RENDER ARTIST SEARCH] artist-search-section not found!');
    return;
  }

  // ✅ CLEAN SEARCH VIEW: Hide profile sections to focus on search
  const profileOverview = document.getElementById('programmer-profile-overview');
  const publicPreview = document.getElementById('programmer-public-preview');
  const profileEditor = document.getElementById('programmer-profile-editor');

  if (profileOverview) {
    profileOverview.style.display = 'none';
    profileOverview.classList.add('hidden');
  }
  if (publicPreview) {
    publicPreview.style.display = 'none';
    publicPreview.classList.add('hidden');
  }
  if (profileEditor) {
    profileEditor.style.display = 'none';
    profileEditor.classList.add('hidden');
  }

  searchSection.innerHTML = `
    <h3 class="text-2xl font-semibold mb-4" data-i18n="search_for_artists">Search for Artists</h3>

    <!-- Toggle Filters Button (Mobile Only) -->
    <button id="toggle-filters-btn" class="md:hidden w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium mb-4 flex items-center justify-between">
      <span>Show Filters</span>
      <i data-lucide="chevron-down" class="h-5 w-5"></i>
    </button>

    <!-- Filter UI -->
    <div id="filters-container" class="space-y-3 md:space-y-6 mb-4 md:mb-6 hidden md:block">
        <!-- Text Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            <input id="filter-name" type="text" class="px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" data-i18n="filter_name" placeholder="Name...">
            <input id="filter-location" type="text" class="px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" data-i18n="filter_location" placeholder="Location...">

            <select id="filter-gender" class="px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="" data-i18n="filter_all_genders">All Genders</option>
                <option value="f" data-i18n="filter_female">Female</option>
                <option value="m" data-i18n="filter_male">Male</option>
                <option value="x" data-i18n="filter_other">Other</option>
            </select>
        </div>

        <!-- Age Filter -->
        <div class="flex items-center space-x-2 md:space-x-4">
            <label class="text-sm md:text-base font-medium text-gray-700" data-i18n="filter_age_range">Age Range:</label>
            <input id="filter-age-min" type="number" class="w-16 md:w-24 px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" data-i18n="filter_age_min" placeholder="Min">
            <span class="text-sm md:text-base text-gray-500">to</span>
            <input id="filter-age-max" type="number" class="w-16 md:w-24 px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" data-i18n="filter_age_max" placeholder="Max">
        </div>

        <!-- Checkbox Filters (Mobile: Compact, Desktop: Grid) -->
        <div class="md:grid md:grid-cols-3 md:gap-6 space-y-2 md:space-y-0">
            <!-- Genres -->
            <div>
                <label class="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2" data-i18n="filter_genres">Genres:</label>
                <div class="space-y-0.5 md:space-y-1 max-h-32 md:max-h-none overflow-y-auto md:overflow-visible">
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="performance-poetry" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_performance_poetry">Performance Poetry</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="poetry-slam" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_poetry_slam">Poetry Slam</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="jazz-poetry" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_jazz_poetry">Jazz Poetry</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="rap" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_rap">Rap</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="storytelling" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_storytelling">Storytelling</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="comedy" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_comedy">Comedy</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="genre-filter" value="1-on-1" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="genre_one_on_one">1-op-1 Sessies</span>
                    </label>
                </div>
            </div>

            <!-- Languages -->
            <div>
                <label class="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2" data-i18n="filter_languages">Languages:</label>
                <div class="space-y-0.5 md:space-y-1">
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="language-filter" value="nl" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="lang_dutch">Dutch (NL)</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="language-filter" value="en" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="lang_english">English (EN)</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="language-filter" value="fr" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="lang_french">French (FR)</span>
                    </label>
                </div>
            </div>

            <!-- Payment Methods -->
            <div>
                <label class="block text-sm md:text-base font-medium text-gray-700 mb-1 md:mb-2" data-i18n="filter_payment_methods">Payment Methods:</label>
                <div class="space-y-0.5 md:space-y-1 max-h-32 md:max-h-none overflow-y-auto md:overflow-visible">
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="payment-filter" value="invoice" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="payment_invoice">Invoice</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="payment-filter" value="payrolling" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="payment_payrolling">Payrolling</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="payment-filter" value="sbk" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="payment_sbk">Other (SBK)</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="payment-filter" value="volunteer-fee" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="payment_volunteer_fee">Volunteer Fee</span>
                    </label>
                    <label class="flex items-center py-0.5">
                        <input type="checkbox" name="payment-filter" value="other" class="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                        <span class="ml-1.5 md:ml-2 text-xs md:text-sm text-gray-700" data-i18n="payment_other">Other</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Search Button -->
        <div>
            <button id="search-artists-btn" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 text-lg" data-i18n="search_artists_btn">
                Search Artists
            </button>
        </div>
    </div>

    <!-- Artist List (Results) -->
    <!-- Mobile: Stack vertically with gap-3, Desktop: Grid layout -->
    <div id="artist-list-container" class="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
        <!-- Artist items will be dynamically injected here -->
    </div>
    <p id="artist-list-empty" class="text-gray-500 text-sm md:text-base" data-i18n="no_artists_found">No artists found. Click 'Search' to load all artists or refine your filters.</p>
  `;

  // ✅ RESET: Clear setup flag to allow re-setup after HTML render
  if (searchSection) {
    searchSection.dataset.setupComplete = 'false';
  }

  // CRUCIAL: Re-setup event listeners after rendering
  setupArtistSearch();

  // Re-initialize Lucide icons for the new content
  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.log('[RENDER ARTIST SEARCH] ✅ Artist search view rendered');
}

/**
 * Setup artist search functionality (SECURED)
 * Sets up search button, back button, and browser history
 */
export function setupArtistSearch() {
  console.log("[SETUP ARTIST SEARCH] Starting artist search setup...");

  // ✅ GUARD: Prevent duplicate setup
  const artistSearchSection = document.getElementById('artist-search-section');
  if (artistSearchSection && artistSearchSection.dataset.setupComplete === 'true') {
    console.log("[SETUP ARTIST SEARCH] Already set up, skipping");
    return;
  }

  // Setup toggle filters button (mobile only)
  const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
  const filtersContainer = document.getElementById('filters-container');

  if (toggleFiltersBtn && filtersContainer) {
    toggleFiltersBtn.addEventListener('click', () => {
      const isHidden = filtersContainer.classList.contains('hidden');

      if (isHidden) {
        // Show filters
        filtersContainer.classList.remove('hidden');
        toggleFiltersBtn.innerHTML = '<span>Hide Filters</span><i data-lucide="chevron-up" class="h-5 w-5"></i>';
      } else {
        // Hide filters
        filtersContainer.classList.add('hidden');
        toggleFiltersBtn.innerHTML = '<span>Show Filters</span><i data-lucide="chevron-down" class="h-5 w-5"></i>';
      }

      // Re-initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
    console.log("[SETUP] Toggle filters button listener added");
  }

  // Setup search button
  const searchButton = document.getElementById('search-artists-btn');
  if (searchButton) {
    searchButton.addEventListener('click', loadArtists);
    console.log("[SETUP] Search button listener added");
  } else {
    console.warn("[SETUP] ⚠️ Search button not found in DOM");
  }

  // Setup real-time filtering on filter inputs
  setupFilterListeners();

  // Setup back button for detail view
  const backToSearchBtn = document.getElementById('back-to-search-btn');
  if (backToSearchBtn) {
    backToSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Security check before navigation
      if (!requireAuth()) return;

      showSearchView();
      // Update browser history
      window.history.pushState({ view: 'search' }, '', '#search');
    });
    console.log("[SETUP] Back button listener added");
  }

  // Setup browser back/forward buttons (SECURED)
  setupBrowserHistory();

  // ✅ Mark setup as complete
  if (artistSearchSection) {
    artistSearchSection.dataset.setupComplete = 'true';
  }

  console.log("[SETUP ARTIST SEARCH] ✅ Artist search setup complete");
}

/**
 * Setup filter change listeners for real-time filtering
 */
function setupFilterListeners() {
  // Text inputs
  const filterName = document.getElementById('filter-name');
  const filterLocation = document.getElementById('filter-location');
  const filterGender = document.getElementById('filter-gender');
  const filterAgeMin = document.getElementById('filter-age-min');
  const filterAgeMax = document.getElementById('filter-age-max');

  // Checkboxes
  const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]');
  const languageCheckboxes = document.querySelectorAll('input[name="language-filter"]');
  const paymentCheckboxes = document.querySelectorAll('input[name="payment-filter"]');

  // Add debounced event listeners to text inputs
  let debounceTimer;
  const debouncedSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadArtists();
    }, 500); // Wait 500ms after user stops typing
  };

  if (filterName) filterName.addEventListener('input', debouncedSearch);
  if (filterLocation) filterLocation.addEventListener('input', debouncedSearch);
  if (filterGender) filterGender.addEventListener('change', loadArtists);
  if (filterAgeMin) filterAgeMin.addEventListener('input', debouncedSearch);
  if (filterAgeMax) filterAgeMax.addEventListener('input', debouncedSearch);

  // Add event listeners to checkboxes (immediate filtering)
  genreCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', loadArtists);
  });

  languageCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', loadArtists);
  });

  paymentCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', loadArtists);
  });

  console.log("[SETUP] Filter listeners added for real-time filtering");
}

/**
 * Setup browser history management (SECURED)
 */
function setupBrowserHistory() {
  // Handle browser back/forward buttons with security
  window.addEventListener('popstate', (event) => {
    console.log("Popstate event:", event.state);

    // Security check: Block if not authenticated
    if (!isAuthenticatedProgrammer()) {
      console.error("Popstate blocked: User not authenticated");

      // Redirect to login
      const loginView = document.getElementById('login-view');
      if (loginView) {
        loginView.style.display = 'block';
      }

      // Hide programmer views
      document.getElementById('programmer-dashboard')?.classList.add('hidden');
      document.getElementById('artist-detail-view')?.classList.add('hidden');

      return;
    }

    if (event.state) {
      if (event.state.view === 'search') {
        showSearchView();
      } else if (event.state.view === 'artist-detail' && event.state.artistId) {
        showArtistDetail(event.state.artistId, false); // false = don't push to history again
      }
    } else {
      // No state, probably initial page load or back to main
      showSearchView();
    }
  });

  // Set initial state
  if (!window.history.state) {
    window.history.replaceState({ view: 'search' }, '', '#search');
  }
}

/**
 * Load artists with filters (SECURED + FIXED v2 - Normalize spaces/dashes)
 */
export async function loadArtists() {
  console.log("[LOAD ARTISTS] Function called");

  // Security check: Only allow authenticated programmers
  if (!requireAuth()) {
    console.error("[LOAD ARTISTS] ❌ Load artists blocked: Authentication required");
    return;
  }

  console.log("[LOAD ARTISTS] ✅ Auth check passed, loading artists...");

  const resultsContainer = document.getElementById('artist-list-container');
  const noResultsDiv = document.getElementById('artist-list-empty');

  if (!resultsContainer) {
    console.error("[LOAD ARTISTS] ❌ ERROR: artist-list-container not found!");
    return;
  }

  // Show loading state
  resultsContainer.innerHTML = '<p class="text-gray-500">Loading artists...</p>';
  if (noResultsDiv) noResultsDiv.style.display = 'none';

  // Helper function to normalize values (lowercase + replace spaces with dashes)
  const normalize = (value) => {
    return value.toLowerCase().replace(/\s+/g, '-');
  };

  try {
    // Get filter values
    const nameFilter = document.getElementById('filter-name')?.value.toLowerCase().trim() || '';
    const locationFilter = document.getElementById('filter-location')?.value.toLowerCase().trim() || '';
    const genderFilter = document.getElementById('filter-gender')?.value || '';

    // Payment filter (using checkboxes)
    const paymentCheckboxes = document.querySelectorAll('input[name="payment-filter"]:checked');
    const paymentFilters = Array.from(paymentCheckboxes).map(cb => normalize(cb.value));

    // Genre filter (using checkboxes)
    const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]:checked');
    const genreFilters = Array.from(genreCheckboxes).map(cb => normalize(cb.value));

    // Language filter (using checkboxes)
    const languageCheckboxes = document.querySelectorAll('input[name="language-filter"]:checked');
    const languageFilters = Array.from(languageCheckboxes).map(cb => cb.value.toLowerCase());

    // Age range filter
    const ageMinInput = document.getElementById('filter-age-min')?.value;
    const ageMaxInput = document.getElementById('filter-age-max')?.value;
    const ageMin = ageMinInput ? parseInt(ageMinInput) : null;
    const ageMax = ageMaxInput ? parseInt(ageMaxInput) : null;

    console.log("🔍 Filter values:", {
      nameFilter,
      locationFilter,
      genderFilter,
      paymentFilters,
      genreFilters,
      languageFilters,
      ageRange: ageMin !== null || ageMax !== null ? `${ageMin || 'any'}-${ageMax || 'any'}` : 'not set'
    });

    // Build Firestore query
    let q = query(collection(db, 'artists'), where('published', '==', true));

    // Add gender filter if selected
    if (genderFilter) {
      q = query(q, where('gender', '==', genderFilter));
    }

    // Fetch all artists
    const snapshot = await getDocs(q);
    console.log(`📊 Found ${snapshot.size} artists before client-side filtering`);

    let artists = [];
    snapshot.forEach((doc) => {
      artists.push({ id: doc.id, ...doc.data() });
    });

    // Exclude current user if they are also an artist (prevents showing own profile)
    const currentUser = getStore('currentUser');
    if (currentUser) {
      const beforeCount = artists.length;
      artists = artists.filter(artist => artist.id !== currentUser.uid);
      if (beforeCount > artists.length) {
        console.log(`🚫 Filtered out current user's own profile`);
      }
    }

    // DEBUG: Log first artist's data structure
    if (artists.length > 0) {
      console.log("📋 Sample artist data:", {
        id: artists[0].id,
        stageName: artists[0].stageName,
        genres: artists[0].genres,
        genresNormalized: artists[0].genres?.map(g => normalize(g)),
        paymentMethods: artists[0].paymentMethods,
        paymentsNormalized: artists[0].paymentMethods?.map(p => normalize(p)),
        languages: artists[0].languages
      });
    }

    // Client-side filtering

    // Filter by name (stage name or full name)
    if (nameFilter) {
      artists = artists.filter(artist => {
        const stageName = (artist.stageName || '').toLowerCase();
        const fullName = `${artist.firstName || ''} ${artist.lastName || ''}`.toLowerCase();
        return stageName.includes(nameFilter) || fullName.includes(nameFilter);
      });
      console.log(`🔍 After name filter: ${artists.length} artists`);
    }

    // Filter by location
    if (locationFilter) {
      artists = artists.filter(artist => {
        const location = (artist.location || '').toLowerCase();
        return location.includes(locationFilter);
      });
      console.log(`📍 After location filter: ${artists.length} artists`);
    }

    // Filter by payment methods (checkboxes - any match)
    if (paymentFilters.length > 0) {
      console.log(`💳 Filtering by payment methods:`, paymentFilters);

      artists = artists.filter(artist => {
        const artistPayments = (artist.paymentMethods || []).map(p => normalize(p));

        // DEBUG: Log comparison for first artist
        if (artists.indexOf(artist) === 0) {
          console.log(`  Artist payment methods (normalized):`, artistPayments);
          console.log(`  Filter payment methods (normalized):`, paymentFilters);
        }

        // Artist must have at least one of the selected payment methods
        const hasMatch = paymentFilters.some(payment => artistPayments.includes(payment));
        return hasMatch;
      });

      console.log(`💳 After payment filter: ${artists.length} artists`);
    }

    // Filter by genres (checkboxes - any match)
    if (genreFilters.length > 0) {
      console.log(`🎭 Filtering by genres:`, genreFilters);

      artists = artists.filter(artist => {
        const artistGenres = (artist.genres || []).map(g => normalize(g));

        // DEBUG: Log comparison for first artist
        if (artists.indexOf(artist) === 0) {
          console.log(`  Artist genres (normalized):`, artistGenres);
          console.log(`  Filter genres (normalized):`, genreFilters);
        }

        // Artist must have at least one of the selected genres
        const hasMatch = genreFilters.some(genre => artistGenres.includes(genre));
        return hasMatch;
      });

      console.log(`🎭 After genre filter: ${artists.length} artists`);
    }

    // Filter by languages (checkboxes - any match)
    if (languageFilters.length > 0) {
      console.log(`🗣️ Filtering by languages:`, languageFilters);

      artists = artists.filter(artist => {
        const artistLanguages = (artist.languages || []).map(l => l.toLowerCase());

        // DEBUG: Log comparison for first artist
        if (artists.indexOf(artist) === 0) {
          console.log(`  Artist languages (lowercase):`, artistLanguages);
          console.log(`  Filter languages (lowercase):`, languageFilters);
        }

        // Artist must have at least one of the selected languages
        const hasMatch = languageFilters.some(lang => artistLanguages.includes(lang));
        return hasMatch;
      });

      console.log(`🗣️ After language filter: ${artists.length} artists`);
    }

    // Filter by age (only if age filters are set)
    if (ageMin !== null || ageMax !== null) {
      artists = artists.filter(artist => {
        if (!artist.dob) return false; // Exclude artists without birthdate when age filter is active

        const age = calculateAge(artist.dob);
        const meetsMin = ageMin === null || age >= ageMin;
        const meetsMax = ageMax === null || age <= ageMax;
        return meetsMin && meetsMax;
      });
      console.log(`🎂 After age filter: ${artists.length} artists`);
    }

    console.log(`✅ ${artists.length} artists after all filtering`);

    // Display results
    if (artists.length === 0) {
      resultsContainer.innerHTML = '';
      if (noResultsDiv) noResultsDiv.style.display = 'block';
    } else {
      if (noResultsDiv) noResultsDiv.style.display = 'none';
      renderArtists(artists);
    }

  } catch (error) {
    console.error("❌ Error loading artists:", error);
    console.error("Full error details:", error);

    // Check if it's a Firestore index error
    if (error.message && error.message.includes('index')) {
      console.error("🔗 FIRESTORE INDEX REQUIRED!");
      console.error("Click this link to create the index:", error.message.match(/https:\/\/[^\s]+/)?.[0]);
    }

    resultsContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800 font-semibold">Error loading artists</p>
        <p class="text-red-600 text-sm mt-2">${error.message}</p>
        ${error.message.includes('index') ?
          `<p class="text-red-600 text-sm mt-2">Please check the console for a link to create the required Firestore index.</p>` :
          ''}
      </div>
    `;
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob) {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Setup event delegation for artist card clicks
 * ✅ FIX: Uses event delegation on container to handle dynamic cards
 */
function setupArtistCardClickHandlers() {
  const resultsContainer = document.getElementById('artist-list-container');
  if (!resultsContainer) {
    console.warn('[ARTIST CARDS] Results container not found');
    return;
  }

  // Check if listener already attached
  if (resultsContainer.dataset.clickHandlerAttached === 'true') {
    console.log('[ARTIST CARDS] Click handler already attached');
    return;
  }

  // Use event delegation on the container
  resultsContainer.addEventListener('click', (e) => {
    // Find the closest artist card
    const card = e.target.closest('.artist-card');
    if (card && card.dataset.artistId) {
      const artistId = card.dataset.artistId;
      console.log('[ARTIST CARDS] Card clicked, artist ID:', artistId);
      showArtistDetail(artistId);
    }
  });

  // Mark as attached
  resultsContainer.dataset.clickHandlerAttached = 'true';
  console.log('[ARTIST CARDS] Click handler attached via event delegation');
}

/**
 * Render artists in the results container
 * ✅ FIX: Uses event delegation for click handling
 */
function renderArtists(artists) {
  const resultsContainer = document.getElementById('artist-list-container');
  if (!resultsContainer) {
    console.error("[RENDER ARTISTS] ❌ artist-list-container not found!");
    return;
  }

  resultsContainer.innerHTML = '';

  artists.forEach(artist => {
    const card = createArtistCard(artist);
    resultsContainer.appendChild(card);
  });

  // ✅ FIX: Setup event delegation for artist card clicks (only once)
  setupArtistCardClickHandlers();
}

/**
 * Create an artist card element
 * Mobile: Compact flex-row layout with small image
 * Desktop: Traditional card layout
 * ✅ FIX: Uses data-artist-id for event delegation
 */
function createArtistCard(artist) {
  const card = document.createElement('div');
  card.className = 'artist-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer';

  // ✅ FIX: Add data attribute for event delegation
  card.dataset.artistId = artist.id;

  // Profile picture
  const profilePic = artist.profilePicUrl || "https://placehold.co/400x400/e0e7ff/6366f1?text=No+Photo";

  // Age
  const age = artist.dob ? calculateAge(artist.dob) : null;
  const ageText = age ? `${age} years old` : 'Age not specified';

  // Genres (limit to 2 on mobile for compact view)
  const genresHTML = artist.genres && artist.genres.length > 0
    ? artist.genres.slice(0, 2).map(g => `<span class="inline-block bg-indigo-100 text-indigo-800 px-1.5 py-0.5 md:px-2 md:py-1 rounded text-xs">${g}</span>`).join(' ') + (artist.genres.length > 2 ? '<span class="text-xs text-gray-500 ml-1">+${artist.genres.length - 2}</span>' : '')
    : '<span class="text-gray-500 text-xs">No genres</span>';

  // Mobile: Horizontal flex layout, Desktop: Vertical card layout
  card.innerHTML = `
    <!-- Mobile: Flex Row (< 768px) -->
    <div class="md:hidden flex items-start gap-3 p-3">
      <img src="${profilePic}" alt="${artist.stageName || 'Artist'}" class="w-20 h-20 rounded-lg object-cover flex-shrink-0">
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-bold text-gray-900 mb-0.5 truncate">${artist.stageName || 'No Stage Name'}</h3>
        <p class="text-xs text-gray-600 mb-1 truncate">${artist.location || 'Location not specified'}</p>
        <div class="mb-2 flex flex-wrap gap-1">
          ${genresHTML}
        </div>
        <button class="artist-card-btn w-full bg-indigo-600 text-white py-1.5 px-3 rounded text-xs font-medium hover:bg-indigo-700 transition-colors">
          View Profile
        </button>
      </div>
    </div>

    <!-- Desktop: Card Layout (>= 768px) -->
    <div class="hidden md:block">
      <div class="aspect-w-4 aspect-h-3">
        <img src="${profilePic}" alt="${artist.stageName || 'Artist'}" class="w-full h-48 object-cover">
      </div>
      <div class="p-4">
        <h3 class="text-xl font-bold text-gray-900 mb-1 truncate">${artist.stageName || 'No Stage Name'}</h3>
        <p class="text-sm text-gray-600 mb-2 truncate">${artist.firstName || ''} ${artist.lastName || ''}</p>
        <p class="text-sm text-gray-600 mb-2 truncate"><i data-lucide="map-pin" class="inline w-4 h-4"></i> ${artist.location || 'Location not specified'}</p>
        <p class="text-sm text-gray-600 mb-3 truncate"><i data-lucide="calendar" class="inline w-4 h-4"></i> ${ageText}</p>
        <div class="mb-3 flex flex-wrap gap-1">
          ${artist.genres && artist.genres.length > 0
            ? artist.genres.slice(0, 3).map(g => `<span class="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">${g}</span>`).join(' ') + (artist.genres.length > 3 ? '<span class="text-xs text-gray-500">+more</span>' : '')
            : '<span class="text-gray-500 text-sm">No genres</span>'}
        </div>
        <button class="artist-card-btn w-full bg-indigo-600 text-white py-2 px-4 rounded text-base hover:bg-indigo-700 transition-colors">
          View Profile
        </button>
      </div>
    </div>
  `;

  // ✅ FIX: No direct click listener - using event delegation instead

  return card;
}

/**
 * Show artist detail view (SECURED)
 */
export async function showArtistDetail(artistId, pushHistory = true) {
  // Security check: Only allow authenticated programmers
  if (!requireAuth()) {
    console.error("Show artist detail blocked: Authentication required");
    return;
  }

  try {
    console.log("Loading artist detail:", artistId);

    // Fetch artist data
    const artistRef = doc(db, 'artists', artistId);
    const artistSnap = await getDoc(artistRef);

    if (!artistSnap.exists()) {
      alert("Artist not found");
      return;
    }

    const artist = { id: artistSnap.id, ...artistSnap.data() };

    // Vul de detail view met de data
    populateArtistDetail(artist);

    // Toon de detail view en verberg de search results
    document.getElementById('programmer-dashboard').style.display = 'none';
    const detailView = document.getElementById('artist-detail-view');
    detailView.style.display = 'block';

    // Store artistId in detail view for later use
    detailView.dataset.artistId = artistId;

    // Load recommendations for this artist
    loadRecommendations(artistId);

    // Setup "Write Recommendation" button (only for programmers)
    const writeRecommendationBtn = document.getElementById('write-recommendation-btn');
    if (writeRecommendationBtn) {
      const currentUserData = getStore('currentUserData');
      if (currentUserData && currentUserData.role === 'programmer') {
        writeRecommendationBtn.classList.remove('hidden');
        writeRecommendationBtn.onclick = () => openRecommendationModal(artistId, artist);
      } else {
        writeRecommendationBtn.classList.add('hidden');
      }
    }

    // Push to browser history
    if (pushHistory) {
      window.history.pushState(
        { view: 'artist-detail', artistId: artistId },
        '',
        `#artist/${artistId}`
      );
    }

    // Scroll naar boven
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Activeer Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    console.error("Error loading artist detail:", error);
    alert("Could not load artist details: " + error.message);
  }
}

/**
 * Vult de detail view met artiest data
 */
function populateArtistDetail(artist) {
  // Profile Picture
  const detailProfilePic = document.getElementById('detail-profile-pic');
  if (detailProfilePic) {
    detailProfilePic.src = artist.profilePicUrl || "https://placehold.co/400x400/e0e7ff/6366f1?text=No+Photo";
  }

  // Basic Info
  document.getElementById('detail-artist-name').textContent = `${artist.firstName || ''} ${artist.lastName || ''}`.trim();
  document.getElementById('detail-stage-name').textContent = artist.stageName || 'N/A';
  document.getElementById('detail-location').textContent = artist.location || 'Not specified';

  // Gender
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  document.getElementById('detail-gender').textContent = genderMap[artist.gender] || 'Not specified';

  // Age
  if (artist.dob) {
    document.getElementById('detail-age').textContent = `${calculateAge(artist.dob)} years old`;
  } else {
    document.getElementById('detail-age').textContent = 'Age not specified';
  }

  // Genres
  const detailGenres = document.getElementById('detail-genres');
  detailGenres.innerHTML = '';
  if (artist.genres && artist.genres.length > 0) {
    artist.genres.forEach(genre => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = genre;
      detailGenres.appendChild(badge);
    });
  } else {
    detailGenres.textContent = 'No genres specified';
  }

  // Languages
  const detailLanguages = document.getElementById('detail-languages');
  detailLanguages.innerHTML = '';
  if (artist.languages && artist.languages.length > 0) {
    artist.languages.forEach(lang => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = lang.toUpperCase();
      detailLanguages.appendChild(badge);
    });
  } else {
    detailLanguages.textContent = 'No languages specified';
  }

  // Bio & Pitch
  document.getElementById('detail-bio').textContent = artist.bio || 'No bio available.';
  document.getElementById('detail-pitch').textContent = artist.pitch || 'No pitch available.';

  // Video Material
  if (artist.videoUrl && artist.videoUrl.trim()) {
    document.getElementById('detail-video-section').style.display = 'block';
    const embedUrl = getEmbedUrl(artist.videoUrl, 'video');
    if (embedUrl) {
      document.getElementById('detail-video-container').innerHTML = `
        <iframe class="w-full h-full" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    } else {
      document.getElementById('detail-video-container').innerHTML = `
        <div class="flex items-center justify-center h-full">
          <a href="${artist.videoUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">View Video (External Link)</a>
        </div>
      `;
    }
  } else {
    document.getElementById('detail-video-section').style.display = 'none';
  }

  // Audio Material
  if (artist.audioUrl && artist.audioUrl.trim()) {
    document.getElementById('detail-audio-section').style.display = 'block';
    const embedUrl = getEmbedUrl(artist.audioUrl, 'audio');
    if (embedUrl) {
      document.getElementById('detail-audio-container').innerHTML = `
        <iframe class="w-full" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
      `;
    } else {
      document.getElementById('detail-audio-container').innerHTML = `
        <a href="${artist.audioUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">Listen to Audio (External Link)</a>
      `;
    }
  } else {
    document.getElementById('detail-audio-section').style.display = 'none';
  }

  // Text Material
  if (artist.textContent && artist.textContent.trim()) {
    document.getElementById('detail-text-section').style.display = 'block';
    document.getElementById('detail-text-content').textContent = artist.textContent;
  } else {
    document.getElementById('detail-text-section').style.display = 'none';
  }

  // Document Material
  const documentSection = document.getElementById('detail-document-section');
  const documentLink = document.getElementById('detail-document-link');

  if (artist.documentUrl && artist.documentUrl.trim()) {
    documentSection.style.display = 'block';
    documentLink.href = artist.documentUrl;
    documentLink.textContent = artist.documentName || 'Download/View Document';
  } else {
    documentSection.style.display = 'none';
  }

  // Contact Information - Access Control
  const currentUserData = getStore('currentUserData');
  const isPro = currentUserData && currentUserData.status === 'pro';

  if (isPro) {
    // Show contact info for Pro users
    document.getElementById('detail-trial-message').style.display = 'none';
    document.getElementById('detail-contact-info').style.display = 'block';

    document.getElementById('detail-email').textContent = artist.email || 'Not available';
    document.getElementById('detail-email').href = `mailto:${artist.email || ''}`;

    document.getElementById('detail-phone').textContent = artist.phone || 'Not available';
    document.getElementById('detail-phone').href = `tel:${artist.phone || ''}`;

    // Setup Send Message button
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn) {
      // Remove any existing listeners
      const newBtn = sendMessageBtn.cloneNode(true);
      sendMessageBtn.parentNode.replaceChild(newBtn, sendMessageBtn);

      // Add new listener
      newBtn.addEventListener('click', () => {
        openMessageModal(artist);
      });
    }
  } else {
    // Show upgrade message for Trial users
    document.getElementById('detail-trial-message').style.display = 'block';
    document.getElementById('detail-contact-info').style.display = 'none';
  }
}

/**
 * Converteert een video/audio URL naar een embed URL
 */
function getEmbedUrl(url, type) {
  if (!url) return null;

  if (type === 'video') {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }

  if (type === 'audio') {
    // SoundCloud
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    }

    // Spotify
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist)\/([^?]+)/);
    if (spotifyMatch) {
      return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
    }
  }

  return null;
}

/**
 * Gaat terug naar de search results view (SECURED)
 */
function showSearchView() {
  // Security check
  if (!requireAuth()) {
    return;
  }

  document.getElementById('artist-detail-view').style.display = 'none';
  document.getElementById('programmer-dashboard').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

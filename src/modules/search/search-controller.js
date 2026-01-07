/**
 * search-controller.js
 * Controller that connects data and UI layers
 * Manages event listeners, user interactions, and browser history
 */

import { loadArtistsData, fetchArtistById, requireAuth, isAuthenticatedUser } from './search-data.js';
import { renderArtistSearch, renderArtists, populateArtistDetail } from './search-ui.js';
import { loadRecommendations, openRecommendationModal, openRecommendationsModal } from '../recommendations/recommendations.js';
import { getStore } from '../../utils/store.js';
import { showErrorToast } from '../../ui/toast.js';
import { forceSearchResultsVisible, hideProfileSectionsForSearch } from './search-visibility-fix.js';
import { loadArtistEventsForProfile } from '../calendar/calendar-controller.js';
import { renderPublicGigsSection } from '../calendar/calendar-ui.js';

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

  // Desktop genre collapse/expand toggle
  const genreToggle = document.getElementById('desktop-genre-toggle');
  const genreCheckboxes = document.getElementById('desktop-genre-checkboxes');
  const genreChevron = document.getElementById('desktop-genre-chevron');

  if (genreToggle && genreCheckboxes && genreChevron) {
    genreToggle.addEventListener('click', () => {
      const isHidden = genreCheckboxes.style.display === 'none';
      genreCheckboxes.style.display = isHidden ? 'flex' : 'none';
      genreChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Mobile clear filters button
  const clearFiltersBtn = document.getElementById('mobile-clear-filters-btn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', async () => {
      // Clear all genre checkboxes (mobile + desktop)
      document.querySelectorAll('input[name="mobile-genre"]:checked, input[name="desktop-genre"]:checked').forEach(cb => {
        cb.checked = false;
        const label = cb.closest('.chip-label');
        if (label) {
          label.style.background = 'white';
          label.style.borderColor = '#d1d5db';
          const text = label.querySelector('.chip-text');
          if (text) text.style.color = '#374151';
        }
      });

      // Clear all text inputs
      ['mobile-input-name', 'mobile-input-location', 'mobile-input-keywords',
       'desktop-input-name', 'desktop-input-location', 'desktop-input-keywords'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
      });

      // Reset filter pill styles
      document.querySelectorAll('[data-action="toggle-filter"]').forEach(btn => {
        btn.style.background = 'white';
        btn.style.borderColor = '#e5e7eb';
        btn.style.color = '#4a4a68';
      });

      // Hide open filter panels
      ['filter-name', 'filter-location', 'filter-keywords', 'filter-genre'].forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.style.display = 'none';
      });

      // Reset chevrons
      const chevronGenre = document.getElementById('chevron-genre');
      if (chevronGenre) chevronGenre.style.transform = 'rotate(0deg)';

      console.log('[FILTERS] All filters cleared, reloading...');

      // Fetch all artists without filters and render
      try {
        const artists = await loadArtistsData();
        renderArtists(artists);
        console.log('[FILTERS] Rendered', artists.length, 'artists');
      } catch (err) {
        console.error('[FILTERS] Error reloading:', err);
      }
    });
  }

  // Setup mobile pill filters
  setupMobileFilterPills();

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
 * ✅ FIX: Uses event delegation to handle dynamic filter elements
 */
function setupFilterListeners() {
  const filtersSidebar = document.getElementById('filters-sidebar');
  if (!filtersSidebar) {
    console.warn("[SETUP] Filters sidebar not found");
    return;
  }

  // Check if listener already attached
  if (filtersSidebar.dataset.filtersAttached === 'true') {
    console.log("[SETUP] Filter listeners already attached");
    return;
  }

  // Debounce timer for text inputs
  let debounceTimer;
  const debouncedSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadArtists();
    }, 500); // Wait 500ms after user stops typing
  };

  // ✅ EVENT DELEGATION: Listen on the sidebar container
  filtersSidebar.addEventListener('input', (e) => {
    const target = e.target;

    // Text inputs: name, location, age
    if (target.id === 'filter-name' ||
        target.id === 'filter-location' ||
        target.id === 'filter-age-min' ||
        target.id === 'filter-age-max') {
      debouncedSearch();
    }
  });

  filtersSidebar.addEventListener('change', (e) => {
    const target = e.target;

    // 'Alle Genres' checkbox
    if (target.id === 'genre-all') {
      if (target.checked) {
        // Uncheck all individual genre checkboxes
        const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]');
        genreCheckboxes.forEach(cb => cb.checked = false);
      }
      loadArtists();
      return;
    }

    // Individual genre checkbox
    if (target.name === 'genre-filter') {
      // Uncheck 'Alle Genres' when selecting specific genre
      const allGenresCheckbox = document.getElementById('genre-all');
      if (allGenresCheckbox && target.checked) {
        allGenresCheckbox.checked = false;
      }
      loadArtists();
      return;
    }

    // Gender select
    if (target.id === 'filter-gender') {
      loadArtists();
    }

    // Checkboxes: languages, payment methods
    if (target.name === 'language-filter' ||
        target.name === 'payment-filter') {
      loadArtists();
    }
  });

  // Mark as attached
  filtersSidebar.dataset.filtersAttached = 'true';
  console.log("[SETUP] Filter listeners added via event delegation");

  // Listen for quick genre filter event from cards
  document.addEventListener('quick-genre-filter', () => {
    loadArtists();
  });
  console.log("[SETUP] Quick genre filter listener added");
}

/**
 * Setup mobile filter pill click handlers
 * Opens horizontal sliding bar instead of bottom sheet
 */
function setupMobileFilterPills() {
  const pillGenre = document.getElementById('pill-genre');
  const pillLocation = document.getElementById('pill-location');
  const pillName = document.getElementById('pill-name');
  const pillOther = document.getElementById('pill-other');

  if (pillGenre) {
    pillGenre.addEventListener('click', () => showMobileFilterBar('genre'));
  }

  if (pillLocation) {
    pillLocation.addEventListener('click', () => showMobileFilterBar('location'));
  }

  if (pillName) {
    pillName.addEventListener('click', () => showMobileFilterBar('name'));
  }

  if (pillOther) {
    pillOther.addEventListener('click', () => showMobileFilterBar('other'));
  }

  console.log("[SETUP] Mobile filter pill listeners added (horizontal bar mode)");
}

/**
 * Show horizontal sliding filter bar for mobile
 */
function showMobileFilterBar(type) {
  const filterBar = document.getElementById('mobile-filter-bar');
  const filterBarContent = document.getElementById('mobile-filter-bar-content');

  if (!filterBar || !filterBarContent) return;

  let contentHTML = '';

  switch(type) {
    case 'genre':
      // Get current selected genres from desktop sidebar
      const selectedGenres = Array.from(document.querySelectorAll('input[name="genre-filter"]:checked'))
        .map(cb => cb.value);

      contentHTML = `
        <div class="flex flex-wrap gap-2">
          ${['performance-poetry', 'poetry-slam', 'jazz-poetry', 'rap', 'storytelling', 'comedy', '1-on-1']
            .map(genre => {
              const isSelected = selectedGenres.includes(genre);
              const displayName = getGenreDisplayName(genre);
              return `
                <button class="mobile-genre-pill px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }" data-genre="${genre}">
                  ${displayName}
                </button>
              `;
            }).join('')}
        </div>
      `;
      break;

    case 'location':
      const currentLocation = document.getElementById('filter-location')?.value || '';
      contentHTML = `
        <input id="mobile-filter-location-input"
               type="text"
               placeholder="Bijv. Brussel, Antwerpen..."
               value="${currentLocation}"
               class="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500">
      `;
      break;

    case 'name':
      const currentName = document.getElementById('filter-name')?.value || '';
      contentHTML = `
        <input id="mobile-filter-name-input"
               type="text"
               placeholder="Naam van artiest..."
               value="${currentName}"
               class="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500">
      `;
      break;

    case 'other':
      contentHTML = `
        <select id="mobile-other-filter-select" class="w-full px-4 py-2 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option value="">Kies filter...</option>
          <option value="gender">Geslacht</option>
          <option value="age">Leeftijd</option>
          <option value="languages">Talen</option>
          <option value="payment">Betaalmethoden</option>
        </select>
      `;
      break;
  }

  filterBarContent.innerHTML = contentHTML;
  filterBarContent.dataset.filterType = type;

  // Show bar with slide-down animation
  filterBar.classList.remove('hidden');
  setTimeout(() => {
    filterBar.style.transform = 'translateY(0)';
    filterBar.style.opacity = '1';
  }, 10);

  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Setup genre pill toggle for genre filter
  if (type === 'genre') {
    const genrePills = filterBarContent.querySelectorAll('.mobile-genre-pill');
    genrePills.forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('bg-indigo-600');
        pill.classList.toggle('text-white');
        pill.classList.toggle('bg-gray-100');
        pill.classList.toggle('text-gray-700');
      });
    });
  }

  // Setup close button
  const closeBtn = document.getElementById('mobile-filter-bar-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      applyMobileFilterBar(type);
      hideMobileFilterBar();
    };
  }

  console.log(`[MOBILE] Filter bar opened: ${type}`);
}

/**
 * Hide horizontal filter bar
 */
function hideMobileFilterBar() {
  const filterBar = document.getElementById('mobile-filter-bar');
  if (!filterBar) return;

  filterBar.style.transform = 'translateY(-10px)';
  filterBar.style.opacity = '0';

  setTimeout(() => {
    filterBar.classList.add('hidden');
  }, 300);

  console.log("[MOBILE] Filter bar closed");
}

/**
 * Apply filters from mobile bar to desktop sidebar and reload
 */
function applyMobileFilterBar(type) {
  const filterBarContent = document.getElementById('mobile-filter-bar-content');
  if (!filterBarContent) return;

  switch(type) {
    case 'genre':
      // Get selected genres from pills
      const selectedPills = filterBarContent.querySelectorAll('.mobile-genre-pill.bg-indigo-600');
      const selectedGenres = Array.from(selectedPills).map(pill => pill.dataset.genre);

      // Sync to desktop sidebar
      const desktopGenreCheckboxes = document.querySelectorAll('input[name="genre-filter"]');
      desktopGenreCheckboxes.forEach(cb => {
        cb.checked = selectedGenres.includes(cb.value);
      });

      // Uncheck "Alle Genres"
      const allGenresCheckbox = document.getElementById('genre-all');
      if (allGenresCheckbox) allGenresCheckbox.checked = false;
      break;

    case 'location':
      const locationInput = document.getElementById('mobile-filter-location-input');
      const desktopLocation = document.getElementById('filter-location');
      if (locationInput && desktopLocation) {
        desktopLocation.value = locationInput.value;
      }
      break;

    case 'name':
      const nameInput = document.getElementById('mobile-filter-name-input');
      const desktopName = document.getElementById('filter-name');
      if (nameInput && desktopName) {
        desktopName.value = nameInput.value;
      }
      break;

    case 'other':
      // Handle "other" filters based on selection
      const selectedType = document.getElementById('mobile-other-filter-select')?.value;
      if (selectedType) {
        // Show expanded options for the selected filter type
        // This could be implemented as a second-level interaction
        console.log('Other filter selected:', selectedType);
      }
      break;
  }

  // Reload artists with new filters
  loadArtists();
  console.log(`[MOBILE] Filter bar applied: ${type}`);
}

/**
 * Helper: Get display name for genre
 */
function getGenreDisplayName(genre) {
  const map = {
    'performance-poetry': 'Performance Poetry',
    'poetry-slam': 'Poetry Slam',
    'jazz-poetry': 'Jazz Poetry',
    'rap': 'Rap',
    'storytelling': 'Storytelling',
    'comedy': 'Comedy',
    '1-on-1': '1-op-1'
  };
  return map[genre] || genre;
}

/**
 * Setup browser history management (SECURED)
 */
function setupBrowserHistory() {
  // Handle browser back/forward buttons with security
  window.addEventListener('popstate', (event) => {
    console.log("Popstate event:", event.state);

    // Security check: Block if not authenticated
    if (!isAuthenticatedUser()) {
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

    // Handle hash-based navigation
    const hash = window.location.hash.replace('#', '');

    switch(hash) {
      case 'search':
        // Import and call showSearch
        import('../../ui/ui.js').then(module => module.showSearch());
        break;
      case 'profile':
        import('../../ui/ui.js').then(module => module.showProfile());
        break;
      case 'messages':
        import('../../ui/ui.js').then(module => module.showMessages());
        break;
      default:
        // Handle state-based navigation (for backward compatibility)
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
    }
  });

  // Set initial state
  if (!window.history.state) {
    window.history.replaceState({ view: 'search' }, '', '#search');
  }
}

/**
 * Load artists with filters (SECURED)
 * Wrapper function that collects filter values, calls data layer, and updates UI
 */
export async function loadArtists() {
  const resultsContainer = document.getElementById('artist-list-container');
  const noResultsDiv = document.getElementById('artist-list-empty');

  if (!resultsContainer) {
    console.error("Artist list container not found!");
    return;
  }

  // Show loading skeleton
  resultsContainer.innerHTML = `
    ${Array(6).fill(0).map(() => `
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse h-full">
        <!-- Skeleton image -->
        <div class="w-24 h-24 md:w-full md:h-64 bg-gray-200"></div>
        <!-- Skeleton content -->
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    `).join('')}
  `;
  if (noResultsDiv) noResultsDiv.classList.add('hidden');

  // Helper function to normalize values (trim, lowercase, replace spaces with dashes)
  const normalize = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  };

  try {
    // Collect filter values from UI
    const nameFilter = document.getElementById('filter-name')?.value.toLowerCase().trim() || '';
    const locationFilter = document.getElementById('filter-location')?.value.toLowerCase().trim() || '';
    const genderFilter = document.getElementById('filter-gender')?.value || '';

    // Payment filter (using checkboxes)
    const paymentCheckboxes = document.querySelectorAll('input[name="payment-filter"]:checked');
    const paymentFilters = Array.from(paymentCheckboxes).map(cb => normalize(cb.value));

    // Genre filter (using checkboxes)
    // Check if 'Alle Genres' is selected (bypass genre filtering)
    const genreAllCheckbox = document.getElementById('genre-all');
    let genreFilters = [];
    if (genreAllCheckbox && genreAllCheckbox.checked) {
      // 'Alle Genres' is checked - bypass genre filtering
      genreFilters = null;
    } else {
      const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]:checked');
      genreFilters = Array.from(genreCheckboxes).map(cb => normalize(cb.value));
    }

    // Language filter (using checkboxes)
    const languageCheckboxes = document.querySelectorAll('input[name="language-filter"]:checked');
    const languageFilters = Array.from(languageCheckboxes).map(cb => cb.value.toLowerCase().trim());

    // Age range filter
    const ageMinInput = document.getElementById('filter-age-min')?.value;
    const ageMaxInput = document.getElementById('filter-age-max')?.value;
    const ageMin = ageMinInput ? parseInt(ageMinInput) : null;
    const ageMax = ageMaxInput ? parseInt(ageMaxInput) : null;

    // Call data layer with filters
    const artists = await loadArtistsData({
      nameFilter,
      locationFilter,
      genderFilter,
      paymentFilters,
      genreFilters,
      languageFilters,
      ageMin,
      ageMax
    });

    // Update UI with results
    if (artists.length === 0) {
      resultsContainer.innerHTML = '';
      if (noResultsDiv) noResultsDiv.classList.remove('hidden');
    } else {
      if (noResultsDiv) noResultsDiv.classList.add('hidden');

      // 🔥 NUCLEAR OPTION 1: Force visibility BEFORE rendering
      console.log('[LOAD ARTISTS] 🔥 STEP 1: FORCE VISIBILITY ON CONTAINERS BEFORE RENDER');

      // Force container visibility
      resultsContainer.classList.remove('hidden');
      resultsContainer.style.display = 'grid';
      resultsContainer.style.opacity = '1';
      resultsContainer.style.visibility = 'visible';
      resultsContainer.style.zIndex = '1';
      resultsContainer.style.minHeight = '200px';
      console.log('[LOAD ARTISTS] ✅ Container forced visible:', resultsContainer);

      // Force parent <main> visibility
      const resultsMain = document.getElementById('artist-results-main');
      if (resultsMain) {
        resultsMain.classList.remove('hidden');
        resultsMain.style.display = 'block';
        resultsMain.style.opacity = '1';
        resultsMain.style.visibility = 'visible';
        resultsMain.style.zIndex = '1';
        console.log('[LOAD ARTISTS] ✅ Parent <main> forced visible:', resultsMain);
      } else {
        console.error('[LOAD ARTISTS] ❌ Parent <main> NOT FOUND!');
      }

      // Force artist search section visibility
      const artistSearchSection = document.getElementById('artist-search-section');
      if (artistSearchSection) {
        artistSearchSection.classList.remove('hidden');
        artistSearchSection.style.display = 'block';
        artistSearchSection.style.opacity = '1';
        artistSearchSection.style.visibility = 'visible';
        artistSearchSection.style.zIndex = '1';
        console.log('[LOAD ARTISTS] ✅ Search section forced visible:', artistSearchSection);
      }

      // Force programmer dashboard visibility
      const programmerDashboard = document.getElementById('programmer-dashboard');
      if (programmerDashboard) {
        programmerDashboard.classList.remove('hidden');
        programmerDashboard.style.display = 'block';
        programmerDashboard.style.opacity = '1';
        programmerDashboard.style.visibility = 'visible';
        programmerDashboard.style.zIndex = '1';
        console.log('[LOAD ARTISTS] ✅ Programmer dashboard forced visible:', programmerDashboard);
      }

      console.log('[LOAD ARTISTS] 🔥 STEP 2: RENDER ARTISTS');
      renderArtists(artists);

      // 🔥 NUCLEAR OPTION 2: Force visibility AFTER rendering (double-check)
      console.log('[LOAD ARTISTS] 🔥 STEP 3: FORCE VISIBILITY AFTER RENDER (DOUBLE-CHECK)');
      forceSearchResultsVisible();

      // Setup event delegation for artist card clicks (only once)
      setupArtistCardClickHandlers();

      console.log('[LOAD ARTISTS] ✅ Rendered and forced visibility on', artists.length, 'artist cards');
    }

  } catch (error) {
    console.error("❌ Error loading artists:", error);

    // Check if it's a Firestore index error
    if (error.message && error.message.includes('index')) {
      console.error("🔗 FIRESTORE INDEX REQUIRED!");
      console.error("Click this link to create the index:", error.message.match(/https:\/\/[^\s]+/)?.[0]);
    }

    const errorMessage = error.message || 'Error loading artists. Please try again.';

    resultsContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800 font-semibold">Error loading artists</p>
        <p class="text-red-600 text-sm mt-2">${error.message}</p>
        ${error.message.includes('index') ?
          `<p class="text-red-600 text-sm mt-2">Please check the console for a link to create the required Firestore index.</p>` :
          ''}
      </div>
    `;

    // Show toast notification
    showErrorToast(errorMessage);
  }
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

    // Fetch artist data from data layer
    const artist = await fetchArtistById(artistId);

    if (!artist) {
      alert("Artist not found");
      return;
    }

    // Vul de detail view met de data (UI layer)
    populateArtistDetail(artist);

    // Initialize chat
    import('./profile-chat.js').then(chatModule => {
      chatModule.initProfileChat(artist);
    }).catch(err => {
      console.warn('[CHAT] Profile chat module not loaded:', err);
    });

    // Toon de detail view en verberg de search results
    document.getElementById('programmer-dashboard').style.display = 'none';
    const detailView = document.getElementById('artist-detail-view');
    detailView.style.display = 'block';

    // Store artistId in detail view for later use
    detailView.dataset.artistId = artistId;

    // Load recommendations for this artist
    loadRecommendations(artistId);

    // Load and render artist gigs
    loadAndRenderArtistGigs(artistId, artist.stageName || artist.firstName);

    // Setup "View All Recommendations" button (opens modal)
    const viewAllRecommendationsBtn = document.getElementById('view-all-recommendations-btn');
    if (viewAllRecommendationsBtn) {
      viewAllRecommendationsBtn.onclick = () => {
        openRecommendationsModal(artistId, artist);
      };
    }

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

    // Setup "View Recommendations" button
    const viewRecommendationsBtn = document.getElementById('view-recommendations-btn');
    if (viewRecommendationsBtn) {
      viewRecommendationsBtn.onclick = () => {
        // Scroll to recommendations section smoothly
        const recommendationsSection = document.getElementById('detail-recommendations');
        if (recommendationsSection) {
          recommendationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
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
    const errorMessage = error.message || 'Could not load artist details. Please try again.';
    showErrorToast(errorMessage);
  }
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

/**
 * Load and render artist gigs in the public profile view
 * @param {string} artistId - Artist UID
 * @param {string} artistName - Artist name for display
 */
async function loadAndRenderArtistGigs(artistId, artistName) {
  // Desktop container
  const desktopContainer = document.getElementById('detail-gigs-list');
  // Mobile container
  const mobileContainer = document.getElementById('mobile-detail-gigs');

  const loadingHTML = '<p style="color: #9ca3af; font-size: 14px;">Loading gigs...</p>';
  if (desktopContainer) desktopContainer.innerHTML = loadingHTML;
  if (mobileContainer) mobileContainer.innerHTML = loadingHTML;

  try {
    const events = await loadArtistEventsForProfile(artistId);

    const emptyHTML = `
      <p style="color: #9ca3af; font-size: 14px; text-align: center; padding: 16px 0;">
        No upcoming gigs
      </p>
    `;

    if (!events || events.length === 0) {
      if (desktopContainer) desktopContainer.innerHTML = emptyHTML;
      if (mobileContainer) mobileContainer.innerHTML = emptyHTML;
      return;
    }

    // Desktop: max 3, Mobile: max 5
    const desktopEvents = events.slice(0, 3);
    const mobileEvents = events.slice(0, 5);

    const renderGig = (event) => {
      const date = event.date?.toDate ? event.date.toDate() : new Date(event.date);
      const formattedDate = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

      return `
        <div style="background: #f9fafb; border-radius: 12px; padding: 14px; border-left: 3px solid #805ad5;">
          <p style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px;">${event.title || 'Untitled Event'}</p>
          <p style="font-size: 13px; color: #6b7280;">${formattedDate} • ${event.location || 'Location TBD'}</p>
        </div>
      `;
    };

    // Render desktop
    if (desktopContainer) {
      desktopContainer.innerHTML = desktopEvents.map(renderGig).join('');
      if (events.length > 3) {
        desktopContainer.innerHTML += `
          <p style="font-size: 13px; color: #805ad5; text-align: center; margin-top: 8px;">
            + ${events.length - 3} more gigs
          </p>
        `;
      }
    }

    // Render mobile
    if (mobileContainer) {
      mobileContainer.innerHTML = mobileEvents.map(renderGig).join('');
      if (events.length > 5) {
        mobileContainer.innerHTML += `
          <p style="font-size: 13px; color: #805ad5; text-align: center; margin-top: 8px;">
            + ${events.length - 5} more gigs
          </p>
        `;
      }
    }

    console.log('[GIGS] Rendered for desktop and mobile');

  } catch (error) {
    console.error('[GIGS] Error:', error);
    const errorHTML = '<p style="color: #9ca3af; font-size: 14px;">Could not load gigs</p>';
    if (desktopContainer) desktopContainer.innerHTML = errorHTML;
    if (mobileContainer) mobileContainer.innerHTML = errorHTML;
  }
}

/**
 * Clear all filter inputs and checkboxes
 * Then reload artists with no filters
 */
function clearAllFilters() {
  console.log("[CLEAR FILTERS] Clearing all filters...");

  // Clear text inputs
  const filterName = document.getElementById('filter-name');
  const filterLocation = document.getElementById('filter-location');
  const filterAgeMin = document.getElementById('filter-age-min');
  const filterAgeMax = document.getElementById('filter-age-max');

  if (filterName) filterName.value = '';
  if (filterLocation) filterLocation.value = '';
  if (filterAgeMin) filterAgeMin.value = '';
  if (filterAgeMax) filterAgeMax.value = '';

  // Reset gender select
  const filterGender = document.getElementById('filter-gender');
  if (filterGender) filterGender.value = '';

  // Uncheck 'Alle Genres' checkbox
  const genreAllCheckbox = document.getElementById('genre-all');
  if (genreAllCheckbox) genreAllCheckbox.checked = false;

  // Uncheck all genre checkboxes
  const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]');
  genreCheckboxes.forEach(cb => cb.checked = false);

  // Uncheck all language checkboxes
  const languageCheckboxes = document.querySelectorAll('input[name="language-filter"]');
  languageCheckboxes.forEach(cb => cb.checked = false);

  // Uncheck all payment checkboxes
  const paymentCheckboxes = document.querySelectorAll('input[name="payment-filter"]');
  paymentCheckboxes.forEach(cb => cb.checked = false);

  console.log("[CLEAR FILTERS] ✅ All filters cleared");

  // Reload artists with no filters
  loadArtists();
}

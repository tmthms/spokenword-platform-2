/**
 * search-ui.js
 * Handles all HTML generation for artist search
 * Premium Apple Design - Responsive filters and card layout
 */

import { calculateAge } from './search-data.js';
import { getStore } from '../../utils/store.js';
import { openMessageModal } from '../messaging/messaging-controller.js';

/**
 * Render the artist search view HTML - JavaScript-based responsive with inline styles
 * Desktop: Sidebar filters + 4-column grid
 * Mobile: Horizontal pills + 2-column grid
 */
export function renderArtistSearch() {
  const searchSection = document.getElementById('artist-search-section');
  if (!searchSection) {
    console.error('[RENDER] artist-search-section not found');
    return;
  }

  // Detect desktop vs mobile
  const isDesktop = window.innerWidth >= 1024;
  console.log('[RENDER] isDesktop:', isDesktop, 'width:', window.innerWidth);

  if (isDesktop) {
    renderDesktopLayout(searchSection);
  } else {
    renderMobileLayout(searchSection);
  }

  // Populate genres after render
  populateGenres();

  // Populate keywords after render
  populateKeywords();

  // Setup interactions
  setupSearchInteractionsInternal();

  // Load artists
  loadArtistsInternal();
}

function renderDesktopLayout(container) {
  container.innerHTML = `
    <div id="search-module-root" style="display: flex; gap: 32px; max-width: 1280px; margin: 0 auto; padding: 20px;">

      <!-- SIDEBAR -->
      <aside style="width: 280px; flex-shrink: 0;">
        <div style="background: #f3f4f6; border-radius: 16px; padding: 24px; position: sticky; top: 100px;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">Filters</h2>

          <!-- Search Name -->
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Search Name</label>
            <input type="text" id="filter-name" placeholder="Search Name"
                   style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          </div>

          <!-- Age Range -->
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Age Range</label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="number" id="filter-age-min" placeholder="18"
                     style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
              <span style="color: #9ca3af;">–</span>
              <input type="number" id="filter-age-max" placeholder="99"
                     style="width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
            </div>
          </div>

          <!-- Genres -->
          <div>
            <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px;">Genres</label>
            <div id="genre-checkboxes" style="display: flex; flex-direction: column; gap: 8px;">
              <span style="color: #9ca3af; font-size: 14px;">Laden...</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- RESULTS -->
      <main style="flex: 1; min-width: 0;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">Artists</h1>
        <p id="results-count" style="color: #6b7280; margin-bottom: 24px;">0 results found</p>
        <div id="search-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
          <!-- Cards here -->
        </div>
      </main>

    </div>
  `;
  console.log('[RENDER] Desktop layout rendered');
}

function renderMobileLayout(container) {
  container.innerHTML = `
    <div id="search-module-root" style="padding: 16px;">

      <!-- FILTER PILLS -->
      <div id="mobile-pills" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px;">
        <button data-filter="genre" class="filter-pill" style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; cursor: pointer;">
          Genre
        </button>
        <button data-filter="location" class="filter-pill" style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; cursor: pointer;">
          Locatie
        </button>
        <button data-filter="name" class="filter-pill" style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; cursor: pointer;">
          Naam
        </button>
        <button data-filter="other" class="filter-pill" style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; cursor: pointer;">
          Andere filters
        </button>
      </div>

      <!-- EXPANDED PANELS -->
      <div id="panel-genre" class="filter-panel" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb; position: relative;">
        <button data-apply="genre" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; background: #f3f4f6; border: none; border-radius: 50%; cursor: pointer; font-size: 16px;">✓</button>
        <div id="mobile-genre-options" style="display: flex; flex-wrap: wrap; gap: 8px; padding-right: 50px;">
          <span style="color: #9ca3af;">Laden...</span>
        </div>
      </div>

      <div id="panel-location" class="filter-panel" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb; position: relative;">
        <button data-apply="location" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; background: #f3f4f6; border: none; border-radius: 50%; cursor: pointer; font-size: 16px;">✓</button>
        <input type="text" id="mobile-location" placeholder="Type een stad..."
               style="width: 100%; padding: 10px 14px; background: #f9fafb; border: none; border-radius: 12px; font-size: 14px; padding-right: 50px;">
      </div>

      <div id="panel-name" class="filter-panel" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb; position: relative;">
        <button data-apply="name" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; background: #f3f4f6; border: none; border-radius: 50%; cursor: pointer; font-size: 16px;">✓</button>
        <input type="text" id="mobile-name" placeholder="Naam artiest..."
               style="width: 100%; padding: 10px 14px; background: #f9fafb; border: none; border-radius: 12px; font-size: 14px; padding-right: 50px;">
      </div>

      <div id="panel-other" class="filter-panel" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb; position: relative;">
        <button data-apply="other" style="position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; background: #f3f4f6; border: none; border-radius: 50%; cursor: pointer; font-size: 16px;">✓</button>

        <!-- Sub-filter buttons -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; padding-right: 50px;">
          <button data-subfilter="age" class="subfilter-btn" style="padding: 8px 14px; background: #f3f4f6; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">Leeftijd</button>
          <button data-subfilter="energy" class="subfilter-btn" style="padding: 8px 14px; background: #f3f4f6; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">Energy level</button>
          <button data-subfilter="keywords" class="subfilter-btn" style="padding: 8px 14px; background: #f3f4f6; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">Keywords</button>
        </div>

        <!-- Leeftijd sub-panel -->
        <div id="subpanel-age" class="subpanel" style="display: none; padding: 12px; background: #f9fafb; border-radius: 12px; margin-top: 8px;">
          <label style="font-size: 12px; color: #6b7280; margin-bottom: 8px; display: block;">Leeftijd</label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="number" id="mobile-age-min" placeholder="Van" style="flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
            <span style="color: #9ca3af;">–</span>
            <input type="number" id="mobile-age-max" placeholder="Tot" style="flex: 1; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          </div>
        </div>

        <!-- Energy level sub-panel -->
        <div id="subpanel-energy" class="subpanel" style="display: none; padding: 12px; background: #f9fafb; border-radius: 12px; margin-top: 8px;">
          <label style="font-size: 12px; color: #6b7280; margin-bottom: 8px; display: block;">Energy level</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button data-energy="intiem" class="energy-option" style="padding: 8px 14px; background: #e5e7eb; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">Intiem</button>
            <button data-energy="interactief" class="energy-option" style="padding: 8px 14px; background: #e5e7eb; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">Interactief</button>
            <button data-energy="high energy" class="energy-option" style="padding: 8px 14px; background: #e5e7eb; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">High energy</button>
          </div>
        </div>

        <!-- Keywords sub-panel -->
        <div id="subpanel-keywords" class="subpanel" style="display: none; padding: 12px; background: #f9fafb; border-radius: 12px; margin-top: 8px;">
          <label style="font-size: 12px; color: #6b7280; margin-bottom: 8px; display: block;">Keywords</label>
          <div id="keywords-options" style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span style="color: #9ca3af; font-size: 14px;">Laden...</span>
          </div>
        </div>
      </div>

      <!-- RESULTS -->
      <div>
        <p id="results-count" style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">0 results found</p>
        <div id="search-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <!-- Cards here -->
        </div>
      </div>

    </div>
  `;
  console.log('[RENDER] Mobile layout rendered');
}

async function populateGenres() {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const snapshot = await getDocs(collection(db, 'artists'));
    const genres = new Set();
    snapshot.forEach(doc => {
      (doc.data().genres || []).forEach(g => genres.add(g));
    });

    const sorted = Array.from(genres).sort();

    // Desktop checkboxes
    const desktopContainer = document.getElementById('genre-checkboxes');
    if (desktopContainer) {
      desktopContainer.innerHTML = sorted.map(g => `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" name="genre" value="${g}" style="width: 16px; height: 16px;">
          <span style="font-size: 14px;">${g}</span>
        </label>
      `).join('');
    }

    // Mobile genre pills
    const mobileContainer = document.getElementById('mobile-genre-options');
    if (mobileContainer) {
      mobileContainer.innerHTML = sorted.map(g => `
        <button data-genre="${g}" class="genre-option" style="padding: 6px 12px; background: #f3f4f6; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">
          ${g}
        </button>
      `).join('');
    }

    console.log('[GENRES] Loaded:', sorted.length);
  } catch (err) {
    console.error('[GENRES] Error:', err);
  }
}

async function populateKeywords() {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const snapshot = await getDocs(collection(db, 'artists'));
    const keywords = new Set();
    snapshot.forEach(doc => {
      (doc.data().keywords || []).forEach(k => keywords.add(k));
    });

    const sorted = Array.from(keywords).sort();

    const container = document.getElementById('keywords-options');
    if (container && sorted.length > 0) {
      container.innerHTML = sorted.map(k => `
        <button data-keyword="${k}" class="keyword-option" style="padding: 8px 14px; background: #e5e7eb; border: none; border-radius: 20px; font-size: 14px; cursor: pointer;">
          ${k}
        </button>
      `).join('');
    } else if (container) {
      container.innerHTML = '<span style="color: #9ca3af; font-size: 14px;">Geen keywords</span>';
    }

    console.log('[KEYWORDS] Loaded:', sorted.length);
  } catch (err) {
    console.error('[KEYWORDS] Error:', err);
  }
}

function setupSearchInteractionsInternal() {
  const root = document.getElementById('search-module-root');
  if (!root) return;

  root.addEventListener('click', (e) => {
    // Mobile filter pill
    const pill = e.target.closest('[data-filter]');
    if (pill) {
      const filterType = pill.dataset.filter;
      const panel = document.getElementById(`panel-${filterType}`);

      // Close all panels
      document.querySelectorAll('.filter-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.filter-pill').forEach(p => {
        p.style.background = 'white';
        p.style.borderColor = '#e5e7eb';
      });

      // Open this panel
      if (panel) {
        panel.style.display = 'block';
        pill.style.background = '#fbbf24';
        pill.style.borderColor = '#fbbf24';
      }
      return;
    }

    // Apply button
    const applyBtn = e.target.closest('[data-apply]');
    if (applyBtn) {
      document.querySelectorAll('.filter-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.filter-pill').forEach(p => {
        p.style.background = 'white';
        p.style.borderColor = '#e5e7eb';
      });
      loadArtistsInternal();
      return;
    }

    // Sub-filter button toggle (Leeftijd, Energy, Keywords)
    const subfilterBtn = e.target.closest('[data-subfilter]');
    if (subfilterBtn) {
      const subfilterType = subfilterBtn.dataset.subfilter;
      const subpanel = document.getElementById(`subpanel-${subfilterType}`);

      // Toggle active state on button
      const isActive = subfilterBtn.style.background === 'rgb(251, 191, 36)';

      // Reset all subfilter buttons
      document.querySelectorAll('.subfilter-btn').forEach(btn => {
        btn.style.background = '#f3f4f6';
      });

      // Hide all subpanels
      document.querySelectorAll('.subpanel').forEach(p => {
        p.style.display = 'none';
      });

      // Toggle clicked one
      if (!isActive && subpanel) {
        subpanel.style.display = 'block';
        subfilterBtn.style.background = '#fbbf24';
      }
      return;
    }

    // Energy level selection
    const energyOption = e.target.closest('.energy-option');
    if (energyOption) {
      const isActive = energyOption.style.background === 'rgb(251, 191, 36)';
      energyOption.style.background = isActive ? '#e5e7eb' : '#fbbf24';
      return;
    }

    // Keyword selection
    const keywordOption = e.target.closest('.keyword-option');
    if (keywordOption) {
      const isActive = keywordOption.style.background === 'rgb(251, 191, 36)';
      keywordOption.style.background = isActive ? '#e5e7eb' : '#fbbf24';
      return;
    }

    // Mobile genre selection
    const genreOption = e.target.closest('.genre-option');
    if (genreOption) {
      const isActive = genreOption.style.background === 'rgb(251, 191, 36)';
      genreOption.style.background = isActive ? '#f3f4f6' : '#fbbf24';
      return;
    }

    // Artist card click
    const card = e.target.closest('[data-artist-id]');
    if (card) {
      const artistId = card.dataset.artistId;
      console.log('[CLICK] Artist:', artistId);
      // Import and call showArtistDetail
      import('./search-controller.js').then(mod => {
        if (mod.showArtistDetail) mod.showArtistDetail(artistId);
      });
    }
  });

  // Desktop input changes
  root.addEventListener('input', (e) => {
    if (e.target.matches('#filter-name, #filter-age-min, #filter-age-max')) {
      clearTimeout(window.searchDebounce);
      window.searchDebounce = setTimeout(() => loadArtistsInternal(), 500);
    }
  });

  // Desktop checkbox changes
  root.addEventListener('change', (e) => {
    if (e.target.matches('[name="genre"]')) {
      loadArtistsInternal();
    }
  });

  console.log('[SETUP] Interactions ready');
}

async function loadArtistsInternal() {
  const grid = document.getElementById('search-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  try {
    const { loadArtistsData } = await import('./search-data.js');

    // Collect filters
    const nameFilter = (document.getElementById('filter-name')?.value || document.getElementById('mobile-name')?.value || '').toLowerCase().trim();
    const locationFilter = (document.getElementById('mobile-location')?.value || '').toLowerCase().trim();

    // Mobile age filters
    const mobileAgeMin = document.getElementById('mobile-age-min')?.value ? parseInt(document.getElementById('mobile-age-min').value) : null;
    const mobileAgeMax = document.getElementById('mobile-age-max')?.value ? parseInt(document.getElementById('mobile-age-max').value) : null;
    const ageMin = document.getElementById('filter-age-min')?.value ? parseInt(document.getElementById('filter-age-min').value) : mobileAgeMin;
    const ageMax = document.getElementById('filter-age-max')?.value ? parseInt(document.getElementById('filter-age-max').value) : mobileAgeMax;

    // Desktop checkboxes
    const desktopGenres = Array.from(document.querySelectorAll('[name="genre"]:checked')).map(cb => cb.value.toLowerCase());
    // Mobile active genres
    const mobileGenres = Array.from(document.querySelectorAll('.genre-option')).filter(btn => btn.style.background === 'rgb(251, 191, 36)').map(btn => btn.dataset.genre.toLowerCase());
    const genreFilters = [...new Set([...desktopGenres, ...mobileGenres])];

    // Energy level filters
    const energyFilters = Array.from(document.querySelectorAll('.energy-option'))
      .filter(btn => btn.style.background === 'rgb(251, 191, 36)')
      .map(btn => btn.dataset.energy.toLowerCase());

    // Keyword filters
    const keywordFilters = Array.from(document.querySelectorAll('.keyword-option'))
      .filter(btn => btn.style.background === 'rgb(251, 191, 36)')
      .map(btn => btn.dataset.keyword.toLowerCase());

    const artists = await loadArtistsData({
      nameFilter,
      locationFilter,
      genreFilters,
      ageMin,
      ageMax,
      energyFilters,
      keywordFilters
    });

    if (countEl) countEl.textContent = `${artists.length} results found`;

    const isDesktop = window.innerWidth >= 1024;

    // Inline SVG placeholders (no external URL needed)
    const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23e5e7eb' width='300' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Photo%3C/text%3E%3C/svg%3E`;
    const placeholderSvgSquare = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect fill='%23e5e7eb' width='300' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Photo%3C/text%3E%3C/svg%3E`;

    grid.innerHTML = artists.map(artist => {
      // Check if profilePicUrl exists AND is not empty
      const hasPhoto = artist.profilePicUrl && artist.profilePicUrl.trim() !== '';
      const name = artist.stageName || 'Unknown';
      const age = artist.dob ? calculateAge(artist.dob) : null;
      const genre = (artist.genres || [])[0] || '';

      if (isDesktop) {
        const pic = hasPhoto ? artist.profilePicUrl : placeholderSvg;
        return `
          <div data-artist-id="${artist.id}" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: pointer;">
            <img src="${pic}" alt="${name}" style="width: 100%; aspect-ratio: 3/4; object-fit: cover; background: #e5e7eb;">
            <div style="padding: 16px;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${name}</h3>
              ${age ? `<p style="color: #6b7280; font-size: 14px;">${age} years old</p>` : ''}
              ${genre ? `<span style="display: inline-block; margin-top: 8px; padding: 4px 10px; background: #f3f4f6; border-radius: 20px; font-size: 12px;">${genre}</span>` : ''}
            </div>
          </div>
        `;
      } else {
        const pic = hasPhoto ? artist.profilePicUrl : placeholderSvgSquare;
        return `
          <div data-artist-id="${artist.id}" style="cursor: pointer;">
            <img src="${pic}" alt="${name}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 12px; background: #e5e7eb;">
            <h3 style="font-weight: 500; font-size: 14px; margin-top: 8px;">${name}${age ? ', ' + age : ''}</h3>
            ${genre ? `<p style="color: #6b7280; font-size: 12px;">${genre}</p>` : ''}
          </div>
        `;
      }
    }).join('');

    console.log('[LOAD] Rendered', artists.length, 'artists');
  } catch (err) {
    console.error('[LOAD] Error:', err);
    grid.innerHTML = '<p style="grid-column: span 4; text-align: center; color: #ef4444;">Error loading artists</p>';
  }
}

// Re-render on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const wasDesktop = document.querySelector('#search-module-root > aside') !== null;
    const isDesktop = window.innerWidth >= 1024;
    if (wasDesktop !== isDesktop) {
      console.log('[RESIZE] Layout change detected, re-rendering');
      renderArtistSearch();
    }
  }, 250);
});

/**
 * Render artists - Apple-style cards for desktop and mobile
 * Renders to both desktop and mobile grids
 */
export function renderArtists(artists) {
  const desktopGrid = document.getElementById('desktop-search-grid');
  const mobileGrid = document.getElementById('mobile-search-grid');
  const desktopCount = document.getElementById('desktop-results-count');
  const mobileCount = document.getElementById('mobile-results-count');

  // Update counts
  const countText = `${artists.length} results found`;
  if (desktopCount) desktopCount.textContent = countText;
  if (mobileCount) mobileCount.textContent = countText;

  // Desktop cards
  if (desktopGrid) {
    desktopGrid.innerHTML = artists.map(artist => {
      const pic = artist.profilePicUrl || 'https://via.placeholder.com/300x400?text=No+Photo';
      const name = artist.stageName || 'Unknown';
      const age = artist.dob ? calculateAge(artist.dob) : null;
      const genre = (artist.genres || [])[0] || '';

      return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-artist-id="${artist.id}">
          <img src="${pic}" alt="${name}" class="w-full aspect-[3/4] object-cover">
          <div class="p-4">
            <h3 class="font-semibold text-gray-900">${name}</h3>
            ${age ? `<p class="text-gray-500 text-sm">${age} years old</p>` : ''}
            ${genre ? `<span class="inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full ${getGenreColor(genre)}">${genre}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Mobile cards
  if (mobileGrid) {
    mobileGrid.innerHTML = artists.map(artist => {
      const pic = artist.profilePicUrl || 'https://via.placeholder.com/300x300?text=No+Photo';
      const name = artist.stageName || 'Unknown';
      const age = artist.dob ? calculateAge(artist.dob) : null;
      const genre = (artist.genres || [])[0] || '';

      return `
        <div class="cursor-pointer" data-artist-id="${artist.id}">
          <img src="${pic}" alt="${name}" class="w-full aspect-square object-cover rounded-xl">
          <h3 class="font-medium text-sm mt-2">${name}${age ? ', ' + age : ''}</h3>
          ${genre ? `<p class="text-gray-500 text-xs">${genre}</p>` : ''}
        </div>
      `;
    }).join('');
  }
}

function getGenreColor(genre) {
  const g = genre.toLowerCase();
  const colors = {
    'pop': 'bg-orange-100 text-orange-700',
    'r&b': 'bg-pink-100 text-pink-700',
    'hip-hop': 'bg-purple-100 text-purple-700',
    'rap': 'bg-red-100 text-red-700',
    'slam poetry': 'bg-blue-100 text-blue-700',
    'spoken word': 'bg-indigo-100 text-indigo-700',
    'performance poetry': 'bg-green-100 text-green-700',
    'storytelling': 'bg-teal-100 text-teal-700'
  };
  return colors[g] || 'bg-gray-100 text-gray-700';
}

/**
 * Populate artist detail view with artist data
 */
export function populateArtistDetail(artist) {
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
 * Convert video/audio URL to embed URL
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

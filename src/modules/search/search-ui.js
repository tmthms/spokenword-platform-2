/**
 * search-ui.js
 * Handles all HTML generation for artist search
 * Responsive layout - mobile pills & desktop sidebar
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { loadArtistsData, calculateAge } from './search-data.js';
import { showArtistDetail } from './search-controller.js';
import { getStore } from '../../utils/store.js';
import { openMessageModal } from '../messaging/messaging-controller.js';

/**
 * Render the artist search view - Responsive with Tailwind
 * Mobile: Horizontal pills + dropdown panels + 2-col grid
 * Desktop: Sidebar filters + 4-col grid
 */
export function renderArtistSearch() {
  const searchSection = document.getElementById('artist-search-section');
  if (!searchSection) {
    console.error('[RENDER] artist-search-section not found');
    return;
  }

  // Apply pattern background
  searchSection.className = 'search-pattern';
  searchSection.style.cssText = 'display: block; opacity: 1; visibility: visible;';

  // Detect if desktop
  const isDesktop = window.innerWidth >= 1024;

  searchSection.innerHTML = `
    <div id="search-module-root" style="max-width: 1400px; margin: 0 auto; position: relative; z-index: 1;">

      <!-- ===================== MOBILE LAYOUT ===================== -->
      <div id="mobile-search-layout" style="display: ${isDesktop ? 'none' : 'block'};">

        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Zoeken</h1>

        <!-- Filter Pills -->
        <div class="no-scrollbar" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 8px;">
          <button data-action="toggle-filter" data-target="name" id="btn-filter-name"
                  style="flex-shrink: 0; padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer;">
            Naam
          </button>
          <button data-action="toggle-filter" data-target="location" id="btn-filter-location"
                  style="flex-shrink: 0; padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer;">
            Locatie
          </button>
          <button data-action="toggle-filter" data-target="genre" id="btn-filter-genre"
                  style="flex-shrink: 0; padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer;">
            Genre
          </button>
        </div>

        <!-- Filter Panels -->
        <div id="filter-name" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-name" placeholder="Naam artiest..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="name"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px;">✓</button>
          </div>
        </div>

        <div id="filter-location" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-location" placeholder="Stad of regio..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="location"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px;">✓</button>
          </div>
        </div>

        <div id="filter-genre" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(128,90,213,0.1);">
          <div id="mobile-genre-checkboxes" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; margin-bottom: 12px;">
            <p style="color: #9ca3af; font-size: 14px;">Laden...</p>
          </div>
          <div style="display: flex; justify-content: flex-end;">
            <button data-action="apply-filter" data-target="genre"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px;">✓</button>
          </div>
        </div>

        <!-- Results -->
        <p id="mobile-results-count" style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">0 gevonden</p>
        <div id="mobile-search-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <!-- Cards here -->
        </div>
      </div>

      <!-- ===================== DESKTOP 3-COLUMN LAYOUT ===================== -->
      <div id="desktop-search-layout" style="display: ${isDesktop ? 'flex' : 'none'}; gap: 24px; align-items: flex-start;">

        <!-- LEFT COLUMN: Filters -->
        <aside style="width: 220px; flex-shrink: 0;">
          <h1 style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 24px;">Zoeken</h1>

          <div style="background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1);">

            <h3 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Filter</h3>

            <!-- Genre Checkboxes -->
            <div id="desktop-genre-checkboxes" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
              <p style="color: #9ca3af; font-size: 14px;">Laden...</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e9e3f5; margin: 20px 0;">

            <!-- Shaner Section (extra filters) -->
            <h3 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Shaner</h3>

            <div id="desktop-shaner-checkboxes" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
              <!-- Will be populated -->
            </div>

            <hr style="border: none; border-top: 1px solid #e9e3f5; margin: 20px 0;">

            <!-- Name Search -->
            <div style="margin-bottom: 16px;">
              <input id="desktop-input-name" type="text" placeholder="Zoek op naam..."
                     style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e9e3f5; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>

            <!-- Location Search -->
            <div>
              <input id="desktop-input-location" type="text" placeholder="Locatie..."
                     style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e9e3f5; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>
          </div>
        </aside>

        <!-- MIDDLE COLUMN: Results Grid (3 cols) -->
        <main style="flex: 1; min-width: 0;">
          <p id="desktop-results-count" style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">0 gevonden</p>
          <div id="desktop-search-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <!-- Cards here -->
          </div>
        </main>

        <!-- RIGHT COLUMN: Artist Detail Panel -->
        <aside id="desktop-artist-detail" style="width: 300px; flex-shrink: 0;">
          <div style="background: white; border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1); position: sticky; top: 100px;">

            <!-- Empty State -->
            <div id="detail-empty-state" style="text-align: center; padding: 40px 0;">
              <div style="width: 80px; height: 80px; background: #f3e8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg width="32" height="32" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <p style="color: #9ca3af; font-size: 14px;">Selecteer een artiest</p>
            </div>

            <!-- Filled State (hidden by default) -->
            <div id="detail-content" style="display: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 24px;">Profiel</h2>

              <!-- Photo -->
              <div style="display: flex; justify-content: center; margin-bottom: 16px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid #805ad5;">
                  <img id="detail-photo" src="" alt="Artist" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
              </div>

              <!-- Name -->
              <h3 id="detail-name" style="font-size: 20px; font-weight: 600; color: #1a1a2e; text-align: center; margin-bottom: 20px;">Artist Name</h3>

              <!-- Edit Button -->
              <button id="detail-edit-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px;">
                Edit Profile
              </button>

              <!-- Over Mij -->
              <div style="margin-bottom: 20px;">
                <h4 style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Over Mij</h4>
                <p id="detail-bio" style="font-size: 13px; color: #4a4a68; line-height: 1.7;">Bio komt hier...</p>
              </div>

              <!-- Mijn Werk -->
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Mijn Werk</h4>
                <p id="detail-work" style="font-size: 13px; color: #4a4a68; line-height: 1.7;">Mijn Werk</p>
              </div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  `;

  // Populate filter checkboxes
  populateGenreFilters();

  // Setup interactions
  setupSearchInteractions();

  // Load artists
  loadArtists();

  // Handle resize
  window.removeEventListener('resize', handleSearchResize);
  window.addEventListener('resize', handleSearchResize);

  searchSection.dataset.setupComplete = 'false';

  console.log('[RENDER] Search UI rendered, isDesktop:', isDesktop);
}

function handleSearchResize() {
  const isDesktop = window.innerWidth >= 1024;
  const mobileLayout = document.getElementById('mobile-search-layout');
  const desktopLayout = document.getElementById('desktop-search-layout');

  if (mobileLayout) mobileLayout.style.display = isDesktop ? 'none' : 'block';
  if (desktopLayout) desktopLayout.style.display = isDesktop ? 'flex' : 'none';
}

async function populateGenreFilters() {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const snapshot = await getDocs(collection(db, 'artists'));
    const genres = new Set();
    snapshot.forEach(doc => {
      (doc.data().genres || []).forEach(g => genres.add(g));
    });

    const sorted = Array.from(genres).sort();

    // Desktop genre checkboxes
    const desktopGenres = document.getElementById('desktop-genre-checkboxes');
    if (desktopGenres) {
      desktopGenres.innerHTML = sorted.map(g => `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" name="desktop-genre" value="${g}"
                 style="width: 18px; height: 18px; accent-color: #805ad5; cursor: pointer;">
          <span style="font-size: 14px; color: #4a4a68;">${g}</span>
        </label>
      `).join('');
    }

    // Desktop shaner checkboxes (placeholder options)
    const desktopShaner = document.getElementById('desktop-shaner-checkboxes');
    if (desktopShaner) {
      desktopShaner.innerHTML = ['Soft shadow'].map(s => `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" name="desktop-shaner" value="${s}"
                 style="width: 18px; height: 18px; accent-color: #805ad5; cursor: pointer;">
          <span style="font-size: 14px; color: #4a4a68;">${s}</span>
        </label>
      `).join('');
    }

    // Mobile genre checkboxes
    const mobileGenres = document.getElementById('mobile-genre-checkboxes');
    if (mobileGenres) {
      mobileGenres.innerHTML = sorted.map(g => `
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f9fafb; border-radius: 10px; cursor: pointer;">
          <input type="checkbox" name="mobile-genre" value="${g}"
                 style="width: 20px; height: 20px; accent-color: #805ad5; cursor: pointer;">
          <span style="font-size: 14px; color: #1a1a2e;">${g}</span>
        </label>
      `).join('');
    }

    console.log('[FILTERS] Populated', sorted.length, 'genres');
  } catch (err) {
    console.error('[FILTERS] Error:', err);
  }
}

/**
 * Populate genre checkboxes in both mobile and desktop
 */
async function populateGenres() {
  try {
    const snapshot = await getDocs(collection(db, 'artists'));
    const genres = new Set();
    snapshot.forEach(doc => {
      (doc.data().genres || []).forEach(g => genres.add(g));
    });

    const sorted = Array.from(genres).sort();

    // Desktop checkboxes
    const desktopContainer = document.getElementById('desktop-genre-checkboxes');
    if (desktopContainer) {
      desktopContainer.innerHTML = sorted.map(g => `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" name="desktop-genre" value="${g}"
                 style="width: 16px; height: 16px; accent-color: #805ad5; cursor: pointer;">
          <span style="font-size: 13px; color: #4a4a68;">${g}</span>
        </label>
      `).join('');
    }

    // Mobile checkboxes
    const mobileContainer = document.getElementById('mobile-genre-checkboxes');
    if (mobileContainer) {
      mobileContainer.innerHTML = sorted.map(g => `
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
          <input type="checkbox" name="mobile-genre" value="${g}" class="w-5 h-5 rounded text-purple-600">
          <span class="text-gray-900">${g}</span>
        </label>
      `).join('');
    }
  } catch (err) {
    console.error('[GENRES] Error:', err);
  }
}

/**
 * Setup search interactions for responsive layout
 */
function setupSearchInteractions() {
  const root = document.getElementById('search-module-root');
  if (!root) return;

  // Mobile: Toggle filter panels
  root.addEventListener('click', (e) => {
    // Toggle filter button
    const toggleBtn = e.target.closest('[data-action="toggle-filter"]');
    if (toggleBtn) {
      const target = toggleBtn.dataset.target;
      const panel = document.getElementById(`filter-${target}`);

      // Close all panels
      document.querySelectorAll('[id^="filter-"]').forEach(p => {
        if (p.id.startsWith('filter-') && p.style.display === 'none') return;
        if (p.id !== `filter-${target}`) p.style.display = 'none';
      });

      // Toggle this panel
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
      return;
    }

    // Apply filter button
    const applyBtn = e.target.closest('[data-action="apply-filter"]');
    if (applyBtn) {
      const target = applyBtn.dataset.target;
      const panel = document.getElementById(`filter-${target}`);
      if (panel) panel.style.display = 'none';
      loadArtists();
      return;
    }

    // Artist card click
    const card = e.target.closest('[data-artist-id]');
    if (card) {
      const artistId = card.dataset.artistId;
      console.log('[SEARCH] Card clicked:', artistId);

      // Desktop: show in detail panel
      const detailPanel = document.getElementById('desktop-artist-detail');
      const isDesktop = window.innerWidth >= 1024;

      if (detailPanel && isDesktop) {
        import('./search-data.js').then(dataModule => {
          dataModule.fetchArtistById(artistId).then(artist => {
            if (artist) {
              showArtistInDetailPanel(artist);
            }
          });
        });
      } else {
        // Mobile: navigate to full page
        showArtistDetail(artistId);
      }
      return;
    }
  });

  // Desktop: Apply filters button
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      loadArtists();
    });
  }

  // Desktop: Input changes - debounced
  root.addEventListener('input', (e) => {
    if (e.target.matches('#desktop-input-name, #desktop-input-location')) {
      clearTimeout(window.searchDebounce);
      window.searchDebounce = setTimeout(() => loadArtists(), 500);
    }
  });

  // Desktop: Checkbox changes - immediate
  root.addEventListener('change', (e) => {
    if (e.target.matches('[name="desktop-genre"], [name="mobile-genre"]')) {
      loadArtists();
    }
  });

  console.log('[SETUP] Interactions ready');
}

/**
 * Load artists with filters from both mobile and desktop
 */
async function loadArtists() {
  const desktopGrid = document.getElementById('desktop-search-grid');
  const mobileGrid = document.getElementById('mobile-search-grid');
  const desktopCount = document.getElementById('desktop-results-count');
  const mobileCount = document.getElementById('mobile-results-count');

  // Show loading
  if (desktopGrid) desktopGrid.style.opacity = '0.5';
  if (mobileGrid) mobileGrid.style.opacity = '0.5';

  try {
    // Collect filters from both mobile and desktop
    const nameFilter = (
      document.getElementById('desktop-input-name')?.value ||
      document.getElementById('mobile-input-name')?.value || ''
    ).toLowerCase().trim();

    const locationFilter = (
      document.getElementById('desktop-input-location')?.value ||
      document.getElementById('mobile-input-location')?.value || ''
    ).toLowerCase().trim();

    const genreCheckboxes = document.querySelectorAll(
      'input[name="desktop-genre"]:checked, input[name="mobile-genre"]:checked'
    );
    const genreFilters = Array.from(genreCheckboxes).map(cb => cb.value.toLowerCase().trim());

    // Load and filter
    const artists = await loadArtistsData({ nameFilter, locationFilter, genreFilters });

    // Update counts
    const countText = `${artists.length} gevonden`;
    if (desktopCount) desktopCount.textContent = countText;
    if (mobileCount) mobileCount.textContent = countText;

    // Render to both grids
    renderArtists(artists);

  } catch (error) {
    console.error('Error loading artists:', error);
  } finally {
    if (desktopGrid) desktopGrid.style.opacity = '1';
    if (mobileGrid) mobileGrid.style.opacity = '1';
  }
}

/**
 * Render artists to both mobile and desktop grids
 */
export function renderArtists(artists) {
  const desktopGrid = document.getElementById('desktop-search-grid');
  const mobileGrid = document.getElementById('mobile-search-grid');
  const desktopCount = document.getElementById('desktop-results-count');
  const mobileCount = document.getElementById('mobile-results-count');

  const countText = `${artists.length} gevonden`;
  if (desktopCount) desktopCount.textContent = countText;
  if (mobileCount) mobileCount.textContent = countText;

  // Generate desktop card HTML
  const desktopCardHTML = (artist) => {
    const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
    const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
    const genre = (artist.genres || [])[0] || '';

    return `
      <div class="artist-card" data-artist-id="${artist.id}"
           style="background: white; border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 2px 12px rgba(128,90,213,0.06);">
        <div style="width: 80px; height: 80px; margin: 0 auto 12px; border-radius: 50%; overflow: hidden; border: 2px solid #e9e3f5; background: #f3e8ff;">
          <img src="${pic}" alt="${name}"
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:#805ad5;\\'>${name.charAt(0)}</div>'">
        </div>
        <h3 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</h3>
        ${genre ? `<p style="font-size: 12px; color: #9ca3af;">${genre}</p>` : '<p style="font-size: 12px; color: #9ca3af;">&nbsp;</p>'}
      </div>
    `;
  };

  // Generate mobile card HTML
  const mobileCardHTML = (artist) => {
    const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
    const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
    const genre = (artist.genres || [])[0] || '';

    return `
      <div data-artist-id="${artist.id}" style="text-align: center; cursor: pointer;">
        <div style="width: 100px; height: 100px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 2px solid #e9e3f5; background: #f3e8ff;">
          <img src="${pic}" alt="${name}"
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:#805ad5;\\'>${name.charAt(0)}</div>'">
        </div>
        <h3 style="font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 10px;">${name}</h3>
        ${genre ? `<p style="font-size: 11px; color: #9ca3af;">${genre}</p>` : ''}
      </div>
    `;
  };

  // Render desktop grid
  if (desktopGrid) {
    desktopGrid.innerHTML = artists.length > 0
      ? artists.map(desktopCardHTML).join('')
      : '<p style="grid-column: span 3; text-align: center; color: #9ca3af; padding: 60px 0;">Geen artiesten gevonden</p>';
  }

  // Render mobile grid
  if (mobileGrid) {
    mobileGrid.innerHTML = artists.length > 0
      ? artists.map(mobileCardHTML).join('')
      : '<p style="grid-column: span 2; text-align: center; color: #9ca3af; padding: 40px 0;">Geen artiesten gevonden</p>';
  }

  console.log('[RENDER] Rendered', artists.length, 'artists');
}

/**
 * Show artist in detail panel (desktop 3-column layout)
 */
export function showArtistInDetailPanel(artist) {
  const emptyState = document.getElementById('detail-empty-state');
  const detailContent = document.getElementById('detail-content');

  if (!emptyState || !detailContent) return;

  emptyState.style.display = 'none';
  detailContent.style.display = 'block';

  const photo = document.getElementById('detail-photo');
  const name = document.getElementById('detail-name');
  const bio = document.getElementById('detail-bio');
  const work = document.getElementById('detail-work');
  const editBtn = document.getElementById('detail-edit-btn');

  const artistName = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
  const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=e0e7ff&color=6366f1&size=150`;

  if (photo) photo.src = pic;
  if (name) name.textContent = artistName;
  if (bio) bio.textContent = artist.bio || artist.pitch || 'Geen bio beschikbaar.';
  if (work) work.textContent = artist.work || 'Geen werk beschikbaar.';

  if (editBtn) {
    editBtn.textContent = 'Bekijk Profiel';
    editBtn.onclick = () => {
      import('./search-controller.js').then(m => m.showArtistDetail(artist.id));
    };
  }

  // Highlight selected card
  document.querySelectorAll('.artist-card').forEach(card => {
    card.style.borderColor = card.dataset.artistId === artist.id ? '#805ad5' : 'transparent';
    card.style.boxShadow = card.dataset.artistId === artist.id
      ? '0 4px 20px rgba(128,90,213,0.2)'
      : '0 2px 12px rgba(128,90,213,0.06)';
  });
}

/**
 * Populate artist detail view with artist data
 */
export function populateArtistDetail(artist) {
  // Profile Picture
  const detailProfilePic = document.getElementById('detail-profile-pic');
  if (detailProfilePic) {
    const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'A';
    detailProfilePic.src = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=6366f1&size=400`;
    detailProfilePic.onerror = function() {
      this.onerror = null;
      this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=6366f1&size=400`;
    };
  }

  // Basic Info
  const artistName = document.getElementById('detail-artist-name');
  if (artistName) {
    artistName.textContent = `${artist.firstName || ''} ${artist.lastName || ''}`.trim();
  }

  const stageName = document.getElementById('detail-stage-name');
  if (stageName) {
    stageName.textContent = artist.stageName || 'N/A';
  }

  const locationEl = document.getElementById('detail-location');
  if (locationEl) {
    locationEl.textContent = artist.location || 'Not specified';
  }

  // Gender
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  const genderEl = document.getElementById('detail-gender');
  if (genderEl) {
    genderEl.textContent = genderMap[artist.gender] || 'Not specified';
  }

  // Age
  const ageEl = document.getElementById('detail-age');
  if (ageEl) {
    if (artist.dob) {
      ageEl.textContent = `${calculateAge(artist.dob)} years old`;
    } else {
      ageEl.textContent = 'Age not specified';
    }
  }

  // Genres
  const detailGenres = document.getElementById('detail-genres');
  if (detailGenres) {
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
  }

  // Languages
  const detailLanguages = document.getElementById('detail-languages');
  if (detailLanguages) {
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
  }

  // Bio & Pitch
  const bioEl = document.getElementById('detail-bio');
  if (bioEl) {
    bioEl.textContent = artist.bio || 'No bio available.';
  }

  const pitchEl = document.getElementById('detail-pitch');
  if (pitchEl) {
    pitchEl.textContent = artist.pitch || 'No pitch available.';
  }

  // Video Material
  const videoSection = document.getElementById('detail-video-section');
  const videoContainer = document.getElementById('detail-video-container');
  if (artist.videoUrl && artist.videoUrl.trim()) {
    if (videoSection) videoSection.style.display = 'block';
    const embedUrl = getEmbedUrl(artist.videoUrl, 'video');
    if (videoContainer) {
      if (embedUrl) {
        videoContainer.innerHTML = `
          <iframe class="w-full h-full" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
      } else {
        videoContainer.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <a href="${artist.videoUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">View Video (External Link)</a>
          </div>
        `;
      }
    }
  } else {
    if (videoSection) videoSection.style.display = 'none';
  }

  // Audio Material
  const audioSection = document.getElementById('detail-audio-section');
  const audioContainer = document.getElementById('detail-audio-container');
  if (artist.audioUrl && artist.audioUrl.trim()) {
    if (audioSection) audioSection.style.display = 'block';
    const embedUrl = getEmbedUrl(artist.audioUrl, 'audio');
    if (audioContainer) {
      if (embedUrl) {
        audioContainer.innerHTML = `
          <iframe class="w-full" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
        `;
      } else {
        audioContainer.innerHTML = `
          <a href="${artist.audioUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">Listen to Audio (External Link)</a>
        `;
      }
    }
  } else {
    if (audioSection) audioSection.style.display = 'none';
  }

  // Text Material
  const textSection = document.getElementById('detail-text-section');
  const textContent = document.getElementById('detail-text-content');
  if (artist.textContent && artist.textContent.trim()) {
    if (textSection) textSection.style.display = 'block';
    if (textContent) textContent.textContent = artist.textContent;
  } else {
    if (textSection) textSection.style.display = 'none';
  }

  // Document Material
  const documentSection = document.getElementById('detail-document-section');
  const documentLink = document.getElementById('detail-document-link');

  if (artist.documentUrl && artist.documentUrl.trim()) {
    if (documentSection) documentSection.style.display = 'block';
    if (documentLink) {
      documentLink.href = artist.documentUrl;
      documentLink.textContent = artist.documentName || 'Download/View Document';
    }
  } else {
    if (documentSection) documentSection.style.display = 'none';
  }

  // Contact Information - Access Control
  const currentUserData = getStore('currentUserData');
  const isPro = currentUserData && currentUserData.status === 'pro';

  const trialMessage = document.getElementById('detail-trial-message');
  const contactInfo = document.getElementById('detail-contact-info');

  if (isPro) {
    // Show contact info for Pro users
    if (trialMessage) trialMessage.style.display = 'none';
    if (contactInfo) contactInfo.style.display = 'block';

    const emailEl = document.getElementById('detail-email');
    if (emailEl) {
      emailEl.textContent = artist.email || 'Not available';
      emailEl.href = `mailto:${artist.email || ''}`;
    }

    const phoneEl = document.getElementById('detail-phone');
    if (phoneEl) {
      phoneEl.textContent = artist.phone || 'Not available';
      phoneEl.href = `tel:${artist.phone || ''}`;
    }

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
    if (trialMessage) trialMessage.style.display = 'block';
    if (contactInfo) contactInfo.style.display = 'none';
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

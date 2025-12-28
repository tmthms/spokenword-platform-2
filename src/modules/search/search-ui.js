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

  // Add pattern class to parent
  searchSection.className = 'search-pattern min-h-screen';
  searchSection.style.cssText = 'display: block; opacity: 1; visibility: visible;';

  searchSection.innerHTML = `
    <div id="search-module-root" class="max-w-7xl mx-auto px-4 py-6">

      <!-- ============ MOBILE LAYOUT ============ -->
      <div class="lg:hidden">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Zoeken</h1>

        <!-- Mobile Filter Pills -->
        <div class="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4">
          <button data-action="toggle-filter" data-target="name" id="btn-filter-name"
                  style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; font-weight: 500; color: #4a4a68;">
            Naam
          </button>
          <button data-action="toggle-filter" data-target="location" id="btn-filter-location"
                  style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; font-weight: 500; color: #4a4a68;">
            Locatie
          </button>
          <button data-action="toggle-filter" data-target="genre" id="btn-filter-genre"
                  style="flex-shrink: 0; padding: 8px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 20px; font-size: 14px; font-weight: 500; color: #4a4a68;">
            Genre
          </button>
        </div>

        <!-- Mobile Filter Panels -->
        <div id="filter-name" class="hidden" style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-name" placeholder="Naam artiest..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="name"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer;">✓</button>
          </div>
        </div>

        <div id="filter-location" class="hidden" style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-location" placeholder="Stad of regio..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="location"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer;">✓</button>
          </div>
        </div>

        <div id="filter-genre" class="hidden" style="background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(128,90,213,0.1);">
          <div id="mobile-genre-checkboxes" style="max-height: 200px; overflow-y: auto; margin-bottom: 12px;">
            <p style="color: #9ca3af; font-size: 14px;">Laden...</p>
          </div>
          <div style="display: flex; justify-content: flex-end;">
            <button data-action="apply-filter" data-target="genre"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer;">✓</button>
          </div>
        </div>

        <!-- Mobile Results -->
        <p id="mobile-results-count" style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">0 gevonden</p>
        <div id="mobile-search-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <!-- Mobile cards -->
        </div>
      </div>

      <!-- ============ DESKTOP 3-COLUMN LAYOUT ============ -->
      <div class="hidden lg:flex gap-6" style="align-items: flex-start;">

        <!-- LEFT: Filter Sidebar -->
        <aside style="width: 200px; flex-shrink: 0;">
          <h1 style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px;">Zoeken</h1>

          <div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1);">
            <h3 style="font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px;">Filter</h3>

            <!-- Genre Checkboxes -->
            <div id="desktop-genre-checkboxes" style="display: flex; flex-direction: column; gap: 10px;">
              <p style="color: #9ca3af; font-size: 14px;">Laden...</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e9e3f5; margin: 16px 0;">

            <!-- Name Search -->
            <div style="margin-bottom: 12px;">
              <input id="desktop-input-name" type="text" placeholder="Zoek op naam..."
                     style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e9e3f5; font-size: 14px; outline: none;"
                     onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e9e3f5'">
            </div>

            <!-- Location Search -->
            <div>
              <input id="desktop-input-location" type="text" placeholder="Locatie..."
                     style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #e9e3f5; font-size: 14px; outline: none;"
                     onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e9e3f5'">
            </div>
          </div>
        </aside>

        <!-- MIDDLE: Results Grid (3 columns) -->
        <main style="flex: 1; min-width: 0;">
          <p id="desktop-results-count" style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">0 gevonden</p>
          <div id="desktop-search-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <!-- Desktop cards -->
          </div>
        </main>

        <!-- RIGHT: Artist Detail Panel -->
        <aside id="desktop-artist-detail" style="width: 280px; flex-shrink: 0;">
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1); position: sticky; top: 24px;">

            <!-- Empty State -->
            <div id="detail-empty-state" style="text-align: center; padding: 40px 0;">
              <div style="width: 80px; height: 80px; background: #f3e8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg width="32" height="32" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <p style="color: #9ca3af; font-size: 14px;">Selecteer een artiest</p>
            </div>

            <!-- Artist Detail (hidden by default) -->
            <div id="detail-content" style="display: none;">
              <h2 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px;">Profiel</h2>

              <!-- Profile Photo -->
              <div style="display: flex; justify-content: center; margin-bottom: 16px;">
                <img id="detail-photo" src="" alt="Artist" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #805ad5;">
              </div>

              <!-- Name -->
              <h3 id="detail-name" style="font-size: 18px; font-weight: 600; color: #1a1a2e; text-align: center; margin-bottom: 16px;">Artist Name</h3>

              <!-- Action Button -->
              <button id="detail-message-btn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 20px;">
                Stuur Bericht
              </button>

              <!-- Bio Section -->
              <div style="margin-bottom: 16px;">
                <h4 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Over Mij</h4>
                <p id="detail-bio" style="font-size: 13px; color: #4a4a68; line-height: 1.6;">Bio komt hier...</p>
              </div>

              <!-- Genres -->
              <div>
                <h4 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Genres</h4>
                <div id="detail-genres" style="display: flex; flex-wrap: wrap; gap: 6px;">
                  <!-- Genre badges -->
                </div>
              </div>

              <!-- View Full Profile Link -->
              <a id="detail-full-profile-link" href="#" style="display: block; text-align: center; margin-top: 20px; color: #805ad5; font-size: 14px; font-weight: 500; text-decoration: none;">
                Bekijk volledig profiel →
              </a>
            </div>
          </div>
        </aside>

      </div>

    </div>
  `;

  // Populate genres
  populateGenres();

  // Setup interactions
  setupSearchInteractions();

  // Load artists
  loadArtists();

  console.log('[RENDER] Artist search rendered with 3-column desktop layout');
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
        if (p.id.startsWith('filter-') && p.classList.contains('hidden')) return;
        if (p.id !== `filter-${target}`) p.classList.add('hidden');
      });

      // Toggle this panel
      if (panel) {
        panel.classList.toggle('hidden');
      }
      return;
    }

    // Apply filter button
    const applyBtn = e.target.closest('[data-action="apply-filter"]');
    if (applyBtn) {
      const target = applyBtn.dataset.target;
      const panel = document.getElementById(`filter-${target}`);
      if (panel) panel.classList.add('hidden');
      loadArtists();
      return;
    }

    // Artist card click
    const card = e.target.closest('[data-artist-id]');
    if (card) {
      const artistId = card.dataset.artistId;

      // Check if on desktop (detail panel visible)
      const detailPanel = document.getElementById('desktop-artist-detail');
      if (detailPanel && window.innerWidth >= 1024) {
        // Desktop: Show in side panel
        import('./search-data.js').then(dataModule => {
          dataModule.fetchArtistById(artistId).then(artist => {
            if (artist) {
              showArtistInDetailPanel(artist);
            }
          });
        });

        // Highlight selected card
        document.querySelectorAll('.artist-card').forEach(c => {
          c.style.borderColor = 'transparent';
        });
        card.style.borderColor = '#805ad5';
      } else {
        // Mobile: navigate to full detail page
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

  // Desktop cards met ronde foto's
  if (desktopGrid) {
    desktopGrid.innerHTML = artists.length > 0
      ? artists.map(artist => {
          const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
          const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
          const genre = (artist.genres || [])[0] || '';

          return `
            <div class="artist-card" data-artist-id="${artist.id}"
                 style="background: white; border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; box-shadow: 0 2px 10px rgba(128,90,213,0.06);"
                 onmouseover="this.style.borderColor='#805ad5'; this.style.boxShadow='0 4px 20px rgba(128,90,213,0.15)'"
                 onmouseout="this.style.borderColor='transparent'; this.style.boxShadow='0 2px 10px rgba(128,90,213,0.06)'">
              <img src="${pic}" alt="${name}"
                   style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; border: 2px solid #e9e3f5;"
                   onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=6366f1&size=150'">
              <h3 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px;">${name}</h3>
              ${genre ? `<p style="font-size: 12px; color: #9ca3af;">${genre}</p>` : ''}
            </div>
          `;
        }).join('')
      : '<p style="grid-column: span 3; text-align: center; color: #9ca3af; padding: 40px;">Geen artiesten gevonden</p>';
  }

  // Mobile cards
  if (mobileGrid) {
    mobileGrid.innerHTML = artists.length > 0
      ? artists.map(artist => {
          const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
          const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
          const genre = (artist.genres || [])[0] || '';

          return `
            <div data-artist-id="${artist.id}" style="text-align: center; cursor: pointer;">
              <img src="${pic}" alt="${name}"
                   style="width: 100%; aspect-ratio: 1; border-radius: 50%; object-fit: cover; border: 2px solid #e9e3f5;"
                   onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=6366f1&size=150'">
              <h3 style="font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 8px;">${name}</h3>
              ${genre ? `<p style="font-size: 11px; color: #9ca3af;">${genre}</p>` : ''}
            </div>
          `;
        }).join('')
      : '<p style="grid-column: span 2; text-align: center; color: #9ca3af; padding: 40px;">Geen artiesten gevonden</p>';
  }
}

/**
 * Show artist in detail panel (desktop 3-column layout)
 */
export function showArtistInDetailPanel(artist) {
  const emptyState = document.getElementById('detail-empty-state');
  const detailContent = document.getElementById('detail-content');

  if (!emptyState || !detailContent) return;

  // Hide empty state, show content
  emptyState.style.display = 'none';
  detailContent.style.display = 'block';

  // Fill in data
  const photo = document.getElementById('detail-photo');
  const name = document.getElementById('detail-name');
  const bio = document.getElementById('detail-bio');
  const genres = document.getElementById('detail-genres');
  const messageBtn = document.getElementById('detail-message-btn');
  const fullProfileLink = document.getElementById('detail-full-profile-link');

  if (photo) {
    photo.src = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
  }
  if (name) {
    name.textContent = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
  }
  if (bio) {
    bio.textContent = artist.bio || artist.pitch || 'Geen bio beschikbaar.';
  }
  if (genres) {
    genres.innerHTML = (artist.genres || []).map(g =>
      `<span style="padding: 4px 10px; background: #f3e8ff; color: #805ad5; border-radius: 12px; font-size: 11px; font-weight: 500;">${g}</span>`
    ).join('');
  }
  if (messageBtn) {
    messageBtn.onclick = () => {
      openMessageModal(artist);
    };
  }
  if (fullProfileLink) {
    fullProfileLink.href = `#artist/${artist.id}`;
    fullProfileLink.onclick = (e) => {
      e.preventDefault();
      showArtistDetail(artist.id);
    };
  }
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

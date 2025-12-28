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

  searchSection.innerHTML = `
    <div id="search-module-root" class="w-full max-w-7xl mx-auto py-4">

      <!-- ============ MOBILE LAYOUT ============ -->
      <div class="lg:hidden px-4">

        <!-- Mobile Filter Pills -->
        <div class="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2">
          <button data-action="toggle-filter" data-target="name" id="btn-filter-name"
                  class="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap">
            Naam
          </button>
          <button data-action="toggle-filter" data-target="location" id="btn-filter-location"
                  class="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap">
            Locatie
          </button>
          <button data-action="toggle-filter" data-target="genre" id="btn-filter-genre"
                  class="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap">
            Genre
          </button>
        </div>

        <!-- Mobile Filter Panels (hidden by default) -->
        <div id="filter-name" class="hidden bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
          <div class="flex gap-2">
            <input type="text" id="mobile-input-name" placeholder="Naam artiest..."
                   class="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none">
            <button data-action="apply-filter" data-target="name"
                    class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </div>

        <div id="filter-location" class="hidden bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
          <div class="flex gap-2">
            <input type="text" id="mobile-input-location" placeholder="Stad of regio..."
                   class="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none">
            <button data-action="apply-filter" data-target="location"
                    class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </div>

        <div id="filter-genre" class="hidden bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
          <div id="mobile-genre-checkboxes" class="space-y-2 mb-3 max-h-48 overflow-y-auto">
            <p class="text-gray-400 text-sm">Laden...</p>
          </div>
          <div class="flex justify-end">
            <button data-action="apply-filter" data-target="genre"
                    class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Results Count -->
        <p id="mobile-results-count" class="text-gray-500 text-sm mb-3">0 gevonden</p>

        <!-- Mobile Results Grid (2 columns) -->
        <div id="mobile-search-grid" class="grid grid-cols-2 gap-3">
          <!-- Cards worden hier gerenderd -->
        </div>
      </div>

      <!-- ============ DESKTOP LAYOUT ============ -->
      <div class="hidden lg:flex gap-8">

        <!-- Desktop Sidebar -->
        <aside class="w-72 flex-shrink-0">
          <div class="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-sm sticky top-24">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Filters</h2>

            <!-- Name Input -->
            <div class="mb-5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Naam</label>
              <input id="desktop-input-name" type="text" placeholder="Typ een naam..."
                     class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20">
            </div>

            <!-- Location Input -->
            <div class="mb-5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Locatie</label>
              <input id="desktop-input-location" type="text" placeholder="Stad of regio..."
                     class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500/20">
            </div>

            <!-- Genre Checkboxes -->
            <div class="mb-5">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Genre</label>
              <div id="desktop-genre-checkboxes" class="space-y-2">
                <p class="text-gray-400 text-sm">Laden...</p>
              </div>
            </div>

            <!-- Apply Button -->
            <button id="apply-filters-btn" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-md transition-transform active:scale-95">
              Filters Toepassen
            </button>
          </div>

          <!-- Results Count -->
          <div class="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-sm mt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Resultaten</h2>
            <p id="desktop-results-count" class="text-sm text-gray-500">0 gevonden</p>
          </div>
        </aside>

        <!-- Desktop Results Grid (4 columns) -->
        <main class="flex-1">
          <div id="desktop-search-grid" class="grid grid-cols-4 gap-5">
            <!-- Cards worden hier gerenderd -->
          </div>
        </main>
      </div>

    </div>
  `;

  // Populate genres
  populateGenres();

  // Setup interactions
  setupSearchInteractions();

  // Load artists
  loadArtists();

  console.log('[RENDER] Search module rendered');
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
        <label class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
          <input type="checkbox" name="desktop-genre" value="${g}" class="w-4 h-4 rounded text-purple-600">
          <span class="text-sm text-gray-700">${g}</span>
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
      showArtistDetail(artistId);
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

  const generateCard = (artist, isMobile) => {
    const pic = artist.profilePicUrl || 'https://via.placeholder.com/300x400?text=No+Photo';
    const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
    const age = artist.dob ? calculateAge(artist.dob) : null;
    const location = artist.location || '';
    const genre = (artist.genres || [])[0] || '';

    if (isMobile) {
      // Mobile card: compact
      return `
        <div class="cursor-pointer" data-artist-id="${artist.id}">
          <img src="${pic}" alt="${name}" class="w-full aspect-square object-cover rounded-xl">
          <h3 class="font-medium text-sm mt-2 truncate">${name}${age ? ', ' + age : ''}</h3>
          ${genre ? `<p class="text-gray-500 text-xs truncate">${genre}</p>` : ''}
        </div>
      `;
    } else {
      // Desktop card: more detail
      return `
        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" data-artist-id="${artist.id}">
          <img src="${pic}" alt="${name}" class="w-full aspect-[3/4] object-cover">
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 truncate">${name}</h3>
            ${age ? `<p class="text-gray-500 text-sm">${age} jaar</p>` : ''}
            ${location ? `<p class="text-gray-400 text-xs">${location}</p>` : ''}
            ${genre ? `<span class="inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">${genre}</span>` : ''}
          </div>
        </div>
      `;
    }
  };

  // Render desktop grid
  if (desktopGrid) {
    desktopGrid.innerHTML = artists.map(a => generateCard(a, false)).join('');
  }

  // Render mobile grid
  if (mobileGrid) {
    mobileGrid.innerHTML = artists.map(a => generateCard(a, true)).join('');
  }
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

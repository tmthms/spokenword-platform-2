/**
 * search-ui.js
 * Handles all HTML generation for artist search
 * Premium Apple Design - Responsive filters and card layout
 */

import { calculateAge } from './search-data.js';
import { getStore } from '../../utils/store.js';
import { openMessageModal } from '../messaging/messaging-controller.js';
import { openRecommendationModal } from '../recommendations/recommendations.js';
import { hideProfileSectionsForSearch } from './search-visibility-fix.js';

/**
 * Render the artist search view HTML
 * Desktop: Split-view met sidebar links en results rechts
 * Mobile: Pills bovenaan met slide-in menus
 */
export function renderArtistSearch() {
  const searchSection = document.getElementById('artist-search-section');
  if (!searchSection) {
    console.error('[RENDER ARTIST SEARCH] artist-search-section not found!');
    return;
  }

  // Clean search view: Hide profile sections
  hideProfileSectionsForSearch();

  searchSection.innerHTML = `
    <h3 class="text-2xl font-semibold mb-6" data-i18n="search_for_artists">Search for Artists</h3>

    <!-- Split View Container -->
    <div class="flex flex-col md:flex-row gap-6">

      <!-- Desktop Sidebar - Links, alleen op desktop zichtbaar -->
      <aside id="filters-sidebar" class="hidden md:block md:w-1/4">
        <div class="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200 space-y-4 sticky top-4">

          <!-- 'Alle Genres' checkbox bovenaan -->
          <label class="flex items-center gap-2">
            <input type="checkbox" id="genre-all" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            <span class="text-sm font-medium text-gray-900" data-i18n="filter_all_genres">Alle Genres</span>
          </label>

          <hr class="border-gray-200">

          <!-- Genres verticaal -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_genres">Genres</label>
            <div class="space-y-1">
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="performance-poetry" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_performance_poetry">Performance Poetry</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="poetry-slam" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_poetry_slam">Poetry Slam</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="jazz-poetry" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_jazz_poetry">Jazz Poetry</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="rap" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_rap">Rap</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="storytelling" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_storytelling">Storytelling</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="comedy" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_comedy">Comedy</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="genre-filter" value="1-on-1" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="genre_one_on_one">1-op-1 Sessies</span>
              </label>
            </div>
          </div>

          <!-- Name input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_name">Naam</label>
            <input id="filter-name" type="text" placeholder="Naam..." class="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>

          <!-- Location input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_location">Locatie</label>
            <input id="filter-location" type="text" placeholder="Locatie..." class="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>

          <!-- Gender select -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_gender">Geslacht</label>
            <select id="filter-gender" class="w-full px-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
              <option value="" data-i18n="filter_all_genders">Alle Geslachten</option>
              <option value="f" data-i18n="filter_female">Vrouw</option>
              <option value="m" data-i18n="filter_male">Man</option>
              <option value="x" data-i18n="filter_other">Anders</option>
            </select>
          </div>

          <!-- Age range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_age_range">Leeftijd</label>
            <div class="flex items-center gap-2">
              <input id="filter-age-min" type="number" placeholder="Min" class="w-20 px-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
              <span class="text-gray-500">-</span>
              <input id="filter-age-max" type="number" placeholder="Max" class="w-20 px-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
            </div>
          </div>

          <!-- Languages -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_languages">Talen</label>
            <div class="space-y-1">
              <label class="flex items-center gap-2">
                <input type="checkbox" name="language-filter" value="nl" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="lang_dutch">Nederlands</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="language-filter" value="en" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="lang_english">Engels</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="language-filter" value="fr" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="lang_french">Frans</span>
              </label>
            </div>
          </div>

          <!-- Payment methods -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="filter_payment_methods">Betaalmethoden</label>
            <div class="space-y-1">
              <label class="flex items-center gap-2">
                <input type="checkbox" name="payment-filter" value="invoice" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="payment_invoice">Factuur</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="payment-filter" value="payrolling" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="payment_payrolling">Payrolling</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="payment-filter" value="sbk" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="payment_sbk">SBK</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="payment-filter" value="volunteer-fee" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="payment_volunteer_fee">Vrijwilligersvergoeding</span>
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" name="payment-filter" value="other" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="text-sm text-gray-700" data-i18n="payment_other">Anders</span>
              </label>
            </div>
          </div>

          <!-- Search & Clear buttons -->
          <button id="search-artists-btn" class="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all hover:shadow-md" data-i18n="search_artists_btn">
            Zoeken
          </button>
          <button id="clear-filters-btn" class="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all" data-i18n="clear_filters">
            Wis Filters
          </button>
        </div>
      </aside>

      <!-- Main Content - Rechts -->
      <main id="artist-results-main" class="flex-1 md:w-3/4">

        <!-- Mobile Filter Pills & Horizontal Bar - Alleen op mobile -->
        <div class="md:hidden mb-4 relative">
          <!-- Pills Row -->
          <div id="mobile-filter-pills" class="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            <button id="pill-genre" class="pill">Genre</button>
            <button id="pill-location" class="pill">Locatie</button>
            <button id="pill-name" class="pill">Naam</button>
            <button id="pill-other" class="pill">Overige</button>
          </div>

          <!-- Horizontal Sliding Filter Bar -->
          <div id="mobile-filter-bar" class="hidden absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20 transition-all duration-300">
            <div class="flex items-center gap-3">
              <div id="mobile-filter-bar-content" class="flex-1">
                <!-- Dynamic content inserted here -->
              </div>
              <button id="mobile-filter-bar-close" class="flex-shrink-0 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <i data-lucide="check" class="h-5 w-5"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Artist Results Grid -->
        <div id="artist-list-container" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <!-- Cards hier -->
        </div>

        <p id="artist-list-empty" class="text-gray-500 text-center mt-8 hidden" data-i18n="no_artists_found">
          Geen artiesten gevonden
        </p>
      </main>

    </div>
  `;

  // Reset setup flags
  if (searchSection) {
    searchSection.dataset.setupComplete = 'false';
  }

  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.log('[RENDER ARTIST SEARCH] ✅ Artist search view rendered');
}


/**
 * Render artists in the results container
 * Desktop: Grid layout
 * Mobile: List layout
 */
export function renderArtists(artists) {
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

  console.log(`[RENDER ARTISTS] ✅ Rendered ${artists.length} artist cards`);
}

/**
 * Create an artist card element
 * Consistent vierkante layout voor mobile EN desktop
 */
export function createArtistCard(artist) {
  const card = document.createElement('div');
  card.className = 'artist-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1';
  card.dataset.artistId = artist.id;

  // Profile picture
  const profilePic = artist.profilePicUrl || "https://placehold.co/400x400/e0e7ff/6366f1?text=No+Photo";

  // Age
  const age = artist.dob ? calculateAge(artist.dob) : (artist.age || null);
  const ageText = age ? `${age}` : '?';

  // Location
  const location = artist.location || 'BE';

  // Genres als pills (horizontal tags)
  const genrePills = artist.genres && artist.genres.length > 0
    ? artist.genres.map(g => `
        <span class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full cursor-pointer hover:bg-indigo-100 transition-colors genre-pill" data-genre="${g}">
          ${g}
        </span>
      `).join('')
    : '<span class="text-xs text-gray-400">No genres</span>';

  // APPLE-STYLE LAYOUT
  card.innerHTML = `
    <div class="w-full">
      <!-- Image met padding voor breathing room -->
      <div class="p-6 pb-4">
        <img src="${profilePic}"
             alt="${artist.stageName || 'Artist'}"
             class="w-full aspect-square object-cover rounded-lg cursor-pointer shadow-sm"
             data-card-image>
      </div>

      <!-- Card content -->
      <div class="px-6 pb-6">
        <!-- Naam (Apple style: clean, bold) -->
        <h3 class="text-xl font-semibold text-gray-900 mb-1 cursor-pointer leading-tight" data-card-name>
          ${artist.stageName || 'No Stage Name'}
        </h3>

        <!-- Leeftijd & Locatie (Apple style: gray, smaller) -->
        <p class="text-sm text-gray-500 mb-3 font-medium">
          ${ageText} jr • ${location}
        </p>

        <!-- Genre pills - horizontal flow -->
        <div class="flex flex-wrap gap-2">
          ${genrePills}
        </div>
      </div>
    </div>
  `;

  // Genre pill click handler - Quick filter
  const pills = card.querySelectorAll('.genre-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const genre = pill.dataset.genre;
      if (genre) {
        applyQuickGenreFilter(genre);
      }
    });
  });

  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  return card;
}

/**
 * Apply quick genre filter from card dropdown
 */
function applyQuickGenreFilter(genre) {
  // Uncheck 'Alle Genres'
  const allGenresCheckbox = document.getElementById('genre-all');
  if (allGenresCheckbox) {
    allGenresCheckbox.checked = false;
  }

  // Uncheck all genre checkboxes
  const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]');
  genreCheckboxes.forEach(cb => cb.checked = false);

  // Check only selected genre
  const targetCheckbox = document.querySelector(`input[name="genre-filter"][value="${genre}"]`);
  if (targetCheckbox) {
    targetCheckbox.checked = true;
  }

  // Trigger filter update (will be handled by controller's loadArtists)
  const event = new CustomEvent('quick-genre-filter', { detail: { genre } });
  document.dispatchEvent(event);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

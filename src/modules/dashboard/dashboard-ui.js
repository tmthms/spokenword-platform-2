/**
 * dashboard-ui.js
 * Apple-style UI rendering for artist dashboard
 * Focuses on clean, minimal widgets with premium styling
 */

import { calculateAge } from './dashboard-service.js';

/**
 * Renders the artist dashboard HTML structure
 * Apple-esque design: white cards, rounded corners, subtle shadows
 */
export function renderArtistDashboard() {
  const container = document.getElementById('artist-dashboard');

  if (!container) {
    console.warn("Artist dashboard container not found");
    return;
  }

  container.innerHTML = `
    <!-- Profile Overview Card -->
    <div id="artist-profile-overview" class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-8">
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <h3 class="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h3>
        <button id="edit-artist-profile-btn" class="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow">
          Edit Profile
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
        <!-- Profile Picture -->
        <div class="flex justify-center md:justify-start">
          <img id="artist-overview-pic" src="https://placehold.co/200x200/e0e7ff/6366f1?text=A" alt="Profile" class="w-52 h-52 md:w-72 md:h-72 object-cover rounded-3xl shadow-lg border border-gray-100">
        </div>

        <!-- Profile Info -->
        <div class="space-y-5">
          <div class="pb-5 border-b border-gray-50">
            <h4 id="artist-overview-name" class="text-4xl font-bold text-gray-900 tracking-tight mb-2">Artist Name</h4>
            <p id="artist-overview-stagename" class="text-2xl text-indigo-600 font-semibold">Stage Name</p>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-gray-50 p-3 rounded-xl">
              <span class="block text-xs font-semibold text-gray-500 mb-1">LOCATION</span>
              <span id="artist-overview-location" class="font-medium text-gray-900">Location</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl">
              <span class="block text-xs font-semibold text-gray-500 mb-1">PHONE</span>
              <span id="artist-overview-phone" class="font-medium text-gray-900">Phone</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl">
              <span class="block text-xs font-semibold text-gray-500 mb-1">GENDER</span>
              <span id="artist-overview-gender" class="font-medium text-gray-900">Gender</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-xl">
              <span class="block text-xs font-semibold text-gray-500 mb-1">AGE</span>
              <span id="artist-overview-age" class="font-medium text-gray-900">Age</span>
            </div>
          </div>

          <!-- Genres -->
          <div>
            <span class="block text-xs font-semibold text-gray-500 mb-2">GENRES</span>
            <div id="artist-overview-genres" class="flex flex-wrap gap-2">
              <!-- Badges will be inserted here -->
            </div>
          </div>

          <!-- Languages -->
          <div>
            <span class="block text-xs font-semibold text-gray-500 mb-2">LANGUAGES</span>
            <div id="artist-overview-languages" class="flex flex-wrap gap-2">
              <!-- Badges will be inserted here -->
            </div>
          </div>

          <!-- Payment Methods -->
          <div>
            <span class="block text-xs font-semibold text-gray-500 mb-2">PAYMENT METHODS</span>
            <div id="artist-overview-payment" class="flex flex-wrap gap-2">
              <!-- Badges will be inserted here -->
            </div>
          </div>
        </div>
      </div>

      <!-- Bio & Pitch -->
      <div class="mt-8 space-y-4">
        <div class="bg-gray-50 p-4 rounded-xl">
          <p class="text-xs font-semibold text-gray-500 mb-2">BIO</p>
          <p id="artist-overview-bio" class="text-gray-700 leading-relaxed">Bio content here</p>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl">
          <p class="text-xs font-semibold text-gray-500 mb-2">PITCH</p>
          <p id="artist-overview-pitch" class="text-gray-700 leading-relaxed">Pitch content here</p>
        </div>
      </div>
    </div>

    <!-- Profile Editor (Hidden by default) -->
    <div id="artist-profile-editor" class="hidden">
      <!-- Editor content will be rendered dynamically -->
    </div>

    <!-- Artist Recommendations Section -->
    <div id="artist-recommendations-section" class="hidden bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <h3 class="text-3xl font-bold text-gray-900 tracking-tight mb-8 pb-6 border-b border-gray-100">My Recommendations</h3>

      <!-- Loading State -->
      <div id="recommendations-loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="text-gray-600 mt-4">Loading recommendations...</p>
      </div>

      <!-- Error State -->
      <div id="recommendations-error" class="text-center py-8 text-red-600" style="display: none;">
        Error loading recommendations
      </div>

      <!-- Empty State -->
      <div id="recommendations-empty" class="text-center py-8 bg-gray-50 rounded-xl" style="display: none;">
        <p class="text-gray-600">No recommendations yet. Programmers can write recommendations after viewing your profile.</p>
      </div>

      <!-- Recommendations List -->
      <div id="recommendations-list" class="space-y-4" style="display: none;">
        <!-- Recommendations will be inserted here dynamically -->
      </div>
    </div>

    <!-- Version Badge -->
    <div class="text-center py-6 text-xs text-gray-400">
      Staging v2.1 (Modular Dashboard) [23-12-2025]
    </div>
  `;

  console.log("Artist dashboard HTML rendered with Apple-esque styling");
}

/**
 * Render the profile editor form
 */
export function renderProfileEditor() {
  const container = document.getElementById('artist-profile-editor');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Edit Artist Profile</h2>
          <p class="text-sm text-gray-500 mt-1">Update your information below.</p>
        </div>
        <button id="cancel-edit-profile-btn" class="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-xl hover:bg-gray-50">
          Cancel
        </button>
      </div>

      <!-- Main Content: 2-column on desktop -->
      <div class="flex flex-col lg:flex-row">

        <!-- LEFT COLUMN: Profile Photo -->
        <div class="lg:w-72 lg:border-r border-gray-100 p-6 lg:sticky lg:top-0 lg:self-start bg-gray-50 lg:bg-white">
          <div class="text-center">
            <img id="artist-profile-pic-preview"
                 src="https://placehold.co/150x150/e0e7ff/6366f1?text=A"
                 alt="Profile"
                 class="w-32 h-32 lg:w-36 lg:h-36 rounded-full object-cover mx-auto border-4 border-white shadow-lg">
            <label class="mt-4 inline-block cursor-pointer bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800">
              Change Photo
              <input id="artist-edit-profile-pic" type="file" accept="image/*" class="sr-only">
            </label>
            <p class="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max 5MB.</p>
          </div>
          <button id="view-public-profile-btn" type="button" class="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800">
            View Public Profile
          </button>
        </div>

        <!-- RIGHT COLUMN: Tabbed Content -->
        <div class="flex-1 min-w-0">

          <!-- Tab Navigation (desktop only) -->
          <div id="editor-tabs" class="hidden lg:flex border-b border-gray-200 bg-gray-50">
            <button type="button" class="tab-btn px-6 py-4 font-semibold border-b-2 text-indigo-600 border-indigo-600 bg-white" data-tab="basics">
              Basics & Identity
            </button>
            <button type="button" class="tab-btn px-6 py-4 font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="media">
              Bio & Media
            </button>
            <button type="button" class="tab-btn px-6 py-4 font-semibold border-b-2 border-transparent text-gray-500 hover:text-gray-700" data-tab="contact">
              Contact & Socials
            </button>
          </div>

          <!-- Form -->
          <form id="artist-profile-form">

            <!-- TAB 1: Basics & Identity -->
            <div class="tab-panel" data-tab-content="basics">
              <!-- MOBILE: Accordion Header -->
              <button type="button" class="accordion-header lg:hidden w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200" data-accordion="basics">
                <span class="font-semibold text-gray-900">1. Basics & Identity</span>
                <svg class="accordion-chevron w-5 h-5 text-gray-500 transition-transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <!-- Content -->
              <div id="tab-basics" class="accordion-content p-6 space-y-6">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Display Name (Stage Name) *</label>
                  <input id="artist-edit-stagename" type="text" required
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Location (City, Country) *</label>
                  <input id="artist-edit-location" type="text" required
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">Genres *</label>
                <div id="artist-edit-genres" class="grid grid-cols-2 md:grid-cols-3 gap-2"></div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">Languages *</label>
                <div id="artist-edit-languages" class="grid grid-cols-2 md:grid-cols-3 gap-2"></div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Short Pitch * <span class="font-normal text-gray-400">(max 150 chars)</span>
                </label>
                <textarea id="artist-edit-pitch" maxlength="150" rows="3" required
                          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"></textarea>
                <p class="text-xs text-gray-400 mt-1 text-right"><span id="pitch-char-count">0</span>/150</p>
              </div>
              </div>
            </div>

            <!-- TAB 2: Bio & Media -->
            <div class="tab-panel" data-tab-content="media">
              <!-- MOBILE: Accordion Header -->
              <button type="button" class="accordion-header lg:hidden w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200" data-accordion="media">
                <span class="font-semibold text-gray-900">2. Biography & Media</span>
                <svg class="accordion-chevron w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <!-- Content (hidden by default on mobile) -->
              <div id="tab-media" class="accordion-content p-6 space-y-6 hidden lg:hidden">

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Bio / Background Info *</label>
                <textarea id="artist-edit-bio" rows="5" required
                          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">YouTube/Vimeo Link</label>
                <input id="artist-edit-video" type="url"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Spotify/SoundCloud Link</label>
                <input id="artist-edit-audio" type="url"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Text Material <span class="font-normal text-gray-400">(up to 2000 words)</span></label>
                <textarea id="artist-edit-text" rows="5"
                          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Document (PDF, DOC, DOCX)</label>
                <input id="artist-edit-document" type="file" accept=".pdf,.doc,.docx"
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium">
              </div>
              </div>
            </div>

            <!-- TAB 3: Contact & Socials -->
            <div class="tab-panel" data-tab-content="contact">
              <!-- MOBILE: Accordion Header -->
              <button type="button" class="accordion-header lg:hidden w-full flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200" data-accordion="contact">
                <span class="font-semibold text-gray-900">3. Contact & Socials</span>
                <svg class="accordion-chevron w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <!-- Content (hidden by default on mobile) -->
              <div id="tab-contact" class="accordion-content p-6 space-y-6 hidden lg:hidden">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input id="artist-edit-phone" type="tel" required
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                  <input id="artist-edit-website" type="url"
                         class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">Payment Methods *</label>
                <div id="artist-edit-payment" class="grid grid-cols-2 gap-2"></div>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <label class="block text-sm font-semibold text-gray-700 mb-3">Notification Settings</label>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input id="artist-edit-notify-email" type="checkbox" class="w-5 h-5 rounded text-indigo-600 border-gray-300">
                    <span class="text-sm text-gray-700">Receive email notifications</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input id="artist-edit-notify-sms" type="checkbox" class="w-5 h-5 rounded text-indigo-600 border-gray-300">
                    <span class="text-sm text-gray-700">Receive SMS notifications</span>
                  </label>
                </div>
              </div>
              </div>
            </div>

            <!-- Hidden fields -->
            <input type="hidden" id="artist-edit-firstname">
            <input type="hidden" id="artist-edit-lastname">
            <input type="hidden" id="artist-edit-dob">
            <input type="hidden" id="artist-edit-gender">

          </form>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div class="flex items-center justify-end gap-4 max-w-4xl mx-auto">
          <p id="artist-profile-error" class="text-red-500 text-sm mr-auto hidden"></p>
          <p id="artist-profile-success" class="text-green-600 text-sm mr-auto hidden"></p>
          <button type="submit" form="artist-profile-form" id="save-artist-profile-btn"
                  class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  `;

  // Initialize
  initEditorTabs();
  initMobileAccordions();
  renderEditorCheckboxes();
  initPitchCounter();
}

function initEditorTabs() {
  const tabBtns = document.querySelectorAll('#editor-tabs .tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Update button styling
      tabBtns.forEach(b => {
        const isActive = b.dataset.tab === targetTab;
        b.classList.toggle('text-indigo-600', isActive);
        b.classList.toggle('border-indigo-600', isActive);
        b.classList.toggle('bg-white', isActive);
        b.classList.toggle('text-gray-500', !isActive);
        b.classList.toggle('border-transparent', !isActive);
      });

      // Show/hide content panels
      document.querySelectorAll('.accordion-content').forEach(content => {
        const panelId = content.id; // tab-basics, tab-media, tab-contact
        const panelTab = panelId.replace('tab-', '');

        if (panelTab === targetTab) {
          content.classList.remove('hidden', 'lg:hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
}

function initMobileAccordions() {
  const headers = document.querySelectorAll('.accordion-header');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      // Alleen op mobile
      if (window.innerWidth >= 1024) return;

      const targetId = header.dataset.accordion;
      const content = document.getElementById(`tab-${targetId}`);
      const chevron = header.querySelector('.accordion-chevron');
      const isOpen = !content.classList.contains('hidden');

      if (isOpen) {
        content.classList.add('hidden');
        chevron.classList.remove('rotate-180');
      } else {
        content.classList.remove('hidden', 'lg:hidden');
        chevron.classList.add('rotate-180');
        setTimeout(() => {
          header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });
}

function renderEditorCheckboxes() {
  // Genres
  const genresContainer = document.getElementById('artist-edit-genres');
  if (genresContainer) {
    const genres = [
      { value: 'performance-poetry', label: 'Performance Poetry' },
      { value: 'poetry-slam', label: 'Poetry Slam' },
      { value: 'jazz-poetry', label: 'Jazz Poetry' },
      { value: 'rap', label: 'Rap' },
      { value: 'storytelling', label: 'Storytelling' },
      { value: 'comedy', label: 'Comedy' },
      { value: '1-on-1', label: '1-on-1 Sessions' }
    ];
    genresContainer.innerHTML = genres.map(g => createCheckbox('genre', g.value, g.label)).join('');
  }

  // Languages
  const langsContainer = document.getElementById('artist-edit-languages');
  if (langsContainer) {
    const langs = [
      { value: 'nl', label: 'NL (Dutch)' },
      { value: 'en', label: 'EN (English)' },
      { value: 'fr', label: 'FR (French)' }
    ];
    langsContainer.innerHTML = langs.map(l => createCheckbox('language', l.value, l.label)).join('');
  }

  // Payment
  const paymentContainer = document.getElementById('artist-edit-payment');
  if (paymentContainer) {
    const payments = [
      { value: 'invoice', label: 'Invoice' },
      { value: 'payrolling', label: 'Payrolling' },
      { value: 'sbk', label: 'Other (SBK)' },
      { value: 'volunteer', label: 'Volunteer Fee' },
      { value: 'other', label: 'Other' }
    ];
    paymentContainer.innerHTML = payments.map(p => createCheckbox('payment', p.value, p.label)).join('');
  }
}

function createCheckbox(name, value, label) {
  return `
    <label class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 border border-gray-200">
      <input type="checkbox" name="${name}" value="${value}" class="w-4 h-4 rounded text-indigo-600 border-gray-300">
      <span class="text-sm text-gray-700">${label}</span>
    </label>
  `;
}

function initPitchCounter() {
  const pitch = document.getElementById('artist-edit-pitch');
  const counter = document.getElementById('pitch-char-count');
  if (pitch && counter) {
    const update = () => { counter.textContent = pitch.value.length; };
    pitch.addEventListener('input', update);
    update();
  }
}


/**
 * Display artist profile overview
 */
export function displayProfileOverview(currentUserData) {
  if (!currentUserData) {
    console.warn("No artist data found for overview");
    return;
  }

  // Profile Picture
  const overviewPic = document.getElementById('artist-overview-pic');
  if (overviewPic) {
    overviewPic.src = currentUserData.profilePicUrl ||
      `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.stageName || currentUserData.firstName || 'A').charAt(0))}`;
  }

  // Name & Stage Name
  document.getElementById('artist-overview-name').textContent =
    `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Artist Name';
  document.getElementById('artist-overview-stagename').textContent =
    currentUserData.stageName || 'No stage name';

  // Basic Info
  document.getElementById('artist-overview-location').textContent = currentUserData.location || 'Not specified';
  document.getElementById('artist-overview-phone').textContent = currentUserData.phone || 'Not specified';

  // Gender
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  document.getElementById('artist-overview-gender').textContent = genderMap[currentUserData.gender] || 'Not specified';

  // Age
  if (currentUserData.dob) {
    const age = calculateAge(currentUserData.dob);
    document.getElementById('artist-overview-age').textContent = `${age} years old`;
  } else {
    document.getElementById('artist-overview-age').textContent = 'Not specified';
  }

  // Genres
  const genresContainer = document.getElementById('artist-overview-genres');
  genresContainer.innerHTML = '';
  if (currentUserData.genres && currentUserData.genres.length > 0) {
    currentUserData.genres.forEach(genre => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium';
      badge.textContent = genre;
      genresContainer.appendChild(badge);
    });
  } else {
    genresContainer.textContent = 'No genres specified';
  }

  // Languages
  const languagesContainer = document.getElementById('artist-overview-languages');
  languagesContainer.innerHTML = '';
  if (currentUserData.languages && currentUserData.languages.length > 0) {
    currentUserData.languages.forEach(lang => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium';
      badge.textContent = lang.toUpperCase();
      languagesContainer.appendChild(badge);
    });
  } else {
    languagesContainer.textContent = 'No languages specified';
  }

  // Payment Methods
  const paymentContainer = document.getElementById('artist-overview-payment');
  paymentContainer.innerHTML = '';
  if (currentUserData.paymentMethods && currentUserData.paymentMethods.length > 0) {
    currentUserData.paymentMethods.forEach(method => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium';
      badge.textContent = method;
      paymentContainer.appendChild(badge);
    });
  } else {
    paymentContainer.textContent = 'No payment methods specified';
  }

  // Bio & Pitch
  document.getElementById('artist-overview-bio').textContent = currentUserData.bio || 'No bio available';
  document.getElementById('artist-overview-pitch').textContent = currentUserData.pitch || 'No pitch available';
}

/**
 * Populate the profile editor with current data
 */
export function populateProfileEditor(currentUserData) {
  if (!currentUserData) {
    console.warn("No artist data found to populate editor");
    return;
  }

  console.log("Populating profile editor with:", currentUserData);

  // Personal Details (visible fields)
  document.getElementById('artist-edit-stagename').value = currentUserData.stageName || '';
  document.getElementById('artist-edit-phone').value = currentUserData.phone || '';
  document.getElementById('artist-edit-location').value = currentUserData.location || '';

  // Hidden fields (for backward compatibility)
  document.getElementById('artist-edit-firstname').value = currentUserData.firstName || '';
  document.getElementById('artist-edit-lastname').value = currentUserData.lastName || '';
  document.getElementById('artist-edit-dob').value = currentUserData.dob || '';
  document.getElementById('artist-edit-gender').value = currentUserData.gender || '';

  // Professional Details (checkboxes with new names)
  setCheckboxValues('genre', currentUserData.genres || []);
  setCheckboxValues('language', currentUserData.languages || []);
  setCheckboxValues('payment', currentUserData.paymentMethods || []);

  // Bio & Pitch
  document.getElementById('artist-edit-bio').value = currentUserData.bio || '';
  document.getElementById('artist-edit-pitch').value = currentUserData.pitch || '';

  // Update pitch counter
  const pitchCounter = document.getElementById('pitch-char-count');
  if (pitchCounter) {
    pitchCounter.textContent = (currentUserData.pitch || '').length;
  }

  // Media
  document.getElementById('artist-edit-video').value = currentUserData.videoUrl || '';
  document.getElementById('artist-edit-audio').value = currentUserData.audioUrl || '';
  document.getElementById('artist-edit-text').value = currentUserData.textContent || '';

  // Website (new field)
  const websiteInput = document.getElementById('artist-edit-website');
  if (websiteInput) {
    websiteInput.value = currentUserData.website || '';
  }

  // Notification Settings
  document.getElementById('artist-edit-notify-email').checked = currentUserData.notifyEmail !== false;
  document.getElementById('artist-edit-notify-sms').checked = currentUserData.notifySms || false;

  // Profile Picture
  const previewImg = document.getElementById('artist-profile-pic-preview');
  if (currentUserData.profilePicUrl) {
    previewImg.src = currentUserData.profilePicUrl;
  } else {
    previewImg.src = `https://placehold.co/150x150/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.stageName || currentUserData.firstName || 'A').charAt(0))}`;
  }
}

/**
 * Helper: Set checkbox values
 */
function setCheckboxValues(name, values) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
  checkboxes.forEach(checkbox => {
    checkbox.checked = values.includes(checkbox.value);
  });
}

/**
 * Helper: Get checkbox values
 */
export function getCheckboxValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

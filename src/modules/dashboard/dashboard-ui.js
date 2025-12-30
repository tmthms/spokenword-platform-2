/**
 * dashboard-ui.js
 * Apple-style UI rendering for artist dashboard
 * Focuses on clean, minimal widgets with premium styling
 */

import { calculateAge } from './dashboard-service.js';
import { getStore } from '../../utils/store.js';

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
                <div class="flex items-center justify-between mb-3">
                  <label class="text-sm font-semibold text-gray-700">Documents (PDF, DOC, DOCX)</label>
                  <label class="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                    + Add Document
                    <input id="artist-add-document" type="file" accept=".pdf,.doc,.docx" class="sr-only">
                  </label>
                </div>
                <p class="text-xs text-gray-400 mb-3">Maximum 10MB per file</p>
                <div id="artist-documents-preview" class="space-y-2">
                  <!-- Documents rendered via JS -->
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-sm font-semibold text-gray-700">Gallery Photos</label>
                  <label class="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                    + Add Photo
                    <input id="artist-add-gallery-photo" type="file" accept="image/*" class="sr-only">
                  </label>
                </div>
                <div id="artist-gallery-preview" class="grid grid-cols-3 gap-3">
                  <!-- Photos rendered via JS -->
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">YouTube Videos</label>
                <div class="flex gap-2 mb-3">
                  <input id="youtube-url-input" type="url"
                         class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                         placeholder="https://www.youtube.com/watch?v=...">
                  <button type="button" id="add-youtube-btn" class="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 whitespace-nowrap">
                    Add Video
                  </button>
                </div>
                <div id="artist-youtube-preview" class="grid grid-cols-2 gap-3">
                  <!-- Videos rendered via JS -->
                </div>
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

  // Initialize all handlers
  initEditorTabs();
  initMobileAccordions();
  renderEditorCheckboxes();
  initPitchCounter();
  setupGalleryUploadHandler();
  setupYouTubeAddHandler();
  setupDocumentUploadHandler();
  setupProfilePicPreview();
  setupViewPublicProfileHandler();

  // Attach form submit handler
  const form = document.getElementById('artist-profile-form');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }

  // Populate with current data
  const currentUserData = getStore('currentUserData');
  if (currentUserData) {
    populateProfileEditor(currentUserData);
  }
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
export function populateProfileEditor(data) {
  if (!data) return;

  // === TAB 1: Basics & Identity ===
  setValue('artist-edit-stagename', data.stageName || '');
  setValue('artist-edit-location', data.location || '');
  setValue('artist-edit-pitch', data.pitch || '');
  checkValues('genre', data.genres || []);
  checkValues('language', data.languages || []);
  updatePitchCount();

  // === TAB 2: Bio & Media ===
  setValue('artist-edit-bio', data.bio || '');
  setValue('artist-edit-video', data.videoUrl || '');
  setValue('artist-edit-audio', data.audioUrl || '');
  setValue('artist-edit-text', data.textContent || '');
  renderGalleryPreview(data.galleryPhotos || []);
  renderYouTubePreview(data.youtubeVideos || []);
  renderDocumentsPreview(data.documents || []);

  // === TAB 3: Contact & Socials ===
  setValue('artist-edit-phone', data.phone || '');
  setValue('artist-edit-website', data.website || '');
  checkValues('payment', data.paymentMethods || []);
  setChecked('artist-edit-notify-email', data.notifyEmail !== false);
  setChecked('artist-edit-notify-sms', data.notifySms === true);

  // === Hidden fields ===
  setValue('artist-edit-firstname', data.firstName || '');
  setValue('artist-edit-lastname', data.lastName || '');
  setValue('artist-edit-dob', data.dob || '');
  setValue('artist-edit-gender', data.gender || '');

  // === Profile Picture ===
  const picPreview = document.getElementById('artist-profile-pic-preview');
  if (picPreview) {
    picPreview.src = data.profilePicUrl ||
      `https://placehold.co/150x150/e0e7ff/6366f1?text=${encodeURIComponent((data.stageName || 'A').charAt(0))}`;
  }

  console.log('[EDITOR] Form populated with user data');
}

// === Helper Functions ===

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setChecked(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = checked;
}

function checkValues(name, values) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
    cb.checked = values.includes(cb.value);
  });
}

function updatePitchCount() {
  const pitch = document.getElementById('artist-edit-pitch');
  const counter = document.getElementById('pitch-char-count');
  if (pitch && counter) {
    counter.textContent = pitch.value.length;
  }
}

/**
 * Helper: Get checkbox values
 */
export function getCheckboxValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

// === Gallery Functions ===

function renderGalleryPreview(photos) {
  const container = document.getElementById('artist-gallery-preview');
  if (!container) return;

  if (!photos || photos.length === 0) {
    container.innerHTML = `
      <div class="col-span-3 py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
        No photos uploaded yet
      </div>
    `;
    return;
  }

  container.innerHTML = photos.map((url, index) => `
    <div class="relative group aspect-square">
      <img src="${url}" alt="Gallery photo" class="w-full h-full object-cover rounded-xl">
      <button type="button"
              class="delete-gallery-photo absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
              data-index="${index}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Attach delete handlers
  container.querySelectorAll('.delete-gallery-photo').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const index = parseInt(btn.dataset.index);
      await deleteGalleryPhoto(index);
    });
  });
}

async function deleteGalleryPhoto(index) {
  if (!confirm('Delete this photo?')) return;

  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');
    const { getStore, setStore } = await import('../../utils/store.js');

    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');
    const photos = [...(currentUserData.galleryPhotos || [])];
    photos.splice(index, 1);

    await updateDoc(doc(db, 'artists', currentUser.uid), { galleryPhotos: photos });

    setStore('currentUserData', { ...currentUserData, galleryPhotos: photos });
    renderGalleryPreview(photos);
    console.log('[GALLERY] Photo deleted');
  } catch (error) {
    console.error('[GALLERY] Delete error:', error);
    alert('Error deleting photo');
  }
}

function setupGalleryUploadHandler() {
  const input = document.getElementById('artist-add-gallery-photo');
  if (!input) return;

  input.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase.js');
      const { getStore, setStore } = await import('../../utils/store.js');

      const currentUser = getStore('currentUser');
      const currentUserData = getStore('currentUserData');

      // Upload
      const storage = getStorage();
      const fileName = `gallery_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `artists/${currentUser.uid}/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      await updateDoc(doc(db, 'artists', currentUser.uid), {
        galleryPhotos: arrayUnion(downloadURL)
      });

      // Update local
      const photos = [...(currentUserData.galleryPhotos || []), downloadURL];
      setStore('currentUserData', { ...currentUserData, galleryPhotos: photos });
      renderGalleryPreview(photos);

      // Reset input
      input.value = '';
      console.log('[GALLERY] Photo uploaded');
    } catch (error) {
      console.error('[GALLERY] Upload error:', error);
      alert('Error uploading photo');
    }
  });
}

// === YouTube Functions ===

function renderYouTubePreview(videos) {
  const container = document.getElementById('artist-youtube-preview');
  if (!container) return;

  if (!videos || videos.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
        No videos added yet
      </div>
    `;
    return;
  }

  container.innerHTML = videos.map((video, index) => {
    const videoId = video.videoId || extractYouTubeId(video.url || video);
    if (!videoId) return '';

    return `
      <div class="relative group aspect-video">
        <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg"
             alt="Video thumbnail"
             class="w-full h-full object-cover rounded-xl">
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <button type="button"
                class="delete-youtube-video absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                data-index="${index}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');

  // Attach delete handlers
  container.querySelectorAll('.delete-youtube-video').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const index = parseInt(btn.dataset.index);
      await deleteYouTubeVideo(index);
    });
  });
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

async function deleteYouTubeVideo(index) {
  if (!confirm('Delete this video?')) return;

  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');
    const { getStore, setStore } = await import('../../utils/store.js');

    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');
    const videos = [...(currentUserData.youtubeVideos || [])];
    videos.splice(index, 1);

    await updateDoc(doc(db, 'artists', currentUser.uid), { youtubeVideos: videos });

    setStore('currentUserData', { ...currentUserData, youtubeVideos: videos });
    renderYouTubePreview(videos);
    console.log('[YOUTUBE] Video deleted');
  } catch (error) {
    console.error('[YOUTUBE] Delete error:', error);
    alert('Error deleting video');
  }
}

function setupYouTubeAddHandler() {
  const addBtn = document.getElementById('add-youtube-btn');
  const input = document.getElementById('youtube-url-input');
  if (!addBtn || !input) return;

  addBtn.addEventListener('click', async () => {
    const url = input.value.trim();
    if (!url) {
      alert('Please enter a YouTube URL');
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    try {
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase.js');
      const { getStore, setStore } = await import('../../utils/store.js');

      const currentUser = getStore('currentUser');
      const currentUserData = getStore('currentUserData');

      const videoData = { url, videoId, addedAt: new Date().toISOString() };

      await updateDoc(doc(db, 'artists', currentUser.uid), {
        youtubeVideos: arrayUnion(videoData)
      });

      const videos = [...(currentUserData.youtubeVideos || []), videoData];
      setStore('currentUserData', { ...currentUserData, youtubeVideos: videos });
      renderYouTubePreview(videos);

      input.value = '';
      console.log('[YOUTUBE] Video added');
    } catch (error) {
      console.error('[YOUTUBE] Add error:', error);
      alert('Error adding video');
    }
  });
}

// === Document Functions ===

function renderDocumentsPreview(documents) {
  const container = document.getElementById('artist-documents-preview');
  if (!container) return;

  if (!documents || documents.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
        No documents uploaded yet
      </div>
    `;
    return;
  }

  container.innerHTML = documents.map((doc, index) => `
    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">${doc.name || 'Document'}</p>
          <a href="${doc.url}" target="_blank" class="text-xs text-indigo-600 hover:underline">View</a>
        </div>
      </div>
      <button type="button"
              class="delete-document w-8 h-8 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-200"
              data-index="${index}">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Attach delete handlers
  container.querySelectorAll('.delete-document').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const index = parseInt(btn.dataset.index);
      await deleteDocument(index);
    });
  });
}

async function deleteDocument(index) {
  if (!confirm('Delete this document?')) return;

  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');
    const { getStore, setStore } = await import('../../utils/store.js');

    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');
    const documents = [...(currentUserData.documents || [])];
    documents.splice(index, 1);

    await updateDoc(doc(db, 'artists', currentUser.uid), { documents });

    setStore('currentUserData', { ...currentUserData, documents });
    renderDocumentsPreview(documents);
    console.log('[DOCUMENTS] Document deleted');
  } catch (error) {
    console.error('[DOCUMENTS] Delete error:', error);
    alert('Error deleting document');
  }
}

function setupDocumentUploadHandler() {
  const input = document.getElementById('artist-add-document');
  if (!input) return;

  input.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Document must be less than 10MB');
      input.value = '';
      return;
    }

    try {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { db } = await import('../../services/firebase.js');
      const { getStore, setStore } = await import('../../utils/store.js');

      const currentUser = getStore('currentUser');
      const currentUserData = getStore('currentUserData');

      // Upload
      const storage = getStorage();
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `artists/${currentUser.uid}/docs/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const docData = {
        name: file.name,
        url: downloadURL,
        uploadedAt: new Date().toISOString()
      };

      // Update Firestore
      await updateDoc(doc(db, 'artists', currentUser.uid), {
        documents: arrayUnion(docData)
      });

      // Update local
      const documents = [...(currentUserData.documents || []), docData];
      setStore('currentUserData', { ...currentUserData, documents });
      renderDocumentsPreview(documents);

      input.value = '';
      console.log('[DOCUMENTS] Document uploaded');
    } catch (error) {
      console.error('[DOCUMENTS] Upload error:', error);
      alert('Error uploading document');
    }
  });
}

/**
 * Setup profile picture preview
 */
function setupProfilePicPreview() {
  const input = document.getElementById('artist-edit-profile-pic');
  const preview = document.getElementById('artist-profile-pic-preview');
  if (!input || !preview) return;

  input.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Get checked checkbox values by name
 */
function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(cb => cb.value);
}

/**
 * Handle profile form submission
 */
async function handleProfileSubmit(e) {
  e.preventDefault();

  const errorMsg = document.getElementById('artist-profile-error');
  const successMsg = document.getElementById('artist-profile-success');
  const submitBtn = document.getElementById('save-artist-profile-btn');

  // Reset messages
  if (errorMsg) {
    errorMsg.classList.add('hidden');
    errorMsg.textContent = '';
  }
  if (successMsg) {
    successMsg.classList.add('hidden');
    successMsg.textContent = '';
  }

  // Disable button
  const originalBtnText = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { db } = await import('../../services/firebase.js');
    const { getStore, setStore } = await import('../../utils/store.js');

    const currentUser = getStore('currentUser');
    if (!currentUser) throw new Error('Not logged in');

    // === Collect data from all tabs ===
    const profileData = {
      // Tab 1: Basics & Identity
      stageName: document.getElementById('artist-edit-stagename')?.value.trim() || '',
      location: document.getElementById('artist-edit-location')?.value.trim() || '',
      pitch: document.getElementById('artist-edit-pitch')?.value.trim() || '',
      genres: getCheckedValues('genre'),
      languages: getCheckedValues('language'),

      // Tab 2: Bio & Media
      bio: document.getElementById('artist-edit-bio')?.value.trim() || '',
      videoUrl: document.getElementById('artist-edit-video')?.value.trim() || '',
      audioUrl: document.getElementById('artist-edit-audio')?.value.trim() || '',
      textContent: document.getElementById('artist-edit-text')?.value.trim() || '',

      // Tab 3: Contact & Socials
      phone: document.getElementById('artist-edit-phone')?.value.trim() || '',
      website: document.getElementById('artist-edit-website')?.value.trim() || '',
      paymentMethods: getCheckedValues('payment'),
      notifyEmail: document.getElementById('artist-edit-notify-email')?.checked ?? true,
      notifySms: document.getElementById('artist-edit-notify-sms')?.checked ?? false,

      // Hidden fields (preserve existing data)
      firstName: document.getElementById('artist-edit-firstname')?.value || '',
      lastName: document.getElementById('artist-edit-lastname')?.value || '',
      dob: document.getElementById('artist-edit-dob')?.value || '',
      gender: document.getElementById('artist-edit-gender')?.value || ''
    };

    // === Validation ===
    if (!profileData.stageName) {
      throw new Error('Display name is required');
    }
    if (!profileData.location) {
      throw new Error('Location is required');
    }
    if (!profileData.pitch) {
      throw new Error('Short pitch is required');
    }
    if (profileData.genres.length === 0) {
      throw new Error('Please select at least one genre');
    }
    if (profileData.languages.length === 0) {
      throw new Error('Please select at least one language');
    }
    if (!profileData.bio) {
      throw new Error('Bio is required');
    }
    if (!profileData.phone) {
      throw new Error('Phone number is required');
    }
    if (profileData.paymentMethods.length === 0) {
      throw new Error('Please select at least one payment method');
    }

    // === Profile Picture Upload ===
    const picInput = document.getElementById('artist-edit-profile-pic');
    if (picInput?.files?.[0]) {
      const file = picInput.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Profile picture must be less than 5MB');
      }

      const storage = getStorage();
      const storageRef = ref(storage, `artists/${currentUser.uid}/profile_${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      profileData.profilePicUrl = await getDownloadURL(storageRef);
      console.log('[SAVE] Profile picture uploaded');
    }

    // === Save to Firestore ===
    const docRef = doc(db, 'artists', currentUser.uid);
    await updateDoc(docRef, profileData);

    // === Update local store ===
    const currentUserData = getStore('currentUserData');
    setStore('currentUserData', { ...currentUserData, ...profileData });

    // === Success feedback ===
    if (successMsg) {
      successMsg.textContent = '✓ Profile saved successfully!';
      successMsg.classList.remove('hidden');
    }

    console.log('[SAVE] Profile saved successfully');

    // === Redirect to profile page after short delay ===
    setTimeout(async () => {
      const { showArtistOwnProfile } = await import('../../ui/ui.js');

      // Hide editor
      const editor = document.getElementById('artist-profile-editor');
      if (editor) editor.classList.add('hidden');

      // Show profile
      if (showArtistOwnProfile) {
        showArtistOwnProfile();
      }
    }, 1000); // 1 second delay to show success message

  } catch (error) {
    console.error('[SAVE] Error:', error);

    if (errorMsg) {
      errorMsg.textContent = error.message || 'Error saving profile';
      errorMsg.classList.remove('hidden');
    }
  } finally {
    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText || 'Save All Changes';
    }
  }
}

/**
 * Setup view public profile button handler
 */
function setupViewPublicProfileHandler() {
  const btn = document.getElementById('view-public-profile-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // Hide editor, show public profile view
    const editor = document.getElementById('artist-profile-editor');
    if (editor) editor.classList.add('hidden');

    // Trigger the artist own profile view
    const { showArtistOwnProfile } = await import('../../ui/ui.js');
    if (showArtistOwnProfile) {
      showArtistOwnProfile();
    }
  });
}

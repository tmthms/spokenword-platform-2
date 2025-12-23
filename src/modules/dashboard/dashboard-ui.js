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

  if (!container) {
    console.warn("Profile editor container not found");
    return;
  }

  container.innerHTML = `
    <div class="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h4 class="text-3xl font-bold text-gray-900 tracking-tight">Edit Your Profile</h4>
          <p class="text-sm text-gray-500 mt-2">Update your information below. Fields marked with * are required.</p>
        </div>
        <button id="cancel-edit-profile-btn" class="text-gray-600 hover:text-gray-900 font-semibold transition-colors px-4 py-2 rounded-xl hover:bg-gray-50">
          Cancel
        </button>
      </div>

      <form id="artist-profile-form" class="space-y-10">

        <!-- Profile Picture -->
        <div class="border-b border-gray-100 pb-8">
          <h5 class="text-xl font-bold text-gray-900 mb-6">Profile Picture</h5>
          <div class="flex items-center gap-8">
            <img id="artist-profile-pic-preview" src="https://placehold.co/100x100/e0e7ff/6366f1?text=Your+Photo" alt="Profile preview" class="w-28 h-28 rounded-3xl object-cover shadow-md border border-gray-100">
            <div class="flex flex-col gap-3">
              <label for="artist-edit-profile-pic" class="cursor-pointer bg-gray-900 text-white py-3 px-6 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-all inline-block text-center shadow-sm hover:shadow">
                Upload New Photo
                <input id="artist-edit-profile-pic" type="file" accept="image/*" class="sr-only">
              </label>
              <p class="text-xs text-gray-500 leading-relaxed">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        <!-- Personal Details -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Personal Details</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="artist-edit-firstname" class="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
              <input id="artist-edit-firstname" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-lastname" class="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
              <input id="artist-edit-lastname" type="text" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-stagename" class="block text-sm font-semibold text-gray-700 mb-2">Stage Name</label>
              <input id="artist-edit-stagename" type="text" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-phone" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <input id="artist-edit-phone" type="tel" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-dob" class="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
              <input id="artist-edit-dob" type="date" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-gender" class="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
              <select id="artist-edit-gender" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                <option value="">Select...</option>
                <option value="f">Female</option>
                <option value="m">Male</option>
                <option value="x">Other / Prefer not to say</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label for="artist-edit-location" class="block text-sm font-semibold text-gray-700 mb-2">Location (City, Country) *</label>
              <input id="artist-edit-location" type="text" required placeholder="e.g. Amsterdam, Netherlands" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
          </div>
        </div>

        <!-- Professional Details with CHECKBOX GROUPS -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Professional Details</h5>

          <!-- Genres -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Genres (select all that apply) *</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              ${renderCheckbox('artist-edit-genres', 'performance-poetry', 'Performance Poetry')}
              ${renderCheckbox('artist-edit-genres', 'poetry-slam', 'Poetry Slam')}
              ${renderCheckbox('artist-edit-genres', 'jazz-poetry', 'Jazz Poetry')}
              ${renderCheckbox('artist-edit-genres', 'rap', 'Rap')}
              ${renderCheckbox('artist-edit-genres', 'storytelling', 'Storytelling')}
              ${renderCheckbox('artist-edit-genres', 'comedy', 'Comedy')}
              ${renderCheckbox('artist-edit-genres', '1-on-1', '1-on-1 Sessions')}
            </div>
          </div>

          <!-- Languages -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Languages (select all that apply) *</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              ${renderCheckbox('artist-edit-languages', 'nl', 'NL (Dutch)')}
              ${renderCheckbox('artist-edit-languages', 'en', 'EN (English)')}
              ${renderCheckbox('artist-edit-languages', 'fr', 'FR (French)')}
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-3">Payment Methods (select all that apply) *</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              ${renderCheckbox('artist-edit-payment', 'invoice', 'Invoice')}
              ${renderCheckbox('artist-edit-payment', 'payrolling', 'Payrolling')}
              ${renderCheckbox('artist-edit-payment', 'sbk', 'Other (SBK)')}
              ${renderCheckbox('artist-edit-payment', 'volunteer-fee', 'Volunteer Fee')}
              ${renderCheckbox('artist-edit-payment', 'other', 'Other')}
            </div>
          </div>

          <!-- Bio & Pitch -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="artist-edit-bio" class="block text-sm font-semibold text-gray-700 mb-2">Bio / Background Info *</label>
              <textarea id="artist-edit-bio" rows="4" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
            </div>
            <div>
              <label for="artist-edit-pitch" class="block text-sm font-semibold text-gray-700 mb-2">Pitch (a short summary for programmers) *</label>
              <textarea id="artist-edit-pitch" rows="2" required class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
            </div>
          </div>
        </div>

        <!-- Media & Portfolio -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Media & Portfolio</h5>
          <div class="space-y-4">
            <div>
              <label for="artist-edit-video" class="block text-sm font-semibold text-gray-700 mb-2">YouTube/Vimeo Link</label>
              <input id="artist-edit-video" type="url" placeholder="https://youtube.com/watch?v=..." class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-audio" class="block text-sm font-semibold text-gray-700 mb-2">Spotify/SoundCloud Link</label>
              <input id="artist-edit-audio" type="url" placeholder="https://soundcloud.com/..." class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="artist-edit-text" class="block text-sm font-semibold text-gray-700 mb-2">Text Material (up to 2000 words)</label>
              <textarea id="artist-edit-text" rows="8" class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
            </div>

            <!-- Document Upload -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Document (PDF, DOC, DOCX)</label>
              <div class="flex items-center gap-4">
                <label for="artist-edit-document" class="cursor-pointer bg-gray-900 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                  Choose File
                  <input id="artist-edit-document" type="file" accept=".pdf,.doc,.docx" class="sr-only">
                </label>
                <span id="artist-document-filename" class="text-sm text-gray-500">No file chosen</span>
              </div>
              <p class="mt-2 text-xs text-gray-500">Maximum file size: 10MB</p>
              <div id="artist-current-document" class="mt-2 hidden">
                <p class="text-sm text-gray-700">Current document: <a id="artist-current-document-link" href="#" target="_blank" class="text-indigo-600 hover:text-indigo-800 underline">View</a></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Notification Settings</h5>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input id="artist-edit-notify-email" type="checkbox" class="w-5 h-5 text-indigo-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition-all">
              <span class="text-sm text-gray-700 group-hover:text-gray-900">Receive email notifications</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input id="artist-edit-notify-sms" type="checkbox" class="w-5 h-5 text-indigo-600 bg-gray-50 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition-all">
              <span class="text-sm text-gray-700 group-hover:text-gray-900">Receive SMS notifications (for direct messages from programmers only)</span>
            </label>
          </div>
        </div>

        <!-- Save Button -->
        <div class="space-y-4 pt-4">
          <button type="submit" class="w-full bg-indigo-600 text-white px-6 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
            Save All Changes
          </button>
          <p id="artist-profile-success" class="text-green-600 text-sm text-center"></p>
          <p id="artist-profile-error" class="text-red-600 text-sm text-center"></p>
        </div>
      </form>
    </div>
  `;

  console.log("Profile editor rendered");
}

/**
 * Helper: Render checkbox input
 */
function renderCheckbox(name, value, label) {
  return `
    <label class="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group">
      <input type="checkbox" name="${name}" value="${value}" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
      <span class="text-sm text-gray-700 group-hover:text-gray-900">${label}</span>
    </label>
  `;
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

  // Personal Details
  document.getElementById('artist-edit-firstname').value = currentUserData.firstName || '';
  document.getElementById('artist-edit-lastname').value = currentUserData.lastName || '';
  document.getElementById('artist-edit-stagename').value = currentUserData.stageName || '';
  document.getElementById('artist-edit-phone').value = currentUserData.phone || '';
  document.getElementById('artist-edit-dob').value = currentUserData.dob || '';
  document.getElementById('artist-edit-gender').value = currentUserData.gender || '';
  document.getElementById('artist-edit-location').value = currentUserData.location || '';

  // Professional Details (checkboxes)
  setCheckboxValues('artist-edit-genres', currentUserData.genres || []);
  setCheckboxValues('artist-edit-languages', currentUserData.languages || []);
  setCheckboxValues('artist-edit-payment', currentUserData.paymentMethods || []);

  // Bio & Pitch
  document.getElementById('artist-edit-bio').value = currentUserData.bio || '';
  document.getElementById('artist-edit-pitch').value = currentUserData.pitch || '';

  // Media
  document.getElementById('artist-edit-video').value = currentUserData.videoUrl || '';
  document.getElementById('artist-edit-audio').value = currentUserData.audioUrl || '';
  document.getElementById('artist-edit-text').value = currentUserData.textContent || '';

  // Notification Settings
  document.getElementById('artist-edit-notify-email').checked = currentUserData.notifyEmail !== false;
  document.getElementById('artist-edit-notify-sms').checked = currentUserData.notifySms || false;

  // Profile Picture
  const previewImg = document.getElementById('artist-profile-pic-preview');
  if (currentUserData.profilePicUrl) {
    previewImg.src = currentUserData.profilePicUrl;
  } else {
    previewImg.src = `https://placehold.co/100x100/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.stageName || currentUserData.firstName || 'A').charAt(0))}`;
  }

  // Document
  const currentDocDiv = document.getElementById('artist-current-document');
  const currentDocLink = document.getElementById('artist-current-document-link');
  if (currentUserData.documentUrl) {
    currentDocDiv.classList.remove('hidden');
    currentDocLink.href = currentUserData.documentUrl;
  } else {
    currentDocDiv.classList.add('hidden');
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

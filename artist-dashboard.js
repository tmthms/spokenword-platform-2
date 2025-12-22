// IMPROVED artist-dashboard.js

import { getStore, setStore } from './store.js';
import { db } from './firebase.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { getCheckboxValues, setCheckboxValues } from './checkbox-helpers.js';
import { loadRecommendations } from './recommendations.js';

/**
 * Renders the artist dashboard HTML structure
 */
export function renderArtistDashboard() {
  const container = document.getElementById('artist-dashboard');

  if (!container) {
    console.warn("Artist dashboard container not found");
    return;
  }

  container.innerHTML = `
    <!-- Profile Overview Card -->
    <div id="artist-profile-overview" class="bg-white p-8 rounded-lg shadow-xl mb-6">
        <h3 class="text-2xl font-semibold mb-6 flex items-center justify-between">
            <span>Your Profile</span>
            <button id="edit-artist-profile-btn" class="text-sm bg-indigo-600 text-white px-5 py-2 rounded-md font-medium hover:bg-indigo-700">
                Edit Profile
            </button>
        </h3>

        <div class="flex flex-col md:flex-row gap-6">
            <!-- Profile Picture -->
            <div class="flex-shrink-0">
                <img id="artist-overview-pic" src="https://placehold.co/200x200/e0e7ff/6366f1?text=A" alt="Profile" class="h-48 w-48 object-cover rounded-lg shadow-lg">
            </div>

            <!-- Profile Info -->
            <div class="flex-1">
                <h4 id="artist-overview-name" class="text-3xl font-bold text-gray-900 mb-2">Artist Name</h4>
                <p id="artist-overview-stagename" class="text-xl text-indigo-600 font-semibold mb-4">Stage Name</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                        <span class="font-semibold">Location:</span>
                        <span id="artist-overview-location" class="ml-2">Location</span>
                    </div>
                    <div>
                        <span class="font-semibold">Phone:</span>
                        <span id="artist-overview-phone" class="ml-2">Phone</span>
                    </div>
                    <div>
                        <span class="font-semibold">Gender:</span>
                        <span id="artist-overview-gender" class="ml-2">Gender</span>
                    </div>
                    <div>
                        <span class="font-semibold">Age:</span>
                        <span id="artist-overview-age" class="ml-2">Age</span>
                    </div>
                </div>

                <div class="mt-4">
                    <div class="mb-2">
                        <span class="font-semibold text-gray-700">Genres:</span>
                        <div id="artist-overview-genres" class="inline-flex flex-wrap gap-2 ml-2">
                            <!-- Badges will be inserted here -->
                        </div>
                    </div>
                    <div class="mb-2">
                        <span class="font-semibold text-gray-700">Languages:</span>
                        <div id="artist-overview-languages" class="inline-flex flex-wrap gap-2 ml-2">
                            <!-- Badges will be inserted here -->
                        </div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-700">Payment Methods:</span>
                        <div id="artist-overview-payment" class="inline-flex flex-wrap gap-2 ml-2">
                            <!-- Badges will be inserted here -->
                        </div>
                    </div>
                </div>

                <div class="mt-4">
                    <p class="font-semibold text-gray-700">Bio:</p>
                    <p id="artist-overview-bio" class="text-gray-600 mt-1">Bio content here</p>
                </div>

                <div class="mt-3">
                    <p class="font-semibold text-gray-700">Pitch:</p>
                    <p id="artist-overview-pitch" class="text-gray-600 mt-1">Pitch content here</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Profile Editor -->
    <div id="artist-profile-editor" class="bg-white p-8 rounded-lg shadow-xl hidden">
        <h4 class="text-xl font-semibold mb-4" data-i18n="edit_your_profile">Edit Your Profile</h4>
        <p class="text-gray-600 mb-6" data-i18n="update_info_below">Update your information below. Fields marked with * are required.</p>

        <form id="artist-profile-form" class="space-y-8">

            <!-- Profile Picture -->
            <div class="border-b border-gray-200 pb-6">
                <h5 class="text-lg font-semibold mb-4">Profile Picture</h5>
                <div class="mt-2 flex items-center space-x-4">
                    <img id="artist-profile-pic-preview" src="https://placehold.co/100x100/e0e7ff/6366f1?text=Your+Photo" alt="Profile preview" class="h-24 w-24 rounded-full object-cover">
                    <div class="flex flex-col">
                        <label for="artist-edit-profile-pic" class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                            <span>Upload New Photo</span>
                            <input id="artist-edit-profile-pic" type="file" accept="image/*" class="sr-only">
                        </label>
                        <p class="mt-2 text-sm text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                    <!-- Artist Public Preview Section -->
                    <div id="artist-public-preview" class="bg-white p-8 rounded-lg shadow-xl mt-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-2xl font-semibold">Public Profile Preview</h3>
                            <button id="refresh-preview-btn" class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700">
                                <i data-lucide="refresh-cw" class="h-4 w-4 inline mr-1"></i>
                                Refresh Preview
                            </button>
                        </div>

                        <div class="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                            <p class="text-sm text-gray-600 mb-4">
                                <i data-lucide="info" class="h-4 w-4 inline mr-1"></i>
                                This is how programmers see your profile when they search for artists.
                            </p>

                            <!-- Preview Content Container -->
                            <div id="preview-content" class="bg-white rounded-lg shadow-lg">
                                <!-- Preview will be rendered here -->
                                <div class="text-center py-12 text-gray-500">
                                    <i data-lucide="eye" class="h-12 w-12 mx-auto mb-4 text-gray-400"></i>
                                    <p>Click "Refresh Preview" to see how your profile looks</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Personal Details -->
            <div class="border-b border-gray-200 pb-6">
                <h5 class="text-lg font-semibold mb-4">Personal Details</h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="artist-edit-firstname" class="block text-sm font-medium text-gray-700">First Name *</label>
                        <input id="artist-edit-firstname" type="text" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-lastname" class="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input id="artist-edit-lastname" type="text" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-stagename" class="block text-sm font-medium text-gray-700">Stage Name</label>
                        <input id="artist-edit-stagename" type="text" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-phone" class="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input id="artist-edit-phone" type="tel" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-dob" class="block text-sm font-medium text-gray-700">Date of Birth *</label>
                        <input id="artist-edit-dob" type="date" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-gender" class="block text-sm font-medium text-gray-700">Gender *</label>
                        <select id="artist-edit-gender" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">Select...</option>
                            <option value="f">Female</option>
                            <option value="m">Male</option>
                            <option value="x">Other / Prefer not to say</option>
                        </select>
                    </div>
                    <div class="md:col-span-2">
                        <label for="artist-edit-location" class="block text-sm font-medium text-gray-700">Location (City, Country) *</label>
                        <input id="artist-edit-location" type="text" required placeholder="e.g. Amsterdam, Netherlands" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                </div>
            </div>

            <!-- Professional Details with CHECKBOX GROUPS -->
            <div class="border-b border-gray-200 pb-6">
                <h5 class="text-lg font-semibold mb-4">Professional Details</h5>

                <!-- Genres as Checkboxes -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Genres (select all that apply) *</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="performance-poetry" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Performance Poetry</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="poetry-slam" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Poetry Slam</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="jazz-poetry" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Jazz Poetry</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="rap" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Rap</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="storytelling" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Storytelling</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="comedy" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Comedy</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-genres" value="1-on-1" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">1-op-1 Sessies</span>
                        </label>
                    </div>
                </div>

                <!-- Languages as Checkboxes -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Languages (select all that apply) *</label>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-languages" value="nl" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">NL (Dutch)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-languages" value="en" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">EN (English)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-languages" value="fr" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">FR (French)</span>
                        </label>
                    </div>
                </div>

                <!-- Payment Methods as Checkboxes -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Methods (select all that apply) *</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-payment" value="invoice" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Invoice</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-payment" value="payrolling" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Payrolling</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-payment" value="sbk" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Other (SBK)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-payment" value="volunteer-fee" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Volunteer Fee</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input type="checkbox" name="artist-edit-payment" value="other" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <span class="text-sm">Other</span>
                        </label>
                    </div>
                </div>

                <!-- Bio & Pitch -->
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label for="artist-edit-bio" class="block text-sm font-medium text-gray-700">Bio / Background Info *</label>
                        <textarea id="artist-edit-bio" rows="4" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    <div>
                        <label for="artist-edit-pitch" class="block text-sm font-medium text-gray-700">Pitch (a short summary for programmers) *</label>
                        <textarea id="artist-edit-pitch" rows="2" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                </div>
            </div>

            <!-- Media & Portfolio -->
            <div class="border-b border-gray-200 pb-6">
                <h5 class="text-lg font-semibold mb-4">Media & Portfolio</h5>
                <div class="space-y-4">
                    <div>
                        <label for="artist-edit-video" class="block text-sm font-medium text-gray-700">YouTube/Vimeo Link</label>
                        <input id="artist-edit-video" type="url" placeholder="https://youtube.com/watch?v=..." class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-audio" class="block text-sm font-medium text-gray-700">Spotify/SoundCloud Link</label>
                        <input id="artist-edit-audio" type="url" placeholder="https://soundcloud.com/..." class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label for="artist-edit-text" class="block text-sm font-medium text-gray-700">Text Material (up to 2000 words)</label>
                        <textarea id="artist-edit-text" rows="8" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>

                    <!-- NEW: Document Upload -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2" data-i18n="upload_document">Upload Document (PDF, DOC, DOCX)</label>
                        <div class="flex items-center space-x-4">
                            <label for="artist-edit-document" class="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <span>Choose File</span>
                                <input id="artist-edit-document" type="file" accept=".pdf,.doc,.docx" class="sr-only">
                            </label>
                            <span id="artist-document-filename" class="text-sm text-gray-500">No file chosen</span>
                        </div>
                        <p class="mt-2 text-sm text-gray-500">Maximum file size: 10MB</p>
                        <div id="artist-current-document" class="mt-2 hidden">
                            <p class="text-sm text-gray-700"><span data-i18n="current_document">Current document:</span> <a id="artist-current-document-link" href="#" target="_blank" class="text-indigo-600 hover:text-indigo-800 underline" data-i18n="view">View</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notification Settings -->
            <div class="border-b border-gray-200 pb-6">
                <h5 class="text-lg font-semibold mb-4">Notification Settings</h5>
                <div class="space-y-3">
                    <div class="flex items-start">
                        <input id="artist-edit-notify-email" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1">
                        <label for="artist-edit-notify-email" class="ml-3 block text-sm text-gray-700">Receive email notifications</label>
                    </div>
                    <div class="flex items-start">
                        <input id="artist-edit-notify-sms" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1">
                        <label for="artist-edit-notify-sms" class="ml-3 block text-sm text-gray-700">Receive SMS notifications (for direct messages from programmers only)</label>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div>
                <button type="submit" class="w-full bg-green-600 text-white px-5 py-3 rounded-md font-medium hover:bg-green-700 text-lg">
                    Save All Changes
                </button>
                <p id="artist-profile-success" class="text-green-600 text-sm mt-2"></p>
                <p id="artist-profile-error" class="text-red-600 text-sm mt-2"></p>
            </div>
        </form>
    </div>

    <!-- Artist Recommendations Section -->
    <div id="artist-recommendations-section" class="hidden bg-white p-8 rounded-lg shadow-xl mt-6">
        <h3 class="text-2xl font-semibold mb-6">My Recommendations</h3>

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
        <div id="recommendations-empty" class="text-center py-8 bg-gray-50 rounded-lg" style="display: none;">
            <p class="text-gray-600">No recommendations yet. Programmers can write recommendations after viewing your profile.</p>
        </div>

        <!-- Recommendations List -->
        <div id="recommendations-list" class="space-y-4" style="display: none;">
            <!-- Recommendations will be inserted here dynamically -->
        </div>
    </div>

    <!-- Version Badge (Artist Dashboard) -->
    <div class="text-center py-6 text-xs text-gray-400">
        Staging v1.0 [22-12-2025]
    </div>
  `;

  console.log("Artist dashboard HTML rendered");
}

/**
 * Sets up the artist dashboard
 */
export function setupArtistDashboard() {
  const editBtn = document.getElementById('edit-artist-profile-btn');
  const editor = document.getElementById('artist-profile-editor');
  const overview = document.getElementById('artist-profile-overview');

  if (!editBtn || !editor || !overview) {
    console.warn("Artist dashboard elements not found");
    return;
  }

  // Load and display profile overview
  displayArtistProfileOverview();

  // Setup edit button toggle
  setupEditProfileButton();

  // Setup profile picture preview
  setupProfilePicPreview();

  // Setup document file input
  setupDocumentInput();

  // Handle form submission
  const form = document.getElementById('artist-profile-form');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }

  // Load artist's recommendations
  loadArtistRecommendations();

  // Setup public preview
  setupPublicPreview();

  console.log("[SETUP] Artist dashboard setup complete");
}

/**
 * Displays the artist profile overview
 */
function displayArtistProfileOverview() {
  const currentUserData = getStore('currentUserData');
  
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
      badge.className = 'inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium';
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
      badge.className = 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
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
      badge.className = 'inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium';
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
 * Calculate age from date of birth
 */
function calculateAge(dob) {
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
 * Setup edit profile button with toggle
 * Uses event delegation on the container for reliability
 */
function setupEditProfileButton() {
  const container = document.getElementById('artist-dashboard');
  const editor = document.getElementById('artist-profile-editor');
  const overview = document.getElementById('artist-profile-overview');

  if (!container || !editor || !overview) {
    console.warn("Artist dashboard elements not found for edit button setup");
    return;
  }

  // Check if listener is already attached to prevent duplicates
  if (container.dataset.editListenerAttached === 'true') {
    console.log("[ARTIST DASHBOARD] Edit button listener already attached, skipping");
    return;
  }

  // Use event delegation on the container
  // This works even if the button is re-rendered
  container.addEventListener('click', (e) => {
    // Check if the clicked element is the edit button
    if (e.target.id === 'edit-artist-profile-btn' || e.target.closest('#edit-artist-profile-btn')) {
      console.log("[ARTIST DASHBOARD] Edit profile button clicked");

      const isHidden = editor.classList.contains('hidden');

      if (isHidden) {
        // Show editor, hide overview
        console.log("[ARTIST DASHBOARD] Showing editor");
        editor.classList.remove('hidden');
        overview.classList.add('hidden');
        populateArtistEditor();
      } else {
        // Hide editor, show overview
        console.log("[ARTIST DASHBOARD] Hiding editor, showing overview");
        editor.classList.add('hidden');
        overview.classList.remove('hidden');
        displayArtistProfileOverview();
      }
    }
  });

  // Mark listener as attached
  container.dataset.editListenerAttached = 'true';

  console.log("[ARTIST DASHBOARD] Edit button listener attached via event delegation");
}

/**
 * Setup profile picture preview on file selection
 */
function setupProfilePicPreview() {
  const fileInput = document.getElementById('artist-edit-profile-pic');
  const previewImg = document.getElementById('artist-profile-pic-preview');
  
  if (!fileInput || !previewImg) return;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        fileInput.value = '';
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        fileInput.value = '';
        return;
      }
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Setup document input to show filename
 */
function setupDocumentInput() {
  const fileInput = document.getElementById('artist-edit-document');
  const filenameSpan = document.getElementById('artist-document-filename');
  
  if (!fileInput || !filenameSpan) return;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        fileInput.value = '';
        filenameSpan.textContent = 'No file chosen';
        return;
      }
      
      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        alert('Please select a PDF, DOC, or DOCX file');
        fileInput.value = '';
        filenameSpan.textContent = 'No file chosen';
        return;
      }
      
      filenameSpan.textContent = file.name;
    } else {
      filenameSpan.textContent = 'No file chosen';
    }
  });
}

/**
 * Populates the editor with current user data
 */
export function populateArtistEditor() {
  const currentUserData = getStore('currentUserData');
  
  if (!currentUserData) {
    console.warn("No artist data found to populate editor");
    return;
  }
  
  console.log("Populating artist editor with:", currentUserData);
  
  // Personal Details
  document.getElementById('artist-edit-firstname').value = currentUserData.firstName || '';
  document.getElementById('artist-edit-lastname').value = currentUserData.lastName || '';
  document.getElementById('artist-edit-stagename').value = currentUserData.stageName || '';
  document.getElementById('artist-edit-phone').value = currentUserData.phone || '';
  document.getElementById('artist-edit-dob').value = currentUserData.dob || '';
  document.getElementById('artist-edit-gender').value = currentUserData.gender || '';
  document.getElementById('artist-edit-location').value = currentUserData.location || '';
  
  // Professional Details (checkboxes instead of multi-select)
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
 * Handles form submission to save profile changes
 */
async function handleProfileSubmit(e) {
  e.preventDefault();
  
  const successMsg = document.getElementById('artist-profile-success');
  const errorMsg = document.getElementById('artist-profile-error');
  const submitBtn = e.submitter || e.target.querySelector('button[type="submit"]');
  
  // Reset messages
  successMsg.textContent = '';
  errorMsg.textContent = '';
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  
  try {
    const currentUser = getStore('currentUser');
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    const uid = currentUser.uid;
    const docRef = doc(db, 'artists', uid);
    
    // Collect checkbox values using helper function
    const genres = getCheckboxValues('artist-edit-genres');
    const languages = getCheckboxValues('artist-edit-languages');
    const paymentMethods = getCheckboxValues('artist-edit-payment');
    
    // Validate checkbox groups
    if (genres.length === 0) {
      throw new Error("Please select at least one genre");
    }
    if (languages.length === 0) {
      throw new Error("Please select at least one language");
    }
    if (paymentMethods.length === 0) {
      throw new Error("Please select at least one payment method");
    }
    
    // Collect all form data
    const dataToUpdate = {
      // Personal Details
      firstName: document.getElementById('artist-edit-firstname').value.trim(),
      lastName: document.getElementById('artist-edit-lastname').value.trim(),
      stageName: document.getElementById('artist-edit-stagename').value.trim(),
      phone: document.getElementById('artist-edit-phone').value.trim(),
      dob: document.getElementById('artist-edit-dob').value,
      gender: document.getElementById('artist-edit-gender').value,
      location: document.getElementById('artist-edit-location').value.trim(),
      
      // Professional Details (from checkboxes)
      genres: genres,
      languages: languages,
      paymentMethods: paymentMethods,
      bio: document.getElementById('artist-edit-bio').value.trim(),
      pitch: document.getElementById('artist-edit-pitch').value.trim(),
      
      // Media
      videoUrl: document.getElementById('artist-edit-video').value.trim(),
      audioUrl: document.getElementById('artist-edit-audio').value.trim(),
      textContent: document.getElementById('artist-edit-text').value.trim(),
      
      // Notification Settings
      notifyEmail: document.getElementById('artist-edit-notify-email').checked,
      notifySms: document.getElementById('artist-edit-notify-sms').checked
    };
    
    // Validate required fields
    if (!dataToUpdate.firstName || !dataToUpdate.lastName || !dataToUpdate.phone || 
        !dataToUpdate.dob || !dataToUpdate.gender || !dataToUpdate.location ||
        !dataToUpdate.bio || !dataToUpdate.pitch) {
      throw new Error("Please fill in all required fields (marked with *)");
    }
    
    const storage = getStorage();
    
    // Handle profile picture upload
    const profilePicInput = document.getElementById('artist-edit-profile-pic');
    const profilePicFile = profilePicInput.files[0];
    
    if (profilePicFile) {
      console.log("Uploading profile picture...");
      const storageRef = ref(storage, `artists/${uid}/profile.jpg`);
      const snapshot = await uploadBytes(storageRef, profilePicFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Profile picture uploaded:", downloadURL);
      dataToUpdate.profilePicUrl = downloadURL;
      document.getElementById('artist-profile-pic-preview').src = downloadURL;
    }
    
    // Handle document upload
    const documentInput = document.getElementById('artist-edit-document');
    const documentFile = documentInput.files[0];
    
    if (documentFile) {
      console.log("Uploading document...");
      const fileExtension = documentFile.name.split('.').pop();
      const storageRef = ref(storage, `artists/${uid}/document.${fileExtension}`);
      const snapshot = await uploadBytes(storageRef, documentFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Document uploaded:", downloadURL);
      dataToUpdate.documentUrl = downloadURL;
      dataToUpdate.documentName = documentFile.name;
    }
    
    // Update Firestore
    await updateDoc(docRef, dataToUpdate);
    console.log("Profile updated successfully");
    
    // Update local store
    const currentUserData = getStore('currentUserData');
    setStore('currentUserData', { ...currentUserData, ...dataToUpdate });
    
    // Show success message
    successMsg.textContent = '✓ Profile updated successfully!';
    
    // Clear file inputs
    if (profilePicFile) {
      profilePicInput.value = '';
    }
    if (documentFile) {
      documentInput.value = '';
      document.getElementById('artist-document-filename').textContent = 'No file chosen';
    }
    
    // Update overview and switch back to it
    displayArtistProfileOverview();
    // ⭐ NEW: Refresh public preview
    renderPublicPreview();  
    document.getElementById('artist-profile-editor').classList.add('hidden');
    document.getElementById('artist-profile-overview').classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error saving profile:", error);
    errorMsg.textContent = 'Error: ' + error.message;
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save All Changes';
  }
}
/**
 * Load artist's own recommendations on their dashboard
 */
export function loadArtistRecommendations() {
  const currentUser = getStore('currentUser');

  if (!currentUser) {
    console.warn("No user logged in, cannot load recommendations");
    return;
  }

  // Check if recommendations section exists in HTML before loading
  const recommendationsSection = document.getElementById('recommendations-list');
  if (!recommendationsSection) {
    console.log("Recommendations section not found in HTML, skipping load");
    return;
  }

  loadRecommendations(currentUser.uid);
}

/**
 * Setup public preview functionality
 */
function setupPublicPreview() {
  const refreshBtn = document.getElementById('refresh-preview-btn');

  if (!refreshBtn) {
    console.warn("Refresh preview button not found");
    return;
  }

  // Setup refresh button click handler
  refreshBtn.addEventListener('click', () => {
    renderPublicPreview();
  });

  // Show initial preview
  renderPublicPreview();

  console.log("Public preview setup complete");
}

/**
 * Render the public profile preview
 */
function renderPublicPreview() {
  const previewContent = document.getElementById('preview-content');
  const currentUserData = getStore('currentUserData');

  if (!previewContent) {
    console.warn("Preview content container not found");
    return;
  }

  if (!currentUserData) {
    console.warn("No artist data found for preview");
    previewContent.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <p>No profile data available. Please complete your profile first.</p>
      </div>
    `;
    return;
  }

  // Generate preview HTML
  const profilePicUrl = currentUserData.profilePicUrl ||
    `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.stageName || currentUserData.firstName || 'A').charAt(0))}`;

  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  const gender = genderMap[currentUserData.gender] || 'Not specified';

  let age = 'Not specified';
  if (currentUserData.dob) {
    age = `${calculateAge(currentUserData.dob)} years old`;
  }

  // Render genres
  let genresHTML = '';
  if (currentUserData.genres && currentUserData.genres.length > 0) {
    genresHTML = currentUserData.genres.map(genre =>
      `<span class="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">${genre}</span>`
    ).join(' ');
  } else {
    genresHTML = '<span class="text-gray-500">No genres specified</span>';
  }

  // Render languages
  let languagesHTML = '';
  if (currentUserData.languages && currentUserData.languages.length > 0) {
    languagesHTML = currentUserData.languages.map(lang =>
      `<span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">${lang.toUpperCase()}</span>`
    ).join(' ');
  } else {
    languagesHTML = '<span class="text-gray-500">No languages specified</span>';
  }

  previewContent.innerHTML = `
    <div class="p-6">
      <!-- Header with profile pic and basic info -->
      <div class="flex items-start space-x-6 mb-6">
        <img src="${profilePicUrl}" alt="Profile" class="w-24 h-24 rounded-full object-cover">
        <div class="flex-1">
          <h4 class="text-2xl font-bold text-gray-900">${currentUserData.stageName || currentUserData.firstName || 'Artist Name'}</h4>
          <p class="text-gray-600">${currentUserData.firstName || ''} ${currentUserData.lastName || ''}</p>
          <p class="text-sm text-gray-500 mt-1">
            <i data-lucide="map-pin" class="h-4 w-4 inline mr-1"></i>
            ${currentUserData.location || 'Location not specified'}
          </p>
          <p class="text-sm text-gray-500">
            ${gender} • ${age}
          </p>
        </div>
      </div>

      <!-- Genres -->
      <div class="mb-4">
        <h5 class="text-sm font-semibold text-gray-700 mb-2">Genres</h5>
        <div class="flex flex-wrap gap-2">
          ${genresHTML}
        </div>
      </div>

      <!-- Languages -->
      <div class="mb-4">
        <h5 class="text-sm font-semibold text-gray-700 mb-2">Languages</h5>
        <div class="flex flex-wrap gap-2">
          ${languagesHTML}
        </div>
      </div>

      <!-- Bio -->
      <div class="mb-4">
        <h5 class="text-sm font-semibold text-gray-700 mb-2">Bio</h5>
        <p class="text-gray-600 text-sm">${currentUserData.bio || 'No bio available'}</p>
      </div>

      <!-- Pitch -->
      <div class="mb-4">
        <h5 class="text-sm font-semibold text-gray-700 mb-2">Pitch</h5>
        <p class="text-gray-600 text-sm">${currentUserData.pitch || 'No pitch available'}</p>
      </div>
    </div>
  `;

  // Re-initialize Lucide icons for the new content
  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.log("Public preview rendered");
}
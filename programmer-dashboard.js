/**
 * programmer-dashboard.js
 * Manages only the programmer's profile overview (read-only display)
 * - Name, Organization, Photo, Contact Info, About
 * - Public profile preview
 *
 * Profile editing is handled by programmer-profile.js
 * Artist search is handled by artist-search.js
 */

import { getStore } from './store.js';

/**
 * Renders the programmer dashboard HTML structure
 */
export function renderProgrammerDashboard() {
  const container = document.getElementById('programmer-dashboard');

  if (!container) {
    console.warn("Programmer dashboard container not found");
    return;
  }

  container.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-xl mb-6">
        <h3 class="text-2xl font-semibold mb-2" data-i18n="programmer_dashboard">Programmer Dashboard</h3>

        <!-- View voor "Pending" -->
        <div id="programmer-pending-view" class="hidden">
            <p class="mb-4 text-lg p-4 bg-yellow-100 text-yellow-800 rounded-md" data-i18n="pending_approval">Your account is <strong>pending admin approval</strong>. You will be notified by email once it's published.</p>
        </div>

        <!-- View voor "Trial" of "Pro" -->
        <div id="programmer-trial-view">
            <p id="programmer-pro-message" class="mb-4 text-lg hidden" data-i18n="pro_account">You have a <strong>PRO Account</strong>. Enjoy full access to the database.</p>
            <p id="programmer-trial-message" class="mb-4 text-lg" data-i18n="trial_account">You are currently on your <strong>7-Day Free Trial</strong>.</p>
            <button id="upgrade-pro-btn" class="bg-yellow-500 text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-600" data-i18n="upgrade_to_pro">
                Upgrade to PRO (Coming Soon)
            </button>
        </div>
    </div>

    <!-- Programmer Profile Overview Card -->
    <div id="programmer-profile-overview" class="bg-white p-8 rounded-lg shadow-xl mb-6">
        <h3 class="text-2xl font-semibold mb-6 flex items-center justify-between">
            <span>Your Profile</span>
            <button id="edit-programmer-profile-btn" class="text-sm bg-indigo-600 text-white px-5 py-2 rounded-md font-medium hover:bg-indigo-700">
                Edit Profile
            </button>
        </h3>

        <div class="flex flex-col md:flex-row gap-6">
            <!-- Profile Picture -->
            <div class="flex-shrink-0">
                <img id="programmer-overview-pic" src="https://placehold.co/200x200/e0e7ff/6366f1?text=P" alt="Profile" class="h-48 w-48 object-cover rounded-lg shadow-lg">
            </div>

            <!-- Profile Info -->
            <div class="flex-1">
                <h4 id="programmer-overview-name" class="text-3xl font-bold text-gray-900 mb-2">Programmer Name</h4>
                <p id="programmer-overview-org" class="text-xl text-indigo-600 font-semibold mb-4">Organization Name</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                        <span class="font-semibold">Email:</span>
                        <span id="programmer-overview-email" class="ml-2">email@example.com</span>
                    </div>
                    <div>
                        <span class="font-semibold">Phone:</span>
                        <span id="programmer-overview-phone" class="ml-2">Phone</span>
                    </div>
                    <div class="col-span-2">
                        <span class="font-semibold">Website:</span>
                        <a id="programmer-overview-website" href="#" target="_blank" class="ml-2 text-indigo-600 hover:text-indigo-800">Website</a>
                    </div>
                </div>

                <div class="mt-4">
                    <p class="font-semibold text-gray-700">About Organization:</p>
                    <p id="programmer-overview-about" class="text-gray-600 mt-1">Organization description here</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Programmer Profile Editor (rendered by programmer-profile.js) -->
    <div id="programmer-profile-editor" class="bg-white p-8 rounded-lg shadow-xl mb-6 hidden">
        <!-- Content will be rendered by renderProgrammerProfileEditor() -->
    </div>

    <!-- Programmer Public Preview Section -->
    <div id="programmer-public-preview" class="bg-white p-8 rounded-lg shadow-xl mb-6">
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-semibold">Public Profile Preview</h3>
            <button id="refresh-programmer-preview-btn" class="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700">
                <i data-lucide="refresh-cw" class="h-4 w-4 inline mr-1"></i>
                Refresh Preview
            </button>
        </div>

        <div class="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
            <p class="text-sm text-gray-600 mb-4">
                <i data-lucide="info" class="h-4 w-4 inline mr-1"></i>
                This is how artists see your profile when they view your organization information.
            </p>

            <!-- Preview Content Container -->
            <div id="programmer-preview-content" class="bg-white rounded-lg shadow-lg">
                <!-- Preview will be rendered here -->
                <div class="text-center py-12 text-gray-500">
                    <i data-lucide="eye" class="h-12 w-12 mx-auto mb-4 text-gray-400"></i>
                    <p>Click "Refresh Preview" to see how your profile looks</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Search and Filter Section (Content rendered dynamically by renderArtistSearch() in artist-search.js) -->
    <div id="artist-search-section" class="bg-white p-8 rounded-lg shadow-xl">
        <!-- Content will be injected dynamically -->
    </div>

    <!-- Version Badge (Programmer Dashboard) -->
    <div class="text-center py-6 text-xs text-gray-400">
        Staging v1.0 [22-12-2025]
    </div>
  `;

  console.log("Programmer dashboard HTML rendered");
}

/**
 * Setup programmer dashboard
 * Only handles the profile overview display and public preview
 */
export function setupProgrammerDashboard() {
  console.log("[SETUP PROGRAMMER DASHBOARD] Starting programmer dashboard setup...");

  // Display profile overview
  displayProgrammerProfileOverview();

  // Setup public profile preview
  setupPublicPreview();

  // ⭐ FIX: Setup edit profile button click handler
  setupEditProfileButton();

  console.log("[SETUP PROGRAMMER DASHBOARD] ✅ Programmer dashboard setup complete");
}

/**
 * Setup edit profile button click handler
 * Uses event delegation on the container for reliability
 */
function setupEditProfileButton() {
  const container = document.getElementById('programmer-dashboard');
  const editor = document.getElementById('programmer-profile-editor');

  if (!container || !editor) {
    console.warn("[SETUP EDIT BTN] Dashboard container or editor not found");
    return;
  }

  // Check if listener is already attached to prevent duplicates
  if (container.dataset.editListenerAttached === 'true') {
    console.log("[PROGRAMMER DASHBOARD] Edit button listener already attached, skipping");
    return;
  }

  // Use event delegation on the container
  // This works even if the button is re-rendered
  container.addEventListener('click', (e) => {
    // Check if the clicked element is the edit button
    if (e.target.id === 'edit-programmer-profile-btn' || e.target.closest('#edit-programmer-profile-btn')) {
      console.log("[PROGRAMMER DASHBOARD] Edit profile button clicked");

      // Import the functions we need
      import('./programmer-profile.js').then(module => {
        const isHidden = editor.classList.contains('hidden') || editor.style.display === 'none';

        if (isHidden) {
          // Show editor
          console.log("[PROGRAMMER DASHBOARD] Showing editor");
          module.renderProgrammerProfileEditor();
          editor.classList.remove('hidden');
          editor.style.display = 'block';

          // Setup form handlers after rendering
          module.setupProfileFormHandlers();

          // Populate with current data
          module.populateProgrammerEditor();

          // Scroll to editor
          setTimeout(() => {
            editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          // Hide editor
          console.log("[PROGRAMMER DASHBOARD] Hiding editor, showing overview");
          editor.classList.add('hidden');
          editor.style.display = 'none';

          // Refresh the profile overview
          displayProgrammerProfileOverview();
        }
      }).catch(error => {
        console.error("[EDIT BTN] Error loading programmer-profile.js:", error);
      });
    }
  });

  // Mark listener as attached
  container.dataset.editListenerAttached = 'true';

  console.log("[PROGRAMMER DASHBOARD] Edit button listener attached via event delegation");
}

/**
 * Displays the programmer profile overview (read-only)
 * Called on initial load and after profile updates
 */
export function displayProgrammerProfileOverview() {
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');

  // If no data yet (e.g., during page load before login), skip
  if (!currentUserData || !currentUser) {
    console.log("[PROFILE] No user data yet, skipping profile overview display");
    return;
  }

  // Profile Picture
  const overviewPic = document.getElementById('programmer-overview-pic');
  if (overviewPic) {
    overviewPic.src = currentUserData.profilePicUrl ||
                      `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.firstName || 'P').charAt(0))}`;
  }

  // Name & Organization
  const nameEl = document.getElementById('programmer-overview-name');
  if (nameEl) {
    nameEl.textContent = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Programmer Name';
  }

  const orgEl = document.getElementById('programmer-overview-org');
  if (orgEl) {
    orgEl.textContent = currentUserData.organizationName || 'Organization Name';
  }

  // Contact Info
  const emailEl = document.getElementById('programmer-overview-email');
  if (emailEl) {
    emailEl.textContent = currentUser?.email || 'email@example.com';
  }

  const phoneEl = document.getElementById('programmer-overview-phone');
  if (phoneEl) {
    phoneEl.textContent = currentUserData.phone || 'Not specified';
  }

  // Website
  const websiteElement = document.getElementById('programmer-overview-website');
  if (websiteElement) {
    if (currentUserData.website) {
      websiteElement.href = currentUserData.website;
      websiteElement.textContent = currentUserData.website.replace(/^https?:\/\//, '');
    } else {
      websiteElement.href = '#';
      websiteElement.textContent = 'Not specified';
    }
  }

  // About
  const aboutEl = document.getElementById('programmer-overview-about');
  if (aboutEl) {
    aboutEl.textContent = currentUserData.organizationAbout || 'No description available';
  }

  console.log("[PROFILE] Profile overview displayed successfully");
}

/**
 * Setup public profile preview functionality
 */
function setupPublicPreview() {
  const refreshBtn = document.getElementById('refresh-programmer-preview-btn');

  if (!refreshBtn) {
    console.warn("Refresh programmer preview button not found");
    return;
  }

  // Setup refresh button click handler
  refreshBtn.addEventListener('click', () => {
    renderPublicPreview();
  });

  // Show initial preview
  renderPublicPreview();

  console.log("Programmer public preview setup complete");
}

/**
 * Render the public profile preview
 * Shows how the programmer's profile looks to artists
 */
export function renderPublicPreview() {
  const previewContent = document.getElementById('programmer-preview-content');
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');

  if (!previewContent) {
    console.warn("Programmer preview content container not found");
    return;
  }

  if (!currentUserData) {
    console.warn("No programmer data found for preview");
    previewContent.innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <p>No profile data available. Please complete your profile first.</p>
      </div>
    `;
    return;
  }

  // Generate preview HTML
  const profilePicUrl = currentUserData.profilePicUrl ||
    `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.firstName || 'P').charAt(0))}`;

  const fullName = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Programmer Name';
  const organizationName = currentUserData.organizationName || 'Organization Name';
  const email = currentUser?.email || 'email@example.com';
  const phone = currentUserData.phone || 'Not specified';
  const website = currentUserData.website || '';
  const about = currentUserData.organizationAbout || 'No description available';

  previewContent.innerHTML = `
    <div class="p-6">
      <!-- Header with profile pic and basic info -->
      <div class="flex items-start space-x-6 mb-6">
        <img src="${profilePicUrl}" alt="Profile" class="w-24 h-24 rounded-full object-cover border-4 border-indigo-100">
        <div class="flex-1">
          <h4 class="text-2xl font-bold text-gray-900">${fullName}</h4>
          <p class="text-lg text-indigo-600 font-semibold">${organizationName}</p>
          <div class="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <i data-lucide="mail" class="h-4 w-4 inline mr-2"></i>
              <a href="mailto:${email}" class="hover:text-indigo-600">${email}</a>
            </p>
            <p>
              <i data-lucide="phone" class="h-4 w-4 inline mr-2"></i>
              ${phone}
            </p>
            ${website ? `
              <p>
                <i data-lucide="globe" class="h-4 w-4 inline mr-2"></i>
                <a href="${website}" target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600">
                  ${website.replace(/^https?:\/\//, '')}
                </a>
              </p>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- About Organization -->
      <div class="mb-4 bg-gray-50 p-4 rounded-lg">
        <h5 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
          <i data-lucide="building-2" class="h-4 w-4 inline mr-2"></i>
          About ${organizationName}
        </h5>
        <p class="text-gray-700 text-sm leading-relaxed">${about}</p>
      </div>

      <!-- Badge -->
      <div class="flex items-center justify-center pt-4 border-t border-gray-200">
        <div class="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
          <i data-lucide="check-circle" class="h-4 w-4 mr-2"></i>
          Verified Programmer
        </div>
      </div>
    </div>
  `;

  // Re-initialize Lucide icons for the new content
  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.log("Programmer public preview rendered");
}

/**
 * programmer-dashboard.js
 * Manages only the programmer's profile overview (read-only display)
 * - Name, Organization, Photo, Contact Info, About
 * - Public profile preview
 *
 * Profile editing is handled by programmer-profile.js
 * Artist search is handled by artist-search.js
 */

import { getStore } from '../../utils/store.js';

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
    <!-- View voor "Pending" -->
    <div id="programmer-pending-view" class="hidden bg-yellow-50 border border-yellow-200 p-8 rounded-2xl shadow-sm mb-6">
        <div class="flex items-start space-x-4">
            <i data-lucide="clock" class="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1"></i>
            <div>
                <h3 class="text-xl font-bold text-yellow-900 mb-2">Account Pending Approval</h3>
                <p class="text-yellow-800 leading-relaxed" data-i18n="pending_approval">
                    Your account is <strong>pending admin approval</strong>. You will be notified by email once it's published.
                </p>
            </div>
        </div>
    </div>

    <!-- Programmer Profile Overview Card (Apple Style) -->
    <div id="programmer-profile-overview" class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <h3 class="text-3xl font-bold text-gray-900 tracking-tight">Your Profile</h3>
            <button id="edit-programmer-profile-btn" class="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow">
                Edit Profile
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <!-- Profile Picture -->
            <div class="flex justify-center md:justify-start">
                <img id="programmer-overview-pic" src="https://placehold.co/200x200/e0e7ff/6366f1?text=P" alt="Profile" class="w-52 h-52 md:w-72 md:h-72 object-cover rounded-3xl shadow-lg border border-gray-100">
            </div>

            <!-- Profile Info -->
            <div class="space-y-5">
                <div class="pb-5 border-b border-gray-50">
                    <h4 id="programmer-overview-name" class="text-4xl font-bold text-gray-900 tracking-tight mb-2">Programmer Name</h4>
                    <p id="programmer-overview-org" class="text-2xl text-indigo-600 font-semibold">Organization Name</p>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="bg-gray-50 p-3 rounded-xl">
                        <span class="block text-xs font-semibold text-gray-500 mb-1">EMAIL</span>
                        <span id="programmer-overview-email" class="font-medium text-gray-900">email@example.com</span>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-xl">
                        <span class="block text-xs font-semibold text-gray-500 mb-1">PHONE</span>
                        <span id="programmer-overview-phone" class="font-medium text-gray-900">Phone</span>
                    </div>
                    <div class="col-span-2 bg-gray-50 p-3 rounded-xl">
                        <span class="block text-xs font-semibold text-gray-500 mb-1">WEBSITE</span>
                        <a id="programmer-overview-website" href="#" target="_blank" class="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Website</a>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-xl">
                    <p class="text-xs font-semibold text-gray-500 mb-2">ABOUT ORGANIZATION</p>
                    <p id="programmer-overview-about" class="text-gray-700 leading-relaxed">Organization description here</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Programmer Profile Editor (rendered by programmer-profile.js) -->
    <div id="programmer-profile-editor" class="hidden">
        <!-- Content will be rendered by renderProgrammerProfileEditor() -->
    </div>

    <!-- Programmer Public Preview Section (Apple Style) -->
    <div id="programmer-public-preview" class="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <h3 class="text-3xl font-bold text-gray-900 tracking-tight">Public Profile Preview</h3>
            <button id="refresh-programmer-preview-btn" class="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow">
                <i data-lucide="refresh-cw" class="h-4 w-4 inline mr-1"></i>
                Refresh Preview
            </button>
        </div>

        <div class="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
            <p class="text-sm text-gray-600 mb-4 flex items-center">
                <i data-lucide="info" class="h-4 w-4 mr-2 flex-shrink-0"></i>
                This is how artists see your profile when they view your organization information.
            </p>

            <!-- Preview Content Container -->
            <div id="programmer-preview-content" class="bg-white rounded-2xl shadow-sm border border-gray-100">
                <!-- Preview will be rendered here -->
                <div class="text-center py-12 text-gray-500">
                    <i data-lucide="eye" class="h-12 w-12 mx-auto mb-4 text-gray-400"></i>
                    <p class="font-medium">Click "Refresh Preview" to see how your profile looks</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Search and Filter Section (Content rendered dynamically by renderArtistSearch() in artist-search.js) -->
    <div id="artist-search-section" class="bg-white p-4 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100" style="min-height: 400px; display: block; opacity: 1; visibility: visible;">
        <!-- Content will be injected dynamically -->
    </div>

    <!-- Version Badge (Programmer Dashboard) -->
    <div class="text-center py-6 text-xs text-gray-400">
        Staging v2.1 (Modular Dashboard) [23-12-2025]
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
    // Check if the clicked element is the edit button or any child of it
    const clickedBtn = e.target.closest('#edit-programmer-profile-btn');
    if (clickedBtn) {
      e.preventDefault();
      e.stopPropagation();
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

  // Generate preview HTML with Apple styling
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
      <!-- Header with profile pic and basic info (Apple Style) -->
      <div class="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
        <img src="${profilePicUrl}" alt="Profile" class="w-28 h-28 rounded-2xl object-cover shadow-sm border-2 border-gray-100">
        <div class="flex-1">
          <h4 class="text-2xl font-bold text-gray-900 tracking-tight">${fullName}</h4>
          <p class="text-lg text-indigo-600 font-semibold mt-1">${organizationName}</p>
          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div class="bg-gray-50 p-2.5 rounded-xl flex items-center">
              <i data-lucide="mail" class="h-4 w-4 mr-2 text-gray-500 flex-shrink-0"></i>
              <a href="mailto:${email}" class="text-gray-700 hover:text-indigo-600 transition-colors truncate">${email}</a>
            </div>
            <div class="bg-gray-50 p-2.5 rounded-xl flex items-center">
              <i data-lucide="phone" class="h-4 w-4 mr-2 text-gray-500 flex-shrink-0"></i>
              <span class="text-gray-700">${phone}</span>
            </div>
            ${website ? `
              <div class="col-span-full bg-gray-50 p-2.5 rounded-xl flex items-center">
                <i data-lucide="globe" class="h-4 w-4 mr-2 text-gray-500 flex-shrink-0"></i>
                <a href="${website}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 transition-colors truncate">
                  ${website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- About Organization (Apple Style) -->
      <div class="mb-4 bg-gray-50 p-4 rounded-xl">
        <h5 class="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center">
          <i data-lucide="building-2" class="h-4 w-4 inline mr-2"></i>
          About ${organizationName}
        </h5>
        <p class="text-gray-700 leading-relaxed">${about}</p>
      </div>

      <!-- Badge (Apple Style) -->
      <div class="flex items-center justify-center pt-4 border-t border-gray-100">
        <div class="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold">
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

/**
 * programmer-dashboard.js
 * Manages the programmer's profile with separate views:
 * - Profile overview (read-only display)
 * - Edit profile (form)
 * - Public profile preview
 *
 * Artist search is handled by artist-search.js
 */

import { getStore, setStore } from '../../utils/store.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../services/firebase.js';
import { setLanguage } from '../../utils/translations.js';
import { showEditProfile, showPublicProfile } from '../../ui/ui.js';

/**
 * Renders the programmer dashboard HTML structure
 * DESKTOP: New compact card layout matching mockup
 * MOBILE: Original layout preserved (unchanged)
 */
export function renderProgrammerDashboard(options = {}) {
  const { searchModeOnly = false } = options;
  const container = document.getElementById('programmer-dashboard');

  if (!container) {
    console.warn("Programmer dashboard container not found");
    return;
  }

  // If search mode only, render minimal container
  if (searchModeOnly) {
    container.innerHTML = `
      <div id="programmer-profile-desktop" class="hidden"></div>
      <div id="programmer-profile-mobile" class="hidden"></div>
      <div id="programmer-profile-editor" class="hidden"></div>
      <div id="artist-search-section" class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100" style="min-height: 400px;"></div>
    `;
    console.log("Programmer dashboard HTML rendered (search mode only)");
    return;
  }

  container.innerHTML = `
    <!-- View voor "Pending" -->
    <div id="programmer-pending-view" class="hidden bg-yellow-50 border border-yellow-200 p-8 rounded-2xl shadow-sm mb-6">
        <div class="flex items-start space-x-4">
            <i data-lucide="clock" class="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1"></i>
            <div>
                <h3 class="text-xl font-bold text-yellow-900 mb-2">Account Pending Approval</h3>
                <p class="text-yellow-800 leading-relaxed">
                    Your account is <strong>pending admin approval</strong>. You will be notified by email once it's published.
                </p>
            </div>
        </div>
    </div>

    <!-- ========== PROGRAMMER PROFILE - DESKTOP (>= md) ========== -->
    <div id="programmer-profile-desktop" class="hidden md:block">

      <!-- Profile Header Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div class="flex items-center gap-8">

          <!-- Large Circular Avatar -->
          <div class="flex-shrink-0">
            <div id="programmer-avatar-placeholder-desktop"
                 class="w-36 h-36 rounded-full flex items-center justify-center"
                 style="background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%); border: 4px solid #8b5cf6;">
              <span id="programmer-avatar-initial-desktop" class="text-5xl font-bold text-white">P</span>
              <img id="programmer-overview-pic-desktop"
                   src=""
                   alt="Profile"
                   class="w-36 h-36 rounded-full object-cover"
                   style="border: 4px solid #8b5cf6; max-width: 144px; max-height: 144px; display: none; position: absolute;">
            </div>
          </div>

          <!-- Info Section -->
          <div class="flex-grow">
            <h2 id="programmer-overview-name-desktop" class="text-3xl font-bold text-gray-900 mb-1">Tim Thomaesz</h2>
            <p id="programmer-overview-org-desktop" class="text-lg mb-3" style="color: #7c3aed;">ddd</p>

            <!-- Verified Badge -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-5"
                 style="background-color: #10b981; color: white;">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              <span>Verified Programmer</span>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3">
              <button id="edit-programmer-profile-btn"
                      class="px-6 py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
                      style="background-color: #3b82f6;">
                Edit Profile
              </button>
              <button id="view-public-profile-btn"
                      class="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all bg-white"
                      style="color: #3b82f6; border: 2px solid #3b82f6;">
                View Public Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Cards -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Contact Information Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
          <div class="space-y-4">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
              <svg class="w-5 h-5 flex-shrink-0" style="color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span id="programmer-overview-email-desktop" class="text-gray-700">programmer1@test.com</span>
            </div>
            <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
              <svg class="w-5 h-5 flex-shrink-0" style="color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <span id="programmer-overview-phone-desktop" class="text-gray-500">Not specified</span>
            </div>
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 flex-shrink-0" style="color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
              <a id="programmer-overview-website-desktop" href="#" target="_blank" class="text-gray-500">Not specified</a>
            </div>
          </div>
        </div>

        <!-- About Organization Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">About Organization</h3>
          <p id="programmer-overview-about-desktop" class="text-gray-600 leading-relaxed">No description available</p>
        </div>
      </div>
    </div>

    <!-- ========== PROGRAMMER PROFILE - MOBILE (< md) ========== -->
    <div id="programmer-profile-mobile" class="block md:hidden">
      <!-- Profile Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div class="flex justify-center mb-4">
          <div id="programmer-avatar-placeholder-mobile"
               class="w-28 h-28 rounded-full flex items-center justify-center"
               style="background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%); border: 4px solid #8b5cf6;">
            <span id="programmer-avatar-initial-mobile" class="text-4xl font-bold text-white">P</span>
            <img id="programmer-overview-pic-mobile"
                 src=""
                 alt="Profile"
                 class="w-28 h-28 rounded-full object-cover"
                 style="border: 4px solid #8b5cf6; max-width: 112px; max-height: 112px; display: none; position: absolute;">
          </div>
        </div>

        <h2 id="programmer-overview-name-mobile" class="text-2xl font-bold text-gray-900 text-center mb-1">Tim Thomaesz</h2>
        <p id="programmer-overview-org-mobile" class="text-base text-center mb-3" style="color: #7c3aed;">ddd</p>

        <div class="flex justify-center mb-5">
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
               style="background-color: #10b981; color: white;">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>Verified Programmer</span>
          </div>
        </div>

        <div class="space-y-3">
          <button id="edit-programmer-profile-btn-mobile"
                  class="w-full py-3 rounded-xl font-semibold text-white transition-all"
                  style="background-color: #3b82f6;">
            Edit Profile
          </button>
          <button id="view-public-profile-btn-mobile"
                  class="w-full py-3 rounded-xl font-semibold transition-all bg-white"
                  style="color: #3b82f6; border: 2px solid #3b82f6;">
            View Public Profile
          </button>
        </div>
      </div>

      <!-- Contact Information Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
            <svg class="w-5 h-5 flex-shrink-0" style="color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span id="programmer-overview-email-mobile" class="text-gray-700">programmer1@test.com</span>
          </div>
          <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
            <svg class="w-5 h-5 flex-shrink-0" style="color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span id="programmer-overview-phone-mobile" class="text-gray-500">Not specified</span>
          </div>
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" style="color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
            <a id="programmer-overview-website-mobile" href="#" target="_blank" class="text-gray-500">Not specified</a>
          </div>
        </div>
      </div>

      <!-- About Organization Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">About Organization</h3>
        <p id="programmer-overview-about-mobile" class="text-gray-600 leading-relaxed">No description available</p>
      </div>
    </div>

    <!-- Hidden sections -->
    <div id="programmer-profile-editor" class="hidden"></div>
    <div id="artist-search-section" class="hidden"></div>
  `;

  console.log("Programmer dashboard HTML rendered (wireframe layout)");
}

/**
 * Toon profile overview (main view)
 */
export function showProgrammerProfileView() {
  const profileView = document.getElementById('programmer-profile-view');
  const editView = document.getElementById('programmer-edit-view');
  const publicView = document.getElementById('programmer-public-view');

  if (profileView) profileView.style.display = 'block';
  if (editView) editView.style.display = 'none';
  if (publicView) publicView.style.display = 'none';

  // Refresh data
  displayProgrammerProfileOverview();

  window.scrollTo({ top: 0, behavior: 'smooth' });

  console.log("[NAVIGATION] Switched to profile overview");
}

/**
 * Toon edit profile view
 */
export function showProgrammerEditView() {
  const profileView = document.getElementById('programmer-profile-view');
  const editView = document.getElementById('programmer-edit-view');
  const publicView = document.getElementById('programmer-public-view');

  if (profileView) profileView.style.display = 'none';
  if (editView) editView.style.display = 'block';
  if (publicView) publicView.style.display = 'none';

  // Populate form with current data
  populateProgrammerEditor();

  window.scrollTo({ top: 0, behavior: 'smooth' });

  console.log("[NAVIGATION] Switched to edit view");
}

/**
 * Toon public profile view
 */
export function showProgrammerPublicView() {
  const profileView = document.getElementById('programmer-profile-view');
  const editView = document.getElementById('programmer-edit-view');
  const publicView = document.getElementById('programmer-public-view');

  if (profileView) profileView.style.display = 'none';
  if (editView) editView.style.display = 'none';
  if (publicView) publicView.style.display = 'block';

  // Render public preview
  renderPublicPreviewCard();

  window.scrollTo({ top: 0, behavior: 'smooth' });

  console.log("[NAVIGATION] Switched to public view");
}

/**
 * Show only search section (hide profile sections)
 */
export function showSearchOnlyView() {
  console.log('[PROGRAMMER DASHBOARD] Showing search-only view');

  // Hide ALL profile sections (use correct IDs from actual HTML)
  const sectionsToHide = [
    'programmer-profile-overview',
    'programmer-public-preview',
    'programmer-about-card',
    'programmer-profile-editor',
    'programmer-pending-view'
  ];

  sectionsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.add('hidden');
    }
  });

  // SHOW search section
  const searchSection = document.getElementById('artist-search-section');
  if (searchSection) {
    searchSection.style.display = 'block';
    searchSection.style.opacity = '1';
    searchSection.style.visibility = 'visible';
    searchSection.classList.remove('hidden');
    console.log('[PROGRAMMER DASHBOARD] artist-search-section now visible');
  } else {
    console.error('[PROGRAMMER DASHBOARD] artist-search-section NOT FOUND');
  }
}

/**
 * Show only profile section (hide search section)
 */
export function showProfileOnlyView() {
  console.log('[PROGRAMMER DASHBOARD] Showing profile-only view');

  // SHOW profile sections (use correct IDs from actual HTML)
  const sectionsToShow = [
    'programmer-profile-overview',
    'programmer-public-preview',
    'programmer-about-card'
  ];

  sectionsToShow.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'block';
      el.classList.remove('hidden');
    }
  });

  // HIDE editor
  const editor = document.getElementById('programmer-profile-editor');
  if (editor) {
    editor.style.display = 'none';
    editor.classList.add('hidden');
  }

  // HIDE search section
  const searchSection = document.getElementById('artist-search-section');
  if (searchSection) {
    searchSection.style.display = 'none';
    searchSection.classList.add('hidden');
  }

  // Refresh profile data
  displayProgrammerProfileOverview();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Render public preview in de card (voor de separate public view page)
 */
function renderPublicPreviewCard() {
  const container = document.getElementById('programmer-public-preview-card');
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');

  if (!container || !currentUserData) return;

  const firstName = currentUserData.firstName || '';
  const lastName = currentUserData.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Programmer';
  const orgName = currentUserData.organizationName || 'Organization';
  const email = currentUser?.email || '';
  const phone = currentUserData.phone || '';
  const website = currentUserData.website || '';
  const about = currentUserData.organizationAbout || 'No description available.';
  const profilePic = currentUserData.profilePicUrl;
  const initial = (firstName || 'P').charAt(0).toUpperCase();

  container.innerHTML = `
    <div style="display: flex; gap: 28px; align-items: flex-start; margin-bottom: 24px;">

      <!-- Profile Picture -->
      <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #e9e3f5 0%, #d4c8eb 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
        ${profilePic
          ? `<img src="${profilePic}" style="width: 100%; height: 100%; object-fit: cover;">`
          : `<span style="font-size: 48px; font-weight: 600; color: #805ad5;">${initial}</span>`
        }
      </div>

      <!-- Info -->
      <div style="flex: 1;">
        <h2 style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px;">${fullName}</h2>
        <p style="font-size: 18px; color: #805ad5; font-weight: 600; margin-bottom: 16px;">${orgName}</p>

        <!-- Contact -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${email ? `
            <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
              <svg width="16" height="16" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              ${email}
            </div>
          ` : ''}
          ${phone ? `
            <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
              <svg width="16" height="16" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              ${phone}
            </div>
          ` : ''}
          ${website ? `
            <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
              <svg width="16" height="16" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
              ${website.replace(/^https?:\/\//, '')}
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- About -->
    <div style="border-top: 1px solid #e9e3f5; padding-top: 20px; margin-bottom: 20px;">
      <h3 style="font-size: 14px; font-weight: 600; color: #805ad5; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">About ${orgName}</h3>
      <p style="color: #4a4a68; font-size: 15px; line-height: 1.7;">${about}</p>
    </div>

    <!-- Verified Badge -->
    <div style="display: flex; justify-content: center; padding-top: 16px; border-top: 1px solid #e9e3f5;">
      <span style="display: inline-flex; align-items: center; gap: 6px; color: #805ad5; font-size: 14px; font-weight: 500;">
        <svg width="18" height="18" fill="#805ad5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Verified Programmer
      </span>
    </div>
  `;

  console.log("[PUBLIC VIEW] Public preview card rendered");
}

/**
 * Populate edit form with current user data
 */
function populateProgrammerEditor() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData) {
    console.warn("[EDIT] No user data to populate");
    return;
  }

  // Populate form fields
  const firstNameInput = document.getElementById('programmer-edit-firstname');
  const lastNameInput = document.getElementById('programmer-edit-lastname');
  const phoneInput = document.getElementById('programmer-edit-phone');
  const orgNameInput = document.getElementById('programmer-edit-org-name');
  const websiteInput = document.getElementById('programmer-edit-website');
  const orgAboutInput = document.getElementById('programmer-edit-org-about');
  const picPreview = document.getElementById('programmer-edit-pic-preview');

  if (firstNameInput) firstNameInput.value = currentUserData.firstName || '';
  if (lastNameInput) lastNameInput.value = currentUserData.lastName || '';
  if (phoneInput) phoneInput.value = currentUserData.phone || '';
  if (orgNameInput) orgNameInput.value = currentUserData.organizationName || '';
  if (websiteInput) websiteInput.value = currentUserData.website || '';
  if (orgAboutInput) orgAboutInput.value = currentUserData.organizationAbout || '';

  // Update profile picture preview
  if (picPreview && currentUserData.profilePicUrl) {
    picPreview.src = currentUserData.profilePicUrl;
  }

  console.log("[EDIT] Form populated with current data");
}

/**
 * Setup programmer dashboard
 * Only handles the profile overview display and navigation
 */
export function setupProgrammerDashboard() {
  console.log("[SETUP PROGRAMMER DASHBOARD] Starting programmer dashboard setup...");

  // Display profile overview
  displayProgrammerProfileOverview();

  // Setup edit profile button
  setupEditProfileButton();

  console.log("[SETUP PROGRAMMER DASHBOARD] ✅ Programmer dashboard setup complete");
}

/**
 * Setup navigation event handlers using event delegation
 */
function setupProgrammerNavigation() {
  const dashboard = document.getElementById('programmer-dashboard');

  if (!dashboard) {
    console.warn("[NAVIGATION] Dashboard container not found");
    return;
  }

  // Prevent duplicate listeners
  if (dashboard.dataset.navListenersAttached === 'true') {
    console.log("[NAVIGATION] Listeners already attached, skipping");
    return;
  }

  // Use event delegation for all navigation clicks
  dashboard.addEventListener('click', (e) => {
    // Edit Profile button (both mobile and desktop)
    if (e.target.closest('#edit-programmer-profile-btn') || e.target.closest('#edit-programmer-profile-btn-mobile')) {
      e.preventDefault();
      showProgrammerEditView();
      return;
    }

    // View Public Profile button
    if (e.target.closest('#view-public-profile-btn')) {
      e.preventDefault();
      showProgrammerPublicView();
      return;
    }

    // Back from Edit (both back button and cancel button)
    if (e.target.closest('#back-from-edit-btn') || e.target.closest('#cancel-edit-btn')) {
      e.preventDefault();
      showProgrammerProfileView();
      return;
    }

    // Back from Public
    if (e.target.closest('#back-from-public-btn')) {
      e.preventDefault();
      showProgrammerProfileView();
      return;
    }
  });

  // Form submit handler
  dashboard.addEventListener('submit', (e) => {
    if (e.target.id === 'programmer-profile-form') {
      e.preventDefault();
      handleProgrammerProfileSubmit(e);
    }
  });

  // Profile picture preview on file select
  dashboard.addEventListener('change', (e) => {
    if (e.target.id === 'programmer-edit-profile-pic') {
      const file = e.target.files?.[0];
      const preview = document.getElementById('programmer-edit-pic-preview');

      if (file && preview) {
        const reader = new FileReader();
        reader.onload = (event) => {
          preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Mobile Save button (for edit view)
  const mobileSaveBtn = document.getElementById('mobile-save-profile-btn');
  if (mobileSaveBtn) {
    mobileSaveBtn.addEventListener('click', async () => {
      await saveMobileProfileChanges();
    });
  }

  // Mobile Cancel button (for edit view)
  const mobileCancelBtn = document.getElementById('mobile-cancel-edit-btn');
  if (mobileCancelBtn) {
    mobileCancelBtn.addEventListener('click', () => {
      showProgrammerProfileView();
    });
  }

  // Mobile photo upload (for edit view)
  const mobilePhotoInput = document.getElementById('mobile-edit-photo-input');
  if (mobilePhotoInput) {
    mobilePhotoInput.addEventListener('change', handleMobilePhotoUpload);
  }

  dashboard.dataset.navListenersAttached = 'true';

  console.log("[NAVIGATION] Event listeners attached via event delegation (including mobile)");
}

/**
 * Handles form submission to save profile changes
 * Navigates back to profile view after successful save
 */
async function handleProgrammerProfileSubmit(e) {
  e.preventDefault();

  const successMsg = document.getElementById('programmer-profile-success');
  const errorMsg = document.getElementById('programmer-profile-error');
  const submitBtn = document.getElementById('save-programmer-profile-btn');

  // Reset messages
  if (successMsg) successMsg.style.display = 'none';
  if (errorMsg) errorMsg.style.display = 'none';

  // Disable button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  try {
    const currentUser = getStore('currentUser');
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    const uid = currentUser.uid;
    const docRef = doc(db, 'programmers', uid);

    // Collect form data
    const dataToUpdate = {
      firstName: document.getElementById('programmer-edit-firstname')?.value.trim() || '',
      lastName: document.getElementById('programmer-edit-lastname')?.value.trim() || '',
      phone: document.getElementById('programmer-edit-phone')?.value.trim() || '',
      organizationName: document.getElementById('programmer-edit-org-name')?.value.trim() || '',
      organizationAbout: document.getElementById('programmer-edit-org-about')?.value.trim() || '',
      website: document.getElementById('programmer-edit-website')?.value.trim() || ''
    };

    // Validate required fields
    if (!dataToUpdate.firstName || !dataToUpdate.lastName || !dataToUpdate.organizationName) {
      throw new Error("Please fill in all required fields (marked with *)");
    }

    // Handle profile picture upload
    const fileInput = document.getElementById('programmer-edit-profile-pic');
    const file = fileInput?.files?.[0];

    if (file) {
      console.log("[SAVE] Uploading profile picture...");

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      const storage = getStorage();
      const storageRef = ref(storage, `programmers/${uid}/profile.jpg`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("[SAVE] Profile picture uploaded:", downloadURL);

      // Add URL to data
      dataToUpdate.profilePicUrl = downloadURL;
    }

    // Update Firestore
    await updateDoc(docRef, dataToUpdate);
    console.log("[SAVE] Profile updated successfully");

    // Update local store
    const currentUserData = getStore('currentUserData');
    setStore('currentUserData', { ...currentUserData, ...dataToUpdate });

    // Show success message
    if (successMsg) {
      successMsg.textContent = '✓ Profile updated successfully!';
      successMsg.style.display = 'block';
    }

    // Clear file input
    if (file && fileInput) {
      fileInput.value = '';
    }

    // Navigate back to profile view after 1.5 seconds
    setTimeout(() => {
      showProgrammerProfileView();
    }, 1500);

  } catch (error) {
    console.error("[SAVE] Error saving profile:", error);
    if (errorMsg) {
      errorMsg.textContent = error.message || 'Failed to save profile';
      errorMsg.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
}

/**
 * Populates mobile profile view with user data
 */
export function populateMobileProfile(userData) {
  if (!userData) return;

  const photoEl = document.getElementById('mobile-profile-photo');
  const nameEl = document.getElementById('mobile-profile-name');
  const orgEl = document.getElementById('mobile-profile-org');
  const aboutEl = document.getElementById('mobile-profile-about');
  const emailLink = document.getElementById('mobile-profile-email-link');
  const websiteLink = document.getElementById('mobile-profile-website-link');

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Naam';

  if (photoEl) {
    photoEl.src = userData.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0e7ff&color=6366f1&size=280`;
  }
  if (nameEl) nameEl.textContent = fullName;
  if (orgEl) orgEl.textContent = userData.organizationName || userData.companyName || 'Organisatie';
  if (aboutEl) aboutEl.textContent = userData.organizationAbout || userData.bio || userData.about || 'Geen beschrijving beschikbaar.';

  const currentUser = getStore('currentUser');
  if (emailLink && currentUser?.email) {
    emailLink.href = `mailto:${currentUser.email}`;
    emailLink.style.display = 'flex';
  }
  if (websiteLink && userData.website) {
    websiteLink.href = userData.website;
    websiteLink.style.display = 'flex';
  } else if (websiteLink) {
    websiteLink.style.display = 'none';
  }

  console.log('[MOBILE PROFILE] Mobile profile populated');
}

/**
 * Populates mobile edit form with user data
 */
export function populateMobileEditForm(userData) {
  if (!userData) return;

  const photoPreview = document.getElementById('mobile-edit-photo-preview');
  const phoneInput = document.getElementById('mobile-edit-phone');
  const orgNameInput = document.getElementById('mobile-edit-org-name');
  const websiteInput = document.getElementById('mobile-edit-website');
  const aboutInput = document.getElementById('mobile-edit-about');
  const languageSelect = document.getElementById('mobile-edit-language');

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';

  if (photoPreview) {
    photoPreview.src = userData.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=e0e7ff&color=6366f1&size=60`;
  }
  if (phoneInput) phoneInput.value = userData.phone || '';
  if (orgNameInput) orgNameInput.value = userData.organizationName || userData.companyName || '';
  if (websiteInput) websiteInput.value = userData.website || '';
  if (aboutInput) aboutInput.value = userData.organizationAbout || userData.bio || userData.about || '';
  if (languageSelect) languageSelect.value = userData.language || 'nl';

  console.log('[MOBILE EDIT] Mobile edit form populated');
}

/**
 * Saves mobile profile changes to Firestore
 */
async function saveMobileProfileChanges() {
  // Collect values from mobile form
  const phone = document.getElementById('mobile-edit-phone')?.value || '';
  const orgName = document.getElementById('mobile-edit-org-name')?.value || '';
  const website = document.getElementById('mobile-edit-website')?.value || '';
  const about = document.getElementById('mobile-edit-about')?.value || '';
  const language = document.getElementById('mobile-edit-language')?.value || 'nl';

  try {
    const currentUser = getStore('currentUser');
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const docRef = doc(db, 'programmers', currentUser.uid);

    await updateDoc(docRef, {
      phone,
      organizationName: orgName,
      website,
      organizationAbout: about,
      language,
      updatedAt: new Date()
    });

    // Update local store
    const userData = getStore('currentUserData');
    setStore('currentUserData', {
      ...userData,
      phone,
      organizationName: orgName,
      website,
      organizationAbout: about,
      language
    });

    // Show success and go back
    alert('Profiel opgeslagen!');
    showProgrammerProfileView();

    console.log('[MOBILE SAVE] Profile saved successfully');
  } catch (error) {
    console.error('[MOBILE SAVE] Error saving profile:', error);
    alert('Fout bij opslaan. Probeer opnieuw.');
  }
}

/**
 * Handles mobile photo upload
 */
async function handleMobilePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Update preview immediately
  const preview = document.getElementById('mobile-edit-photo-preview');
  if (preview) {
    preview.src = URL.createObjectURL(file);
  }

  try {
    const currentUser = getStore('currentUser');
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    const storage = getStorage();
    const storageRef = ref(storage, `programmers/${currentUser.uid}/profile.jpg`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update Firestore
    const docRef = doc(db, 'programmers', currentUser.uid);
    await updateDoc(docRef, {
      profilePicUrl: downloadURL,
      updatedAt: new Date()
    });

    // Update local store
    const userData = getStore('currentUserData');
    setStore('currentUserData', {
      ...userData,
      profilePicUrl: downloadURL
    });

    console.log('[MOBILE PHOTO] Profile photo uploaded:', downloadURL);
  } catch (error) {
    console.error('[MOBILE PHOTO] Error uploading photo:', error);
    alert('Fout bij uploaden foto. Probeer opnieuw.');
  }
}

/**
 * Displays the programmer profile overview (read-only)
 * UPDATED: Supports separate mobile and desktop element IDs
 */
export function displayProgrammerProfileOverview() {
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');

  if (!currentUserData || !currentUser) {
    console.log("[PROFILE] No user data yet, skipping profile overview display");
    return;
  }

  // Extract data with fallbacks
  const firstName = currentUserData.firstName || '';
  const lastName = currentUserData.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Programmer Name';
  const initial = (firstName.charAt(0) || 'P').toUpperCase();
  const organizationName = currentUserData.organizationName || 'Organization Name';
  const email = currentUser?.email || 'email@example.com';
  const phone = currentUserData.phone || 'Not specified';
  const website = currentUserData.website || '';
  const about = currentUserData.organizationAbout || 'No description available';
  const profilePicUrl = currentUserData.profilePicUrl || '';

  // Helper: Set text content safely
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // Helper: Set link safely
  const setLink = (id, url) => {
    const el = document.getElementById(id);
    if (el) {
      if (url) {
        el.href = url.startsWith('http') ? url : `https://${url}`;
        el.textContent = url.replace(/^https?:\/\//, '');
      } else {
        el.href = '#';
        el.textContent = 'Not specified';
      }
    }
  };

  // ===== MOBILE ELEMENTS =====
  const mobilePic = document.getElementById('programmer-overview-pic-mobile');
  if (mobilePic) {
    mobilePic.src = profilePicUrl || `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent(initial)}`;
  }
  setText('programmer-overview-name-mobile', fullName);
  setText('programmer-overview-org-mobile', organizationName);
  setText('programmer-overview-email-mobile', email);
  setText('programmer-overview-phone-mobile', phone);
  setLink('programmer-overview-website-mobile', website);
  setText('programmer-overview-about-mobile', about);

  // ===== DESKTOP ELEMENTS =====
  // Avatar: show photo OR placeholder with initial
  const avatarPlaceholder = document.getElementById('programmer-avatar-placeholder');
  const avatarInitial = document.getElementById('programmer-avatar-initial');
  const desktopPic = document.getElementById('programmer-overview-pic-desktop');

  if (profilePicUrl) {
    // Has profile picture - show image, hide placeholder
    if (desktopPic) {
      desktopPic.src = profilePicUrl;
      desktopPic.classList.remove('hidden');
      desktopPic.style.display = 'block';
    }
    if (avatarPlaceholder) {
      avatarPlaceholder.classList.add('hidden');
      avatarPlaceholder.style.display = 'none';
    }
    console.log("[PROFILE] Desktop: Showing profile picture");
  } else {
    // No profile picture - show placeholder with initial
    if (desktopPic) {
      desktopPic.classList.add('hidden');
      desktopPic.style.display = 'none';
    }
    if (avatarPlaceholder) {
      avatarPlaceholder.classList.remove('hidden');
      avatarPlaceholder.style.display = 'flex';
    }
    if (avatarInitial) {
      avatarInitial.textContent = initial;
    }
    console.log("[PROFILE] Desktop: Showing avatar placeholder with initial:", initial);
  }

  // Desktop text fields
  setText('programmer-overview-name-desktop', fullName);
  setText('programmer-overview-org-desktop', organizationName);
  setText('programmer-overview-email-desktop', email);
  setText('programmer-overview-phone-desktop', phone);
  setLink('programmer-overview-website-desktop', website);
  setText('programmer-overview-about-desktop', about);

  console.log("[PROFILE] Profile overview displayed (mobile + desktop)");
}

/**
 * Setup edit profile button click handlers
 * Supports both mobile and desktop edit buttons
 */
function setupEditProfileButton() {
  const container = document.getElementById('programmer-dashboard');
  const editor = document.getElementById('programmer-profile-editor');

  if (!container || !editor) {
    console.warn("[SETUP EDIT BTN] Dashboard container or editor not found");
    return;
  }

  // Prevent duplicate listeners
  if (container.dataset.editListenerAttached === 'true') {
    console.log("[PROGRAMMER DASHBOARD] Edit button listener already attached, skipping");
    return;
  }

  container.addEventListener('click', (e) => {
    // Handle BOTH edit buttons (mobile: #edit-programmer-profile-btn-mobile, desktop: #edit-programmer-profile-btn)
    const clickedEditBtn = e.target.closest('#edit-programmer-profile-btn, #edit-programmer-profile-btn-mobile');

    if (clickedEditBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("[PROGRAMMER DASHBOARD] Edit profile button clicked");
      showEditProfile();
    }

    // Handle View Public Profile button
    const clickedViewBtn = e.target.closest('#view-public-profile-btn');
    if (clickedViewBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("[PROGRAMMER DASHBOARD] View public profile clicked");
      showPublicProfile();
    }
  });

  container.dataset.editListenerAttached = 'true';
  console.log("[PROGRAMMER DASHBOARD] Button listeners attached (mobile + desktop)");
}

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

    <!-- VIEW 1: Profile Overview (main view) - DESKTOP REDESIGN -->
    <div id="programmer-profile-view" class="programmer-profile-pattern">

      <!-- Programmer Profile Overview Card - DESKTOP REDESIGN -->
      <div id="programmer-profile-overview" class="mb-8">

        <!-- MOBILE VIEW (unchanged - show on small screens) -->
        <div class="block md:hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 class="text-2xl font-bold text-gray-900">Your Profile</h3>
            <button id="edit-programmer-profile-btn-mobile" class="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm">
              Edit Profile
            </button>
          </div>
          <div class="flex flex-col items-center mb-6">
            <img id="programmer-overview-pic-mobile" src="https://placehold.co/150x150/e9d5ff/805ad5?text=P" alt="Profile" class="w-32 h-32 object-cover rounded-2xl shadow-md border border-gray-100 mb-4">
            <h4 id="programmer-overview-name-mobile" class="text-2xl font-bold text-gray-900 text-center mb-1">Programmer Name</h4>
            <p id="programmer-overview-org-mobile" class="text-lg text-purple-600 font-semibold text-center">Organization Name</p>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex items-center text-gray-700">
              <i data-lucide="mail" class="h-4 w-4 mr-3 text-purple-600 flex-shrink-0"></i>
              <span id="programmer-overview-email-mobile" class="truncate">email@example.com</span>
            </div>
            <div class="flex items-center text-gray-700">
              <i data-lucide="phone" class="h-4 w-4 mr-3 text-purple-600 flex-shrink-0"></i>
              <span id="programmer-overview-phone-mobile">Phone</span>
            </div>
            <div class="flex items-center text-gray-700">
              <i data-lucide="globe" class="h-4 w-4 mr-3 text-purple-600 flex-shrink-0"></i>
              <a id="programmer-overview-website-mobile" href="#" target="_blank" class="text-purple-600 hover:text-purple-800 truncate">Website</a>
            </div>
          </div>
        </div>

        <!-- DESKTOP VIEW (new design - show on md and larger) -->
        <div class="hidden md:block bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-start gap-6">

            <!-- Left: Avatar -->
            <div class="flex-shrink-0">
              <div id="programmer-avatar-container" class="w-28 h-28 rounded-2xl bg-purple-100 flex items-center justify-center shadow-sm border border-purple-200 overflow-hidden">
                <span id="programmer-avatar-initial" class="text-5xl font-bold text-purple-600">P</span>
                <img id="programmer-overview-pic-desktop" src="" alt="Profile" class="w-full h-full object-cover hidden">
              </div>
            </div>

            <!-- Middle: Info -->
            <div class="flex-grow min-w-0">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 id="programmer-overview-name-desktop" class="text-3xl font-bold text-purple-700 mb-1">Programmer Name</h2>
                  <p id="programmer-overview-org-desktop" class="text-lg text-gray-600 font-medium">Organization Name</p>
                </div>
                <!-- Verified Badge -->
                <div class="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                  <i data-lucide="check-circle" class="h-4 w-4"></i>
                  <span>Verified Programmer</span>
                </div>
              </div>

              <!-- Contact Info Row -->
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
                <div class="flex items-center">
                  <i data-lucide="mail" class="h-4 w-4 mr-2 text-purple-500"></i>
                  <span id="programmer-overview-email-desktop">email@example.com</span>
                </div>
                <div class="flex items-center">
                  <i data-lucide="phone" class="h-4 w-4 mr-2 text-purple-500"></i>
                  <span id="programmer-overview-phone-desktop">Phone</span>
                </div>
                <div class="flex items-center">
                  <i data-lucide="globe" class="h-4 w-4 mr-2 text-purple-500"></i>
                  <a id="programmer-overview-website-desktop" href="#" target="_blank" class="text-purple-600 hover:text-purple-800">Website</a>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-3">
                <button id="edit-programmer-profile-btn" class="bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-800 transition-all shadow-sm text-sm">
                  Edit Profile
                </button>
                <button id="view-public-profile-btn" class="bg-white text-purple-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all border-2 border-purple-700 text-sm">
                  View Public Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- About Organization Card - DESKTOP ONLY -->
        <div class="hidden md:block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-4">
          <h3 class="text-xl font-bold text-gray-900 mb-3">About Organization</h3>
          <p id="programmer-overview-about-desktop" class="text-gray-600 leading-relaxed">Organization description here</p>
        </div>

        <!-- About Organization - MOBILE (inside existing card flow) -->
        <div class="block md:hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-4">
          <h3 class="text-lg font-bold text-gray-900 mb-2">About Organization</h3>
          <p id="programmer-overview-about-mobile" class="text-gray-600 text-sm leading-relaxed">Organization description here</p>
        </div>
      </div>

    </div>
    <!-- End Profile View -->

    <!-- VIEW 2: Edit Profile (hidden by default) -->
    <div id="programmer-edit-view" class="programmer-profile-pattern" style="display: none;">

      <!-- MOBILE EDIT LAYOUT -->
      <div id="mobile-edit-layout" class="lg:hidden" style="padding: 16px; padding-bottom: 100px;">

        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 24px;">Edit Profile</h1>

        <!-- Personal Details -->
        <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
          <h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Personal Details</h2>

          <!-- Photo -->
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; overflow: hidden;">
              <img id="mobile-edit-photo-preview" src="" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 6px;">Photo</p>
              <label style="padding: 8px 16px; background: white; border: 1px solid #805ad5; color: #805ad5; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;">
                Change Photo
                <input type="file" id="mobile-edit-photo-input" accept="image/*" style="display: none;">
              </label>
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label style="font-size: 14px; color: #6b7280; display: block; margin-bottom: 6px;">Phone</label>
            <input type="tel" id="mobile-edit-phone" placeholder="Telefoonnummer"
                   style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
          </div>
        </div>

        <!-- Organization Details -->
        <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
          <h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Organization Details</h2>

          <!-- Name -->
          <div style="margin-bottom: 16px;">
            <label style="font-size: 14px; color: #6b7280; display: block; margin-bottom: 6px;">Name</label>
            <input type="text" id="mobile-edit-org-name" placeholder="Organisatie naam"
                   style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
          </div>

          <!-- Website -->
          <div style="margin-bottom: 16px;">
            <label style="font-size: 14px; color: #6b7280; display: block; margin-bottom: 6px;">Website</label>
            <input type="url" id="mobile-edit-website" placeholder="https://..."
                   style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box;">
          </div>

          <!-- About -->
          <div>
            <label style="font-size: 14px; color: #6b7280; display: block; margin-bottom: 6px;">About</label>
            <textarea id="mobile-edit-about" placeholder="Beschrijf je organisatie..." rows="4"
                      style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;"></textarea>
          </div>
        </div>

        <!-- Preferences -->
        <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">
          <h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Preferences</h2>

          <!-- Language -->
          <div>
            <label style="font-size: 14px; color: #6b7280; display: block; margin-bottom: 6px;">Language</label>
            <select id="mobile-edit-language"
                    style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; box-sizing: border-box; background: white;">
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px;">
          <button id="mobile-save-profile-btn"
                  style="flex: 1; padding: 14px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;">
            Save All Changes
          </button>
          <button id="mobile-cancel-edit-btn"
                  style="padding: 14px 24px; background: white; color: #6b7280; border: none; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer;">
            Cancel
          </button>
        </div>
      </div>

      <!-- DESKTOP EDIT LAYOUT -->
      <div id="desktop-edit-layout" class="hidden lg:block" style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">

        <!-- Back Button -->
        <button id="back-from-edit-btn" style="display: flex; align-items: center; gap: 8px; background: none; border: none; color: #805ad5; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 24px; padding: 8px 0;">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Terug naar profiel
        </button>

        <!-- Edit Form Card -->
        <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1);">
          <h2 style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px;">Edit Profile</h2>
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 32px;">Update your information below</p>

          <form id="programmer-profile-form">
            <!-- Profile Picture -->
            <div style="margin-bottom: 28px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Profile Picture</label>
              <div style="display: flex; align-items: center; gap: 20px;">
                <img id="programmer-edit-pic-preview" src="https://placehold.co/100x100/e9e3f5/805ad5?text=P" style="width: 100px; height: 100px; border-radius: 12px; object-fit: cover;">
                <div>
                  <input type="file" id="programmer-edit-profile-pic" accept="image/*" style="font-size: 14px;">
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">JPG, PNG or WebP. Max 5MB.</p>
                </div>
              </div>
            </div>

            <!-- Name Fields -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">First Name *</label>
                <input type="text" id="programmer-edit-firstname" required style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
              <div>
                <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Last Name *</label>
                <input type="text" id="programmer-edit-lastname" required style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e5e7eb'">
              </div>
            </div>

            <!-- Phone -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Phone Number</label>
              <input type="tel" id="programmer-edit-phone" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- Organization Name -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Organization Name *</label>
              <input type="text" id="programmer-edit-org-name" required style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- Website -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">Website</label>
              <input type="url" id="programmer-edit-website" placeholder="https://example.com" style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none;" onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e5e7eb'">
            </div>

            <!-- About Organization -->
            <div style="margin-bottom: 28px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 8px;">About Organization *</label>
              <textarea id="programmer-edit-org-about" rows="4" required style="width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; resize: vertical;" onfocus="this.style.borderColor='#805ad5'" onblur="this.style.borderColor='#e5e7eb'"></textarea>
            </div>

            <!-- Submit -->
            <div style="display: flex; gap: 12px;">
              <button type="submit" id="save-programmer-profile-btn" style="flex: 1; padding: 14px 28px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;">
                Save Changes
              </button>
              <button type="button" id="cancel-edit-btn" style="padding: 14px 28px; background: white; color: #4a4a68; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer;">
                Cancel
              </button>
            </div>

            <p id="programmer-profile-success" style="display: none; color: #10b981; text-align: center; margin-top: 16px;"></p>
            <p id="programmer-profile-error" style="display: none; color: #ef4444; text-align: center; margin-top: 16px;"></p>
          </form>
        </div>

      </div>
      <!-- End Desktop Edit Layout -->

    </div>
    <!-- End Edit View -->

    <!-- VIEW 3: Public Profile Preview (hidden by default) -->
    <div id="programmer-public-view" class="programmer-profile-pattern" style="display: none;">
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">

        <!-- Back Button -->
        <button id="back-from-public-btn" style="display: flex; align-items: center; gap: 8px; background: none; border: none; color: #805ad5; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 24px; padding: 8px 0;">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Terug naar profiel
        </button>

        <!-- Info Banner -->
        <div style="background: #f3e8ff; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">
          <svg width="20" height="20" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p style="color: #6b46c1; font-size: 14px;">This is how artists see your profile when they view your organization information.</p>
        </div>

        <!-- Public Profile Card -->
        <div id="programmer-public-preview-card" style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1);">
          <!-- Content wordt gevuld door renderPublicPreviewCard() -->
        </div>

      </div>
    </div>

    <!-- Search and Filter Section (Content rendered dynamically by renderArtistSearch() in artist-search.js) -->
    <div id="artist-search-section" class="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100" style="min-height: 400px; display: block; opacity: 1; visibility: visible;">
        <!-- Content will be injected dynamically -->
    </div>

    <!-- Version Badge (Programmer Dashboard) -->
    <div class="text-center py-6 text-xs text-gray-400">
        Staging v2.1 (Modular Dashboard) [27-12-2025]
    </div>
  `;

  console.log("Programmer dashboard HTML rendered with 3 separate views");
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

  // Hide ALL profile elements
  const profileView = document.getElementById('programmer-profile-view');
  const editView = document.getElementById('programmer-edit-view');
  const publicView = document.getElementById('programmer-public-view');
  const mobileProfileLayout = document.getElementById('mobile-profile-layout');
  const desktopProfileLayout = document.getElementById('desktop-profile-layout');

  [profileView, editView, publicView, mobileProfileLayout, desktopProfileLayout].forEach(el => {
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

  // Show profile view
  const profileView = document.getElementById('programmer-profile-view');
  const editView = document.getElementById('programmer-edit-view');
  const publicView = document.getElementById('programmer-public-view');

  if (profileView) {
    profileView.style.display = 'block';
    profileView.classList.remove('hidden');
  }
  if (editView) {
    editView.style.display = 'none';
    editView.classList.add('hidden');
  }
  if (publicView) {
    publicView.style.display = 'none';
    publicView.classList.add('hidden');
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

  // Setup navigation event handlers
  setupProgrammerNavigation();

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
 * Called on initial load and after profile updates
 * UPDATED: Supports separate mobile and desktop element IDs
 */
export function displayProgrammerProfileOverview() {
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');

  // If no data yet (e.g., during page load before login), skip
  if (!currentUserData || !currentUser) {
    console.log("[PROFILE] No user data yet, skipping profile overview display");
    return;
  }

  const firstName = currentUserData.firstName || '';
  const lastName = currentUserData.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Programmer Name';
  const initial = firstName.charAt(0).toUpperCase() || 'P';
  const organizationName = currentUserData.organizationName || 'Organization Name';
  const email = currentUser?.email || 'email@example.com';
  const phone = currentUserData.phone || 'Not specified';
  const website = currentUserData.website || '';
  const about = currentUserData.organizationAbout || 'No description available';
  const profilePicUrl = currentUserData.profilePicUrl || '';

  // Helper function to update element if it exists
  const updateElement = (id, value, isHref = false) => {
    const el = document.getElementById(id);
    if (el) {
      if (isHref) {
        el.href = value || '#';
        el.textContent = value ? value.replace(/^https?:\/\//, '') : 'Not specified';
      } else {
        el.textContent = value;
      }
    }
  };

  // === MOBILE ELEMENTS ===
  const mobileProfilePic = document.getElementById('programmer-overview-pic-mobile');
  if (mobileProfilePic) {
    mobileProfilePic.src = profilePicUrl || `https://placehold.co/150x150/e9d5ff/805ad5?text=${encodeURIComponent(initial)}`;
  }
  updateElement('programmer-overview-name-mobile', fullName);
  updateElement('programmer-overview-org-mobile', organizationName);
  updateElement('programmer-overview-email-mobile', email);
  updateElement('programmer-overview-phone-mobile', phone);
  updateElement('programmer-overview-website-mobile', website, true);
  updateElement('programmer-overview-about-mobile', about);

  // === DESKTOP ELEMENTS ===
  // Avatar handling: show initial OR profile pic
  const avatarInitial = document.getElementById('programmer-avatar-initial');
  const avatarPic = document.getElementById('programmer-overview-pic-desktop');

  if (profilePicUrl && avatarPic && avatarInitial) {
    // Has profile picture - show image, hide initial
    avatarPic.src = profilePicUrl;
    avatarPic.classList.remove('hidden');
    avatarInitial.classList.add('hidden');
  } else if (avatarInitial) {
    // No profile picture - show initial
    avatarInitial.textContent = initial;
    avatarInitial.classList.remove('hidden');
    if (avatarPic) avatarPic.classList.add('hidden');
  }

  updateElement('programmer-overview-name-desktop', fullName);
  updateElement('programmer-overview-org-desktop', organizationName);
  updateElement('programmer-overview-email-desktop', email);
  updateElement('programmer-overview-phone-desktop', phone);
  updateElement('programmer-overview-website-desktop', website, true);
  updateElement('programmer-overview-about-desktop', about);

  console.log("[PROFILE] Profile overview displayed successfully (mobile + desktop)");
}

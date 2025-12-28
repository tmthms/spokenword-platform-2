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

    <!-- VIEW 1: Profile Overview (main view) -->
    <div id="programmer-profile-view" class="programmer-profile-pattern">
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">

        <!-- Main Profile Card -->
        <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1); margin-bottom: 20px;">

          <!-- Verified Badge - Top Right -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: -20px;">
            <span id="programmer-verified-badge" style="display: none; align-items: center; gap: 6px; color: #805ad5; font-size: 14px; font-weight: 500;">
              <svg width="18" height="18" fill="#805ad5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Verified Programmer
            </span>
          </div>

          <!-- Profile Header -->
          <div style="display: flex; gap: 28px; align-items: flex-start;">

            <!-- Profile Picture -->
            <div id="programmer-profile-pic-container" style="width: 140px; height: 140px; background: linear-gradient(135deg, #e9e3f5 0%, #d4c8eb 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;">
              <span id="programmer-profile-initial" style="font-size: 64px; font-weight: 600; color: #805ad5;">P</span>
              <img id="programmer-profile-pic" src="" alt="Profile" style="display: none; width: 100%; height: 100%; object-fit: cover;">
            </div>

            <!-- Profile Info -->
            <div style="flex: 1;">
              <h1 id="programmer-display-name" style="font-size: 32px; font-weight: 700; color: #805ad5; margin-bottom: 4px;">Programmer Name</h1>
              <p id="programmer-org-name" style="font-size: 18px; color: #4a4a68; margin-bottom: 20px;">Organization Name</p>

              <!-- Contact Info Row -->
              <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;">
                <a id="programmer-email-link" href="mailto:" style="display: flex; align-items: center; gap: 8px; color: #4a4a68; text-decoration: none; font-size: 14px;">
                  <svg width="18" height="18" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span id="programmer-email">email@example.com</span>
                </a>
                <a id="programmer-phone-link" href="tel:" style="display: none; align-items: center; gap: 8px; color: #4a4a68; text-decoration: none; font-size: 14px;">
                  <svg width="18" height="18" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span id="programmer-phone">Phone</span>
                </a>
                <a id="programmer-website-link" href="" target="_blank" style="display: none; align-items: center; gap: 8px; color: #4a4a68; text-decoration: none; font-size: 14px;">
                  <svg width="18" height="18" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                  <span id="programmer-website">website.com</span>
                </a>
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; gap: 12px;">
                <button id="edit-programmer-profile-btn" style="padding: 12px 28px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;">
                  Edit Profile
                </button>
                <button id="view-public-profile-btn" style="padding: 12px 28px; background: white; color: #1a1a2e; border: 2px solid #1a1a2e; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;">
                  View Public Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- About Organization Card -->
        <div style="background: white; border-radius: 20px; padding: 28px 32px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1);">
          <h2 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px;">About Organization</h2>
          <p id="programmer-org-about" style="color: #4a4a68; font-size: 15px; line-height: 1.7;">No description available</p>
        </div>

      </div>
    </div>

    <!-- VIEW 2: Edit Profile (hidden by default) -->
    <div id="programmer-edit-view" class="programmer-profile-pattern" style="display: none;">
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">

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
    </div>

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

  // Hide all profile views
  const profileView = document.getElementById('programmer-profile-view');
  const editView = document.getElementById('programmer-edit-view');
  const publicView = document.getElementById('programmer-public-view');

  if (profileView) {
    profileView.style.display = 'none';
    profileView.classList.add('hidden');
  }
  if (editView) {
    editView.style.display = 'none';
    editView.classList.add('hidden');
  }
  if (publicView) {
    publicView.style.display = 'none';
    publicView.classList.add('hidden');
  }

  // Show artist search section
  const artistSearchSection = document.getElementById('artist-search-section');
  if (artistSearchSection) {
    artistSearchSection.style.display = 'block';
    artistSearchSection.style.opacity = '1';
    artistSearchSection.style.visibility = 'visible';
    artistSearchSection.classList.remove('hidden');
    console.log('[PROGRAMMER DASHBOARD] Artist search section shown');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show only profile section (hide search section)
 */
export function showProfileOnlyView() {
  console.log('[PROGRAMMER DASHBOARD] Showing profile-only view');

  // Hide artist search section
  const artistSearchSection = document.getElementById('artist-search-section');
  if (artistSearchSection) {
    artistSearchSection.style.display = 'none';
    artistSearchSection.classList.add('hidden');
  }

  // Show profile view (default view)
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
    // Edit Profile button
    if (e.target.closest('#edit-programmer-profile-btn')) {
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

  dashboard.dataset.navListenersAttached = 'true';

  console.log("[NAVIGATION] Event listeners attached via event delegation");
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

  // Profile Picture or Initial
  const profilePic = document.getElementById('programmer-profile-pic');
  const profileInitial = document.getElementById('programmer-profile-initial');

  if (currentUserData.profilePicUrl) {
    if (profilePic) {
      profilePic.src = currentUserData.profilePicUrl;
      profilePic.style.display = 'block';
    }
    if (profileInitial) profileInitial.style.display = 'none';
  } else {
    if (profilePic) profilePic.style.display = 'none';
    if (profileInitial) {
      profileInitial.style.display = 'flex';
      profileInitial.textContent = (currentUserData.firstName || 'P').charAt(0).toUpperCase();
    }
  }

  // Name
  const displayName = document.getElementById('programmer-display-name');
  if (displayName) {
    displayName.textContent = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Programmer Name';
  }

  // Organization name
  const orgName = document.getElementById('programmer-org-name');
  if (orgName) {
    orgName.textContent = currentUserData.organizationName || 'Organization Name';
  }

  // Email
  const emailSpan = document.getElementById('programmer-email');
  const emailLink = document.getElementById('programmer-email-link');
  if (emailSpan && currentUser?.email) {
    emailSpan.textContent = currentUser.email;
  }
  if (emailLink) {
    emailLink.href = `mailto:${currentUser?.email || ''}`;
    emailLink.style.display = currentUser?.email ? 'flex' : 'none';
  }

  // Phone
  const phoneSpan = document.getElementById('programmer-phone');
  const phoneLink = document.getElementById('programmer-phone-link');
  if (phoneSpan && currentUserData.phone) {
    phoneSpan.textContent = currentUserData.phone;
  }
  if (phoneLink) {
    phoneLink.href = `tel:${currentUserData.phone || ''}`;
    phoneLink.style.display = currentUserData.phone ? 'flex' : 'none';
  }

  // Website
  const websiteSpan = document.getElementById('programmer-website');
  const websiteLink = document.getElementById('programmer-website-link');
  if (websiteSpan && currentUserData.website) {
    websiteSpan.textContent = currentUserData.website.replace(/^https?:\/\//, '');
  }
  if (websiteLink) {
    websiteLink.href = currentUserData.website?.startsWith('http')
      ? currentUserData.website
      : `https://${currentUserData.website}`;
    websiteLink.style.display = currentUserData.website ? 'flex' : 'none';
  }

  // About Organization
  const orgAbout = document.getElementById('programmer-org-about');
  if (orgAbout) {
    orgAbout.textContent = currentUserData.organizationAbout || 'No description available';
  }

  // Verified badge (show only if verified)
  const verifiedBadge = document.getElementById('programmer-verified-badge');
  if (verifiedBadge) {
    verifiedBadge.style.display = currentUserData.verified ? 'inline-flex' : 'none';
  }

  console.log("[PROFILE] Profile overview displayed successfully");
}

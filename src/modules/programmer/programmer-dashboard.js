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
 * REDESIGNED: Matches mockup with compact card layout
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

    <!-- ========== PROGRAMMER PROFILE CARD - REDESIGNED ========== -->
    <div id="programmer-profile-overview" class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">

        <!-- Main Profile Card Content -->
        <div class="p-6 md:p-8">
            <div class="flex flex-col md:flex-row md:items-start gap-6">

                <!-- Avatar Section - FIXED SIZE -->
                <div class="flex-shrink-0 flex justify-center md:justify-start">
                    <div id="programmer-avatar-wrapper" class="relative">
                        <!-- Placeholder Avatar (shown when no photo) -->
                        <div id="programmer-avatar-placeholder" class="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-purple-100 flex items-center justify-center border-2 border-purple-200 shadow-sm">
                            <span id="programmer-avatar-initial" class="text-4xl md:text-5xl font-bold text-purple-600">P</span>
                        </div>
                        <!-- Actual Profile Picture (hidden by default, shown when photo exists) -->
                        <img id="programmer-overview-pic"
                             src=""
                             alt="Profile"
                             class="hidden w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-purple-200 shadow-sm"
                             style="max-width: 112px; max-height: 112px;">
                    </div>
                </div>

                <!-- Info Section -->
                <div class="flex-grow min-w-0 text-center md:text-left">

                    <!-- Name + Badge Row -->
                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                        <div>
                            <h2 id="programmer-overview-name" class="text-2xl md:text-3xl font-bold text-purple-700 mb-1">Programmer Name</h2>
                            <p id="programmer-overview-org" class="text-lg text-gray-600 font-medium">Organization Name</p>
                        </div>
                        <!-- Verified Badge -->
                        <div class="flex justify-center md:justify-start">
                            <div class="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                                <i data-lucide="check-circle" class="h-4 w-4"></i>
                                <span>Verified Programmer</span>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Info Row -->
                    <div class="flex flex-wrap justify-center md:justify-start items-center gap-x-5 gap-y-2 text-sm text-gray-600 mb-5">
                        <div class="flex items-center">
                            <i data-lucide="mail" class="h-4 w-4 mr-2 text-purple-500 flex-shrink-0"></i>
                            <span id="programmer-overview-email" class="truncate max-w-[200px]">email@example.com</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="phone" class="h-4 w-4 mr-2 text-purple-500 flex-shrink-0"></i>
                            <span id="programmer-overview-phone">Not specified</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="globe" class="h-4 w-4 mr-2 text-purple-500 flex-shrink-0"></i>
                            <a id="programmer-overview-website" href="#" target="_blank" class="text-purple-600 hover:text-purple-800 truncate max-w-[150px]">Website</a>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap justify-center md:justify-start items-center gap-3">
                        <button id="edit-programmer-profile-btn" class="bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-800 transition-all shadow-sm text-sm flex items-center gap-2">
                            <i data-lucide="pencil" class="h-4 w-4"></i>
                            Edit Profile
                        </button>
                        <button id="view-public-profile-btn" class="bg-white text-purple-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all border-2 border-purple-700 text-sm flex items-center gap-2">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                            View Public Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ========== ABOUT ORGANIZATION CARD ========== -->
    <div id="programmer-about-card" class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 p-6 md:p-8">
        <h3 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i data-lucide="building-2" class="h-5 w-5 text-purple-600"></i>
            About Organization
        </h3>
        <p id="programmer-overview-about" class="text-gray-600 leading-relaxed">Organization description here</p>
    </div>

    <!-- Programmer Profile Editor (rendered by programmer-profile.js) -->
    <div id="programmer-profile-editor" class="hidden">
        <!-- Content will be rendered by renderProgrammerProfileEditor() -->
    </div>

    <!-- Programmer Public Preview Section -->
    <div id="programmer-public-preview" class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 class="text-xl font-bold text-gray-900">Public Profile Preview</h3>
            <button id="refresh-programmer-preview-btn" class="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-sm text-sm flex items-center gap-2">
                <i data-lucide="refresh-cw" class="h-4 w-4"></i>
                Refresh
            </button>
        </div>

        <div class="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200">
            <p class="text-sm text-gray-500 mb-4 flex items-center">
                <i data-lucide="info" class="h-4 w-4 mr-2 flex-shrink-0"></i>
                This is how artists see your profile when they view your organization information.
            </p>

            <!-- Preview Content Container -->
            <div id="programmer-preview-content" class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="text-center py-10 text-gray-400">
                    <i data-lucide="eye" class="h-10 w-10 mx-auto mb-3"></i>
                    <p class="font-medium">Click "Refresh" to see your public profile</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Search and Filter Section -->
    <div id="artist-search-section" class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100" style="min-height: 400px;">
        <!-- Content will be injected dynamically by artist-search.js -->
    </div>

    <!-- Version Badge -->
    <div class="text-center py-4 text-xs text-gray-400">
        Staging v2.2 (Profile Redesign) [29-12-2025]
    </div>
  `;

  console.log("Programmer dashboard HTML rendered (redesigned)");
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
 * Called on initial load and after profile updates
 * UPDATED: Handles avatar placeholder vs actual photo
 */
export function displayProgrammerProfileOverview() {
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');

  if (!currentUserData || !currentUser) {
    console.log("[PROFILE] No user data yet, skipping profile overview display");
    return;
  }

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

  // === AVATAR HANDLING ===
  const avatarPlaceholder = document.getElementById('programmer-avatar-placeholder');
  const avatarInitial = document.getElementById('programmer-avatar-initial');
  const avatarPic = document.getElementById('programmer-overview-pic');

  if (profilePicUrl && avatarPic) {
    // Has profile picture - show image, hide placeholder
    avatarPic.src = profilePicUrl;
    avatarPic.classList.remove('hidden');
    if (avatarPlaceholder) avatarPlaceholder.classList.add('hidden');
    console.log("[PROFILE] Showing profile picture");
  } else {
    // No profile picture - show placeholder with initial
    if (avatarPic) avatarPic.classList.add('hidden');
    if (avatarPlaceholder) avatarPlaceholder.classList.remove('hidden');
    if (avatarInitial) avatarInitial.textContent = initial;
    console.log("[PROFILE] Showing avatar placeholder with initial:", initial);
  }

  // === UPDATE TEXT ELEMENTS ===
  const updateText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  updateText('programmer-overview-name', fullName);
  updateText('programmer-overview-org', organizationName);
  updateText('programmer-overview-email', email);
  updateText('programmer-overview-phone', phone);
  updateText('programmer-overview-about', about);

  // Website link
  const websiteEl = document.getElementById('programmer-overview-website');
  if (websiteEl) {
    if (website) {
      websiteEl.href = website.startsWith('http') ? website : `https://${website}`;
      websiteEl.textContent = website.replace(/^https?:\/\//, '');
    } else {
      websiteEl.href = '#';
      websiteEl.textContent = 'Not specified';
    }
  }

  console.log("[PROFILE] Profile overview displayed successfully");
}

/**
 * Setup edit profile button click handler
 * UPDATED: Also handles View Public Profile button
 */
function setupEditProfileButton() {
  const container = document.getElementById('programmer-dashboard');
  const editor = document.getElementById('programmer-profile-editor');

  if (!container || !editor) {
    console.warn("[SETUP EDIT BTN] Dashboard container or editor not found");
    return;
  }

  if (container.dataset.editListenerAttached === 'true') {
    console.log("[PROGRAMMER DASHBOARD] Edit button listener already attached, skipping");
    return;
  }

  container.addEventListener('click', (e) => {
    // Handle Edit Profile button
    const clickedEditBtn = e.target.closest('#edit-programmer-profile-btn');
    if (clickedEditBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("[PROGRAMMER DASHBOARD] Edit profile button clicked");

      import('./programmer-profile.js').then(module => {
        const isHidden = editor.classList.contains('hidden') || editor.style.display === 'none';

        if (isHidden) {
          module.renderProgrammerProfileEditor();
          editor.classList.remove('hidden');
          editor.style.display = 'block';
          module.setupProfileFormHandlers();
          module.populateProgrammerEditor();

          setTimeout(() => {
            editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          editor.classList.add('hidden');
          editor.style.display = 'none';
          displayProgrammerProfileOverview();
        }
      }).catch(error => {
        console.error("[EDIT BTN] Error:", error);
      });
    }

    // Handle View Public Profile button
    const clickedViewBtn = e.target.closest('#view-public-profile-btn');
    if (clickedViewBtn) {
      e.preventDefault();
      e.stopPropagation();
      console.log("[PROGRAMMER DASHBOARD] View public profile clicked");

      const publicPreview = document.getElementById('programmer-public-preview');
      if (publicPreview) {
        publicPreview.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Auto-refresh preview
        setTimeout(() => {
          const refreshBtn = document.getElementById('refresh-programmer-preview-btn');
          if (refreshBtn) refreshBtn.click();
        }, 300);
      }
    }
  });

  container.dataset.editListenerAttached = 'true';
  console.log("[PROGRAMMER DASHBOARD] Button listeners attached");
}

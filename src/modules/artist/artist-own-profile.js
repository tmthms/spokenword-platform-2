/**
 * artist-own-profile.js
 * Renders the artist's own profile in the same style as programmer's view
 * but with edit capabilities instead of chat/message
 */

import { calculateAge } from '../dashboard/dashboard-service.js';
import { getStore } from '../../utils/store.js';

/**
 * Render artist own profile view with edit button
 * Reuses the artist-detail-view design from search-ui.js
 */
export function renderArtistOwnProfile(artistData) {
  const container = document.getElementById('artist-dashboard');

  if (!container) {
    console.error('[ARTIST OWN PROFILE] Container not found');
    return;
  }

  console.log('[ARTIST OWN PROFILE] Rendering artist own profile view');

  const artistName = artistData.stageName || `${artistData.firstName || ''} ${artistData.lastName || ''}`.trim() || 'Unknown Artist';
  const profilePicUrl = artistData.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=f3f4f6&color=1a1a2e&size=140`;
  const age = artistData.dob ? calculateAge(artistData.dob) : null;
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  const genderText = genderMap[artistData.gender] || artistData.gender || 'Not specified';

  // Apply pattern background
  container.style.cssText = 'display: block; min-height: 100vh; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%); padding: 24px;';

  container.innerHTML = `
    <div style="max-width: 1400px; margin: 0 auto;">

      <!-- ==================== MOBILE LAYOUT ==================== -->
      <div id="mobile-artist-own-profile" class="lg:hidden" style="padding: 0 0 100px;">

        <!-- Profile Photo -->
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          <div style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 3px solid #1a1a2e;">
            <img src="${profilePicUrl}" alt="${artistName}" style="width: 100%; height: 100%; object-fit: cover; background: #f3f4f6;">
          </div>
        </div>

        <!-- Name -->
        <h1 style="font-size: 28px; font-weight: 700; color: #1a1a2e; text-align: center; margin-bottom: 16px;">${artistName}</h1>

        <!-- Meta Info -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 10px; color: #4a4a68; font-size: 15px;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>${age ? `${age} years old` : 'Age unknown'}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; color: #4a4a68; font-size: 15px;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>${genderText}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; color: #4a4a68; font-size: 15px;">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>${artistData.location || 'Location unknown'}</span>
          </div>
        </div>

        <!-- Genres -->
        <div style="margin-bottom: 20px;">
          <p style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 10px;">Genres</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${renderGenreBadges(artistData.genres || [])}
          </div>
        </div>

        <!-- Languages -->
        <div style="margin-bottom: 24px;">
          <p style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 10px;">Languages</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${renderLanguageBadges(artistData.languages || [])}
          </div>
        </div>

        <!-- Edit Profile Button (replaces Send Message) -->
        <button id="mobile-edit-own-profile-btn"
                style="width: 100%; padding: 14px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Bewerk Profiel
        </button>

        <!-- Biography -->
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Biography</h2>
          <p style="font-size: 15px; color: #4a4a68; line-height: 1.6;">${artistData.bio || 'No biography available.'}</p>
        </div>

        <!-- Pitch -->
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Pitch</h2>
          <p style="font-size: 15px; color: #4a4a68; line-height: 1.6;">${artistData.pitch || 'No pitch available.'}</p>
        </div>

        <!-- Recommendations (Read-only) -->
        <div>
          <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Recommendations</h2>
          <div id="mobile-own-profile-recommendations" style="display: flex; flex-direction: column; gap: 12px;">
            <p style="color: #9ca3af; font-size: 14px;">Loading recommendations...</p>
          </div>
        </div>

      </div>

      <!-- ==================== DESKTOP 3-COLUMN LAYOUT ==================== -->
      <div id="desktop-artist-own-profile" class="hidden lg:grid" style="grid-template-columns: 280px 1fr 320px; gap: 24px; align-items: start;">

        <!-- LEFT COLUMN: Media Gallery -->
        <aside style="background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(128,90,213,0.08); border: 1px solid rgba(128,90,213,0.1);">
          <h2 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px;">Media Gallery</h2>
          <div id="own-profile-media-gallery" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            ${renderMediaGallery(artistData)}
          </div>
        </aside>

        <!-- MIDDLE COLUMN: Artist Profile -->
        <main style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(128,90,213,0.08); border: 1px solid rgba(128,90,213,0.1);">

          <!-- Profile Header -->
          <div style="display: flex; gap: 24px; margin-bottom: 24px;">
            <div style="flex-shrink: 0;">
              <div style="width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 4px solid #805ad5;">
                <img src="${profilePicUrl}" alt="${artistName}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            </div>
            <div style="flex: 1;">
              <h1 style="font-size: 32px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px;">${artistName}</h1>
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>${age ? `${age} years old` : 'Age unknown'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span>${genderText}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #4a4a68; font-size: 14px;">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>${artistData.location || 'Location unknown'}</span>
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <p style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Genres</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${renderGenreBadges(artistData.genres || [])}
                </div>
              </div>
              <div>
                <p style="font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Languages</p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${renderLanguageBadges(artistData.languages || [])}
                </div>
              </div>
            </div>
          </div>

          <!-- Biography Section -->
          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e9e3f5;">
            <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px;">Biography</h3>
            <p style="font-size: 14px; color: #4a4a68; line-height: 1.7;">${artistData.bio || 'No biography available.'}</p>
            <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 20px 0 12px;">Pitch</h3>
            <p style="font-size: 14px; color: #4a4a68; line-height: 1.7;">${artistData.pitch || 'No pitch available.'}</p>
          </div>

          <!-- Recommendations Section (Read-only) -->
          <div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Recommendations</h3>
            <div id="desktop-own-profile-recommendations" style="display: flex; flex-direction: column; gap: 12px;">
              <p style="color: #9ca3af; font-size: 14px;">Loading recommendations...</p>
            </div>
          </div>

        </main>

        <!-- RIGHT COLUMN: Profile Management (replaces Chat Panel) -->
        <aside style="background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(128,90,213,0.08); border: 1px solid rgba(128,90,213,0.1);">
          <h2 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px;">Profiel Beheren</h2>
          <button id="artist-edit-own-profile-btn" style="width: 100%; padding: 16px; background: #805ad5; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
            Bewerk Profiel
          </button>
        </aside>

      </div>
    </div>
  `;

  // Setup event handlers
  setupEditButtonHandlers();

  // Load recommendations (read-only)
  loadOwnRecommendations(artistData);

  // Force responsive layout
  handleResponsiveLayout();
  window.removeEventListener('resize', handleResponsiveLayout);
  window.addEventListener('resize', handleResponsiveLayout);

  console.log('[ARTIST OWN PROFILE] Artist own profile rendered successfully');
}

/**
 * Render genre badges
 */
function renderGenreBadges(genres) {
  if (!genres || genres.length === 0) {
    return '<span style="color: #9ca3af; font-size: 13px;">No genres specified</span>';
  }
  return genres.map(g =>
    `<span style="padding: 6px 14px; background: #f3e8ff; color: #805ad5; border-radius: 20px; font-size: 13px; font-weight: 500;">${g}</span>`
  ).join('');
}

/**
 * Render language badges
 */
function renderLanguageBadges(languages) {
  if (!languages || languages.length === 0) {
    return '<span style="color: #9ca3af; font-size: 13px;">No languages specified</span>';
  }
  return languages.map(l =>
    `<span style="padding: 6px 12px; background: #805ad5; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">${(l || '').substring(0,2).toUpperCase()}</span>`
  ).join('');
}

/**
 * Render media gallery
 */
function renderMediaGallery(artist) {
  const mediaItems = [];

  // Add photos from gallery
  if (artist.galleryPhotos && artist.galleryPhotos.length > 0) {
    artist.galleryPhotos.forEach((photo) => {
      mediaItems.push(`
        <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
          <img src="${photo}" alt="Gallery photo" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `);
    });
  }

  // Add profile pic if no gallery photos
  if (mediaItems.length === 0 && artist.profilePicUrl) {
    mediaItems.push(`
      <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
        <img src="${artist.profilePicUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `);
  }

  // Add YouTube videos
  if (artist.youtubeVideos && artist.youtubeVideos.length > 0) {
    artist.youtubeVideos.forEach((video) => {
      const videoId = video.videoId || (video.url ? video.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] : null);
      if (videoId) {
        mediaItems.push(`
          <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden; position: relative;">
            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3);">
              <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" fill="#805ad5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        `);
      }
    });
  }

  if (mediaItems.length > 0) {
    return mediaItems.join('');
  } else {
    return '<div style="grid-column: span 2; aspect-ratio: 16/9; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;"><span style="color: #9ca3af; font-size: 14px;">Geen media beschikbaar</span></div>';
  }
}

/**
 * Setup edit button handlers
 */
function setupEditButtonHandlers() {
  // Desktop edit button
  const desktopEditBtn = document.getElementById('artist-edit-own-profile-btn');
  if (desktopEditBtn && !desktopEditBtn.dataset.listenerAttached) {
    desktopEditBtn.addEventListener('click', async () => {
      console.log('[ARTIST OWN PROFILE] Desktop edit button clicked');
      // Update URL first
      window.history.pushState({ view: 'artist-edit-profile' }, '', '#edit-profile');
      await showProfileEditorView();
    });
    desktopEditBtn.dataset.listenerAttached = 'true';
  }

  // Mobile edit button
  const mobileEditBtn = document.getElementById('mobile-edit-own-profile-btn');
  if (mobileEditBtn && !mobileEditBtn.dataset.listenerAttached) {
    mobileEditBtn.addEventListener('click', async () => {
      console.log('[ARTIST OWN PROFILE] Mobile edit button clicked');
      // Update URL first
      window.history.pushState({ view: 'artist-edit-profile' }, '', '#edit-profile');
      await showProfileEditorView();
    });
    mobileEditBtn.dataset.listenerAttached = 'true';
  }
}

/**
 * Show profile editor view (exportable for routing)
 */
export async function showProfileEditorView() {
  const currentUserData = getStore('currentUserData');

  // Import dashboard modules
  const dashboardUI = await import('../dashboard/dashboard-ui.js');

  // Hide profile overview
  const mobileProfile = document.getElementById('mobile-artist-own-profile');
  const desktopProfile = document.getElementById('desktop-artist-own-profile');

  if (mobileProfile) mobileProfile.style.display = 'none';
  if (desktopProfile) desktopProfile.style.display = 'none';

  // Get/create editor container
  let editorContainer = document.getElementById('artist-profile-editor');
  if (!editorContainer) {
    const artistDashboard = document.getElementById('artist-dashboard');
    editorContainer = document.createElement('div');
    editorContainer.id = 'artist-profile-editor';
    artistDashboard.appendChild(editorContainer);
  }

  // Render editor
  dashboardUI.renderProfileEditor();

  // Show editor
  editorContainer.classList.remove('hidden');
  editorContainer.style.display = 'block';

  // Populate with current data
  if (currentUserData) {
    dashboardUI.populateProfileEditor(currentUserData);
  }

  // Setup form handlers
  setupEditorFormHandlers();

  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Setup form handlers for editor
 */
function setupEditorFormHandlers() {
  // Form submission
  const form = document.getElementById('artist-profile-form');
  if (form && !form.dataset.listenerAttached) {
    form.addEventListener('submit', async (e) => {
      await handleOwnProfileSubmit(e);
    });
    form.dataset.listenerAttached = 'true';
  }

  // Cancel button - navigate back to profile with correct URL
  const cancelBtn = document.getElementById('cancel-edit-profile-btn');
  if (cancelBtn && !cancelBtn.dataset.listenerAttached) {
    cancelBtn.addEventListener('click', async () => {
      // Update URL and show profile
      window.history.pushState({ view: 'artist-profile' }, '', '#profile');
      hideProfileEditor();
    });
    cancelBtn.dataset.listenerAttached = 'true';
  }

  // File input handlers
  setupProfilePicPreview();
  setupDocumentInput();

  // Setup media gallery
  import('./artist-media.js').then(module => {
    if (module.initArtistMediaGallery) {
      module.initArtistMediaGallery();
    }
  }).catch(err => {
    console.warn('[ARTIST OWN PROFILE] Media gallery module not loaded:', err);
  });
}

/**
 * Hide profile editor and show own profile view
 */
function hideProfileEditor() {
  console.log('[ARTIST OWN PROFILE] Hiding profile editor');

  const editorContainer = document.getElementById('artist-profile-editor');
  const mobileProfile = document.getElementById('mobile-artist-own-profile');
  const desktopProfile = document.getElementById('desktop-artist-own-profile');

  // Hide editor
  if (editorContainer) {
    editorContainer.classList.add('hidden');
    editorContainer.style.display = 'none';
  }

  // Show profile again
  if (mobileProfile) mobileProfile.style.display = 'block';
  if (desktopProfile) {
    desktopProfile.classList.remove('hidden');
    desktopProfile.style.display = 'grid';
  }

  // Refresh profile data
  const currentUserData = getStore('currentUserData');
  if (currentUserData) {
    renderArtistOwnProfile(currentUserData);
  }
}

/**
 * Handle profile form submission for own profile view
 */
async function handleOwnProfileSubmit(e) {
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

    // Import getCheckboxValues from dashboard-ui
    const { getCheckboxValues } = await import('../dashboard/dashboard-ui.js');

    // Collect checkbox values
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
    const profileData = {
      // Personal Details
      firstName: document.getElementById('artist-edit-firstname').value.trim(),
      lastName: document.getElementById('artist-edit-lastname').value.trim(),
      stageName: document.getElementById('artist-edit-stagename').value.trim(),
      phone: document.getElementById('artist-edit-phone').value.trim(),
      dob: document.getElementById('artist-edit-dob').value,
      gender: document.getElementById('artist-edit-gender').value,
      location: document.getElementById('artist-edit-location').value.trim(),

      // Professional Details
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
    if (!profileData.firstName || !profileData.lastName || !profileData.phone ||
      !profileData.dob || !profileData.gender || !profileData.location ||
      !profileData.bio || !profileData.pitch) {
      throw new Error("Please fill in all required fields (marked with *)");
    }

    // Get file inputs
    const profilePicInput = document.getElementById('artist-edit-profile-pic');
    const documentInput = document.getElementById('artist-edit-document');
    const profilePicFile = profilePicInput?.files[0];
    const documentFile = documentInput?.files[0];

    // Import updateArtistProfile
    const { updateArtistProfile } = await import('../dashboard/dashboard-service.js');

    // Update profile
    const updatedData = await updateArtistProfile(uid, profileData, profilePicFile, documentFile);

    // Update local store
    const currentUserData = getStore('currentUserData');
    const { setStore } = await import('../../utils/store.js');
    setStore('currentUserData', { ...currentUserData, ...updatedData });

    // Show success message
    successMsg.textContent = '✓ Profile updated successfully!';

    // Clear file inputs
    if (profilePicFile && profilePicInput) {
      profilePicInput.value = '';
    }
    if (documentFile && documentInput) {
      documentInput.value = '';
      const filenameSpan = document.getElementById('artist-document-filename');
      if (filenameSpan) filenameSpan.textContent = 'No file chosen';
    }

    // Wait a moment, then return to own profile view
    setTimeout(() => {
      hideProfileEditor();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);

  } catch (error) {
    console.error("[ARTIST OWN PROFILE] Error saving profile:", error);
    errorMsg.textContent = 'Error: ' + error.message;
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save All Changes';
  }
}

/**
 * Setup profile picture preview
 */
function setupProfilePicPreview() {
  const fileInput = document.getElementById('artist-edit-profile-pic');
  const previewImg = document.getElementById('artist-profile-pic-preview');

  if (!fileInput || !previewImg) return;

  // Remove existing listener if any
  const newFileInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);

  newFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        newFileInput.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        newFileInput.value = '';
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
 * Setup document input
 */
function setupDocumentInput() {
  const fileInput = document.getElementById('artist-edit-document');
  const filenameSpan = document.getElementById('artist-document-filename');

  if (!fileInput || !filenameSpan) return;

  // Remove existing listener if any
  const newFileInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);

  newFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        newFileInput.value = '';
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
        newFileInput.value = '';
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
 * Load recommendations for this artist (read-only)
 */
async function loadOwnRecommendations(artist) {
  const mobileContainer = document.getElementById('mobile-own-profile-recommendations');
  const desktopContainer = document.getElementById('desktop-own-profile-recommendations');

  if (!mobileContainer && !desktopContainer) return;

  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const currentUser = getStore('currentUser');
    if (!currentUser) {
      throw new Error('No current user');
    }

    const recsRef = collection(db, 'recommendations');
    const q = query(
      recsRef,
      where('artistId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const emptyHTML = '<p style="color: #9ca3af; font-size: 14px;">Nog geen recommendations.</p>';
      if (mobileContainer) mobileContainer.innerHTML = emptyHTML;
      if (desktopContainer) desktopContainer.innerHTML = emptyHTML;
      return;
    }

    let recsHTML = '';
    snapshot.forEach(doc => {
      const rec = doc.data();
      const date = rec.createdAt?.toDate?.() || new Date();
      const formattedDate = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

      recsHTML += `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
          <div style="margin-bottom: 8px;">
            <p style="font-size: 15px; font-weight: 600; color: #1a1a2e;">${rec.authorName || 'Anonymous'}</p>
            <p style="font-size: 13px; color: #9ca3af;">${formattedDate}</p>
          </div>
          <p style="font-size: 14px; color: #4a4a68; line-height: 1.6;">"${rec.text || rec.content || ''}"</p>
        </div>
      `;
    });

    if (mobileContainer) mobileContainer.innerHTML = recsHTML;
    if (desktopContainer) desktopContainer.innerHTML = recsHTML;

  } catch (error) {
    console.error('[RECOMMENDATIONS] Error loading:', error);
    const errorHTML = '<p style="color: #9ca3af; font-size: 14px;">Kon recommendations niet laden.</p>';
    if (mobileContainer) mobileContainer.innerHTML = errorHTML;
    if (desktopContainer) desktopContainer.innerHTML = errorHTML;
  }
}

/**
 * Handle responsive layout
 */
function handleResponsiveLayout() {
  const isDesktop = window.innerWidth >= 1024;
  const mobileLayout = document.getElementById('mobile-artist-own-profile');
  const desktopLayout = document.getElementById('desktop-artist-own-profile');

  if (mobileLayout) {
    mobileLayout.style.display = isDesktop ? 'none' : 'block';
  }

  if (desktopLayout) {
    desktopLayout.classList.remove('hidden');
    desktopLayout.style.display = isDesktop ? 'grid' : 'none';
  }
}

/**
 * dashboard-controller.js
 * Event handling and initialization for artist dashboard
 * Uses robust event delegation for dynamic content
 */

import { getStore, setStore } from '../../utils/store.js';
import { updateArtistProfile } from './dashboard-service.js';
import {
  renderArtistDashboard,
  renderProfileEditor,
  displayProfileOverview,
  populateProfileEditor,
  getCheckboxValues
} from './dashboard-ui.js';
import { loadRecommendations } from '../recommendations/recommendations.js';

/**
 * Setup artist dashboard
 * Main entry point called from ui.js
 */
export function setupArtistDashboard() {
  console.log("[DASHBOARD] Setting up artist dashboard...");

  // Render the dashboard HTML
  renderArtistDashboard();

  // Display profile overview
  const currentUserData = getStore('currentUserData');
  if (currentUserData) {
    displayProfileOverview(currentUserData);
  }

  // Setup event listeners with delegation
  setupEventListeners();

  // Load recommendations
  loadArtistRecommendations();

  console.log("[DASHBOARD] ✅ Artist dashboard setup complete");
}

/**
 * Setup all event listeners using delegation
 * Robust approach that works even when DOM is re-rendered
 */
function setupEventListeners() {
  const dashboard = document.getElementById('artist-dashboard');

  if (!dashboard) {
    console.warn("[DASHBOARD] Dashboard container not found");
    return;
  }

  // Check if listeners already attached
  if (dashboard.dataset.listenersAttached === 'true') {
    console.log("[DASHBOARD] Event listeners already attached, skipping");
    return;
  }

  // Event delegation on dashboard container
  dashboard.addEventListener('click', handleDashboardClick);

  // Mark as attached
  dashboard.dataset.listenersAttached = 'true';

  console.log("[DASHBOARD] Event listeners attached via delegation");
}

/**
 * Handle all clicks on dashboard using event delegation
 */
function handleDashboardClick(e) {
  // Edit Profile Button
  if (e.target.closest('#edit-artist-profile-btn')) {
    e.preventDefault();
    showProfileEditor();
    return;
  }

  // Cancel Edit Button
  if (e.target.closest('#cancel-edit-profile-btn')) {
    e.preventDefault();
    hideProfileEditor();
    return;
  }

  // Profile Picture Upload
  if (e.target.id === 'artist-edit-profile-pic') {
    setupProfilePicPreview();
    return;
  }

  // Document Upload
  if (e.target.id === 'artist-edit-document') {
    setupDocumentInput();
    return;
  }

  // Profile Form Submit (handled separately via form event)
  const form = e.target.closest('#artist-profile-form');
  if (form && e.target.type === 'submit') {
    // Let the form submit event handle this
    return;
  }
}

/**
 * Show profile editor
 */
function showProfileEditor() {
  console.log("[DASHBOARD] Showing profile editor");

  const editor = document.getElementById('artist-profile-editor');
  const overview = document.getElementById('artist-profile-overview');

  if (!editor || !overview) {
    console.warn("[DASHBOARD] Editor or overview not found");
    return;
  }

  // Render the editor HTML
  renderProfileEditor();

  // Show editor, hide overview
  editor.classList.remove('hidden');
  overview.classList.add('hidden');

  // Populate with current data
  const currentUserData = getStore('currentUserData');
  if (currentUserData) {
    populateProfileEditor(currentUserData);
  }

  // Setup form submission handler
  const form = document.getElementById('artist-profile-form');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }

  // Setup file input handlers
  setupProfilePicPreview();
  setupDocumentInput();

  // Re-initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Hide profile editor and show overview
 */
function hideProfileEditor() {
  console.log("[DASHBOARD] Hiding profile editor");

  const editor = document.getElementById('artist-profile-editor');
  const overview = document.getElementById('artist-profile-overview');

  if (!editor || !overview) {
    console.warn("[DASHBOARD] Editor or overview not found");
    return;
  }

  // Hide editor, show overview
  editor.classList.add('hidden');
  overview.classList.remove('hidden');

  // Refresh overview data
  const currentUserData = getStore('currentUserData');
  if (currentUserData) {
    displayProfileOverview(currentUserData);
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
 * Handle profile form submission
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

    // Update profile
    const updatedData = await updateArtistProfile(uid, profileData, profilePicFile, documentFile);

    // Update local store
    const currentUserData = getStore('currentUserData');
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

    // Wait a moment, then hide editor
    setTimeout(() => {
      hideProfileEditor();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);

  } catch (error) {
    console.error("[DASHBOARD] Error saving profile:", error);
    errorMsg.textContent = 'Error: ' + error.message;
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save All Changes';
  }
}

/**
 * Load artist's own recommendations
 */
function loadArtistRecommendations() {
  const currentUser = getStore('currentUser');

  if (!currentUser) {
    console.warn("[DASHBOARD] No user logged in, cannot load recommendations");
    return;
  }

  const recommendationsSection = document.getElementById('artist-recommendations-section');
  if (!recommendationsSection) {
    console.log("[DASHBOARD] Recommendations section not found, skipping");
    return;
  }

  // Show the recommendations section
  recommendationsSection.classList.remove('hidden');
  recommendationsSection.style.display = 'block';

  // Load recommendations
  loadRecommendations(currentUser.uid);
}

/**
 * Exported function to populate editor (called from ui.js for backwards compatibility)
 */
export function populateArtistEditor() {
  const currentUserData = getStore('currentUserData');
  if (currentUserData) {
    populateProfileEditor(currentUserData);
  }
}

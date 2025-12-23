/**
 * programmer-profile.js
 * Handles profile editing functionality for programmers
 */

import { getStore, setStore } from '../../utils/store.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../services/firebase.js';
import { setLanguage } from '../../utils/translations.js';
import { displayProgrammerProfileOverview, renderPublicPreview } from './programmer-dashboard.js';

/**
 * Renders the programmer profile editor HTML
 */
export function renderProgrammerProfileEditor() {
  const container = document.getElementById('programmer-profile-editor');

  if (!container) {
    console.warn("Programmer profile editor container not found");
    return;
  }

  container.innerHTML = `
    <div class="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <div>
          <h3 class="text-3xl font-bold text-gray-900 tracking-tight">Edit Your Profile</h3>
          <p class="text-sm text-gray-500 mt-2">Update your information below. Fields marked with * are required.</p>
        </div>
        <button id="cancel-edit-profile-btn" type="button" class="text-gray-600 hover:text-gray-900 font-semibold transition-colors px-4 py-2 rounded-xl hover:bg-gray-50">
          Cancel
        </button>
      </div>

      <form id="programmer-profile-form" class="space-y-10">
        <!-- Profile Picture (Apple Style) -->
        <div class="border-b border-gray-100 pb-8">
          <h5 class="text-xl font-bold text-gray-900 mb-6">Profile Picture</h5>
          <div class="flex items-center gap-8">
            <img id="programmer-profile-pic-preview"
                 src="https://placehold.co/100x100/e0e7ff/6366f1?text=P"
                 alt="Profile Preview"
                 class="w-28 h-28 rounded-3xl object-cover shadow-md border border-gray-100">
            <div class="flex flex-col gap-3">
              <label for="programmer-edit-profile-pic" class="cursor-pointer bg-gray-900 text-white py-3 px-6 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-all inline-block text-center shadow-sm hover:shadow">
                Upload New Photo
                <input id="programmer-edit-profile-pic" type="file" accept="image/*" class="sr-only">
              </label>
              <p class="text-xs text-gray-500 leading-relaxed">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>
        </div>

        <!-- Personal Details (Apple Style) -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Personal Details</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="programmer-edit-firstname" class="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
              <input id="programmer-edit-firstname" type="text" required
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="programmer-edit-lastname" class="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
              <input id="programmer-edit-lastname" type="text" required
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="programmer-edit-phone" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input id="programmer-edit-phone" type="tel"
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
          </div>
        </div>

        <!-- Organization Details (Apple Style) -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Organization Details</h5>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="programmer-edit-org-name" class="block text-sm font-semibold text-gray-700 mb-2">Organization Name *</label>
              <input id="programmer-edit-org-name" type="text" required
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="programmer-edit-website" class="block text-sm font-semibold text-gray-700 mb-2">Website</label>
              <input id="programmer-edit-website" type="url" placeholder="https://..."
                     class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
            </div>
            <div>
              <label for="programmer-edit-org-about" class="block text-sm font-semibold text-gray-700 mb-2">About Organization</label>
              <textarea id="programmer-edit-org-about" rows="4"
                        class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
            </div>
          </div>
        </div>

        <!-- Preferences (Apple Style) -->
        <div class="border-b border-gray-100 pb-6">
          <h5 class="text-lg font-bold text-gray-900 mb-4">Preferences</h5>
          <div>
            <label for="programmer-edit-language" class="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select id="programmer-edit-language"
                    class="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <!-- Submit Button (Apple Style) -->
        <div class="space-y-4 pt-4">
          <button type="submit"
                  class="w-full bg-indigo-600 text-white px-6 py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
            Save All Changes
          </button>
          <p id="programmer-profile-success" class="text-green-600 text-sm text-center"></p>
          <p id="programmer-profile-error" class="text-red-600 text-sm text-center"></p>
        </div>
      </form>
    </div>
  `;

  console.log("Programmer profile editor HTML rendered");
}

/**
 * Sets up the programmer profile editor
 */
export function setupProgrammerProfile() {
  const editBtn = document.getElementById('edit-programmer-profile-btn');
  const editor = document.getElementById('programmer-profile-editor');

  if (!editBtn || !editor) {
    console.warn("Programmer profile elements not found");
    return;
  }

  // Render the profile editor HTML first
  renderProgrammerProfileEditor();

  // Now get the form element after rendering
  const form = document.getElementById('programmer-profile-form');

  if (!form) {
    console.warn("Programmer profile form not found after rendering");
    return;
  }

  // Toggle editor visibility
  editBtn.addEventListener('click', () => {
    const isHidden = editor.style.display === 'none' || editor.style.display === '';
    editor.style.display = isHidden ? 'block' : 'none';

    // Populate form when opening
    if (isHidden) {
      populateProgrammerEditor();
    }
  });

  // Setup profile picture preview
  setupProfilePicPreview();

  // Handle form submission
  form.addEventListener('submit', handleProgrammerProfileSubmit);

  console.log("Programmer profile editor setup complete");
}

/**
 * Setup profile form handlers (called after rendering HTML)
 * Exported for use in ui.js when showing settings view
 */
export function setupProfileFormHandlers() {
  const form = document.getElementById('programmer-profile-form');
  const editor = document.getElementById('programmer-profile-editor');
  const cancelBtn = document.getElementById('cancel-edit-profile-btn');

  if (!form || !editor) {
    console.warn("Programmer profile form or editor not found for handler setup");
    return;
  }

  // Remove any existing listeners by cloning the form
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  // Setup cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      console.log("[PROFILE] Cancel button clicked - hiding editor");
      editor.classList.add('hidden');
      editor.style.display = 'none';

      // Refresh the profile overview
      displayProgrammerProfileOverview();
    });
  }

  // Setup profile picture preview
  setupProfilePicPreview();

  // Handle form submission
  newForm.addEventListener('submit', handleProgrammerProfileSubmit);

  console.log("Programmer profile form handlers attached");
}

/**
 * Setup profile picture preview on file selection
 */
function setupProfilePicPreview() {
  const fileInput = document.getElementById('programmer-edit-profile-pic');
  const previewImg = document.getElementById('programmer-profile-pic-preview');

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
 * Populates the editor with current user data
 */
export function populateProgrammerEditor() {
  const currentUserData = getStore('currentUserData');
  
  if (!currentUserData) {
    console.warn("No programmer data found to populate editor");
    return;
  }
  
  console.log("Populating programmer editor with:", currentUserData);
  
  // Populate form fields
  document.getElementById('programmer-edit-firstname').value = currentUserData.firstName || '';
  document.getElementById('programmer-edit-lastname').value = currentUserData.lastName || '';
  document.getElementById('programmer-edit-phone').value = currentUserData.phone || '';
  document.getElementById('programmer-edit-org-name').value = currentUserData.organizationName || '';
  document.getElementById('programmer-edit-org-about').value = currentUserData.organizationAbout || '';
  document.getElementById('programmer-edit-website').value = currentUserData.website || '';
  document.getElementById('programmer-edit-language').value = currentUserData.language || 'nl';

  // Show current profile picture
  const previewImg = document.getElementById('programmer-profile-pic-preview');
  if (currentUserData.profilePicUrl) {
    previewImg.src = currentUserData.profilePicUrl;
  } else {
    previewImg.src = "https://placehold.co/100x100/e0e7ff/6366f1?text=" + 
                     encodeURIComponent(currentUserData.firstName?.charAt(0) || 'P');
  }
}

/**
 * Handles form submission to save profile changes
 */
async function handleProgrammerProfileSubmit(e) {
  e.preventDefault();
  
  const successMsg = document.getElementById('programmer-profile-success');
  const errorMsg = document.getElementById('programmer-profile-error');
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
    const docRef = doc(db, 'programmers', uid);
    
    // Collect form data
    const dataToUpdate = {
      firstName: document.getElementById('programmer-edit-firstname').value.trim(),
      lastName: document.getElementById('programmer-edit-lastname').value.trim(),
      phone: document.getElementById('programmer-edit-phone').value.trim(),
      organizationName: document.getElementById('programmer-edit-org-name').value.trim(),
      organizationAbout: document.getElementById('programmer-edit-org-about').value.trim(),
      website: document.getElementById('programmer-edit-website').value.trim(),
      language: document.getElementById('programmer-edit-language').value
    };
    
    // Validate required fields
    if (!dataToUpdate.firstName || !dataToUpdate.lastName || !dataToUpdate.organizationName) {
      throw new Error("Please fill in all required fields (marked with *)");
    }
    
    // Handle profile picture upload
    const fileInput = document.getElementById('programmer-edit-profile-pic');
    const file = fileInput.files[0];
    
    if (file) {
      console.log("Uploading profile picture...");
      const storage = getStorage();
      const storageRef = ref(storage, `programmers/${uid}/profile.jpg`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Profile picture uploaded:", downloadURL);
      
      // Add URL to data
      dataToUpdate.profilePicUrl = downloadURL;
      
      // Update preview
      document.getElementById('programmer-profile-pic-preview').src = downloadURL;
    }
    
    // Update Firestore
    await updateDoc(docRef, dataToUpdate);
    console.log("Profile updated successfully");
    
    // Update local store
    const currentUserData = getStore('currentUserData');
    setStore('currentUserData', { ...currentUserData, ...dataToUpdate });

    // Apply language change immediately
    setLanguage(dataToUpdate.language);

    // Refresh the profile overview display
    displayProgrammerProfileOverview();

    // Refresh the public preview
    renderPublicPreview();

    // Show success message
    successMsg.textContent = '✓ Profile updated successfully!';
    
    // Clear file input
    if (file) {
      fileInput.value = '';
    }
    
  } catch (error) {
    console.error("Error saving profile:", error);
    errorMsg.textContent = 'Error: ' + error.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Profile Changes';
  }
}
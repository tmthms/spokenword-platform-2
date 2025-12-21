/**
 * programmer-profile.js
 * Handles profile editing functionality for programmers
 */

import { getStore, setStore } from './store.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from './firebase.js';
import { setLanguage } from './translations.js';
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
    <h3 class="text-2xl font-semibold mb-6">Edit Your Profile</h3>
    <form id="programmer-profile-form" class="space-y-6">
      <!-- Profile Picture -->
      <div class="border-b border-gray-200 pb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
        <div class="flex items-center space-x-4">
          <img id="programmer-profile-pic-preview"
               src="https://placehold.co/100x100/e0e7ff/6366f1?text=P"
               alt="Profile Preview"
               class="h-24 w-24 rounded-full object-cover border-2 border-gray-200">
          <div>
            <input id="programmer-edit-profile-pic"
                   type="file"
                   accept="image/*"
                   class="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
            <p class="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, GIF accepted.</p>
          </div>
        </div>
      </div>

      <!-- Personal Details -->
      <div class="border-b border-gray-200 pb-6">
        <h4 class="text-lg font-semibold mb-4">Personal Details</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="programmer-edit-firstname" class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input id="programmer-edit-firstname"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label for="programmer-edit-lastname" class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input id="programmer-edit-lastname"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label for="programmer-edit-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input id="programmer-edit-phone"
                   type="tel"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
          </div>
        </div>
      </div>

      <!-- Organization Details -->
      <div class="border-b border-gray-200 pb-6">
        <h4 class="text-lg font-semibold mb-4">Organization Details</h4>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label for="programmer-edit-org-name" class="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
            <input id="programmer-edit-org-name"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label for="programmer-edit-website" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input id="programmer-edit-website"
                   type="url"
                   placeholder="https://..."
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label for="programmer-edit-org-about" class="block text-sm font-medium text-gray-700 mb-1">About Organization</label>
            <textarea id="programmer-edit-org-about"
                      rows="4"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="border-b border-gray-200 pb-6">
        <h4 class="text-lg font-semibold mb-4">Preferences</h4>
        <div>
          <label for="programmer-edit-language" class="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select id="programmer-edit-language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option value="nl">Nederlands</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p id="programmer-profile-success" class="text-green-600 text-sm"></p>
          <p id="programmer-profile-error" class="text-red-500 text-sm"></p>
        </div>
        <button type="submit"
                class="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700">
          Save Profile Changes
        </button>
      </div>
    </form>
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

  if (!form) {
    console.warn("Programmer profile form not found for handler setup");
    return;
  }

  // Remove any existing listeners by cloning the form
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

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
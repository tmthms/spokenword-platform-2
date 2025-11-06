/**
 * programmer-profile.js
 * Handles profile editing functionality for programmers
 */

import { getStore, setStore } from './store.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from './firebase.js';
import { setLanguage } from './translations.js';

/**
 * Sets up the programmer profile editor
 */
export function setupProgrammerProfile() {
  const editBtn = document.getElementById('edit-programmer-profile-btn');
  const editor = document.getElementById('programmer-profile-editor');
  const form = document.getElementById('programmer-profile-form');
  
  if (!editBtn || !editor || !form) {
    console.warn("Programmer profile elements not found");
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
// IMPROVED artist-dashboard.js

import { getStore, setStore } from './store.js';
import { db } from './firebase.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { getCheckboxValues, setCheckboxValues } from './checkbox-helpers.js';
import { loadRecommendations } from './recommendations.js';

/**
 * Sets up the artist dashboard
 */
export function setupArtistDashboard() {
  const editBtn = document.getElementById('edit-artist-profile-btn');
  const editor = document.getElementById('artist-profile-editor');
  const overview = document.getElementById('artist-profile-overview');
  
  if (!editBtn || !editor || !overview) {
    console.warn("Artist dashboard elements not found");
    return;
  }
  
  // Load and display profile overview
  displayArtistProfileOverview();
  
  // Setup edit button toggle
  setupEditProfileButton();
  
  // Setup profile picture preview
  setupProfilePicPreview();
  
  // Setup document file input
  setupDocumentInput();
  
  // Handle form submission
  const form = document.getElementById('artist-profile-form');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }
    // Load artist's recommendations
  loadArtistRecommendations();
  console.log("Artist dashboard setup complete");
}

/**
 * Displays the artist profile overview
 */
function displayArtistProfileOverview() {
  const currentUserData = getStore('currentUserData');
  
  if (!currentUserData) {
    console.warn("No artist data found for overview");
    return;
  }
  
  // Profile Picture
  const overviewPic = document.getElementById('artist-overview-pic');
  if (overviewPic) {
    overviewPic.src = currentUserData.profilePicUrl || 
                      `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.stageName || currentUserData.firstName || 'A').charAt(0))}`;
  }
  
  // Name & Stage Name
  document.getElementById('artist-overview-name').textContent = 
    `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Artist Name';
  document.getElementById('artist-overview-stagename').textContent = 
    currentUserData.stageName || 'No stage name';
  
  // Basic Info
  document.getElementById('artist-overview-location').textContent = currentUserData.location || 'Not specified';
  document.getElementById('artist-overview-phone').textContent = currentUserData.phone || 'Not specified';
  
  // Gender
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  document.getElementById('artist-overview-gender').textContent = genderMap[currentUserData.gender] || 'Not specified';
  
  // Age
  if (currentUserData.dob) {
    const age = calculateAge(currentUserData.dob);
    document.getElementById('artist-overview-age').textContent = `${age} years old`;
  } else {
    document.getElementById('artist-overview-age').textContent = 'Not specified';
  }
  
  // Genres
  const genresContainer = document.getElementById('artist-overview-genres');
  genresContainer.innerHTML = '';
  if (currentUserData.genres && currentUserData.genres.length > 0) {
    currentUserData.genres.forEach(genre => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = genre;
      genresContainer.appendChild(badge);
    });
  } else {
    genresContainer.textContent = 'No genres specified';
  }
  
  // Languages
  const languagesContainer = document.getElementById('artist-overview-languages');
  languagesContainer.innerHTML = '';
  if (currentUserData.languages && currentUserData.languages.length > 0) {
    currentUserData.languages.forEach(lang => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = lang.toUpperCase();
      languagesContainer.appendChild(badge);
    });
  } else {
    languagesContainer.textContent = 'No languages specified';
  }
  
  // Payment Methods
  const paymentContainer = document.getElementById('artist-overview-payment');
  paymentContainer.innerHTML = '';
  if (currentUserData.paymentMethods && currentUserData.paymentMethods.length > 0) {
    currentUserData.paymentMethods.forEach(method => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = method;
      paymentContainer.appendChild(badge);
    });
  } else {
    paymentContainer.textContent = 'No payment methods specified';
  }
  
  // Bio & Pitch
  document.getElementById('artist-overview-bio').textContent = currentUserData.bio || 'No bio available';
  document.getElementById('artist-overview-pitch').textContent = currentUserData.pitch || 'No pitch available';
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Setup edit profile button with toggle
 */
function setupEditProfileButton() {
  const editBtn = document.getElementById('edit-artist-profile-btn');
  const editor = document.getElementById('artist-profile-editor');
  const overview = document.getElementById('artist-profile-overview');
  
  if (!editBtn || !editor || !overview) return;
  
  // Remove old listeners by cloning
  const newBtn = editBtn.cloneNode(true);
  editBtn.parentNode.replaceChild(newBtn, editBtn);
  
  // Add new listener
  newBtn.addEventListener('click', () => {
    const isHidden = editor.classList.contains('hidden');
    
    if (isHidden) {
      // Show editor, hide overview
      editor.classList.remove('hidden');
      overview.classList.add('hidden');
      populateArtistEditor();
    } else {
      // Hide editor, show overview
      editor.classList.add('hidden');
      overview.classList.remove('hidden');
      displayArtistProfileOverview();
    }
  });
}

/**
 * Setup profile picture preview on file selection
 */
function setupProfilePicPreview() {
  const fileInput = document.getElementById('artist-edit-profile-pic');
  const previewImg = document.getElementById('artist-profile-pic-preview');
  
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
 * Setup document input to show filename
 */
function setupDocumentInput() {
  const fileInput = document.getElementById('artist-edit-document');
  const filenameSpan = document.getElementById('artist-document-filename');
  
  if (!fileInput || !filenameSpan) return;
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        fileInput.value = '';
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
        fileInput.value = '';
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
 * Populates the editor with current user data
 */
export function populateArtistEditor() {
  const currentUserData = getStore('currentUserData');
  
  if (!currentUserData) {
    console.warn("No artist data found to populate editor");
    return;
  }
  
  console.log("Populating artist editor with:", currentUserData);
  
  // Personal Details
  document.getElementById('artist-edit-firstname').value = currentUserData.firstName || '';
  document.getElementById('artist-edit-lastname').value = currentUserData.lastName || '';
  document.getElementById('artist-edit-stagename').value = currentUserData.stageName || '';
  document.getElementById('artist-edit-phone').value = currentUserData.phone || '';
  document.getElementById('artist-edit-dob').value = currentUserData.dob || '';
  document.getElementById('artist-edit-gender').value = currentUserData.gender || '';
  document.getElementById('artist-edit-location').value = currentUserData.location || '';
  
  // Professional Details (checkboxes instead of multi-select)
  setCheckboxValues('artist-edit-genres', currentUserData.genres || []);
  setCheckboxValues('artist-edit-languages', currentUserData.languages || []);
  setCheckboxValues('artist-edit-payment', currentUserData.paymentMethods || []);
  
  // Bio & Pitch
  document.getElementById('artist-edit-bio').value = currentUserData.bio || '';
  document.getElementById('artist-edit-pitch').value = currentUserData.pitch || '';
  
  // Media
  document.getElementById('artist-edit-video').value = currentUserData.videoUrl || '';
  document.getElementById('artist-edit-audio').value = currentUserData.audioUrl || '';
  document.getElementById('artist-edit-text').value = currentUserData.textContent || '';
  
  // Notification Settings
  document.getElementById('artist-edit-notify-email').checked = currentUserData.notifyEmail !== false;
  document.getElementById('artist-edit-notify-sms').checked = currentUserData.notifySms || false;
  
  // Profile Picture
  const previewImg = document.getElementById('artist-profile-pic-preview');
  if (currentUserData.profilePicUrl) {
    previewImg.src = currentUserData.profilePicUrl;
  } else {
    previewImg.src = `https://placehold.co/100x100/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.stageName || currentUserData.firstName || 'A').charAt(0))}`;
  }
  
  // Document
  const currentDocDiv = document.getElementById('artist-current-document');
  const currentDocLink = document.getElementById('artist-current-document-link');
  if (currentUserData.documentUrl) {
    currentDocDiv.classList.remove('hidden');
    currentDocLink.href = currentUserData.documentUrl;
  } else {
    currentDocDiv.classList.add('hidden');
  }
}

/**
 * Handles form submission to save profile changes
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
    const docRef = doc(db, 'artists', uid);
    
    // Collect checkbox values using helper function
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
    const dataToUpdate = {
      // Personal Details
      firstName: document.getElementById('artist-edit-firstname').value.trim(),
      lastName: document.getElementById('artist-edit-lastname').value.trim(),
      stageName: document.getElementById('artist-edit-stagename').value.trim(),
      phone: document.getElementById('artist-edit-phone').value.trim(),
      dob: document.getElementById('artist-edit-dob').value,
      gender: document.getElementById('artist-edit-gender').value,
      location: document.getElementById('artist-edit-location').value.trim(),
      
      // Professional Details (from checkboxes)
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
    if (!dataToUpdate.firstName || !dataToUpdate.lastName || !dataToUpdate.phone || 
        !dataToUpdate.dob || !dataToUpdate.gender || !dataToUpdate.location ||
        !dataToUpdate.bio || !dataToUpdate.pitch) {
      throw new Error("Please fill in all required fields (marked with *)");
    }
    
    const storage = getStorage();
    
    // Handle profile picture upload
    const profilePicInput = document.getElementById('artist-edit-profile-pic');
    const profilePicFile = profilePicInput.files[0];
    
    if (profilePicFile) {
      console.log("Uploading profile picture...");
      const storageRef = ref(storage, `artists/${uid}/profile.jpg`);
      const snapshot = await uploadBytes(storageRef, profilePicFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Profile picture uploaded:", downloadURL);
      dataToUpdate.profilePicUrl = downloadURL;
      document.getElementById('artist-profile-pic-preview').src = downloadURL;
    }
    
    // Handle document upload
    const documentInput = document.getElementById('artist-edit-document');
    const documentFile = documentInput.files[0];
    
    if (documentFile) {
      console.log("Uploading document...");
      const fileExtension = documentFile.name.split('.').pop();
      const storageRef = ref(storage, `artists/${uid}/document.${fileExtension}`);
      const snapshot = await uploadBytes(storageRef, documentFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Document uploaded:", downloadURL);
      dataToUpdate.documentUrl = downloadURL;
      dataToUpdate.documentName = documentFile.name;
    }
    
    // Update Firestore
    await updateDoc(docRef, dataToUpdate);
    console.log("Profile updated successfully");
    
    // Update local store
    const currentUserData = getStore('currentUserData');
    setStore('currentUserData', { ...currentUserData, ...dataToUpdate });
    
    // Show success message
    successMsg.textContent = '✓ Profile updated successfully!';
    
    // Clear file inputs
    if (profilePicFile) {
      profilePicInput.value = '';
    }
    if (documentFile) {
      documentInput.value = '';
      document.getElementById('artist-document-filename').textContent = 'No file chosen';
    }
    
    // Update overview and switch back to it
    displayArtistProfileOverview();
    document.getElementById('artist-profile-editor').classList.add('hidden');
    document.getElementById('artist-profile-overview').classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error saving profile:", error);
    errorMsg.textContent = 'Error: ' + error.message;
    errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save All Changes';
  }
}
/**
 * Load artist's own recommendations on their dashboard
 */
export function loadArtistRecommendations() {
  const currentUser = getStore('currentUser');
  
  if (!currentUser) {
    console.warn("No user logged in, cannot load recommendations");
    return;
  }
  
  // Check if recommendations section exists in HTML before loading
  const recommendationsSection = document.getElementById('recommendations-list');
  if (!recommendationsSection) {
    console.log("Recommendations section not found in HTML, skipping load");
    return;
  }
  
  loadRecommendations(currentUser.uid);
}
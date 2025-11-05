/**
 * artist-signup-helpers.js
 * Helper functies voor artist signup met checkbox support
 */

import { getCheckboxValues, validateCheckboxGroup } from './checkbox-helpers.js';

/**
 * Haalt alle artist signup form data op (met checkbox support)
 * @returns {Object} Form data object
 */
export function getArtistSignupData() {
  // Get checkbox values
  const genres = getCheckboxValues('artist-genres');
  const languages = getCheckboxValues('artist-languages');
  const paymentMethods = getCheckboxValues('artist-payment');
  
  return {
    // Account
    email: document.getElementById('artist-email').value.trim(),
    password: document.getElementById('artist-password').value,
    
    // Personal Details
    firstName: document.getElementById('artist-firstname').value.trim(),
    lastName: document.getElementById('artist-lastname').value.trim(),
    stageName: document.getElementById('artist-stagename').value.trim(),
    phone: document.getElementById('artist-phone').value.trim(),
    dob: document.getElementById('artist-dob').value,
    gender: document.getElementById('artist-gender').value,
    location: document.getElementById('artist-location').value.trim(),
    
    // Professional Details (from checkboxes)
    genres: genres,
    languages: languages,
    paymentMethods: paymentMethods,
    bio: document.getElementById('artist-bio').value.trim(),
    pitch: document.getElementById('artist-pitch').value.trim(),
    
    // Notification Settings
    notifyEmail: document.getElementById('artist-notify-email').checked,
    notifySms: document.getElementById('artist-notify-sms').checked,
    
    // Terms
    termsAccepted: document.getElementById('artist-terms').checked
  };
}

/**
 * Valideert artist signup form data
 * @param {Object} data - Form data van getArtistSignupData()
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateArtistSignupData(data) {
  // Check required text fields
  if (!data.email || !data.password || !data.firstName || !data.lastName || 
      !data.phone || !data.dob || !data.gender || !data.location || 
      !data.bio || !data.pitch) {
    return { valid: false, error: "Please fill in all required fields (marked with *)" };
  }
  
  // Check password length
  if (data.password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters long" };
  }
  
  // Check checkbox groups
  if (data.genres.length === 0) {
    return { valid: false, error: "Please select at least one genre" };
  }
  
  if (data.languages.length === 0) {
    return { valid: false, error: "Please select at least one language" };
  }
  
  if (data.paymentMethods.length === 0) {
    return { valid: false, error: "Please select at least one payment method" };
  }
  
  // Check terms
  if (!data.termsAccepted) {
    return { valid: false, error: "You must accept the Terms & Conditions" };
  }
  
  return { valid: true, error: null };
}
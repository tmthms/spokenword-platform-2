/**
 * user-settings.js
 * Handles user account settings: language, email, and password changes
 */

import { auth, db } from '../../services/firebase.js';
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { getStore } from '../../utils/store.js';
import { getCurrentLanguage, setLanguage, t, applyTranslations } from '../../utils/translations.js';

/**
 * Setup user settings functionality
 */
export function setupUserSettings() {
  const modal = document.getElementById('user-settings-modal');
  const closeBtn = document.getElementById('close-settings-modal');
  const userEmail = document.getElementById('user-email');
  const languageSelect = document.getElementById('settings-language-select');
  const updateEmailBtn = document.getElementById('settings-update-email-btn');
  const updatePasswordBtn = document.getElementById('settings-update-password-btn');

  if (!modal || !closeBtn || !userEmail) {
    console.warn("User settings elements not found");
    return;
  }

  // Make user email clickable
  userEmail.style.cursor = 'pointer';
  userEmail.classList.add('hover:text-indigo-600', 'hover:underline');

  userEmail.addEventListener('click', () => {
    openSettingsModal();
  });

  // Close modal handlers
  closeBtn.addEventListener('click', closeSettingsModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeSettingsModal();
    }
  });

  // Language change handler
  if (languageSelect) {
    languageSelect.addEventListener('change', handleLanguageChange);
  }

  // Email update handler
  if (updateEmailBtn) {
    updateEmailBtn.addEventListener('click', handleEmailUpdate);
  }

  // Password update handler
  if (updatePasswordBtn) {
    updatePasswordBtn.addEventListener('click', handlePasswordUpdate);
  }

  console.log("User settings setup complete");
}

/**
 * Open settings modal
 */
function openSettingsModal() {
  const modal = document.getElementById('user-settings-modal');
  const languageSelect = document.getElementById('settings-language-select');

  if (!modal) return;

  // Set current language in dropdown
  if (languageSelect) {
    languageSelect.value = getCurrentLanguage();
  }

  // Clear all fields
  clearAllFields();

  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

/**
 * Close settings modal
 */
function closeSettingsModal() {
  const modal = document.getElementById('user-settings-modal');

  if (!modal) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');

  // Clear all fields
  clearAllFields();
}

/**
 * Clear all input fields and messages
 */
function clearAllFields() {
  // Clear email change fields
  document.getElementById('settings-current-password-email').value = '';
  document.getElementById('settings-new-email').value = '';
  document.getElementById('settings-email-error').classList.add('hidden');
  document.getElementById('settings-email-success').classList.add('hidden');

  // Clear password change fields
  document.getElementById('settings-current-password-pw').value = '';
  document.getElementById('settings-new-password').value = '';
  document.getElementById('settings-confirm-password').value = '';
  document.getElementById('settings-password-error').classList.add('hidden');
  document.getElementById('settings-password-success').classList.add('hidden');
}

/**
 * Handle language change
 */
async function handleLanguageChange(e) {
  const newLanguage = e.target.value;

  // Update UI immediately
  setLanguage(newLanguage);

  console.log(`Language changed to: ${newLanguage}`);

  // Save language preference to database
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user logged in, language preference not saved to database');
      return;
    }

    // Update language in Firestore users collection
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      language: newLanguage
    });

    // Update language in role-specific collection (artists or programmers)
    const currentUserData = getStore('currentUserData');
    if (currentUserData && currentUserData.role) {
      const roleCollection = currentUserData.role === 'artist' ? 'artists' : 'programmers';
      const roleDocRef = doc(db, roleCollection, user.uid);
      await updateDoc(roleDocRef, {
        language: newLanguage
      });
    }

    console.log('Language preference saved to database');
  } catch (error) {
    console.error('Error saving language preference:', error);
    // Don't show error to user as the UI already changed
  }
}

/**
 * Handle email update
 */
async function handleEmailUpdate() {
  const currentPasswordInput = document.getElementById('settings-current-password-email');
  const newEmailInput = document.getElementById('settings-new-email');
  const errorMsg = document.getElementById('settings-email-error');
  const successMsg = document.getElementById('settings-email-success');
  const updateBtn = document.getElementById('settings-update-email-btn');

  // Reset messages
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  errorMsg.textContent = '';
  successMsg.textContent = '';

  const currentPassword = currentPasswordInput.value.trim();
  const newEmail = newEmailInput.value.trim();

  // Validation
  if (!currentPassword) {
    errorMsg.textContent = t('settings_reauth_required');
    errorMsg.classList.remove('hidden');
    return;
  }

  if (!newEmail) {
    errorMsg.textContent = t('settings_invalid_email');
    errorMsg.classList.remove('hidden');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    errorMsg.textContent = t('settings_invalid_email');
    errorMsg.classList.remove('hidden');
    return;
  }

  // Disable button during update
  updateBtn.disabled = true;
  updateBtn.textContent = t('loading');

  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user logged in');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update email in Firebase Auth
    await updateEmail(user, newEmail);

    // Update email in Firestore users collection
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      email: newEmail
    });

    // Update email in role-specific collection (artists or programmers)
    const currentUserData = getStore('currentUserData');
    if (currentUserData && currentUserData.role) {
      const roleCollection = currentUserData.role === 'artist' ? 'artists' : 'programmers';
      const roleDocRef = doc(db, roleCollection, user.uid);
      await updateDoc(roleDocRef, {
        email: newEmail
      });
    }

    // Show success message
    successMsg.textContent = t('settings_email_updated');
    successMsg.classList.remove('hidden');

    // Update displayed email in UI
    const userEmailSpan = document.getElementById('user-email');
    if (userEmailSpan) {
      userEmailSpan.textContent = newEmail;
    }

    // Clear fields
    currentPasswordInput.value = '';
    newEmailInput.value = '';

    console.log('Email updated successfully');

  } catch (error) {
    console.error('Error updating email:', error);

    let errorMessage = error.message;

    // Handle specific Firebase errors
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email address is already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = t('settings_invalid_email');
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Please log out and log back in before changing your email';
    }

    errorMsg.textContent = errorMessage;
    errorMsg.classList.remove('hidden');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = t('settings_update_email');
  }
}

/**
 * Handle password update
 */
async function handlePasswordUpdate() {
  const currentPasswordInput = document.getElementById('settings-current-password-pw');
  const newPasswordInput = document.getElementById('settings-new-password');
  const confirmPasswordInput = document.getElementById('settings-confirm-password');
  const errorMsg = document.getElementById('settings-password-error');
  const successMsg = document.getElementById('settings-password-success');
  const updateBtn = document.getElementById('settings-update-password-btn');

  // Reset messages
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  errorMsg.textContent = '';
  successMsg.textContent = '';

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Validation
  if (!currentPassword) {
    errorMsg.textContent = t('settings_reauth_required');
    errorMsg.classList.remove('hidden');
    return;
  }

  if (!newPassword) {
    errorMsg.textContent = t('settings_password_too_short');
    errorMsg.classList.remove('hidden');
    return;
  }

  if (newPassword.length < 6) {
    errorMsg.textContent = t('settings_password_too_short');
    errorMsg.classList.remove('hidden');
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMsg.textContent = t('settings_password_mismatch');
    errorMsg.classList.remove('hidden');
    return;
  }

  // Disable button during update
  updateBtn.disabled = true;
  updateBtn.textContent = t('loading');

  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user logged in');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password in Firebase Auth
    await updatePassword(user, newPassword);

    // Show success message
    successMsg.textContent = t('settings_password_updated');
    successMsg.classList.remove('hidden');

    // Clear fields
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';

    console.log('Password updated successfully');

  } catch (error) {
    console.error('Error updating password:', error);

    let errorMessage = error.message;

    // Handle specific Firebase errors
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect current password';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = t('settings_password_too_short');
    } else if (error.code === 'auth/requires-recent-login') {
      errorMessage = 'Please log out and log back in before changing your password';
    }

    errorMsg.textContent = errorMessage;
    errorMsg.classList.remove('hidden');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = t('settings_update_password');
  }
}

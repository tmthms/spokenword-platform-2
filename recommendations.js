// recommendations.js - VOLLEDIGE GEÜPDATETE VERSIE

/**
 * recommendations.js
 * Handles recommendation functionality for programmers to recommend artists
 */

import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from './firebase.js';
import { getStore } from './store.js';
import { t } from './translations.js';

/**
 * Setup recommendation modal and form
 */
export function setupRecommendations() {
  const modal = document.getElementById('recommendation-modal');
  const closeBtn = document.getElementById('close-recommendation-modal');
  const cancelBtn = document.getElementById('cancel-recommendation-btn');
  const form = document.getElementById('recommendation-form');

  if (!modal || !closeBtn || !form) {
    console.warn("Recommendation elements not found");
    return;
  }

  // Close modal
  closeBtn.addEventListener('click', closeRecommendationModal);

  // Cancel button also closes modal
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeRecommendationModal);
  }

  // Handle form submission
  form.addEventListener('submit', handleRecommendationSubmit);

  console.log("Recommendations setup complete");
}

/**
 * Open recommendation modal for a specific artist
 * @param {string} artistId - The artist's user ID
 * @param {object} artistData - The artist's profile data
 */
export function openRecommendationModal(artistId, artistData) {
  const currentUserData = getStore('currentUserData');

  // Security check: only programmers can write recommendations
  if (!currentUserData || currentUserData.role !== 'programmer') {
    alert(t('error_only_programmers_recommend'));
    return;
  }

  const modal = document.getElementById('recommendation-modal');
  const artistNameSpan = document.getElementById('recommendation-artist-name');
  const form = document.getElementById('recommendation-form');

  if (!modal || !artistNameSpan || !form) return;

  // Set artist name in modal
  artistNameSpan.textContent = artistData.stageName || `${artistData.firstName} ${artistData.lastName}`;

  // Store artist data in modal for later use
  form.dataset.artistId = artistId;
  form.dataset.artistName = artistData.stageName || `${artistData.firstName} ${artistData.lastName}`;

  // Reset form
  form.reset();
  document.getElementById('recommendation-error').style.display = 'none';
  document.getElementById('recommendation-success').style.display = 'none';

  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

/**
 * Close recommendation modal
 */
function closeRecommendationModal() {
  const modal = document.getElementById('recommendation-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * Handle recommendation form submission
 */
async function handleRecommendationSubmit(e) {
  e.preventDefault();

  const errorMsg = document.getElementById('recommendation-error');
  const successMsg = document.getElementById('recommendation-success');
  const submitBtn = e.submitter || e.target.querySelector('button[type="submit"]');

  // Reset messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = t('submitting') || 'Submitting...';

  try {
    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');

    if (!currentUser || !currentUserData) {
      throw new Error(t('error_must_be_logged_in'));
    }

    if (currentUserData.role !== 'programmer') {
      throw new Error(t('error_only_programmers_recommend'));
    }

    const artistId = e.target.dataset.artistId;
    const artistName = e.target.dataset.artistName;
    const text = document.getElementById('recommendation-text').value.trim();

    if (!text) {
      throw new Error(t('error_recommendation_required'));
    }

    if (text.length < 10) {
      throw new Error(t('error_recommendation_too_short'));
    }

    // Create recommendation document
    const recommendationData = {
      artistId: artistId,
      artistName: artistName,
      programmerId: currentUser.uid,
      programmerName: `${currentUserData.firstName} ${currentUserData.lastName}`,
      programmerOrganization: currentUserData.organizationName || '',
      text: text,
      createdAt: serverTimestamp(),
      isApproved: true // Auto-approve for now
    };

    // Add to Firestore
    await addDoc(collection(db, 'recommendations'), recommendationData);

    console.log("Recommendation submitted successfully");

    // Show success message
    successMsg.textContent = t('recommendation_success');
    successMsg.style.display = 'block';

    // Clear form
    e.target.reset();

    // Close modal after 2 seconds
    setTimeout(() => {
      closeRecommendationModal();
      // Reload recommendations if on artist detail page
      const currentArtistId = document.getElementById('artist-detail-view')?.dataset?.artistId;
      if (currentArtistId === artistId) {
        loadRecommendations(artistId);
      }
    }, 2000);

  } catch (error) {
    console.error("Error submitting recommendation:", error);
    errorMsg.textContent = error.message;
    errorMsg.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = t('submit_recommendation') || 'Submit Recommendation';
  }
}

/**
 * Load recommendations for a specific artist
 * @param {string} artistId - The artist's user ID
 */
export async function loadRecommendations(artistId) {
  const container = document.getElementById('recommendations-list');
  const loadingEl = document.getElementById('recommendations-loading');
  const emptyEl = document.getElementById('recommendations-empty');
  const errorEl = document.getElementById('recommendations-error');

  if (!container) {
    console.warn("Recommendations container not found");
    return;
  }

  // Show loading
  if (loadingEl) loadingEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
  container.innerHTML = '';
  container.style.display = 'none';

  try {
    console.log("Loading recommendations for artist:", artistId);
    
    const recommendationsRef = collection(db, 'recommendations');
    const q = query(
      recommendationsRef,
      where('artistId', '==', artistId),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const recommendations = [];
    querySnapshot.forEach((doc) => {
      recommendations.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Found ${recommendations.length} recommendations`);

    // Hide loading
    if (loadingEl) loadingEl.style.display = 'none';

    if (recommendations.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      container.style.display = 'block';
      displayRecommendations(recommendations);
    }

  } catch (error) {
    console.error("Error loading recommendations:", error);
    
    // Hide loading
    if (loadingEl) loadingEl.style.display = 'none';
    
    // Show error message
    if (errorEl) {
      errorEl.textContent = 'Fout bij laden. Probeer het later opnieuw.';
      errorEl.style.display = 'block';
    }
  }
}

/**
 * Display recommendations list
 */
function displayRecommendations(recommendations) {
  const container = document.getElementById('recommendations-list');
  const currentUser = getStore('currentUser');

  if (!container) return;

  container.innerHTML = '';

  recommendations.forEach(rec => {
    const recDiv = document.createElement('div');
    recDiv.className = 'bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200';

    // Format date
    let dateText = '';
    if (rec.createdAt && rec.createdAt.toDate) {
      const date = rec.createdAt.toDate();
      dateText = date.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Check if current user owns this recommendation (for delete button)
    const canDelete = currentUser && currentUser.uid === rec.programmerId;

    recDiv.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div>
          <h4 class="font-semibold text-gray-900">${rec.programmerName}</h4>
          ${rec.programmerOrganization ? `<p class="text-sm text-gray-600">${rec.programmerOrganization}</p>` : ''}
          <p class="text-xs text-gray-500 mt-1">${dateText}</p>
        </div>
        ${canDelete ? `
          <button onclick="deleteRecommendation('${rec.id}')" class="text-red-600 hover:text-red-800 text-sm">
            <i data-lucide="trash-2" class="h-4 w-4"></i>
          </button>
        ` : ''}
      </div>
      <p class="text-gray-800 italic">"${rec.text}"</p>
    `;

    container.appendChild(recDiv);
  });

  // Activate Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Get recommendation count for an artist
 * @param {string} artistId - The artist's user ID
 * @returns {Promise<number>} - Number of recommendations
 */
export async function getRecommendationCount(artistId) {
  try {
    const recommendationsRef = collection(db, 'recommendations');
    const q = query(
      recommendationsRef,
      where('artistId', '==', artistId),
      where('isApproved', '==', true)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting recommendation count:", error);
    return 0;
  }
}

/**
 * Delete a recommendation (only owner can delete)
 */
window.deleteRecommendation = async function(recommendationId) {
  if (!confirm(t('confirm_delete_recommendation') || 'Are you sure you want to delete this recommendation?')) {
    return;
  }

  try {
    const currentUser = getStore('currentUser');
    if (!currentUser) {
      throw new Error(t('error_must_be_logged_in'));
    }

    // Get recommendation to verify ownership
    const recRef = doc(db, 'recommendations', recommendationId);
    const recSnap = await getDoc(recRef);

    if (!recSnap.exists()) {
      throw new Error('Recommendation not found');
    }

    const recData = recSnap.data();

    // Verify ownership
    if (recData.programmerId !== currentUser.uid) {
      throw new Error('You can only delete your own recommendations');
    }

    // Delete the recommendation
    await deleteDoc(recRef);

    console.log("Recommendation deleted successfully");

    // Reload recommendations
    const artistId = recData.artistId;
    loadRecommendations(artistId);

  } catch (error) {
    console.error("Error deleting recommendation:", error);
    alert(error.message);
  }
};
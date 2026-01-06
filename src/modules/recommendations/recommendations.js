/**
 * recommendations.js
 * Handles recommendation functionality for programmers to recommend artists
 */

import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from '../../services/firebase.js';
import { getStore } from '../../utils/store.js';
import { t } from '../../utils/translations.js';
import { sendRecommendationNotification } from '../messaging/messaging-controller.js';

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
  form.dataset.artistEmail = artistData.email;

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
    const artistEmail = e.target.dataset.artistEmail;
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
      artistEmail: artistEmail,
      programmerId: currentUser.uid,
      programmerName: `${currentUserData.firstName} ${currentUserData.lastName}`,
      programmerOrganization: currentUserData.organizationName || '',
      programmerEmail: currentUserData.email || '',
      programmerProfilePic: currentUserData.profilePicUrl || '',
      text: text,
      createdAt: serverTimestamp(),
      isApproved: true // Auto-approve for now
    };

    // Add to Firestore
    const recDoc = await addDoc(collection(db, 'recommendations'), recommendationData);

    console.log("Recommendation submitted successfully:", recDoc.id);

    // Send notification message to artist
    try {
      await sendRecommendationNotification(
        artistId,
        artistEmail,
        artistName,
        currentUser.uid,
        currentUserData,
        text
      );
      console.log("Notification sent to artist");
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
      // Don't throw - recommendation was saved successfully
    }

    // Show success message
    successMsg.textContent = t('recommendation_success');
    successMsg.style.display = 'block';

    // Clear form
    e.target.reset();

    // ✅ FIX: Close modal immediately after 1 second (faster UX)
    setTimeout(() => {
      closeRecommendationModal();
      // Reload recommendations if on artist detail page
      const currentArtistId = document.getElementById('artist-detail-view')?.dataset?.artistId;
      if (currentArtistId === artistId) {
        loadRecommendations(artistId);
      }
    }, 1000);

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
  const container = document.getElementById('detail-recommendations-list');

  if (!container) {
    console.warn('[RECOMMENDATIONS] Container not found');
    return [];
  }

  container.innerHTML = '<p style="color: #9ca3af; font-size: 14px;">Loading...</p>';

  try {
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

    if (recommendations.length === 0) {
      container.innerHTML = `
        <p style="color: #9ca3af; font-size: 14px; text-align: center; padding: 16px 0;">
          No recommendations yet
        </p>
      `;
      // Hide "View All" button when no recommendations
      const viewAllBtn = document.getElementById('view-all-recommendations-btn');
      if (viewAllBtn) viewAllBtn.style.display = 'none';
      return recommendations;
    }

    // Show max 3 in sidebar
    const displayRecs = recommendations.slice(0, 3);

    container.innerHTML = displayRecs.map(rec => {
      const date = rec.createdAt?.toDate ? rec.createdAt.toDate() : new Date();
      const formattedDate = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
      const shortText = rec.text.length > 100 ? rec.text.substring(0, 100) + '...' : rec.text;

      return `
        <div style="background: #f9fafb; border-radius: 12px; padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <p style="font-size: 14px; font-weight: 600; color: #1a1a2e;">${rec.programmerName || 'Anonymous'}</p>
            <p style="font-size: 11px; color: #9ca3af;">${formattedDate}</p>
          </div>
          <p style="font-size: 13px; color: #4a4a68; line-height: 1.5;">"${shortText}"</p>
        </div>
      `;
    }).join('');

    // Update "View All" button text with count
    const viewAllBtn = document.getElementById('view-all-recommendations-btn');
    if (viewAllBtn) {
      viewAllBtn.style.display = 'block';
      viewAllBtn.textContent = `View All ${recommendations.length} Recommendations`;
    }

    // Store all recommendations for modal (we'll use this in Deel 2)
    window._allRecommendations = recommendations;
    window._currentArtistId = artistId;

    console.log('[RECOMMENDATIONS] Loaded', recommendations.length, 'total,', displayRecs.length, 'displayed');
    return recommendations;

  } catch (error) {
    console.error('[RECOMMENDATIONS] Error:', error);
    container.innerHTML = `<p style="color: #ef4444; font-size: 14px;">Error loading recommendations</p>`;
    return [];
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

    // Programmer name - clickable if viewing as artist or different programmer
    const programmerNameHtml = currentUser && currentUser.uid !== rec.programmerId
      ? `<button onclick="viewProgrammerProfile('${rec.programmerId}')" class="font-semibold text-indigo-600 hover:text-indigo-800 underline">${rec.programmerName}</button>`
      : `<h4 class="font-semibold text-gray-900">${rec.programmerName}</h4>`;

    recDiv.innerHTML = `
      <div class="flex justify-between items-start mb-3">
        <div>
          ${programmerNameHtml}
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
 * View programmer profile
 */
window.viewProgrammerProfile = async function(programmerId) {
  try {
    console.log("Viewing programmer profile:", programmerId);
    
    const programmerRef = doc(db, 'programmers', programmerId);
    const programmerSnap = await getDoc(programmerRef);
    
    if (!programmerSnap.exists()) {
      alert('Programmer profile not found');
      return;
    }
    
    const programmer = { id: programmerId, ...programmerSnap.data() };
    
    // Show programmer profile modal
    showProgrammerProfileModal(programmer);
    
  } catch (error) {
    console.error("Error loading programmer profile:", error);
    alert('Failed to load programmer profile');
  }
};

/**
 * Show programmer profile in a modal
 */
function showProgrammerProfileModal(programmer) {
  // Create modal HTML
  const modalHTML = `
    <div id="programmer-profile-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative p-8 bg-white w-full max-w-2xl m-auto rounded-lg shadow-xl">
        <!-- Close button -->
        <button onclick="closeProgrammerProfileModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <i data-lucide="x" class="h-6 w-6"></i>
        </button>
        
        <!-- Profile content -->
        <div class="mt-3">
          <div class="flex items-start gap-6 mb-6">
            <img src="${programmer.profilePicUrl || 'https://placehold.co/100x100/e0e7ff/6366f1?text=' + encodeURIComponent((programmer.firstName || 'P').charAt(0))}" 
                 alt="Profile" 
                 class="h-24 w-24 rounded-full object-cover border-4 border-indigo-100">
            <div class="flex-1">
              <h3 class="text-2xl font-bold text-gray-900">${programmer.firstName} ${programmer.lastName}</h3>
              <p class="text-lg text-indigo-600 font-semibold">${programmer.organizationName || ''}</p>
              ${programmer.website ? `<a href="${programmer.website}" target="_blank" class="text-sm text-blue-600 hover:underline">${programmer.website}</a>` : ''}
            </div>
          </div>
          
          <div class="space-y-4">
            ${programmer.organizationAbout ? `
              <div>
                <h4 class="font-semibold text-gray-700 mb-2">About</h4>
                <p class="text-gray-600">${programmer.organizationAbout}</p>
              </div>
            ` : ''}
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              ${programmer.phone ? `
                <div>
                  <span class="font-semibold text-gray-700">Phone:</span>
                  <span class="ml-2 text-gray-600">${programmer.phone}</span>
                </div>
              ` : ''}
              ${programmer.email ? `
                <div>
                  <span class="font-semibold text-gray-700">Email:</span>
                  <a href="mailto:${programmer.email}" class="ml-2 text-blue-600 hover:underline">${programmer.email}</a>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button onclick="closeProgrammerProfileModal()" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing modal if present
  const existingModal = document.getElementById('programmer-profile-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Activate Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Close programmer profile modal
 */
window.closeProgrammerProfileModal = function() {
  const modal = document.getElementById('programmer-profile-modal');
  if (modal) {
    modal.remove();
  }
};

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
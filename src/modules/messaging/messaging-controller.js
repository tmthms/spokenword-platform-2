/**
 * messaging-controller.js
 * Controller/Event Handler Layer for Messaging
 * Handles all user interactions, event listeners, and orchestrates service + UI layers
 */

import {
  findExistingConversation,
  createConversation,
  addMessage,
  fetchConversations,
  fetchMessages,
  fetchConversation,
  fetchUserProfile,
  markConversationAsRead,
  setupConversationsListener
} from './messaging-service.js';

import {
  displayConversations,
  displayMessages,
  appendMessageToUI,
  updateUnreadBadge,
  scrollToBottom,
  showProgrammerProfileModal
} from './messaging-ui.js';

import { getStore } from '../../utils/store.js';
import { showErrorToast, showSuccessToast } from '../../ui/toast.js';

// Globale variabele om de huidige artiest bij te houden
let currentArtistForMessage = null;

// Global variable to store the unsubscribe function for badge listener
let badgeListenerUnsubscribe = null;

/**
 * Opent de message modal voor een specifieke artiest
 * @param {object} artist - Het artiest object
 */
export function openMessageModal(artist) {
  const modal = document.getElementById('message-modal');
  const artistNameSpan = document.getElementById('message-artist-name');
  const messageError = document.getElementById('message-error');
  const messageSuccess = document.getElementById('message-success');

  // Sla de artiest op voor later gebruik
  currentArtistForMessage = artist;

  // Update de modal
  artistNameSpan.textContent = artist.stageName || `${artist.firstName} ${artist.lastName}`;

  // Reset form en messages
  document.getElementById('send-message-form').reset();
  messageError.style.display = 'none';
  messageSuccess.style.display = 'none';

  // Toon modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Activeer Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Sluit de message modal
 */
function closeMessageModal() {
  const modal = document.getElementById('message-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  currentArtistForMessage = null;
}

/**
 * Verwerkt het versturen van een bericht
 */
async function handleSendMessage(e) {
  e.preventDefault();

  const messageError = document.getElementById('message-error');
  const messageSuccess = document.getElementById('message-success');
  const submitBtn = e.submitter || e.target.querySelector('button[type="submit"]');

  // Reset messages
  messageError.style.display = 'none';
  messageSuccess.style.display = 'none';

  // Disable button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i data-lucide="loader" class="h-4 w-4 mr-2 animate-spin"></i>Sending...';

  try {
    // Haal gegevens op
    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');

    if (!currentUser || !currentUserData) {
      throw new Error('User not logged in');
    }

    if (!currentArtistForMessage) {
      throw new Error('No artist selected');
    }

    const subject = document.getElementById('message-subject').value.trim();
    const messageText = document.getElementById('message-text').value.trim();

    if (!subject || !messageText) {
      throw new Error('Please fill in all fields');
    }

    // Check of er al een conversatie bestaat tussen deze twee users
    const existingConversation = await findExistingConversation(
      currentUser.uid,
      currentArtistForMessage.uid || currentArtistForMessage.id
    );

    let conversationId;

    if (existingConversation) {
      // Gebruik bestaande conversatie
      conversationId = existingConversation.id;
    } else {
      // Maak nieuwe conversatie aan
      conversationId = await createConversation(
        currentUser.uid,
        currentUserData,
        currentArtistForMessage,
        subject
      );
    }

    // Voeg bericht toe aan conversatie
    await addMessage(conversationId, currentUser.uid, currentUserData, messageText);

    // Toon success bericht
    messageSuccess.textContent = 'Message sent successfully!';
    messageSuccess.style.display = 'block';

    // Sluit modal na 2 seconden
    setTimeout(() => {
      closeMessageModal();
    }, 2000);

  } catch (error) {
    console.error("Error sending message:", error);
    const errorMessage = error.message || 'Failed to send message. Please try again.';
    messageError.textContent = errorMessage;
    messageError.style.display = 'block';

    // Show toast notification
    showErrorToast(errorMessage);

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send" class="h-4 w-4 mr-2"></i>Send Message';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

/**
 * Laadt alle conversaties voor de ingelogde gebruiker
 */
export async function loadConversations() {
  const currentUser = getStore('currentUser');

  if (!currentUser) {
    console.error("No user logged in");
    return;
  }

  const loadingEl = document.getElementById('conversations-loading');
  const emptyEl = document.getElementById('conversations-empty');
  const listEl = document.getElementById('conversations-list');

  // Show loading skeleton
  if (loadingEl) {
    loadingEl.innerHTML = `
      <div class="space-y-3 p-4 animate-pulse">
        ${Array(4).fill(0).map(() => `
          <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
              <div class="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    loadingEl.style.display = 'block';
  }
  if (emptyEl) emptyEl.style.display = 'none';
  if (listEl) {
    listEl.style.display = 'none';
    listEl.innerHTML = '';
  }

  try {
    const conversations = await fetchConversations(currentUser.uid);

    // Verberg loading
    if (loadingEl) loadingEl.style.display = 'none';

    if (conversations.length === 0) {
      // Toon empty state
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      // Toon conversaties
      await displayConversations(
        conversations,
        currentUser.uid,
        openConversation,
        viewUserProfile
      );
    }

    // Update unread badge
    updateUnreadBadge(conversations, currentUser.uid);

  } catch (error) {
    console.error("Error loading conversations:", error);
    const errorMessage = error.message || 'Error loading conversations. Please refresh the page.';

    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-500">Error loading conversations. Please refresh the page.</p>
          <p class="text-sm text-gray-500 mt-2">${error.message}</p>
        </div>
      `;
    }

    // Show toast notification
    showErrorToast(errorMessage);
  }
}

/**
 * Opent de conversation detail view voor een specifieke conversatie
 * @param {string} conversationId - Conversation ID
 */
export async function openConversation(conversationId) {
  try {
    const currentUser = getStore('currentUser');

    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    // Haal conversatie data op
    const conversation = await fetchConversation(conversationId);

    if (!conversation) {
      console.error("Conversation not found:", conversationId);
      alert("Conversation not found.");
      return;
    }

    // Bepaal de andere participant
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.uid);
    const otherParticipantName = conversation.participantNames[otherParticipantId] || 'Unknown';
    const otherParticipantRole = conversation.participantRoles[otherParticipantId] || '';

    // Show chat container and hide placeholder
    const chatPlaceholder = document.getElementById('chat-placeholder');
    const chatContainer = document.getElementById('chat-container');
    const chatHeader = document.getElementById('chat-header');

    // Get the chat area wrapper (parent of chatContainer)
    const chatAreaWrapper = chatContainer?.parentElement;

    // Hide conversation list on mobile when opening chat
    const conversationsList = document.querySelector('.md\\:w-1\\/3');
    if (conversationsList) {
      conversationsList.classList.add('hidden', 'md:block');
    }

    // Make chat area wrapper visible on mobile
    if (chatAreaWrapper) {
      chatAreaWrapper.classList.remove('hidden');
      chatAreaWrapper.classList.add('flex', 'w-full', 'md:w-2/3');
      chatAreaWrapper.style.display = 'flex';
    }

    if (chatPlaceholder) chatPlaceholder.style.display = 'none';
    if (chatContainer) {
      chatContainer.classList.remove('hidden');
      chatContainer.classList.add('flex');
      chatContainer.style.display = 'flex';
      // Store conversation ID for message form
      chatContainer.dataset.conversationId = conversationId;
    }

    // Update chat header with participant info (add back button for mobile)
    if (chatHeader) {
      chatHeader.innerHTML = `
        <div class="flex items-center">
          <button id="back-to-conversations-mobile" class="mr-3 md:hidden text-gray-600 hover:text-gray-900">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">${otherParticipantName}</h3>
            <p class="text-sm text-gray-500">${otherParticipantRole}</p>
            ${conversation.subject ? `<p class="text-sm text-gray-600 mt-1"><strong>Subject:</strong> ${conversation.subject}</p>` : ''}
          </div>
        </div>
      `;

      // Add event listener for mobile back button
      const backBtn = document.getElementById('back-to-conversations-mobile');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          // Hide chat area wrapper on mobile
          if (chatAreaWrapper) {
            chatAreaWrapper.classList.add('hidden', 'md:flex');
            chatAreaWrapper.classList.remove('flex', 'w-full');
            chatAreaWrapper.style.display = '';
          }
          // Hide chat container
          if (chatContainer) {
            chatContainer.classList.add('hidden');
            chatContainer.style.display = 'none';
          }
          // Show conversation list
          if (conversationsList) {
            conversationsList.classList.remove('hidden', 'md:block');
            conversationsList.classList.add('block');
          }
          // Show placeholder on desktop
          if (chatPlaceholder) {
            chatPlaceholder.style.display = '';
          }
        });
      }
    }

    // Markeer conversatie als gelezen
    await markConversationAsRead(conversationId, currentUser.uid);

    // Laad berichten
    await loadMessages(conversationId);

    // Activeer Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

  } catch (error) {
    console.error("Error opening conversation:", error);
    alert("Could not open conversation: " + error.message);
  }
}

/**
 * Laadt alle berichten van een conversatie
 * @param {string} conversationId - Conversation ID
 */
export async function loadMessages(conversationId) {
  const messagesContainer = document.getElementById('messages-container');

  if (!messagesContainer) {
    console.error("Messages container not found");
    return;
  }

  // Show loading state
  messagesContainer.innerHTML = '<p class="text-center text-gray-500">Loading messages...</p>';

  try {
    const messages = await fetchMessages(conversationId);
    const currentUser = getStore('currentUser');

    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // Display messages
    displayMessages(messages, currentUser.uid);

  } catch (error) {
    console.error("Error loading messages:", error);
    messagesContainer.innerHTML = `
      <div class="text-center py-8">
        <p class="text-red-500">Error loading messages. Please refresh the page.</p>
        <p class="text-sm text-gray-500 mt-2">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Handle inline message form submit (for replying in existing conversations)
 * This is now called from global event delegation in ui.js
 * @param {Event} e - Form submit event
 */
async function handleInlineMessageSubmit(e) {
  e.preventDefault();

  const messageInput = document.getElementById('message-input');
  const messageText = messageInput.value.trim();

  if (!messageText) return;

  const chatContainer = document.getElementById('chat-container');
  const conversationId = chatContainer.dataset.conversationId;

  if (!conversationId) {
    console.error("No conversation ID found");
    return;
  }

  try {
    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');

    if (!currentUser || !currentUserData) {
      throw new Error('User not logged in');
    }

    // Send message
    await addMessage(conversationId, currentUser.uid, currentUserData, messageText);

    // Clear input
    messageInput.value = '';

    // Reload messages
    await loadMessages(conversationId);

    // Scroll to bottom
    scrollToBottom();

  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message. Please try again.");
  }
}

/**
 * Bekijk het profiel van een gebruiker (programmer of artist)
 * @param {string} userId - User ID
 * @param {string} role - User role ('programmer' or 'artist')
 */
async function viewUserProfile(userId, role) {
  console.log("Viewing profile:", userId, role);

  try {
    if (role === 'programmer') {
      // Fetch programmer data
      const programmer = await fetchUserProfile(userId, 'programmer');

      if (!programmer) {
        alert('Programmer profile not found.');
        return;
      }

      // Display programmer profile modal
      showProgrammerProfileModal(programmer);

    } else if (role === 'artist') {
      // For artists, we can reuse the existing artist detail view
      const currentUserData = getStore('currentUserData');

      if (currentUserData && currentUserData.role === 'programmer') {
        // We're a programmer viewing an artist
        const artist = await fetchUserProfile(userId, 'artist');

        if (!artist) {
          alert('Artist profile not found.');
          return;
        }

        alert(`Artist Profile:\n\nName: ${artist.stageName || artist.firstName + ' ' + artist.lastName}\nLocation: ${artist.location}\nGenres: ${artist.genres?.join(', ')}\n\nClick on the artist in the search to see full profile.`);
      }
    }

  } catch (error) {
    console.error("Error viewing profile:", error);
    alert('Could not load profile: ' + error.message);
  }
}

/**
 * Setup real-time badge listener voor unread conversations
 * Deze functie moet worden aangeroepen na login
 */
export function setupBadgeListener() {
  const currentUser = getStore('currentUser');

  if (!currentUser) {
    console.log("No user logged in, skipping badge listener setup");
    return;
  }

  console.log("Setting up real-time badge listener for:", currentUser.uid);

  // Setup real-time listener
  badgeListenerUnsubscribe = setupConversationsListener(currentUser.uid, (conversations) => {
    // Update badge met unread count
    updateUnreadBadge(conversations, currentUser.uid);

    console.log(`Badge updated: ${conversations.filter(c => c.unreadBy && c.unreadBy.includes(currentUser.uid)).length} unread`);
  });

  return badgeListenerUnsubscribe;
}

/**
 * Stop de badge listener (bij logout)
 */
export function stopBadgeListener() {
  if (badgeListenerUnsubscribe) {
    badgeListenerUnsubscribe();
    badgeListenerUnsubscribe = null;
    console.log("Badge listener stopped");
  }
}

/**
 * Initialiseert de messaging event listeners
 */
export function setupMessaging() {
  // Close modal buttons
  const closeBtn = document.getElementById('close-message-modal');
  const cancelBtn = document.getElementById('cancel-message-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMessageModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeMessageModal);
  }

  // Form submit
  const messageForm = document.getElementById('send-message-form');
  if (messageForm) {
    messageForm.addEventListener('submit', handleSendMessage);
  }

  // Note: Inline message form (message-form) is handled by global event delegation in ui.js
  // to avoid conflicts and duplicate listeners

  // Close modal when clicking outside
  const modal = document.getElementById('message-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeMessageModal();
      }
    });
  }

  console.log("Messaging listeners ingesteld.");
}

// Export the addMessage function for use in other modules (like recommendations.js)
export { addMessage } from './messaging-service.js';
export { appendMessageToUI } from './messaging-ui.js';

// Export sendRecommendationNotification for use in recommendations.js
export { sendRecommendationNotification } from './messaging-service.js';

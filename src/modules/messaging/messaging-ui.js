/**
 * messaging-ui.js
 * UI/Rendering Layer for Messaging
 * Handles all HTML generation and DOM manipulation for messaging views
 */

import { fetchUserProfile } from './messaging-service.js';

/**
 * Format timestamp naar "time ago" formaat
 * @param {Date} date - Date object
 * @returns {string} Formatted time ago string
 */
export function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Format as date if older than a week
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Toont de lijst met conversaties
 * @param {Array} conversations - Array of conversation objects
 * @param {string} currentUserId - Current user ID
 * @param {Function} onConversationClick - Callback when conversation is clicked
 * @param {Function} onProfileClick - Callback when profile picture is clicked
 * @returns {Promise<void>}
 */
export async function displayConversations(conversations, currentUserId, onConversationClick, onProfileClick) {
  const listEl = document.getElementById('conversations-list');

  if (!listEl) return;

  listEl.innerHTML = '';
  listEl.style.display = 'block';

  // Fetch profile pictures for all participants
  const conversationsWithPics = await Promise.all(conversations.map(async (conversation) => {
    // Bepaal de andere participant
    const otherParticipantId = conversation.participants.find(id => id !== currentUserId);
    const otherParticipantRole = conversation.participantRoles[otherParticipantId] || '';

    // Fetch profile picture
    let profilePic = conversation.participantProfilePics?.[otherParticipantId] || '';

    // If not in conversation data, fetch from user's profile
    if (!profilePic) {
      const userData = await fetchUserProfile(otherParticipantId, otherParticipantRole);
      if (userData) {
        profilePic = userData.profilePicUrl || '';
      }
    }

    return {
      ...conversation,
      otherParticipantId,
      otherParticipantRole,
      otherParticipantPic: profilePic
    };
  }));

  // Now display all conversations with their profile pictures
  conversationsWithPics.forEach(conversation => {
    const otherParticipantName = conversation.participantNames[conversation.otherParticipantId] || 'Unknown';

    // Use fetched profile picture with fallback
    const profilePic = conversation.otherParticipantPic ||
                       'https://placehold.co/80x80/e0e7ff/6366f1?text=' +
                       encodeURIComponent(otherParticipantName.charAt(0));

    // Check of dit bericht unread is
    const isUnread = conversation.unreadBy && conversation.unreadBy.includes(currentUserId);

    // Format timestamp
    let timeAgo = 'Just now';
    if (conversation.lastMessageAt && conversation.lastMessageAt.toDate) {
      const date = conversation.lastMessageAt.toDate();
      timeAgo = formatTimeAgo(date);
    }

    // Maak conversation card
    const conversationCard = document.createElement('div');
    conversationCard.className = `border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition ${isUnread ? 'bg-indigo-50 border-indigo-300' : ''}`;
    conversationCard.dataset.conversationId = conversation.id;
    conversationCard.dataset.otherParticipantId = conversation.otherParticipantId;
    conversationCard.dataset.otherParticipantRole = conversation.otherParticipantRole;

    // Profile Picture with Hover Effect
    conversationCard.innerHTML = `
      <div class="flex items-start space-x-4">
        <!-- Profile Picture with Hover Effect -->
        <div class="relative group flex-shrink-0">
          <img src="${profilePic}"
               alt="${otherParticipantName}"
               class="h-16 w-16 rounded-full object-cover border-2 ${isUnread ? 'border-indigo-300' : 'border-gray-200'} cursor-pointer hover:border-indigo-500 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
               data-view-profile="${conversation.otherParticipantId}"
               data-profile-role="${conversation.otherParticipantRole}">

          <!-- Hover Tooltip (Subtle & Smaller) -->
          <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div class="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap mt-1">
              <svg class="inline-block h-2.5 w-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View profile
            </div>
          </div>

          <!-- Click indicator icon (Smaller & More Subtle) -->
          <div class="absolute bottom-0 right-0 h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-90 transition-opacity duration-200">
            <svg class="h-2 w-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>

        <!-- Conversation Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-1">
            <h3 class="text-lg font-semibold ${isUnread ? 'text-indigo-900' : 'text-gray-900'} truncate">${otherParticipantName}</h3>
            ${isUnread ? '<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white flex-shrink-0">New</span>' : ''}
            <span class="ml-2 text-sm text-gray-500 capitalize flex-shrink-0">${conversation.otherParticipantRole}</span>
          </div>
          <p class="text-sm text-gray-700 mb-1"><strong>Subject:</strong> ${conversation.subject || 'No subject'}</p>
          <p class="text-sm text-gray-600 line-clamp-2">${conversation.lastMessage || 'No messages yet'}</p>
        </div>

        <!-- Timestamp & Status -->
        <div class="text-right flex-shrink-0">
          <p class="text-xs text-gray-500 whitespace-nowrap">${timeAgo}</p>
          ${isUnread ? '<div class="mt-2"><i data-lucide="mail" class="h-5 w-5 text-indigo-600"></i></div>' : ''}
        </div>
      </div>
    `;

    // Click handler om conversatie te openen OF profiel te bekijken
    conversationCard.addEventListener('click', (e) => {
      // Check if clicked on profile picture
      if (e.target.hasAttribute('data-view-profile')) {
        e.stopPropagation();
        const userId = e.target.getAttribute('data-view-profile');
        const role = e.target.getAttribute('data-profile-role');
        onProfileClick(userId, role);
      } else {
        onConversationClick(conversation.id);
      }
    });

    listEl.appendChild(conversationCard);
  });

  // Activeer Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Toont de lijst met berichten
 * @param {Array} messages - Array of message objects
 * @param {string} currentUserId - Current user ID
 * @returns {void}
 */
export function displayMessages(messages, currentUserId) {
  const messagesContainer = document.getElementById('messages-container');

  if (!messagesContainer) return;

  messagesContainer.innerHTML = '';

  if (messages.length === 0) {
    messagesContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No messages yet.</p>';
  } else {
    messages.forEach(message => {
      const isOwnMessage = message.senderId === currentUserId;

      // Format timestamp
      let timeAgo = 'Just now';
      if (message.createdAt && message.createdAt.toDate) {
        const date = message.createdAt.toDate();
        timeAgo = formatTimeAgo(date);
      }

      // Get profile picture with proper fallback
      const profilePic = message.senderProfilePic ||
                        'https://placehold.co/48x48/e0e7ff/6366f1?text=' +
                        encodeURIComponent(message.senderName?.charAt(0) || '?');

      // Create message bubble
      const messageDiv = document.createElement('div');
      messageDiv.className = `flex items-start space-x-3 mb-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`;

      messageDiv.innerHTML = `
        <div class="flex-shrink-0">
          <img src="${profilePic}"
               alt="${message.senderName}"
               class="h-10 w-10 rounded-full object-cover">
        </div>

        <div class="max-w-xl ${isOwnMessage ? 'bg-indigo-100' : 'bg-gray-100'} rounded-lg p-4 shadow-sm">
          <div class="flex items-center mb-2">
            <span class="font-semibold text-sm ${isOwnMessage ? 'text-indigo-900' : 'text-gray-900'}">${message.senderName}</span>
            <span class="text-xs text-gray-500 ml-2 capitalize">${message.senderRole || ''}</span>
          </div>
          <p class="text-gray-800 whitespace-pre-wrap">${message.text}</p>
          <p class="text-xs text-gray-500 mt-2">${timeAgo}</p>
        </div>
      `;

      messagesContainer.appendChild(messageDiv);
    });
  }

  // Scroll to latest message with smooth behavior
  setTimeout(() => {
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

/**
 * Append a single message to the UI immediately (optimistic UI)
 * @param {object} message - Message object
 * @param {string} currentUserId - Current user ID
 * @returns {void}
 */
export function appendMessageToUI(message, currentUserId) {
  const messagesContainer = document.getElementById('messages-container');

  if (!messagesContainer) return;

  // Remove "no messages" placeholder if it exists
  const placeholder = messagesContainer.querySelector('p.text-gray-500');
  if (placeholder) {
    placeholder.remove();
  }

  const isOwnMessage = message.senderId === currentUserId;

  // Format timestamp
  let timeAgo = 'Just now';
  if (message.createdAt && message.createdAt.toDate) {
    const date = message.createdAt.toDate();
    timeAgo = formatTimeAgo(date);
  }

  // Get profile picture with proper fallback
  const profilePic = message.senderProfilePic ||
                    'https://placehold.co/48x48/e0e7ff/6366f1?text=' +
                    encodeURIComponent(message.senderName?.charAt(0) || '?');

  // Create message bubble
  const messageDiv = document.createElement('div');
  messageDiv.className = `flex items-start space-x-3 mb-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`;

  messageDiv.innerHTML = `
    <div class="flex-shrink-0">
      <img src="${profilePic}"
           alt="${message.senderName}"
           class="h-10 w-10 rounded-full object-cover">
    </div>

    <div class="max-w-xl ${isOwnMessage ? 'bg-indigo-100' : 'bg-gray-100'} rounded-lg p-4 shadow-sm">
      <div class="flex items-center mb-2">
        <span class="font-semibold text-sm ${isOwnMessage ? 'text-indigo-900' : 'text-gray-900'}">${message.senderName}</span>
        <span class="text-xs text-gray-500 ml-2 capitalize">${message.senderRole || ''}</span>
      </div>
      <p class="text-gray-800 whitespace-pre-wrap">${message.text}</p>
      <p class="text-xs text-gray-500 mt-2">${timeAgo}</p>
    </div>
  `;

  // Append message
  messagesContainer.appendChild(messageDiv);

  // Smooth scroll to the new message (keep focus on message + input field)
  // Use requestAnimationFrame for better scroll performance
  requestAnimationFrame(() => {
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });

    // Keep focus on input field after sending
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.focus();
    }
  });
}

/**
 * Update all unread badges in navigation (desktop, mobile, legacy)
 * @param {Array} conversations - Array of conversation objects
 * @param {string} currentUserId - Current user ID
 * @returns {void}
 */
export function updateUnreadBadge(conversations, currentUserId) {
  // Get all badge elements
  const badgeDesktop = document.getElementById('messages-badge-desktop');
  const badgeMobile = document.getElementById('messages-badge-mobile');
  const badgeLegacy = document.getElementById('messages-badge'); // Legacy badge

  // Tel unread conversaties
  const unreadCount = conversations.filter(conv =>
    conv.unreadBy && conv.unreadBy.includes(currentUserId)
  ).length;

  console.log(`[MESSAGING] Updating badges: ${unreadCount} unread conversations`);

  // Update desktop badge
  if (badgeDesktop) {
    if (unreadCount > 0) {
      badgeDesktop.textContent = unreadCount;
      badgeDesktop.classList.remove('hidden');
    } else {
      badgeDesktop.classList.add('hidden');
    }
  }

  // Update mobile badge
  if (badgeMobile) {
    if (unreadCount > 0) {
      badgeMobile.textContent = unreadCount;
      badgeMobile.classList.remove('hidden');
    } else {
      badgeMobile.classList.add('hidden');
    }
  }

  // Update legacy badge (if it exists)
  if (badgeLegacy) {
    if (unreadCount > 0) {
      badgeLegacy.textContent = unreadCount;
      badgeLegacy.classList.remove('hidden');
    } else {
      badgeLegacy.classList.add('hidden');
    }
  }
}

/**
 * Scroll to bottom of messages container
 * @returns {void}
 */
export function scrollToBottom() {
  const messagesContainer = document.getElementById('messages-container');
  if (messagesContainer) {
    setTimeout(() => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }
}

/**
 * Toon programmer profiel in een modal
 * @param {object} programmer - Programmer data object
 * @returns {void}
 */
export function showProgrammerProfileModal(programmer) {
  // Create modal element
  const modal = document.createElement('div');
  modal.id = 'programmer-profile-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

  const profilePic = programmer.profilePicUrl ||
                     'https://placehold.co/200x200/e0e7ff/6366f1?text=' +
                     encodeURIComponent((programmer.firstName || 'P').charAt(0));

  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Programmer Profile</h2>
          <button id="close-programmer-modal" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Profile Content -->
        <div class="space-y-6">
          <!-- Profile Picture & Basic Info -->
          <div class="flex items-start space-x-6">
            <img src="${profilePic}"
                 alt="${programmer.firstName}"
                 class="h-32 w-32 rounded-full object-cover flex-shrink-0">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-1">
                ${programmer.firstName} ${programmer.lastName}
              </h3>
              <p class="text-indigo-600 font-medium mb-2">${programmer.organizationName || 'Organization'}</p>
              <div class="space-y-1 text-sm text-gray-600">
                <div class="flex items-center">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  ${programmer.email || 'No email'}
                </div>
                ${programmer.phone ? `
                  <div class="flex items-center">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    ${programmer.phone}
                  </div>
                ` : ''}
                ${programmer.website ? `
                  <div class="flex items-center">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                    </svg>
                    <a href="${programmer.website}" target="_blank" class="text-indigo-600 hover:text-indigo-800">
                      ${programmer.website}
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- About Organization -->
          ${programmer.organizationAbout ? `
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">About the Organization</h4>
              <p class="text-gray-700 whitespace-pre-wrap">${programmer.organizationAbout}</p>
            </div>
          ` : ''}

          <!-- Status Badge -->
          <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            programmer.status === 'pro' ? 'bg-green-100 text-green-800' :
            programmer.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }">
            ${programmer.status === 'pro' ? '✓ Pro Member' :
              programmer.status === 'trial' ? 'Trial Member' :
              'Pending Approval'}
          </div>
        </div>
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(modal);

  // DOM race condition guard - check element exists before adding listener
  const closeBtn = document.getElementById('close-programmer-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
  } else {
    console.warn('[MESSAGING] close-programmer-modal element not found in modal');
  }

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

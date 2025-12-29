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
  // Get all list containers
  const desktopList = document.getElementById('conversations-list');
  const mobileList = document.getElementById('mobile-conversations-list');
  const loadingEl = document.getElementById('conversations-loading');
  const emptyEl = document.getElementById('conversations-empty');
  const mobileEmptyEl = document.getElementById('mobile-conversations-empty');

  // Hide loading
  if (loadingEl) loadingEl.style.display = 'none';

  // Handle empty state
  if (!conversations || conversations.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    if (mobileEmptyEl) mobileEmptyEl.style.display = 'block';
    if (desktopList) desktopList.innerHTML = '';
    if (mobileList) mobileList.innerHTML = '';
    return;
  }

  // Hide empty states
  if (emptyEl) emptyEl.style.display = 'none';
  if (mobileEmptyEl) mobileEmptyEl.style.display = 'none';

  // Fetch profile pics
  const conversationsWithPics = await Promise.all(conversations.map(async (conv) => {
    const otherParticipantId = conv.participants.find(id => id !== currentUserId);
    const otherParticipantRole = conv.participantRoles?.[otherParticipantId] || '';

    let profilePic = conv.participantProfilePics?.[otherParticipantId];
    if (!profilePic) {
      try {
        const profile = await fetchUserProfile(otherParticipantId, otherParticipantRole);
        profilePic = profile?.profilePicUrl;
      } catch (e) { /* ignore */ }
    }

    return { ...conv, otherParticipantId, otherParticipantRole, profilePic };
  }));

  // Generate card HTML
  const generateCard = (conv) => {
    const otherName = conv.participantNames?.[conv.otherParticipantId] || 'Unknown';
    const lastMsg = conv.lastMessage || 'Geen berichten';
    const isUnread = conv.unreadBy?.includes(currentUserId);

    let timeStr = '';
    if (conv.lastMessageAt?.toDate) {
      const d = conv.lastMessageAt.toDate();
      const now = new Date();
      const diffH = Math.floor((now - d) / 3600000);
      timeStr = diffH < 24
        ? d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
    }

    const picUrl = conv.profilePic || `https://placehold.co/48x48/e9d5ff/805ad5?text=${encodeURIComponent(otherName.charAt(0))}`;

    return `
      <div class="conversation-card" data-conversation-id="${conv.id}" data-other-id="${conv.otherParticipantId}" data-other-name="${otherName}" data-other-role="${conv.otherParticipantRole}" data-profile-pic="${picUrl}"
        style="display: flex; align-items: center; gap: 12px; padding: 14px 12px; background: ${isUnread ? '#faf5ff' : 'white'}; border-radius: 12px; margin-bottom: 6px; cursor: pointer; border: 1px solid ${isUnread ? 'rgba(128, 90, 213, 0.25)' : 'rgba(128, 90, 213, 0.08)'}; transition: all 0.15s;">

        <div style="position: relative; flex-shrink: 0;">
          <img src="${picUrl}" alt="${otherName}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover;">
          ${isUnread ? '<div style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; background: #805ad5; border-radius: 50%; border: 2px solid white;"></div>' : ''}
        </div>

        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 15px; font-weight: ${isUnread ? '700' : '600'}; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${otherName}</span>
            <span style="font-size: 12px; color: ${isUnread ? '#805ad5' : '#9ca3af'}; flex-shrink: 0; margin-left: 8px;">${timeStr}</span>
          </div>
          <p style="font-size: 13px; color: ${isUnread ? '#4b5563' : '#9ca3af'}; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: ${isUnread ? '500' : '400'};">${lastMsg}</p>
        </div>
      </div>
    `;
  };

  const cardsHTML = conversationsWithPics.map(c => generateCard(c)).join('');

  // Render desktop
  if (desktopList) {
    desktopList.innerHTML = cardsHTML;
    desktopList.style.display = 'block';

    desktopList.querySelectorAll('.conversation-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const conversationId = card.dataset.conversationId;
        const otherName = card.dataset.otherName;
        const otherRole = card.dataset.otherRole;
        const profilePic = card.dataset.profilePic;

        // Update chat header
        const chatAvatar = document.getElementById('chat-avatar');
        const chatName = document.getElementById('chat-name');
        const chatRole = document.getElementById('chat-role');

        if (chatAvatar) chatAvatar.innerHTML = '<img src="' + profilePic + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        if (chatName) chatName.textContent = otherName;
        if (chatRole) chatRole.textContent = otherRole;

        // Show chat container, hide placeholder
        const chatPlaceholder = document.getElementById('chat-placeholder');
        const chatContainer = document.getElementById('chat-container');

        if (chatPlaceholder) chatPlaceholder.style.display = 'none';
        if (chatContainer) {
          chatContainer.style.display = 'flex';
          chatContainer.dataset.conversationId = conversationId;
        }

        // Highlight selected conversation
        desktopList.querySelectorAll('.conversation-card').forEach(c => {
          c.style.background = 'white';
          c.style.borderColor = 'rgba(128, 90, 213, 0.08)';
        });
        card.style.background = '#faf5ff';
        card.style.borderColor = 'rgba(128, 90, 213, 0.25)';

        // Load messages
        try {
          const { loadMessages, markConversationAsRead } = await import('./messaging-controller.js');
          const { getStore } = await import('../../utils/store.js');
          const currentUser = getStore('currentUser');

          if (currentUser) {
            await markConversationAsRead(conversationId, currentUser.uid);
          }
          await loadMessages(conversationId);
        } catch (err) {
          console.error('Error loading conversation:', err);
        }
      });

      // Hover effects
      card.addEventListener('mouseenter', () => {
        if (card.style.background !== 'rgb(250, 245, 255)') {
          card.style.transform = 'translateX(4px)';
          card.style.boxShadow = '0 2px 8px rgba(128,90,213,0.1)';
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'none';
        card.style.boxShadow = 'none';
      });
    });
  }

  // Render mobile
  if (mobileList) {
    mobileList.innerHTML = cardsHTML;

    mobileList.querySelectorAll('.conversation-card').forEach(card => {
      card.addEventListener('click', () => {
        // Show mobile chat view
        const listView = document.getElementById('mobile-conversations-view');
        const chatView = document.getElementById('mobile-chat-view');
        if (listView) listView.style.display = 'none';
        if (chatView) chatView.style.display = 'flex';

        // Update mobile header
        const avatar = document.getElementById('mobile-chat-avatar');
        const name = document.getElementById('mobile-chat-name');
        const role = document.getElementById('mobile-chat-role');
        if (avatar) avatar.innerHTML = `<img src="${card.dataset.profilePic}" style="width:100%;height:100%;object-fit:cover;">`;
        if (name) name.textContent = card.dataset.otherName;
        if (role) role.textContent = card.dataset.otherRole;

        onConversationClick(card.dataset.conversationId);
      });
    });
  }
}

/**
 * Toont de lijst met berichten
 * @param {Array} messages - Array of message objects
 * @param {string} currentUserId - Current user ID
 * @returns {void}
 */
export function displayMessages(messages, currentUserId) {
  const desktopContainer = document.getElementById('messages-container');
  const mobileContainer = document.getElementById('mobile-messages-container');

  const renderToContainer = (container) => {
    if (!container) return;
    container.innerHTML = '';

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
          <p>Nog geen berichten. Start het gesprek!</p>
        </div>
      `;
      return;
    }

    messages.forEach(msg => {
      const isOwn = msg.senderId === currentUserId;

      let timeStr = 'Zojuist';
      if (msg.createdAt?.toDate) {
        timeStr = formatTimeAgo(msg.createdAt.toDate());
      }

      const pic = msg.senderProfilePic || `https://placehold.co/36x36/e9d5ff/805ad5?text=${encodeURIComponent(msg.senderName?.charAt(0) || '?')}`;

      const div = document.createElement('div');
      div.style.cssText = `display: flex; align-items: flex-end; gap: 8px; margin-bottom: 12px; ${isOwn ? 'flex-direction: row-reverse;' : ''}`;

      div.innerHTML = `
        <img src="${pic}" alt="" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
        <div style="max-width: 75%;">
          <div style="padding: 10px 14px; background: ${isOwn ? '#e9d5ff' : 'white'}; border-radius: 14px; ${isOwn ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;'} ${!isOwn ? 'border: 1px solid rgba(128,90,213,0.1);' : ''}">
            <p style="font-size: 14px; color: #1f2937; margin: 0; white-space: pre-wrap; word-break: break-word;">${msg.text}</p>
          </div>
          <p style="font-size: 11px; color: #9ca3af; margin: 3px 4px 0; ${isOwn ? 'text-align: right;' : ''}">${timeStr}</p>
        </div>
      `;

      container.appendChild(div);
    });

    // Scroll to bottom
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  };

  renderToContainer(desktopContainer);
  renderToContainer(mobileContainer);
}

/**
 * Append a single message to the UI immediately (optimistic UI)
 * @param {object} message - Message object
 * @param {string} currentUserId - Current user ID
 * @returns {void}
 */
export function appendMessageToUI(message, currentUserId) {
  const messagesContainer = document.getElementById('messages-container');
  const mobileMessagesContainer = document.getElementById('mobile-messages-container');

  if (!messagesContainer && !mobileMessagesContainer) return;

  // Remove "no messages" placeholder if it exists
  if (messagesContainer) {
    const placeholder = messagesContainer.querySelector('p.text-gray-500');
    if (placeholder) placeholder.remove();
  }
  if (mobileMessagesContainer) {
    const mobilePlaceholder = mobileMessagesContainer.querySelector('p.text-gray-500');
    if (mobilePlaceholder) mobilePlaceholder.remove();
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

    <div class="max-w-xl ${isOwnMessage ? 'bg-indigo-100' : 'bg-white border border-gray-100'} rounded-2xl p-4">
      <p class="text-gray-800 whitespace-pre-wrap text-sm">${message.text}</p>
      <p class="text-xs text-gray-400 mt-2">${timeAgo}</p>
    </div>
  `;

  // Append message to both containers
  if (messagesContainer) messagesContainer.appendChild(messageDiv);
  if (mobileMessagesContainer) {
    const mobileClone = messageDiv.cloneNode(true);
    mobileMessagesContainer.appendChild(mobileClone);
  }

  // Smooth scroll to the new message (keep focus on message + input field)
  // Use requestAnimationFrame for better scroll performance
  requestAnimationFrame(() => {
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
    if (mobileMessagesContainer) {
      mobileMessagesContainer.scrollTo({
        top: mobileMessagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }

    // Keep focus on input field after sending (both desktop and mobile)
    const messageInput = document.getElementById('message-input');
    const mobileMessageInput = document.getElementById('mobile-message-input');
    if (messageInput) messageInput.focus();
    if (mobileMessageInput) mobileMessageInput.focus();
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

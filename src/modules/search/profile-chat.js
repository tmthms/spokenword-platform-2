/**
 * profile-chat.js
 * Chat functionaliteit voor artist detail page
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { getStore } from '../../utils/store.js';
import {
  findExistingConversation,
  createConversation,
  addMessage
} from '../messaging/messaging-service.js';

// Store voor huidige chat state
let currentConversationId = null;
let messagesUnsubscribe = null;
let currentArtistId = null;

/**
 * Initialiseer chat voor een artist
 */
export async function initProfileChat(artist) {
  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');

  if (!currentUser || !currentUserData) {
    showChatError('Je moet ingelogd zijn om te chatten');
    return;
  }

  currentArtistId = artist.id || artist.uid;

  // Update chat header
  const chatTitle = document.getElementById('detail-chat-title');
  if (chatTitle) {
    chatTitle.textContent = `Chat met ${artist.stageName || 'Artist'}`;
  }

  // Show loading
  showChatLoading();

  try {
    // Check voor bestaande conversatie
    const existingConv = await findExistingConversation(currentUser.uid, currentArtistId);

    if (existingConv) {
      currentConversationId = existingConv.id;
      // Start realtime listener
      startMessagesListener(existingConv.id);
    } else {
      // Geen bestaande conversatie
      currentConversationId = null;
      showChatEmpty();
    }

  } catch (err) {
    console.error('[PROFILE CHAT] Error initializing:', err);
    showChatError('Kon chat niet laden');
  }
}

/**
 * Start realtime messages listener
 */
function startMessagesListener(conversationId) {
  // Stop bestaande listener
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
  }

  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  messagesUnsubscribe = onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    if (messages.length === 0) {
      showChatEmpty();
    } else {
      renderMessages(messages);
    }
  }, (error) => {
    console.error('[PROFILE CHAT] Messages listener error:', error);
    showChatError('Kon berichten niet laden');
  });
}

/**
 * Render messages in de chat
 */
function renderMessages(messages) {
  const loadingEl = document.getElementById('detail-chat-loading');
  const emptyEl = document.getElementById('detail-chat-empty');
  const listEl = document.getElementById('detail-chat-messages-list');

  if (loadingEl) loadingEl.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'none';
  if (listEl) {
    listEl.style.display = 'flex';

    const currentUser = getStore('currentUser');

    listEl.innerHTML = messages.map(msg => {
      const isOwn = msg.senderId === currentUser?.uid;
      const time = msg.createdAt?.toDate?.()
        ? formatTime(msg.createdAt.toDate())
        : 'Nu';

      return `
        <div style="display: flex; flex-direction: column; align-items: ${isOwn ? 'flex-end' : 'flex-start'};">
          <div style="max-width: 85%; padding: 10px 14px; border-radius: ${isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px'}; background: ${isOwn ? 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)' : '#f3f4f6'}; color: ${isOwn ? 'white' : '#1a1a2e'};">
            <p style="font-size: 14px; line-height: 1.5; margin: 0; word-wrap: break-word;">${escapeHtml(msg.text)}</p>
          </div>
          <span style="font-size: 10px; color: #9ca3af; margin-top: 4px; padding: 0 4px;">${msg.senderName?.split(' ')[0] || ''} • ${time}</span>
        </div>
      `;
    }).join('');

    // Scroll naar beneden
    const container = document.getElementById('detail-chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}

/**
 * Verstuur een bericht
 */
export async function sendProfileChatMessage(messageText) {
  if (!messageText || !messageText.trim()) return;

  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');

  if (!currentUser || !currentUserData) {
    showChatError('Je moet ingelogd zijn');
    return;
  }

  if (!currentArtistId) {
    showChatError('Geen artiest geselecteerd');
    return;
  }

  try {
    // Als er nog geen conversatie is, maak er een aan
    if (!currentConversationId) {
      // Haal artist data op
      const { fetchArtistById } = await import('./search-data.js');
      const artist = await fetchArtistById(currentArtistId);

      if (!artist) {
        throw new Error('Artist not found');
      }

      // Maak nieuwe conversatie
      currentConversationId = await createConversation(
        currentUser.uid,
        currentUserData,
        artist,
        'Chat via profiel'
      );

      // Start listener voor de nieuwe conversatie
      startMessagesListener(currentConversationId);
    }

    // Verstuur bericht
    await addMessage(currentConversationId, currentUser.uid, currentUserData, messageText.trim());

    // Clear input
    const input = document.getElementById('detail-chat-input');
    if (input) input.value = '';

  } catch (err) {
    console.error('[PROFILE CHAT] Error sending message:', err);
    showChatError('Kon bericht niet versturen');
  }
}

/**
 * Cleanup functie - roep aan bij verlaten van detail page
 */
export function cleanupProfileChat() {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
    messagesUnsubscribe = null;
  }
  currentConversationId = null;
  currentArtistId = null;
}

// === Helper functies ===

function showChatLoading() {
  const loadingEl = document.getElementById('detail-chat-loading');
  const emptyEl = document.getElementById('detail-chat-empty');
  const listEl = document.getElementById('detail-chat-messages-list');

  if (loadingEl) loadingEl.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  if (listEl) listEl.style.display = 'none';
}

function showChatEmpty() {
  const loadingEl = document.getElementById('detail-chat-loading');
  const emptyEl = document.getElementById('detail-chat-empty');
  const listEl = document.getElementById('detail-chat-messages-list');

  if (loadingEl) loadingEl.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'flex';
  if (listEl) listEl.style.display = 'none';
}

function showChatError(message) {
  const loadingEl = document.getElementById('detail-chat-loading');
  const emptyEl = document.getElementById('detail-chat-empty');

  if (loadingEl) loadingEl.style.display = 'none';
  if (emptyEl) {
    emptyEl.style.display = 'flex';
    emptyEl.innerHTML = `
      <div style="width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
        <svg width="28" height="28" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <p style="color: #ef4444; font-weight: 600;">${message}</p>
    `;
  }
}

function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (mins < 1) return 'Nu';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}u`;

  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

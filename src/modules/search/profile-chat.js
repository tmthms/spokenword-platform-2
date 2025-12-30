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

  console.log('[PROFILE CHAT] Initializing chat with:', artist.stageName || artist.id);

  // Setup form submit handler
  const form = document.getElementById('profile-chat-form');
  if (form) {
    // Remove old listener
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', handleChatSubmit);
  }

  // Setup input enter key
  const input = document.getElementById('profile-chat-input');
  if (input) {
    input.addEventListener('keypress', handleInputKeypress);
  }

  try {
    // Check voor bestaande conversatie
    const existingConv = await findExistingConversation(currentUser.uid, currentArtistId);

    if (existingConv) {
      currentConversationId = existingConv.id;
      console.log('[PROFILE CHAT] Found existing conversation:', currentConversationId);
      // Start realtime listener
      startMessagesListener(existingConv.id);
      // Scroll to bottom after loading
      const container = document.getElementById('profile-chat-messages');
      if (container) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    } else {
      // Geen bestaande conversatie
      console.log('[PROFILE CHAT] No existing conversation found');
      currentConversationId = null;
      showChatEmpty();
    }

  } catch (err) {
    console.error('[PROFILE CHAT] Error initializing:', err);
    showChatError('Kon chat niet laden');
  }
}

function handleInputKeypress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const form = document.getElementById('profile-chat-form');
    if (form) form.dispatchEvent(new Event('submit'));
  }
}

async function handleChatSubmit(e) {
  e.preventDefault();

  const input = document.getElementById('profile-chat-input');
  if (!input) return;

  const messageText = input.value.trim();
  if (!messageText) return;

  // Clear input immediately
  input.value = '';

  try {
    await sendProfileChatMessage(messageText);
  } catch (error) {
    console.error('[PROFILE CHAT] Error sending message:', error);
    // Restore input on error
    input.value = messageText;
    alert('Kon bericht niet versturen. Probeer opnieuw.');
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
  const container = document.getElementById('profile-chat-messages');
  const emptyState = document.getElementById('chat-empty-state');

  if (!container) return;

  if (messages.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');
  const currentUserId = currentUser?.uid;

  // Clear container but keep empty state
  const existingMessages = container.querySelectorAll('.chat-message');
  existingMessages.forEach(el => el.remove());

  messages.forEach(msg => {
    const isOwn = msg.senderId === currentUserId;
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.style.cssText = `display: flex; flex-direction: column; align-items: ${isOwn ? 'flex-end' : 'flex-start'};`;

    const time = msg.createdAt?.toDate?.()
      ? formatTime(msg.createdAt.toDate())
      : 'Nu';

    const senderName = isOwn ? 'Jij' : (msg.senderName?.split(' ')[0] || 'Artist');

    messageEl.innerHTML = `
      <div style="max-width: 85%; padding: 10px 14px; border-radius: ${isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px'}; background: ${isOwn ? 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)' : '#f3f4f6'}; color: ${isOwn ? 'white' : '#1a1a2e'};">
        <p style="font-size: 14px; line-height: 1.5; margin: 0; word-wrap: break-word;">${escapeHtml(msg.text || msg.content || '')}</p>
      </div>
      <span style="font-size: 10px; color: #9ca3af; margin-top: 4px; padding: 0 4px;">${senderName} • ${time}</span>
    `;

    container.appendChild(messageEl);
  });

  // AUTO-SCROLL TO BOTTOM
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
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

    console.log('[PROFILE CHAT] Message sent to conversation:', currentConversationId);

    // Scroll to bottom after sending
    const container = document.getElementById('profile-chat-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }

  } catch (err) {
    console.error('[PROFILE CHAT] Error sending message:', err);
    throw err; // Re-throw to be handled by handleChatSubmit
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

function showChatEmpty() {
  const emptyState = document.getElementById('chat-empty-state');
  if (emptyState) {
    emptyState.style.display = 'flex';
  }
}

function showChatError(message) {
  const emptyState = document.getElementById('chat-empty-state');
  if (emptyState) {
    emptyState.style.display = 'flex';
    emptyState.innerHTML = `
      <div style="width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
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

/**
 * messaging-service.js
 * Firebase/Data Layer for Messaging
 * Handles all Firebase Firestore interactions for conversations and messages
 */

import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../../services/firebase.js';

/**
 * Zoekt naar een bestaande conversatie tussen twee users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<object|null>} Conversation object or null
 */
export async function findExistingConversation(userId1, userId2) {
  try {
    const conversationsRef = collection(db, 'conversations');

    // Query voor conversaties waar beide users participants zijn
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId1)
    );

    const querySnapshot = await getDocs(q);

    // Filter client-side voor de tweede participant
    let existingConv = null;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        existingConv = { id: doc.id, ...data };
      }
    });

    return existingConv;
  } catch (error) {
    console.error("Error finding existing conversation:", error);
    return null;
  }
}

/**
 * Maakt een nieuwe conversatie aan
 * @param {string} programmerId - Programmer user ID
 * @param {object} programmerData - Programmer data object
 * @param {object} artist - Artist object
 * @param {string} subject - Conversation subject
 * @returns {Promise<string>} Conversation ID
 */
export async function createConversation(programmerId, programmerData, artist, subject) {
  try {
    const artistId = artist.uid || artist.id;

    const conversationData = {
      participants: [programmerId, artistId],
      participantNames: {
        [programmerId]: `${programmerData.firstName} ${programmerData.lastName}`,
        [artistId]: artist.stageName || `${artist.firstName} ${artist.lastName}`
      },
      participantRoles: {
        [programmerId]: 'programmer',
        [artistId]: 'artist'
      },
      participantEmails: {
        [programmerId]: programmerData.email,
        [artistId]: artist.email
      },
      participantProfilePics: {
        [programmerId]: programmerData.profilePicUrl || '',
        [artistId]: artist.profilePicUrl || ''
      },
      subject: subject,
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      unreadBy: [artistId],
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Failed to create conversation. Please try again.");
  }
}

/**
 * Voegt een bericht toe aan een conversatie
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {object} senderData - Sender data object
 * @param {string} messageText - Message text
 * @returns {Promise<void>}
 */
export async function addMessage(conversationId, senderId, senderData, messageText) {
  try {
    // 1. Voeg bericht toe aan messages subcollection
    const messageData = {
      senderId: senderId,
      senderName: `${senderData.firstName} ${senderData.lastName}`,
      senderRole: senderData.role,
      senderProfilePic: senderData.profilePicUrl || '',
      text: messageText,
      createdAt: serverTimestamp(),
      read: false
    };

    await addDoc(collection(db, `conversations/${conversationId}/messages`), messageData);

    // 2. Update de conversatie met laatste bericht info
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    const conversationData = conversationSnap.data();

    // Bepaal wie de ontvanger is (de andere participant)
    const receiverId = conversationData.participants.find(id => id !== senderId);

    await setDoc(conversationRef, {
      lastMessage: messageText.substring(0, 100),
      lastMessageAt: serverTimestamp(),
      unreadBy: [receiverId]
    }, { merge: true });
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error("Failed to send message. Please try again.");
  }
}

/**
 * Haalt alle conversaties op voor een specifieke gebruiker
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of conversation objects
 */
export async function fetchConversations(userId) {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });

    return conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Failed to load conversations. Please refresh the page.");
  }
}

/**
 * Haalt alle berichten op van een conversatie
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} Array of message objects
 */
export async function fetchMessages(conversationId) {
  try {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const querySnapshot = await getDocs(q);

    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to load messages. Please refresh the page.");
  }
}

/**
 * Haalt een specifieke conversatie op
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<object|null>} Conversation object or null
 */
export async function fetchConversation(conversationId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
      return null;
    }

    return { id: conversationSnap.id, ...conversationSnap.data() };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw new Error("Failed to load conversation. Please refresh the page.");
  }
}

/**
 * Markeer conversatie als gelezen voor de huidige gebruiker
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function markConversationAsRead(conversationId, userId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) return;

    const conversationData = conversationSnap.data();
    const unreadBy = conversationData.unreadBy || [];

    // Als de gebruiker in de unreadBy lijst staat, verwijder hem
    if (unreadBy.includes(userId)) {
      const newUnreadBy = unreadBy.filter(id => id !== userId);

      await setDoc(conversationRef, {
        unreadBy: newUnreadBy
      }, { merge: true });
    }

  } catch (error) {
    console.error("Error marking conversation as read:", error);
  }
}

/**
 * Setup real-time listener voor conversations
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to call when conversations update
 * @returns {Function} Unsubscribe function
 */
export function setupConversationsListener(userId, callback) {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId)
  );

  // Setup real-time listener
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });

    callback(conversations);
  }, (error) => {
    console.error("Error in conversations listener:", error);
  });

  return unsubscribe;
}

/**
 * Haalt user data op (programmer of artist)
 * @param {string} userId - User ID
 * @param {string} role - User role ('programmer' or 'artist')
 * @returns {Promise<object|null>} User data or null
 */
export async function fetchUserProfile(userId, role) {
  try {
    const collectionName = role === 'artist' ? 'artists' : 'programmers';
    const userDocRef = doc(db, collectionName, userId);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    return { id: userDocSnap.id, ...userDocSnap.data() };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Send recommendation notification to artist
 * @param {string} artistId - Artist user ID
 * @param {string} artistEmail - Artist email
 * @param {string} artistName - Artist name
 * @param {string} programmerId - Programmer user ID
 * @param {object} programmerData - Programmer data
 * @param {string} recommendationText - The recommendation text
 * @returns {Promise<void>}
 */
export async function sendRecommendationNotification(artistId, artistEmail, artistName, programmerId, programmerData, recommendationText) {
  try {
    // Check if conversation exists
    const existingConversation = await findExistingConversation(programmerId, artistId);

    let conversationId;

    if (existingConversation) {
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const conversationData = {
        participants: [programmerId, artistId],
        participantNames: {
          [programmerId]: `${programmerData.firstName} ${programmerData.lastName}`,
          [artistId]: artistName
        },
        participantRoles: {
          [programmerId]: 'programmer',
          [artistId]: 'artist'
        },
        participantEmails: {
          [programmerId]: programmerData.email,
          [artistId]: artistEmail
        },
        participantProfilePics: {
          [programmerId]: programmerData.profilePicUrl || '',
          [artistId]: ''
        },
        subject: '🌟 New Recommendation',
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadBy: [artistId],
        createdAt: serverTimestamp()
      };

      const convRef = await addDoc(collection(db, 'conversations'), conversationData);
      conversationId = convRef.id;
    }

    // Send notification message
    const notificationText = `I've written a recommendation for you! Here's what I said:\n\n"${recommendationText}"\n\nYou can view all your recommendations in your artist dashboard.`;

    await addMessage(conversationId, programmerId, programmerData, notificationText);

  } catch (error) {
    console.error("Error sending recommendation notification:", error);
    throw error;
  }
}

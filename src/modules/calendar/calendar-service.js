/**
 * calendar-service.js
 * Data operations voor artist gigs/events
 * Handles Firestore queries voor events collectie
 */

import { db } from '../../services/firebase.js';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

/**
 * Event types
 */
export const EVENT_TYPES = {
  GIG: 'gig',
  OPEN_MIC: 'open-mic',
  SLAM: 'slam',
  WORKSHOP: 'workshop',
  FEATURE: 'feature',
  SHOWCASE: 'showcase',
  SLAM_FINALE: 'slam-finale'
};

/**
 * Event type labels (NL)
 */
export const EVENT_TYPE_LABELS = {
  'gig': 'Optreden',
  'open-mic': 'Open Mic',
  'slam': 'Poetry Slam',
  'workshop': 'Workshop',
  'feature': 'Feature',
  'showcase': 'Showcase',
  'slam-finale': 'Slam Finale'
};

/**
 * Voeg een nieuw event toe
 * @param {object} eventData - Event gegevens
 * @param {string} eventData.artistId - UID van de artiest
 * @param {string} eventData.artistName - Stage name van de artiest
 * @param {Date} eventData.date - Datum van het event
 * @param {string} eventData.city - Stad
 * @param {string} eventData.venue - Venue naam
 * @param {string} eventData.type - Event type (gig, open-mic, slam, workshop, feature)
 * @param {string} [eventData.link] - Optionele link naar tickets/info
 * @param {string} [eventData.artistProfilePicUrl] - Profielfoto URL voor snelle weergave
 * @returns {Promise<string>} Event ID
 */
export async function addEvent(eventData) {
  try {
    const { artistId, artistName, date, city, venue, type, link, artistProfilePicUrl } = eventData;

    if (!artistId || !artistName || !date || !city || !venue || !type) {
      throw new Error('Missing required fields: artistId, artistName, date, city, venue, type');
    }

    // Valideer event type
    if (!Object.values(EVENT_TYPES).includes(type)) {
      throw new Error(`Invalid event type: ${type}`);
    }

    const eventDoc = {
      artistId,
      artistName,
      artistProfilePicUrl: artistProfilePicUrl || '',
      date: Timestamp.fromDate(new Date(date)),
      city: city.trim(),
      venue: venue.trim(),
      type,
      link: link?.trim() || '',
      supporters: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'events'), eventDoc);
    console.log('[CALENDAR] Event added:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('[CALENDAR] Error adding event:', error);
    throw error;
  }
}

/**
 * Haal events op voor een specifieke artiest
 * @param {string} artistId - UID van de artiest
 * @param {object} options - Query opties
 * @param {boolean} [options.upcomingOnly=true] - Alleen toekomstige events
 * @param {number} [options.limitCount=10] - Maximum aantal events
 * @returns {Promise<Array>} Array van events
 */
export async function getArtistEvents(artistId, options = {}) {
  try {
    const { upcomingOnly = true, limitCount = 10 } = options;

    const eventsRef = collection(db, 'events');
    let q;

    if (upcomingOnly) {
      const now = Timestamp.fromDate(new Date());
      q = query(
        eventsRef,
        where('artistId', '==', artistId),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        limit(limitCount)
      );
    } else {
      q = query(
        eventsRef,
        where('artistId', '==', artistId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const events = [];

    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || null
      });
    });

    console.log(`[CALENDAR] Fetched ${events.length} events for artist ${artistId}`);
    return events;

  } catch (error) {
    console.error('[CALENDAR] Error fetching artist events:', error);
    return [];
  }
}

/**
 * Haal alle upcoming events op (voor community map)
 * @param {object} options - Query opties
 * @param {number} [options.limitCount=50] - Maximum aantal events
 * @param {number} [options.daysAhead=90] - Hoeveel dagen vooruit
 * @returns {Promise<Array>} Array van events
 */
export async function getAllUpcomingEvents(options = {}) {
  try {
    const { limitCount = 50, daysAhead = 90 } = options;

    // Start van vandaag (00:00:00) om events van vandaag ook op te halen
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('date', '>=', Timestamp.fromDate(now)),
      where('date', '<=', Timestamp.fromDate(futureDate)),
      orderBy('date', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const events = [];

    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || null
      });
    });

    console.log(`[CALENDAR] Fetched ${events.length} upcoming events`);
    return events;

  } catch (error) {
    console.error('[CALENDAR] Error fetching all events:', error);
    return [];
  }
}

/**
 * Haal een specifiek event op
 * @param {string} eventId - Event ID
 * @returns {Promise<object|null>} Event object of null
 */
export async function getEvent(eventId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return null;
    }

    const data = eventSnap.data();
    return {
      id: eventSnap.id,
      ...data,
      date: data.date?.toDate() || null
    };

  } catch (error) {
    console.error('[CALENDAR] Error fetching event:', error);
    return null;
  }
}

/**
 * Update een event
 * @param {string} eventId - Event ID
 * @param {object} updates - Velden om te updaten
 * @returns {Promise<void>}
 */
export async function updateEvent(eventId, updates) {
  try {
    const eventRef = doc(db, 'events', eventId);

    const updateData = { ...updates, updatedAt: serverTimestamp() };

    // Convert date to Timestamp if provided
    if (updates.date) {
      updateData.date = Timestamp.fromDate(new Date(updates.date));
    }

    await updateDoc(eventRef, updateData);
    console.log('[CALENDAR] Event updated:', eventId);

  } catch (error) {
    console.error('[CALENDAR] Error updating event:', error);
    throw error;
  }
}

/**
 * Verwijder een event
 * @param {string} eventId - Event ID
 * @returns {Promise<void>}
 */
export async function deleteEvent(eventId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    console.log('[CALENDAR] Event deleted:', eventId);

  } catch (error) {
    console.error('[CALENDAR] Error deleting event:', error);
    throw error;
  }
}

/**
 * Voeg supporter toe aan event
 * @param {string} eventId - Event ID
 * @param {string} supporterId - UID van de supporter
 * @returns {Promise<void>}
 */
export async function addSupporter(eventId, supporterId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }

    const supporters = eventSnap.data().supporters || [];

    if (!supporters.includes(supporterId)) {
      supporters.push(supporterId);
      await updateDoc(eventRef, {
        supporters,
        updatedAt: serverTimestamp()
      });
      console.log('[CALENDAR] Supporter added to event:', eventId);
    }

  } catch (error) {
    console.error('[CALENDAR] Error adding supporter:', error);
    throw error;
  }
}

/**
 * Verwijder supporter van event
 * @param {string} eventId - Event ID
 * @param {string} supporterId - UID van de supporter
 * @returns {Promise<void>}
 */
export async function removeSupporter(eventId, supporterId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }

    const supporters = (eventSnap.data().supporters || []).filter(id => id !== supporterId);

    await updateDoc(eventRef, {
      supporters,
      updatedAt: serverTimestamp()
    });
    console.log('[CALENDAR] Supporter removed from event:', eventId);

  } catch (error) {
    console.error('[CALENDAR] Error removing supporter:', error);
    throw error;
  }
}

/**
 * Check of een artiest events heeft op een specifieke datum
 * Nuttig voor beschikbaarheidscheck
 * @param {string} artistId - UID van de artiest
 * @param {Date} date - Datum om te checken
 * @returns {Promise<boolean>} True als er events zijn op die datum
 */
export async function hasEventOnDate(artistId, date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('artistId', '==', artistId),
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;

  } catch (error) {
    console.error('[CALENDAR] Error checking date availability:', error);
    return false;
  }
}

/**
 * Format datum voor weergave
 * @param {Date} date - Datum object
 * @returns {string} Geformatteerde datum string
 */
export function formatEventDate(date) {
  if (!date) return '';

  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return date.toLocaleDateString('nl-BE', options);
}

/**
 * Format korte datum (voor lijsten)
 * @param {Date} date - Datum object
 * @returns {string} Korte datum string
 */
export function formatShortDate(date) {
  if (!date) return '';

  const options = {
    day: 'numeric',
    month: 'short'
  };

  return date.toLocaleDateString('nl-BE', options);
}

/**
 * Haal events op binnen een specifiek datumbereik
 * @param {Date} startDate - Start datum
 * @param {Date} endDate - Eind datum
 * @param {object} options - Query opties
 * @param {number} [options.limitCount=100] - Maximum aantal events
 * @returns {Promise<Array>} Array van events gesorteerd op datum
 */
export async function getEventsForDateRange(startDate, endDate, options = {}) {
  try {
    const { limitCount = 100 } = options;

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('date', '>=', Timestamp.fromDate(new Date(startDate))),
      where('date', '<=', Timestamp.fromDate(new Date(endDate))),
      orderBy('date', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const events = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate() || null,
        // Ensure new fields have defaults
        isClusterEvent: data.isClusterEvent || false,
        eventName: data.eventName || null,
        eventTime: data.eventTime || null,
        participants: data.participants || [],
        attendees: data.attendees || [],
        attendeeCount: data.attendeeCount || 0,
        coordinates: data.coordinates || null
      });
    });

    console.log(`[CALENDAR] Fetched ${events.length} events for date range`);
    return events;

  } catch (error) {
    console.error('[CALENDAR] Error fetching events for date range:', error);
    return [];
  }
}

/**
 * Groepeer events per datum
 * @param {Array} events - Array van events
 * @returns {Map<string, Array>} Map met dateString als key en events array als value
 */
export function getEventsGroupedByDate(events) {
  const grouped = new Map();

  events.forEach(event => {
    if (!event.date) return;

    // Format date as YYYY-MM-DD
    const dateString = event.date.toISOString().split('T')[0];

    if (!grouped.has(dateString)) {
      grouped.set(dateString, []);
    }

    grouped.get(dateString).push(event);
  });

  // Sort events within each date by time if available
  grouped.forEach((dayEvents, dateString) => {
    dayEvents.sort((a, b) => {
      // If eventTime is available, sort by that
      if (a.eventTime && b.eventTime) {
        return a.eventTime.localeCompare(b.eventTime);
      }
      // Otherwise keep original order (by date from query)
      return 0;
    });
  });

  console.log(`[CALENDAR] Grouped ${events.length} events into ${grouped.size} dates`);
  return grouped;
}

/**
 * Haal event counts per datum op voor Date Tape heatmap
 * @param {Date} startDate - Start datum
 * @param {Date} endDate - Eind datum
 * @returns {Promise<Object>} Object met dateString als keys en counts als values
 */
export async function getEventCountsPerDate(startDate, endDate) {
  try {
    const events = await getEventsForDateRange(startDate, endDate, { limitCount: 200 });
    const counts = {};

    events.forEach(event => {
      if (!event.date) return;

      // Use local date formatting instead of UTC
      const eventDate = event.date instanceof Date ? event.date : event.date.toDate();
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    console.log(`[CALENDAR] Event counts calculated for ${Object.keys(counts).length} dates`);
    return counts;

  } catch (error) {
    console.error('[CALENDAR] Error getting event counts:', error);
    return {};
  }
}

/**
 * Toggle "Ik ga ook" attendance voor een event
 * @param {string} eventId - Event ID
 * @param {string} userId - UID van de user
 * @returns {Promise<boolean>} True als user nu attending is, false als removed
 */
export async function toggleAttendance(eventId, userId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }

    const data = eventSnap.data();
    const attendees = data.attendees || [];
    const isAttending = attendees.includes(userId);

    let newAttendees;
    let newCount;

    if (isAttending) {
      // Remove user from attendees
      newAttendees = attendees.filter(id => id !== userId);
      newCount = Math.max(0, (data.attendeeCount || 0) - 1);
    } else {
      // Add user to attendees
      newAttendees = [...attendees, userId];
      newCount = (data.attendeeCount || 0) + 1;
    }

    await updateDoc(eventRef, {
      attendees: newAttendees,
      attendeeCount: newCount
    });

    console.log(`[CALENDAR] Attendance toggled for event ${eventId}, user ${userId}: ${!isAttending}`);
    return !isAttending;

  } catch (error) {
    console.error('[CALENDAR] Error toggling attendance:', error);
    throw error;
  }
}

/**
 * Haal alle attendees op voor events van een artiest
 * @param {string} artistId - UID van de artiest
 * @returns {Promise<Array>} Array van {event, attendees} objecten
 */
export async function getAttendeeNotifications(artistId) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('artistId', '==', artistId),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    const notifications = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // FIX: Check of attendees bestaat EN niet leeg is EN niet alleen de artiest zelf bevat
      const attendees = data.attendees || [];
      // Filter de artiest zelf eruit
      const otherAttendees = attendees.filter(uid => uid !== artistId);

      if (otherAttendees.length > 0) {
        notifications.push({
          eventId: doc.id,
          venue: data.venue,
          city: data.city,
          date: data.date?.toDate() || null,
          attendees: otherAttendees,
          attendeeCount: otherAttendees.length
        });
      }
    });

    return notifications;
  } catch (error) {
    console.error('[CALENDAR] Error fetching attendee notifications:', error);
    return [];
  }
}

/**
 * Haal profiel info op voor een lijst van user IDs
 * @param {Array} userIds - Array van user UIDs
 * @returns {Promise<Array>} Array van user profiles
 */
export async function getAttendeeProfiles(userIds) {
  if (!userIds || userIds.length === 0) return [];

  try {
    const profiles = [];

    // Haal profielen op (check eerst artists, dan programmers)
    for (const uid of userIds.slice(0, 20)) { // Max 20 om queries te beperken
      // Probeer artist
      let userDoc = await getDoc(doc(db, 'artists', uid));

      if (!userDoc.exists()) {
        // Probeer programmer
        userDoc = await getDoc(doc(db, 'programmers', uid));
      }

      if (userDoc.exists()) {
        const data = userDoc.data();
        profiles.push({
          uid: uid,
          name: data.stageName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Anoniem',
          profilePicUrl: data.profilePicUrl || null,
          role: data.role || 'user'
        });
      } else {
        profiles.push({
          uid: uid,
          name: 'Community lid',
          profilePicUrl: null,
          role: 'user'
        });
      }
    }

    return profiles;
  } catch (error) {
    console.error('[CALENDAR] Error fetching attendee profiles:', error);
    return [];
  }
}

/**
 * Check of een user attending is voor een event
 * @param {string} eventId - Event ID
 * @param {string} userId - UID van de user
 * @returns {Promise<boolean>} True als user attending is
 */
export async function isUserAttending(eventId, userId) {
  try {
    const event = await getEvent(eventId);
    if (!event) return false;

    const attendees = event.attendees || [];
    return attendees.includes(userId);

  } catch (error) {
    console.error('[CALENDAR] Error checking attendance:', error);
    return false;
  }
}

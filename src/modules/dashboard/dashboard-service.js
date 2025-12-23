/**
 * dashboard-service.js
 * Data operations for artist dashboard
 * Handles Firestore queries for bookings, statistics, and profile data
 */

import { db } from '../../services/firebase.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob) {
  if (!dob) return null;

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Fetch artist profile data
 */
export async function fetchArtistProfile(uid) {
  try {
    const artistRef = doc(db, 'artists', uid);
    const artistSnap = await getDoc(artistRef);

    if (!artistSnap.exists()) {
      console.warn("Artist profile not found:", uid);
      return null;
    }

    return { id: artistSnap.id, ...artistSnap.data() };
  } catch (error) {
    console.error("Error fetching artist profile:", error);
    throw error;
  }
}

/**
 * Update artist profile in Firestore
 */
export async function updateArtistProfile(uid, profileData, profilePicFile = null, documentFile = null) {
  try {
    const docRef = doc(db, 'artists', uid);
    const storage = getStorage();
    const dataToUpdate = { ...profileData };

    // Handle profile picture upload
    if (profilePicFile) {
      console.log("Uploading profile picture...");
      const storageRef = ref(storage, `artists/${uid}/profile.jpg`);
      const snapshot = await uploadBytes(storageRef, profilePicFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Profile picture uploaded:", downloadURL);
      dataToUpdate.profilePicUrl = downloadURL;
    }

    // Handle document upload
    if (documentFile) {
      console.log("Uploading document...");
      const fileExtension = documentFile.name.split('.').pop();
      const storageRef = ref(storage, `artists/${uid}/document.${fileExtension}`);
      const snapshot = await uploadBytes(storageRef, documentFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Document uploaded:", downloadURL);
      dataToUpdate.documentUrl = downloadURL;
      dataToUpdate.documentName = documentFile.name;
    }

    // Update Firestore
    await updateDoc(docRef, dataToUpdate);
    console.log("Profile updated successfully");

    return dataToUpdate;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/**
 * Fetch artist bookings/gigs (placeholder for future implementation)
 */
export async function fetchArtistBookings(uid) {
  try {
    // TODO: Implement bookings collection query
    // For now, return empty array
    console.log("Fetching bookings for artist:", uid);
    return [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

/**
 * Fetch artist statistics (placeholder for future implementation)
 */
export async function fetchArtistStats(uid) {
  try {
    // TODO: Implement stats aggregation
    // For now, return placeholder stats
    console.log("Fetching stats for artist:", uid);

    return {
      profileViews: 0,
      messageCount: 0,
      recommendationCount: 0,
      bookings: 0
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      profileViews: 0,
      messageCount: 0,
      recommendationCount: 0,
      bookings: 0
    };
  }
}

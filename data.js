// BELANGRIJKE FIX: 'getDoc' hier geïmporteerd
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase.js';
import { setStore } from './store.js';
import { setLanguage } from './translations.js';

/**
 * Haalt de profielgegevens van de gebruiker op uit Firestore
 * en slaat deze op in de global store.
 * 
 * FIX: Deze functie voegt nu de 'role', 'uid' en 'email' velden toe
 * aan het currentUserData object zodat messaging.js toegang heeft tot senderRole.
 */
export async function fetchUserData(uid) {
  if (!uid) return null;

  try {
    // 1. Haal eerst de 'role' op uit de 'users' collectie
    const userRoleRef = doc(db, 'users', uid);
    const userRoleSnap = await getDoc(userRoleRef);

    if (!userRoleSnap.exists()) {
      throw new Error("Gebruikersrol niet gevonden in /users/" + uid);
    }
    
    const userData = userRoleSnap.data();
    const role = userData.role;
    const email = userData.email;
    
    setStore('userRole', role); // Sla de rol op

    // 2. Haal het volledige profiel op uit de specifieke collectie (artists/programmers)
    let userProfile = null;
    let userProfileSnap = null;

    if (role === 'artist') {
      const artistRef = doc(db, 'artists', uid);
      userProfileSnap = await getDoc(artistRef);
      userProfile = userProfileSnap.data();
    } else if (role === 'programmer') {
      const programmerRef = doc(db, 'programmers', uid);
      userProfileSnap = await getDoc(programmerRef);
      userProfile = userProfileSnap.data();
    } else {
      throw new Error(`Onbekende rol: ${role}`);
    }

    if (!userProfile) {
      // Probeer de snapshot data te gebruiken als userProfile leeg is
      if (userProfileSnap && userProfileSnap.exists()) {
        userProfile = userProfileSnap.data();
      } else {
        throw new Error(`Profiel niet gevonden in /${role}s/` + uid);
      }
    }

    // ⭐ FIX: Voeg role, uid, en email toe aan userProfile
    // Dit zorgt ervoor dat messaging.js toegang heeft tot senderRole
    const completeUserData = {
      ...userProfile,
      role: role,      // ⭐ Voeg role toe
      uid: uid,        // ⭐ Voeg uid toe
      email: email     // ⭐ Voeg email toe (als backup)
    };

    // 3. Sla de volledige profielgegevens op in de store
    setStore('currentUserData', completeUserData);
    console.log("Gebruikersprofiel geladen met role:", { uid, email, role, status: completeUserData.status });

    // 4. Set user's language preference (defaults to 'nl' if not set)
    const userLanguage = userProfile.language || 'nl';
    setLanguage(userLanguage);

    return completeUserData;

  } catch (error) {
    console.error("Fout bij ophalen gebruikersgegevens:", error);
    setStore('currentUserData', null);
    setStore('userRole', null);
    throw error; // Gooi de fout door zodat auth.js het kan opvangen
  }
}
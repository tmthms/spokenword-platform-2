/**
 * auth.js
 * Beheert alle authenticatie-logica: inloggen, registreren,
 * uitloggen, en het controleren van de auth-status.
 */

// Importeer de Firebase-services die we nodig hebben
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from './firebase.js'; // Haal de geïnitialiseerde 'auth' en 'db' op

// Importeer de UI-functies en de "store" (globale state)
import { showPage, updateNav, showDashboard } from '../ui/ui.js';
import { setStore, getStore } from '../utils/store.js';
import { fetchUserData } from './data.js';
import { setupBadgeListener, stopBadgeListener } from '../modules/messaging/messaging-controller.js';
import { getCheckboxValues } from '../utils/checkbox-helpers.js';

// --- HULPFUNCTIES ---

/**
 * Toont een foutmelding op een specifiek formulier.
 * @param {string} formId - De ID van het formulier (bv. 'login-form').
 * @param {string} message - De foutmelding die getoond moet worden.
 */
function showAuthError(formId, message) {
  const errorEl = document.getElementById(`${formId}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  } else {
    console.error(`Fout-element niet gevonden voor formulier: ${formId}`, message);
  }
}

// ⭐ REMOVED: getSelectValues() is no longer needed, we use getCheckboxValues() from checkbox-helpers.js

// --- FORMULIER-HANDLERS ---

/**
 * Verwerkt de inlog-poging.
 */
export async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  console.log("[LOGIN] Attempting login for:", email);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // De onAuthStateChanged-listener (in monitorAuthState)
    // zal de rest afhandelen (data ophalen, dashboard tonen).
  } catch (error) {
    console.error("Login mislukt:", error);
    errorEl.textContent = error.message;
  }
}

/**
 * Verwerkt de registratie van een nieuwe artiest.
 */
export async function handleArtistSignup(e) {
  e.preventDefault();
  const errorEl = document.getElementById('artist-signup-error');
  errorEl.textContent = '';
  
  // Haal formulierwaarden op
  const email = document.getElementById('artist-email').value;
  const password = document.getElementById('artist-password').value;

  try {
    // 1. Maak de gebruiker aan in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Maak het profiel aan in Firestore
    // (a) Maak het 'users' document (voor snelle rol-check)
    const userDocRef = doc(db, `users/${user.uid}`);
    await setDoc(userDocRef, {
        role: 'artist',
        email: email,
        status: 'active' // Artiesten zijn direct actief
    });

    // (b) Maak het 'artists' document (het volledige profiel)
    const artistDocRef = doc(db, `artists/${user.uid}`);
    const artistData = {
        uid: user.uid,
        email: email,
        firstName: document.getElementById('artist-firstname').value,
        lastName: document.getElementById('artist-lastname').value,
        stageName: document.getElementById('artist-stagename').value,
        phone: document.getElementById('artist-phone').value,
        dob: document.getElementById('artist-dob').value,
        gender: document.getElementById('artist-gender').value,
        location: document.getElementById('artist-location').value,
        genres: getCheckboxValues('artist-genres'),
        languages: getCheckboxValues('artist-languages'),
        paymentMethods: getCheckboxValues('artist-payment'),
        bio: document.getElementById('artist-bio').value,
        pitch: document.getElementById('artist-pitch').value,
        notifyEmail: document.getElementById('artist-notify-email').checked,
        notifySms: document.getElementById('artist-notify-sms').checked,
        createdAt: new Date().toISOString(),
        profilePicUrl: '', // Wordt later toegevoegd
        videoUrl: '',
        audioUrl: '',
        textContent: '',
        published: true // Artiesten zijn standaard gepubliceerd
    };
    await setDoc(artistDocRef, artistData);
    
    // De onAuthStateChanged-listener zal de rest afhandelen.

  } catch (error) {
    console.error("Registratie artiest mislukt:", error);
    errorEl.textContent = error.message;
  }
}

/**
 * Verwerkt de registratie van een nieuwe programmeur.
 */
export async function handleProgrammerSignup(e) {
  e.preventDefault();
  const errorEl = document.getElementById('programmer-signup-error');
  errorEl.textContent = '';
  
  const email = document.getElementById('prog-email').value;
  const password = document.getElementById('prog-password').value;

  try {
    // 1. Maak de gebruiker aan in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Maak de profielen aan in Firestore
    // (a) Maak het 'users' document (voor snelle rol-check)
    const userDocRef = doc(db, `users/${user.uid}`);
    await setDoc(userDocRef, {
        role: 'programmer',
        email: email,
        status: 'pending' // Programmeurs moeten worden goedgekeurd
    });
    
    // (b) Maak het 'programmers' document (het volledige profiel)
    const programmerDocRef = doc(db, `programmers/${user.uid}`);
    const programmerData = {
        uid: user.uid,
        email: email,
        firstName: document.getElementById('prog-firstname').value,
        lastName: document.getElementById('prog-lastname').value,
        phone: document.getElementById('prog-phone').value,
        organizationName: document.getElementById('prog-org-name').value,
        organizationAbout: document.getElementById('prog-org-about').value,
        website: document.getElementById('prog-website').value,
        notifyEmail: document.getElementById('prog-notify-email').checked,
        createdAt: new Date().toISOString(),
        status: 'pending', // Needs admin approval per MVP doc
        trialStartedAt: new Date().toISOString()
    };
    await setDoc(programmerDocRef, programmerData);

    // De onAuthStateChanged-listener zal de rest afhandelen.

  } catch (error) {
    console.error("Registratie programmeur mislukt:", error);
    errorEl.textContent = error.message;
  }
}

/**
 * Verwerkt het uitloggen.
 * DIT IS DE FIX: 'export' toegevoegd
 */
export function handleLogout() {
  // Stop badge listener
  stopBadgeListener();
  // Logout
  signOut(auth).catch(error => console.error("Logout mislukt:", error));
}


// --- HOOFDFUNCTIES (te importeren in main.js) ---

/**
 * Luistert naar de algemene inlogstatus van Firebase.
 * Dit is de "hoofdschakelaar" van de app.
 */
export function monitorAuthState() {
  const loadingView = document.getElementById('loading-view');

  console.log('[AUTH] Setting up onAuthStateChanged listener...');

  // Add a timeout to prevent infinite loading
  const loadingTimeout = setTimeout(() => {
    console.error('[AUTH] ⚠️ Auth state listener did not fire within 10 seconds!');
    console.error('[AUTH] This usually means Firebase is not initialized correctly.');
    if (loadingView) {
      loadingView.innerHTML = `
        <div class="text-center p-8 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
          <h1 class="text-2xl font-bold mb-4 text-red-600">Initialization Error</h1>
          <p class="mb-4">Firebase authentication failed to initialize.</p>
          <p class="text-sm text-gray-600">Please check the browser console for details.</p>
          <button onclick="location.reload()" class="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      `;
    }
  }, 10000); // 10 second timeout

  onAuthStateChanged(auth, async (user) => {
    // Clear the timeout since auth state changed
    clearTimeout(loadingTimeout);
    if (user) {
      // Gebruiker is ingelogd
      console.log("Auth state change: User logged in:", user.uid);
      // Sla het Firebase user object op in de store
      setStore('currentUser', user);
      // Haal de profielgegevens van de gebruiker op (uit 'users' en 'artists'/'programmers')
      try {
        await fetchUserData(user.uid);
        // Werk de navigatiebalk bij
        updateNav(user);
        // Setup real-time badge listener (Fase 2.5)
        setupBadgeListener();
        // Toon het juiste dashboard (artiest of programmeur)
        showDashboard();
      } catch (error) {
        console.error("Fout bij ophalen van gebruikersdata na inloggen:", error);
        // Als het ophalen van data mislukt, log de gebruiker uit voor de veiligheid
        handleLogout();
        showPage('login-view');
        showAuthError('login-form', `Kon profiel niet laden: ${error.message}`);
      }
      
    } else {
      // Gebruiker is uitgelogd
      console.log("Auth state change: User logged out");
      // Stop badge listener
      stopBadgeListener();
      setStore('currentUser', null);
      updateNav(null);
      // Toon de homepagina en verberg de lader
      showPage('home-view');
    }
    // Verberg de lader (pas nadat alles klaar is)
    // FIX 3: Null-safe style guard
    if (loadingView) loadingView.style.display = 'none';
  });
}

/**
 * Updates user email address
 * @param {string} newEmail - New email address
 * @param {string} currentPassword - Current password for reauthentication
 * @returns {Promise<void>}
 */
export async function updateUserEmail(newEmail, currentPassword) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user logged in");
  }

  // Reauthenticate user before email change (Firebase requirement)
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update email in Firebase Auth
  await updateEmail(user, newEmail);

  // Update email in Firestore users collection
  const userDocRef = doc(db, `users/${user.uid}`);
  await updateDoc(userDocRef, { email: newEmail });

  // Update email in role-specific collection (artists or programmers)
  const currentUserData = getStore('currentUserData');
  if (currentUserData?.role === 'artist') {
    const artistDocRef = doc(db, `artists/${user.uid}`);
    await updateDoc(artistDocRef, { email: newEmail });
  } else if (currentUserData?.role === 'programmer') {
    const programmerDocRef = doc(db, `programmers/${user.uid}`);
    await updateDoc(programmerDocRef, { email: newEmail });
  }

  console.log('[AUTH] Email updated successfully');
}

/**
 * Updates user password
 * @param {string} currentPassword - Current password for reauthentication
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export async function updateUserPassword(currentPassword, newPassword) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user logged in");
  }

  // Reauthenticate user before password change (Firebase requirement)
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password in Firebase Auth
  await updatePassword(user, newPassword);

  console.log('[AUTH] Password updated successfully');
}

// ⭐ REMOVED: initAuth() - all form handling is now done via global event delegation in ui.js
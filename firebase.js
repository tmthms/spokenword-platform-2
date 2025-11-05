// Importeer de *originele* Firebase functies
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// De configuratie van uw NIEUWE Firebase-project
// Zorg ervoor dat dit de config is die u zojuist heeft gekopieerd
const firebaseConfig = {
  // Plak hier de NIEUWE firebaseConfig uit uw
  // NIEUWE Firebase-projectinstellingen
  apiKey: "AIzaSyBUId9LHYCGIJgXAXBFhxn9-68_PFzQ5oo",
  authDomain: "dans-dichter-db.firebaseapp.com",
  projectId: "dans-dichter-db",
  storageBucket: "dans-dichter-db.firebasestorage.app",
  messagingSenderId: "112694272627",
  appId: "1:112694272627:web:2758ed2393181aff320006",
  measurementId: "G-W7VYHZNC3D"
};

// Initialiseer Firebase
const app = initializeApp(firebaseConfig);

// Maak en EXPORTEER de services die we in andere bestanden gaan gebruiken
// Dit lost de "db is not exported" fout op.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
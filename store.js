// Dit is een simpele "global store" om data tussen modules te delen
// (bijv. de ingelogde gebruiker, hun rol, en hun profiel)

// Sla de data op in een privaat object
const state = {
  currentUser: null,     // Het 'auth' object van Firebase
  userRole: null,        // 'artist' of 'programmer'
  currentUserData: null, // Het volledige profiel-object uit Firestore
};

/**
 * Haalt een waarde op uit de global state.
 * @param {string} key - De sleutel (currentUser, userRole, currentUserData)
 * @returns {*} De opgeslagen waarde
 */
export function getStore(key) {
  return state[key];
}

/**
 * Slaat een waarde op in de global state.
 * @param {string} key - De sleutel (currentUser, userRole, currentUserData)
 * @param {*} value - De waarde om op te slaan
 */
export function setStore(key, value) {
  state[key] = value;
}


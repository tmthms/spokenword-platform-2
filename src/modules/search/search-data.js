/**
 * search-data.js
 * Handles all Firebase queries and data fetching for artist search
 * No DOM manipulation - pure data operations
 */

import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from '../../services/firebase.js';
import { getStore } from '../../utils/store.js';

/**
 * Security: Check if user is authenticated (programmer OR artist)
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticatedUser() {
  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');
  const userRole = currentUserData?.role;

  console.log('[AUTH CHECK] currentUser:', currentUser ? 'EXISTS (uid: ' + currentUser.uid + ')' : 'NULL');
  console.log('[AUTH CHECK] userRole:', userRole);

  if (!currentUser) {
    console.warn("[AUTH CHECK] ❌ Access denied: No currentUser in store");
    return false;
  }

  if (userRole !== 'programmer' && userRole !== 'artist') {
    console.warn("[AUTH CHECK] ❌ Access denied: userRole is not 'programmer' or 'artist', got:", userRole);
    return false;
  }

  console.log("[AUTH CHECK] ✅ Authentication passed - User is authenticated " + userRole);
  return true;
}

/**
 * Check if current user is a programmer (for privileged actions)
 * @returns {boolean} True if programmer, false otherwise
 */
export function isProgrammer() {
  const currentUserData = getStore('currentUserData');
  return currentUserData?.role === 'programmer';
}

/**
 * Security: Check if user is authenticated as a programmer
 * @deprecated Use isAuthenticatedUser() and isProgrammer() instead
 * @returns {boolean} True if authenticated programmer, false otherwise
 */
export function isAuthenticatedProgrammer() {
  return isAuthenticatedUser() && isProgrammer();
}

/**
 * Security: Require authentication for search operations
 * Redirects to login if not authenticated
 */
export function requireAuth() {
  console.log("[REQUIRE AUTH] Checking authentication...");

  if (!isAuthenticatedUser()) {
    console.error("[REQUIRE AUTH] ❌ Access denied: Redirecting to login");
    alert("You must be logged in to access this page.");

    import('../../ui/ui.js').then(module => {
      module.showPage('login-view');
    });
    return false;
  }
  return true;
}

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
 * Load all available genres from published artists
 * @returns {Promise<Array<string>>} Sorted array of unique genres
 */
export async function loadAvailableGenres() {
  try {
    const snapshot = await getDocs(query(collection(db, 'artists'), where('published', '==', true)));
    const genreSet = new Set();

    snapshot.forEach((docSnap) => {
      const genres = docSnap.data().genres || [];
      genres.forEach(g => {
        if (g && typeof g === 'string') {
          genreSet.add(g.trim());
        }
      });
    });

    const genreArray = Array.from(genreSet).sort();
    console.log(`📋 Loaded ${genreArray.length} unique genres:`, genreArray);
    return genreArray;
  } catch (error) {
    console.error('❌ Error loading genres:', error);
    return [];
  }
}

/**
 * Fetch a single artist by ID
 * @param {string} artistId - The artist's document ID
 * @returns {Promise<object|null>} Artist data or null if not found
 */
export async function fetchArtistById(artistId) {
  try {
    console.log("Fetching artist data:", artistId);

    const artistRef = doc(db, 'artists', artistId);
    const artistSnap = await getDoc(artistRef);

    if (!artistSnap.exists()) {
      console.warn("Artist not found:", artistId);
      return null;
    }

    return { id: artistSnap.id, ...artistSnap.data() };
  } catch (error) {
    console.error("Error fetching artist:", error);
    throw error;
  }
}

/**
 * Load artists with filters (SECURED + FIXED v2 - Normalize spaces/dashes)
 * @param {object} filters - Filter values from UI
 * @returns {Promise<Array>} Filtered artists array
 */
export async function loadArtistsData(filters = {}) {
  // Security check: Only allow authenticated programmers
  if (!requireAuth()) {
    throw new Error("Authentication required");
  }

  // Helper function to normalize values (trim, lowercase, replace spaces with dashes)
  const normalize = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  };

  try {
    const {
      nameFilter = '',
      locationFilter = '',
      genderFilter = '',
      paymentFilters = [],
      genreFilters = [],
      languageFilters = [],
      ageMin = null,
      ageMax = null,
      themeFilters = [],
      energyFilters = [],
      formatFilters = [],
      keywordsFilter = ''
    } = filters;

    console.log("🔍 Filter values:", {
      nameFilter,
      locationFilter,
      genderFilter,
      paymentFilters,
      genreFilters,
      languageFilters,
      ageRange: ageMin !== null || ageMax !== null ? `${ageMin || 'any'}-${ageMax || 'any'}` : 'not set',
      themeFilters,
      energyFilters,
      formatFilters,
      keywordsFilter
    });

    // Build Firestore query
    let q = query(collection(db, 'artists'), where('published', '==', true));

    // Add gender filter if selected
    if (genderFilter) {
      q = query(q, where('gender', '==', genderFilter));
    }

    // Fetch all artists
    const snapshot = await getDocs(q);
    console.log(`📊 Found ${snapshot.size} artists before client-side filtering`);

    let artists = [];
    snapshot.forEach((doc) => {
      artists.push({ id: doc.id, ...doc.data() });
    });

    // Exclude current user if they are also an artist (prevents showing own profile)
    const currentUser = getStore('currentUser');
    if (currentUser) {
      const beforeCount = artists.length;
      artists = artists.filter(artist => artist.id !== currentUser.uid);
      if (beforeCount > artists.length) {
        console.log(`🚫 Filtered out current user's own profile`);
      }
    }

    // DEBUG: Log first artist's data structure
    if (artists.length > 0) {
      console.log("📋 Sample artist data:", {
        id: artists[0].id,
        stageName: artists[0].stageName,
        genres: artists[0].genres,
        genresNormalized: artists[0].genres?.map(g => normalize(g)),
        paymentMethods: artists[0].paymentMethods,
        paymentsNormalized: artists[0].paymentMethods?.map(p => normalize(p)),
        languages: artists[0].languages
      });
    }

    // Client-side filtering

    // Filter by name (stage name or full name)
    if (nameFilter) {
      artists = artists.filter(artist => {
        const stageName = (artist.stageName || '').toLowerCase();
        const fullName = `${artist.firstName || ''} ${artist.lastName || ''}`.toLowerCase();
        return stageName.includes(nameFilter) || fullName.includes(nameFilter);
      });
      console.log(`🔍 After name filter: ${artists.length} artists`);
    }

    // Filter by location
    if (locationFilter) {
      artists = artists.filter(artist => {
        const location = (artist.location || '').toLowerCase();
        return location.includes(locationFilter);
      });
      console.log(`📍 After location filter: ${artists.length} artists`);
    }

    // Filter by payment methods (checkboxes - any match)
    if (paymentFilters.length > 0) {
      console.log(`💳 Filtering by payment methods:`, paymentFilters);

      let debugLogged = false;
      artists = artists.filter(artist => {
        const artistPayments = (artist.paymentMethods || []).map(p => normalize(p));

        // DEBUG: Log comparison for first artist only once
        if (!debugLogged) {
          console.log(`  Sample artist payment methods (normalized):`, artistPayments);
          console.log(`  Filter payment methods (normalized):`, paymentFilters);
          debugLogged = true;
        }

        // Artist must have at least one of the selected payment methods
        const hasMatch = paymentFilters.some(payment => artistPayments.includes(payment));
        return hasMatch;
      });

      console.log(`💳 After payment filter: ${artists.length} artists`);
    }

    // Filter by genres (checkboxes - any match)
    if (genreFilters.length > 0) {
      console.log(`🎭 Filtering by genres:`, genreFilters);

      let debugLogged = false;
      artists = artists.filter(artist => {
        const artistGenres = (artist.genres || []).map(g => normalize(g));

        // DEBUG: Log comparison for first artist only once
        if (!debugLogged) {
          console.log(`  Sample artist genres (normalized):`, artistGenres);
          console.log(`  Filter genres (normalized):`, genreFilters);
          debugLogged = true;
        }

        // Artist must have at least one of the selected genres
        const hasMatch = genreFilters.some(genre => artistGenres.includes(genre));
        return hasMatch;
      });

      console.log(`🎭 After genre filter: ${artists.length} artists`);
    }

    // Filter by languages (checkboxes - any match)
    if (languageFilters.length > 0) {
      console.log(`🗣️ Filtering by languages:`, languageFilters);

      let debugLogged = false;
      artists = artists.filter(artist => {
        const artistLanguages = (artist.languages || [])
          .filter(l => l && typeof l === 'string')
          .map(l => l.toLowerCase().trim());

        // DEBUG: Log comparison for first artist only once
        if (!debugLogged) {
          console.log(`  Sample artist languages (lowercase):`, artistLanguages);
          console.log(`  Filter languages (lowercase):`, languageFilters);
          debugLogged = true;
        }

        // Artist must have at least one of the selected languages
        const hasMatch = languageFilters.some(lang => artistLanguages.includes(lang));
        return hasMatch;
      });

      console.log(`🗣️ After language filter: ${artists.length} artists`);
    }

    // Filter by age (only if age filters are set)
    if (ageMin !== null || ageMax !== null) {
      artists = artists.filter(artist => {
        if (!artist.dob) return false; // Exclude artists without birthdate when age filter is active

        const age = calculateAge(artist.dob);
        const meetsMin = ageMin === null || age >= ageMin;
        const meetsMax = ageMax === null || age <= ageMax;
        return meetsMin && meetsMax;
      });
      console.log(`🎂 After age filter: ${artists.length} artists`);
    }

    // Filter by themes (any match)
    if (themeFilters.length > 0) {
      console.log(`🎨 Filtering by themes:`, themeFilters);

      let debugLogged = false;
      artists = artists.filter(artist => {
        const artistThemes = (artist.themes || [])
          .filter(t => t && typeof t === 'string')
          .map(t => normalize(t));

        // DEBUG: Log comparison for first artist only once
        if (!debugLogged) {
          console.log(`  Sample artist themes (normalized):`, artistThemes);
          console.log(`  Filter themes (normalized):`, themeFilters);
          debugLogged = true;
        }

        // Artist must have at least one of the selected themes
        const hasMatch = themeFilters.some(theme => artistThemes.includes(theme));
        return hasMatch;
      });

      console.log(`🎨 After themes filter: ${artists.length} artists`);
    }

    // Filter by energy levels (any match)
    if (energyFilters.length > 0) {
      console.log(`⚡ Filtering by energy:`, energyFilters);
      console.log('[DEBUG] Energy filters:', energyFilters);

      let debugLogged = false;
      artists = artists.filter(artist => {
        const artistEnergy = (artist.energyLevels || [])
          .filter(e => e && typeof e === 'string')
          .map(e => e.toLowerCase().trim());

        // DEBUG: Log comparison for first artist only once
        if (!debugLogged) {
          console.log('[DEBUG] First artist:', artist.stageName, 'energyLevels:', artist.energyLevels, 'normalized:', artistEnergy);
          console.log(`  Sample artist energy (lowercase):`, artistEnergy);
          console.log(`  Filter energy (lowercase):`, energyFilters);
          debugLogged = true;
        }

        // Artist must have at least one of the selected energy levels
        const hasMatch = energyFilters.some(energy => artistEnergy.includes(energy));

        if (!debugLogged) {
          console.log('[DEBUG] Match:', hasMatch);
        }

        return hasMatch;
      });

      console.log(`⚡ After energy filter: ${artists.length} artists`);
      console.log('[FILTER] After energy:', artists.length);
    }

    // Filter by formats (any match)
    if (formatFilters.length > 0) {
      console.log(`🎭 Filtering by formats:`, formatFilters);

      let debugLogged = false;
      artists = artists.filter(artist => {
        const artistFormats = (artist.formats || [])
          .filter(f => f && typeof f === 'string')
          .map(f => normalize(f));

        // DEBUG: Log comparison for first artist only once
        if (!debugLogged) {
          console.log(`  Sample artist formats (normalized):`, artistFormats);
          console.log(`  Filter formats (normalized):`, formatFilters);
          debugLogged = true;
        }

        // Artist must have at least one of the selected formats
        const hasMatch = formatFilters.some(format => artistFormats.includes(format));
        return hasMatch;
      });

      console.log(`🎭 After formats filter: ${artists.length} artists`);
    }

    // Filter by keywords (search in bio, pitch, genres, stageName)
    if (keywordsFilter) {
      const keywords = keywordsFilter.split(/[,\s]+/).filter(k => k.length > 0);

      artists = artists.filter(artist => {
        const searchText = [
          artist.stageName || '',
          artist.bio || '',
          artist.pitch || '',
          ...(artist.genres || []),
          ...(artist.keywords || [])
        ].join(' ').toLowerCase();

        // Artist must match ALL keywords
        return keywords.every(keyword => searchText.includes(keyword));
      });

      console.log(`🔑 After keywords filter: ${artists.length} artists`);
    }

    console.log(`✅ ${artists.length} artists after all filtering`);

    return artists;

  } catch (error) {
    console.error("❌ Error loading artists:", error);
    console.error("Full error details:", error);

    // Check if it's a Firestore index error
    if (error.message && error.message.includes('index')) {
      console.error("🔗 FIRESTORE INDEX REQUIRED!");
      console.error("Click this link to create the index:", error.message.match(/https:\/\/[^\s]+/)?.[0]);
    }

    throw error;
  }
}

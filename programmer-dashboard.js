/**
 * SECURE programmer-dashboard.js v2.2
 * Met authentication guards, age filtering, payment filtering, en browser history
 * CRITICAL SECURITY UPDATE: Alle sensitive functies nu beveiligd tegen ongeautoriseerde toegang
 */

import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from './firebase.js';
import { getStore, setStore } from './store.js';
import { openMessageModal } from './messaging.js';

/**
 * Security: Check if user is authenticated as a programmer
 * @returns {boolean} True if authenticated programmer, false otherwise
 */
function isAuthenticatedProgrammer() {
  const currentUser = getStore('currentUser');
  const userRole = getStore('userRole');
  
  // DEBUG: Log wat we hebben
  console.log('[AUTH CHECK] currentUser:', currentUser ? 'EXISTS (uid: ' + currentUser.uid + ')' : 'NULL');
  console.log('[AUTH CHECK] userRole:', userRole);
  
  if (!currentUser) {
    console.warn("[AUTH CHECK] ❌ Access denied: No currentUser in store");
    return false;
  }
  
  if (userRole !== 'programmer') {
    console.warn("[AUTH CHECK] ❌ Access denied: userRole is not 'programmer', got:", userRole);
    return false;
  }
  
  console.log("[AUTH CHECK] ✅ Authentication passed - User is authenticated programmer");
  return true;
}

/**
 * Security: Require authentication for sensitive operations
 * Redirects to login if not authenticated
 */
function requireAuth() {
  console.log("[REQUIRE AUTH] Checking authentication...");
  
  if (!isAuthenticatedProgrammer()) {
    console.error("[REQUIRE AUTH] ❌ Access denied: Redirecting to login");
    console.error("[REQUIRE AUTH] TIP: Check if auth.js properly sets store values:");
    console.error("[REQUIRE AUTH]   - setStore('currentUser', user)");
    console.error("[REQUIRE AUTH]   - setStore('userRole', 'programmer')");
    
    alert("You must be logged in as a programmer to access this page.");
    
    // Hide all content
    const programmerDashboard = document.getElementById('programmer-dashboard');
    const artistDetailView = document.getElementById('artist-detail-view');
    
    if (programmerDashboard) programmerDashboard.classList.add('hidden');
    if (artistDetailView) artistDetailView.classList.add('hidden');
    
    // Show login page
    const loginView = document.getElementById('login-view');
    if (loginView) {
      loginView.style.display = 'block';
    }
    
    return false;
  }
  
  console.log("[REQUIRE AUTH] ✅ Auth check passed");
  return true;
}

/**
 * Setup programmer dashboard (SECURED)
 * NOTE: Auth check removed from setup - setup can run at page load
 * Auth checks are in the actual data-fetching functions (loadArtists, showArtistDetail, etc.)
 */
export function setupProgrammerDashboard() {
  console.log("[SETUP] Starting programmer dashboard setup...");
  
  // Setup search button
  const searchButton = document.getElementById('search-artists-btn');
  if (searchButton) {
    searchButton.addEventListener('click', loadArtists);
    console.log("[SETUP] Search button listener added");
  } else {
    console.warn("[SETUP] ⚠️ Search button not found in DOM");
  }
  
  // Setup back button for detail view
  const backToSearchBtn = document.getElementById('back-to-search-btn');
  if (backToSearchBtn) {
    backToSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Security check before navigation
      if (!requireAuth()) return;
      
      showSearchView();
      // Update browser history
      window.history.pushState({ view: 'search' }, '', '#search');
    });
    console.log("[SETUP] Back button listener added");
  }
  
  // Setup profile editor
  setupProgrammerProfileEditor();
  
  // Display profile overview  
  displayProgrammerProfileOverview();
  
  // Setup browser back/forward buttons (SECURED)
  setupBrowserHistory();
  
  console.log("[SETUP] ✅ Programmer dashboard setup complete (SECURED v2.2.1-FIXED)");
}

/**
 * Setup browser history management (SECURED)
 */
function setupBrowserHistory() {
  // Handle browser back/forward buttons with security
  window.addEventListener('popstate', (event) => {
    console.log("Popstate event:", event.state);
    
    // Security check: Block if not authenticated
    if (!isAuthenticatedProgrammer()) {
      console.error("Popstate blocked: User not authenticated");
      
      // Redirect to login
      const loginView = document.getElementById('login-view');
      if (loginView) {
        loginView.style.display = 'block';
      }
      
      // Hide programmer views
      document.getElementById('programmer-dashboard')?.classList.add('hidden');
      document.getElementById('artist-detail-view')?.classList.add('hidden');
      
      return;
    }
    
    if (event.state) {
      if (event.state.view === 'search') {
        showSearchView();
      } else if (event.state.view === 'artist-detail' && event.state.artistId) {
        showArtistDetail(event.state.artistId, false); // false = don't push to history again
      }
    } else {
      // No state, probably initial page load or back to main
      showSearchView();
    }
  });
  
  // Set initial state
  if (!window.history.state) {
    window.history.replaceState({ view: 'search' }, '', '#search');
  }
}

/**
 * Displays the programmer profile overview
 */
function displayProgrammerProfileOverview() {
  const currentUserData = getStore('currentUserData');
  const currentUser = getStore('currentUser');
  
  // If no data yet (e.g., during page load before login), skip
  if (!currentUserData || !currentUser) {
    console.log("[PROFILE] No user data yet, skipping profile overview display");
    return;
  }
  
  // Profile Picture
  const overviewPic = document.getElementById('programmer-overview-pic');
  if (overviewPic) {
    overviewPic.src = currentUserData.profilePicUrl || 
                      `https://placehold.co/200x200/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.firstName || 'P').charAt(0))}`;
  }
  
  // Name & Organization
  const nameEl = document.getElementById('programmer-overview-name');
  if (nameEl) {
    nameEl.textContent = `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Programmer Name';
  }
  
  const orgEl = document.getElementById('programmer-overview-org');
  if (orgEl) {
    orgEl.textContent = currentUserData.organizationName || 'Organization Name';
  }
  
  // Contact Info
  const emailEl = document.getElementById('programmer-overview-email');
  if (emailEl) {
    emailEl.textContent = currentUser?.email || 'email@example.com';
  }
  
  const phoneEl = document.getElementById('programmer-overview-phone');
  if (phoneEl) {
    phoneEl.textContent = currentUserData.phone || 'Not specified';
  }
  
  // Website
  const websiteElement = document.getElementById('programmer-overview-website');
  if (websiteElement) {
    if (currentUserData.website) {
      websiteElement.href = currentUserData.website;
      websiteElement.textContent = currentUserData.website.replace(/^https?:\/\//, '');
    } else {
      websiteElement.href = '#';
      websiteElement.textContent = 'Not specified';
    }
  }
  
  // About
  const aboutEl = document.getElementById('programmer-overview-about');
  if (aboutEl) {
    aboutEl.textContent = currentUserData.organizationAbout || 'No description available';
  }
  
  console.log("[PROFILE] Profile overview displayed successfully");
}

/**
 * Setup programmer profile editor
 */
function setupProgrammerProfileEditor() {
  const editBtn = document.getElementById('edit-programmer-profile-btn');
  const editor = document.getElementById('programmer-profile-editor');
  const overview = document.getElementById('programmer-profile-overview');
  
  if (!editBtn || !editor || !overview) {
    console.warn("Programmer profile editor elements not found");
    return;
  }
  
  // Remove old listeners
  const newBtn = editBtn.cloneNode(true);
  editBtn.parentNode.replaceChild(newBtn, editBtn);
  
  // Add new listener
  newBtn.addEventListener('click', () => {
    const isHidden = editor.classList.contains('hidden');
    
    if (isHidden) {
      editor.classList.remove('hidden');
      overview.classList.add('hidden');
      populateProgrammerEditor();
    } else {
      editor.classList.add('hidden');
      overview.classList.remove('hidden');
      displayProgrammerProfileOverview();
    }
  });
  
  // Setup profile picture preview
  const fileInput = document.getElementById('programmer-edit-profile-pic');
  const previewImg = document.getElementById('programmer-profile-pic-preview');
  
  if (fileInput && previewImg) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          fileInput.value = '';
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          fileInput.value = '';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Handle form submission
  const form = document.getElementById('programmer-profile-form');
  if (form) {
    form.addEventListener('submit', handleProgrammerProfileSubmit);
  }
}

/**
 * Populates the programmer editor with current data
 */
function populateProgrammerEditor() {
  const currentUserData = getStore('currentUserData');
  
  if (!currentUserData) {
    console.warn("No programmer data found to populate editor");
    return;
  }
  
  console.log("Populating programmer editor with:", currentUserData);
  
  document.getElementById('programmer-edit-firstname').value = currentUserData.firstName || '';
  document.getElementById('programmer-edit-lastname').value = currentUserData.lastName || '';
  document.getElementById('programmer-edit-phone').value = currentUserData.phone || '';
  document.getElementById('programmer-edit-org-name').value = currentUserData.organizationName || '';
  document.getElementById('programmer-edit-org-about').value = currentUserData.organizationAbout || '';
  document.getElementById('programmer-edit-website').value = currentUserData.website || '';
  
  const previewImg = document.getElementById('programmer-profile-pic-preview');
  if (currentUserData.profilePicUrl) {
    previewImg.src = currentUserData.profilePicUrl;
  } else {
    previewImg.src = `https://placehold.co/100x100/e0e7ff/6366f1?text=${encodeURIComponent((currentUserData.firstName || 'P').charAt(0))}`;
  }
}

/**
 * Handles programmer profile form submission
 */
async function handleProgrammerProfileSubmit(e) {
  e.preventDefault();
  
  const successMsg = document.getElementById('programmer-profile-success');
  const errorMsg = document.getElementById('programmer-profile-error');
  const submitBtn = e.submitter || e.target.querySelector('button[type="submit"]');
  
  // Reset messages
  successMsg.textContent = '';
  errorMsg.textContent = '';
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  
  try {
    const currentUser = getStore('currentUser');
    
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    // Get form values
    const firstName = document.getElementById('programmer-edit-firstname').value.trim();
    const lastName = document.getElementById('programmer-edit-lastname').value.trim();
    const phone = document.getElementById('programmer-edit-phone').value.trim();
    const orgName = document.getElementById('programmer-edit-org-name').value.trim();
    const orgAbout = document.getElementById('programmer-edit-org-about').value.trim();
    const website = document.getElementById('programmer-edit-website').value.trim();
    
    // Build update object
    const updateData = {
      firstName,
      lastName,
      phone,
      organizationName: orgName,
      organizationAbout: orgAbout,
      website
    };
    
    // Handle profile picture upload if selected
    const fileInput = document.getElementById('programmer-edit-profile-pic');
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error("Please select an image file");
      }
      
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `programmers/${currentUser.uid}/profile-pic-${Date.now()}.jpg`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      updateData.profilePicUrl = downloadURL;
      console.log("Profile picture uploaded:", downloadURL);
    }
    
    // Update Firestore
    const userDocRef = doc(db, 'programmers', currentUser.uid);
    await updateDoc(userDocRef, updateData);
    
    console.log("Programmer profile updated successfully");
    
    // Update local store
    const currentUserData = getStore('currentUserData');
    setStore('currentUserData', { ...currentUserData, ...updateData });
    
    // Show success message
    successMsg.textContent = 'Profile updated successfully!';
    
    // Refresh overview
    displayProgrammerProfileOverview();
    
    // Hide editor after 2 seconds
    setTimeout(() => {
      document.getElementById('programmer-profile-editor').classList.add('hidden');
      document.getElementById('programmer-profile-overview').classList.remove('hidden');
    }, 2000);
    
  } catch (error) {
    console.error("Error updating programmer profile:", error);
    errorMsg.textContent = `Error: ${error.message}`;
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Profile';
  }
}

/**
 * Load artists with filters (SECURED)
 */
export async function loadArtists() {
  console.log("[LOAD ARTISTS] Function called");
  
  // Security check: Only allow authenticated programmers
  if (!requireAuth()) {
    console.error("[LOAD ARTISTS] ❌ Load artists blocked: Authentication required");
    return;
  }
  
  console.log("[LOAD ARTISTS] ✅ Auth check passed, loading artists...");
  
  const resultsContainer = document.getElementById('artist-results');
  const loadingDiv = document.getElementById('loading-artists');
  const noResultsDiv = document.getElementById('no-results');
  
  if (!resultsContainer) {
    console.error("[LOAD ARTISTS] ❌ ERROR: artist-results container not found!");
    return;
  }
  
  // Show loading
  resultsContainer.innerHTML = '';
  loadingDiv.style.display = 'block';
  noResultsDiv.style.display = 'none';
  
  try {
    // Get filter values
    const nameFilter = document.getElementById('filter-name')?.value.toLowerCase().trim() || '';
    const locationFilter = document.getElementById('filter-location')?.value.toLowerCase().trim() || '';
    const genderFilter = document.getElementById('filter-gender')?.value || '';
    
    // Payment filter (NEW - v2.1)
    const paymentCheckboxes = document.querySelectorAll('input[name="payment-filter"]:checked');
    const paymentFilters = Array.from(paymentCheckboxes).map(cb => cb.value);
    
    // Genre filter
    const genreCheckboxes = document.querySelectorAll('input[name="genre-filter"]:checked');
    const genreFilters = Array.from(genreCheckboxes).map(cb => cb.value);
    
    // Language filter
    const languageCheckboxes = document.querySelectorAll('input[name="language-filter"]:checked');
    const languageFilters = Array.from(languageCheckboxes).map(cb => cb.value);
    
    // Age range filter
    const ageMinInput = document.getElementById('filter-age-min')?.value;
    const ageMaxInput = document.getElementById('filter-age-max')?.value;
    const ageMin = ageMinInput ? parseInt(ageMinInput) : null;
    const ageMax = ageMaxInput ? parseInt(ageMaxInput) : null;
    
    console.log("Filter values:", {
      nameFilter,
      locationFilter,
      genderFilter,
      paymentFilters,
      genreFilters,
      languageFilters,
      ageRange: ageMin !== null || ageMax !== null ? `${ageMin || 'any'}-${ageMax || 'any'}` : 'not set'
    });
    
    // Build Firestore query
    let q = query(collection(db, 'artists'), where('published', '==', true));
    
    // Add gender filter if selected
    if (genderFilter) {
      q = query(q, where('gender', '==', genderFilter));
    }
    
    // Fetch all artists
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.size} artists before client-side filtering`);
    
    let artists = [];
    snapshot.forEach((doc) => {
      artists.push({ id: doc.id, ...doc.data() });
    });
    
    // Client-side filtering
    
    // Filter by name (stage name or full name)
    if (nameFilter) {
      artists = artists.filter(artist => {
        const stageName = (artist.stageName || '').toLowerCase();
        const fullName = `${artist.firstName || ''} ${artist.lastName || ''}`.toLowerCase();
        return stageName.includes(nameFilter) || fullName.includes(nameFilter);
      });
    }
    
    // Filter by location
    if (locationFilter) {
      artists = artists.filter(artist => {
        const location = (artist.location || '').toLowerCase();
        return location.includes(locationFilter);
      });
    }
    
    // Filter by payment methods (NEW - v2.1)
    if (paymentFilters.length > 0) {
      artists = artists.filter(artist => {
        const artistPayments = artist.paymentMethods || [];
        // Artist must have at least one of the selected payment methods
        return paymentFilters.some(payment => artistPayments.includes(payment));
      });
    }
    
    // Filter by genres
    if (genreFilters.length > 0) {
      artists = artists.filter(artist => {
        const artistGenres = artist.genres || [];
        // Artist must have at least one of the selected genres
        return genreFilters.some(genre => artistGenres.includes(genre));
      });
    }
    
    // Filter by languages
    if (languageFilters.length > 0) {
      artists = artists.filter(artist => {
        const artistLanguages = artist.languages || [];
        // Artist must have at least one of the selected languages
        return languageFilters.some(lang => artistLanguages.includes(lang));
      });
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
    }
    
    console.log(`${artists.length} artists after all filtering`);
    
    // Hide loading
    loadingDiv.style.display = 'none';
    
    // Display results
    if (artists.length === 0) {
      noResultsDiv.style.display = 'block';
    } else {
      renderArtists(artists);
    }
    
  } catch (error) {
    console.error("Error loading artists:", error);
    loadingDiv.style.display = 'none';
    alert("Could not load artists: " + error.message);
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob) {
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
 * Render artists in the results container
 */
function renderArtists(artists) {
  const resultsContainer = document.getElementById('artist-results');
  resultsContainer.innerHTML = '';
  
  artists.forEach(artist => {
    const card = createArtistCard(artist);
    resultsContainer.appendChild(card);
  });
}

/**
 * Create an artist card element
 */
function createArtistCard(artist) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer';
  
  // Profile picture
  const profilePic = artist.profilePicUrl || "https://placehold.co/400x400/e0e7ff/6366f1?text=No+Photo";
  
  // Age
  const age = artist.dob ? calculateAge(artist.dob) : null;
  const ageText = age ? `${age} years old` : 'Age not specified';
  
  // Genres
  const genresHTML = artist.genres && artist.genres.length > 0
    ? artist.genres.map(g => `<span class="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">${g}</span>`).join(' ')
    : '<span class="text-gray-500 text-sm">No genres</span>';
  
  card.innerHTML = `
    <div class="aspect-w-4 aspect-h-3">
      <img src="${profilePic}" alt="${artist.stageName || 'Artist'}" class="w-full h-48 object-cover">
    </div>
    <div class="p-4">
      <h3 class="text-xl font-bold text-gray-900 mb-1">${artist.stageName || 'No Stage Name'}</h3>
      <p class="text-sm text-gray-600 mb-2">${artist.firstName || ''} ${artist.lastName || ''}</p>
      <p class="text-sm text-gray-600 mb-2"><i data-lucide="map-pin" class="inline w-4 h-4"></i> ${artist.location || 'Location not specified'}</p>
      <p class="text-sm text-gray-600 mb-3"><i data-lucide="calendar" class="inline w-4 h-4"></i> ${ageText}</p>
      <div class="mb-3">
        ${genresHTML}
      </div>
      <button class="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
        View Profile
      </button>
    </div>
  `;
  
  // Add click listener
  card.addEventListener('click', () => {
    showArtistDetail(artist.id);
  });
  
  return card;
}

/**
 * Show artist detail view (SECURED)
 */
export async function showArtistDetail(artistId, pushHistory = true) {
  // Security check: Only allow authenticated programmers
  if (!requireAuth()) {
    console.error("Show artist detail blocked: Authentication required");
    return;
  }
  
  try {
    console.log("Loading artist detail:", artistId);
    
    // Fetch artist data
    const artistRef = doc(db, 'artists', artistId);
    const artistSnap = await getDoc(artistRef);
    
    if (!artistSnap.exists()) {
      alert("Artist not found");
      return;
    }
    
    const artist = { id: artistSnap.id, ...artistSnap.data() };
    
    // Vul de detail view met de data
    populateArtistDetail(artist);
    
    // Toon de detail view en verberg de search results
    document.getElementById('programmer-dashboard').style.display = 'none';
    document.getElementById('artist-detail-view').style.display = 'block';
    
    // Push to browser history
    if (pushHistory) {
      window.history.pushState(
        { view: 'artist-detail', artistId: artistId }, 
        '', 
        `#artist/${artistId}`
      );
    }
    
    // Scroll naar boven
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Activeer Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
  } catch (error) {
    console.error("Error loading artist detail:", error);
    alert("Could not load artist details: " + error.message);
  }
}

/**
 * Vult de detail view met artiest data
 */
function populateArtistDetail(artist) {
  // Profile Picture
  const detailProfilePic = document.getElementById('detail-profile-pic');
  if (detailProfilePic) {
    detailProfilePic.src = artist.profilePicUrl || "https://placehold.co/400x400/e0e7ff/6366f1?text=No+Photo";
  }
  
  // Basic Info
  document.getElementById('detail-artist-name').textContent = `${artist.firstName || ''} ${artist.lastName || ''}`.trim();
  document.getElementById('detail-stage-name').textContent = artist.stageName || 'N/A';
  document.getElementById('detail-location').textContent = artist.location || 'Not specified';
  
  // Gender
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  document.getElementById('detail-gender').textContent = genderMap[artist.gender] || 'Not specified';
  
  // Age
  if (artist.dob) {
    document.getElementById('detail-age').textContent = `${calculateAge(artist.dob)} years old`;
  } else {
    document.getElementById('detail-age').textContent = 'Age not specified';
  }
  
  // Genres
  const detailGenres = document.getElementById('detail-genres');
  detailGenres.innerHTML = '';
  if (artist.genres && artist.genres.length > 0) {
    artist.genres.forEach(genre => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = genre;
      detailGenres.appendChild(badge);
    });
  } else {
    detailGenres.textContent = 'No genres specified';
  }
  
  // Languages
  const detailLanguages = document.getElementById('detail-languages');
  detailLanguages.innerHTML = '';
  if (artist.languages && artist.languages.length > 0) {
    artist.languages.forEach(lang => {
      const badge = document.createElement('span');
      badge.className = 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
      badge.textContent = lang.toUpperCase();
      detailLanguages.appendChild(badge);
    });
  } else {
    detailLanguages.textContent = 'No languages specified';
  }
  
  // Bio & Pitch
  document.getElementById('detail-bio').textContent = artist.bio || 'No bio available.';
  document.getElementById('detail-pitch').textContent = artist.pitch || 'No pitch available.';
  
  // Video Material
  if (artist.videoUrl && artist.videoUrl.trim()) {
    document.getElementById('detail-video-section').style.display = 'block';
    const embedUrl = getEmbedUrl(artist.videoUrl, 'video');
    if (embedUrl) {
      document.getElementById('detail-video-container').innerHTML = `
        <iframe class="w-full h-full" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
    } else {
      document.getElementById('detail-video-container').innerHTML = `
        <div class="flex items-center justify-center h-full">
          <a href="${artist.videoUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">View Video (External Link)</a>
        </div>
      `;
    }
  } else {
    document.getElementById('detail-video-section').style.display = 'none';
  }
  
  // Audio Material
  if (artist.audioUrl && artist.audioUrl.trim()) {
    document.getElementById('detail-audio-section').style.display = 'block';
    const embedUrl = getEmbedUrl(artist.audioUrl, 'audio');
    if (embedUrl) {
      document.getElementById('detail-audio-container').innerHTML = `
        <iframe class="w-full" height="166" scrolling="no" frameborder="no" allow="autoplay" src="${embedUrl}"></iframe>
      `;
    } else {
      document.getElementById('detail-audio-container').innerHTML = `
        <a href="${artist.audioUrl}" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">Listen to Audio (External Link)</a>
      `;
    }
  } else {
    document.getElementById('detail-audio-section').style.display = 'none';
  }
  
  // Text Material
  if (artist.textContent && artist.textContent.trim()) {
    document.getElementById('detail-text-section').style.display = 'block';
    document.getElementById('detail-text-content').textContent = artist.textContent;
  } else {
    document.getElementById('detail-text-section').style.display = 'none';
  }
  
  // Document Material
  const documentSection = document.getElementById('detail-document-section');
  const documentLink = document.getElementById('detail-document-link');
  
  if (artist.documentUrl && artist.documentUrl.trim()) {
    documentSection.style.display = 'block';
    documentLink.href = artist.documentUrl;
    documentLink.textContent = artist.documentName || 'Download/View Document';
  } else {
    documentSection.style.display = 'none';
  }
  
  // Contact Information - Access Control
  const currentUserData = getStore('currentUserData');
  const isPro = currentUserData && currentUserData.status === 'pro';
  
  if (isPro) {
    // Show contact info for Pro users
    document.getElementById('detail-trial-message').style.display = 'none';
    document.getElementById('detail-contact-info').style.display = 'block';
    
    document.getElementById('detail-email').textContent = artist.email || 'Not available';
    document.getElementById('detail-email').href = `mailto:${artist.email || ''}`;
    
    document.getElementById('detail-phone').textContent = artist.phone || 'Not available';
    document.getElementById('detail-phone').href = `tel:${artist.phone || ''}`;
    
    // Setup Send Message button
    const sendMessageBtn = document.getElementById('send-message-btn');
    if (sendMessageBtn) {
      // Remove any existing listeners
      const newBtn = sendMessageBtn.cloneNode(true);
      sendMessageBtn.parentNode.replaceChild(newBtn, sendMessageBtn);
      
      // Add new listener
      newBtn.addEventListener('click', () => {
        openMessageModal(artist);
      });
    }
  } else {
    // Show upgrade message for Trial users
    document.getElementById('detail-trial-message').style.display = 'block';
    document.getElementById('detail-contact-info').style.display = 'none';
  }
}

/**
 * Converteert een video/audio URL naar een embed URL
 */
function getEmbedUrl(url, type) {
  if (!url) return null;
  
  if (type === 'video') {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }
  
  if (type === 'audio') {
    // SoundCloud
    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    }
    
    // Spotify
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist)\/([^?]+)/);
    if (spotifyMatch) {
      return `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`;
    }
  }
  
  return null;
}

/**
 * Gaat terug naar de search results view (SECURED)
 */
function showSearchView() {
  // Security check
  if (!requireAuth()) {
    return;
  }
  
  document.getElementById('artist-detail-view').style.display = 'none';
  document.getElementById('programmer-dashboard').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
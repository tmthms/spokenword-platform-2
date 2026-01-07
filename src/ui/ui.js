/**
 * ui.js
 * Beheert alle UI-interacties: pagina's tonen/verbergen,
 * navigatieknoppen en de status van de UI bijwerken.
 */

// Importeer de "store" (globale state) om de data van de ingelogde gebruiker te lezen
import { getStore, setStore } from '../utils/store.js';

// Importeer de functies die we nodig hebben van andere modules
import { handleLogout, handleLogin, handleArtistSignup, handleProgrammerSignup, updateUserEmail, updateUserPassword } from '../services/auth.js';
import { setupArtistDashboard, populateArtistEditor } from '../modules/dashboard/dashboard-controller.js';
import { renderProgrammerDashboard, setupProgrammerDashboard } from '../modules/programmer/programmer-dashboard.js';
import { loadArtists, setupArtistSearch } from '../modules/search/search-controller.js';
import { renderArtistSearch } from '../modules/search/search-ui.js';
import { loadConversations } from '../modules/messaging/messaging-controller.js';
import { populateProgrammerEditor, renderProgrammerProfileEditor, setupProfileFormHandlers } from '../modules/programmer/programmer-profile.js';
import { setNavigationVisibility, updateDesktopNav, updateMobileNavActive } from '../modules/navigation/navigation.js';

// Importeer de view renderers
import {
  renderHome,
  renderLogin,
  renderSignup,
  renderArtistSignup,
  renderProgrammerSignup,
  renderMessages as renderMessagesView,
  renderDashboard as renderDashboardView,
  renderAccountSettings,
  renderEditProfile
} from './view-renderers.js'; 

// --- DOM Elementen ---
// We slaan alle belangrijke UI-elementen één keer op voor snelle toegang
const elements = {
  // Pagina-secties
  pageSections: document.querySelectorAll('.page-section'),
  loadingView: document.getElementById('loading-view'),
  homeView: document.getElementById('home-view'),
  loginView: document.getElementById('login-view'),
  signupView: document.getElementById('signup-view'),
  artistSignupView: document.getElementById('artist-signup-view'),
  programmerSignupView: document.getElementById('programmer-signup-view'),
  dashboardView: document.getElementById('dashboard-view'),

  // Navigatie & Gebruikersmenu
  navButtons: document.querySelectorAll('.nav-button'),
  navHome: document.getElementById('nav-home'),
  navLogin: document.getElementById('nav-login'),
  navSignup: document.getElementById('nav-signup'),
  navDashboard: document.getElementById('nav-dashboard'),
  navMessages: document.getElementById('nav-messages'),
  navSettings: document.getElementById('nav-settings'),
  navLogout: document.getElementById('nav-logout'),
  authLinks: document.getElementById('auth-links'),
  userMenu: document.getElementById('user-menu'),
  userEmailSpan: document.getElementById('user-email'),

  // Knoppen op de Homepagina
  homeCtaArtist: document.getElementById('home-cta-artist'),
  homeCtaProgrammer: document.getElementById('home-cta-programmer'),

  // Knoppen op de Aanmeld-keuzepagina
  signupChoiceArtist: document.getElementById('signup-choice-artist'),
  signupChoiceProgrammer: document.getElementById('signup-choice-programmer'),

  // Dashboard Specifieke Views
  artistDashboard: document.getElementById('artist-dashboard'),
  programmerDashboard: document.getElementById('programmer-dashboard'),
  programmerPendingView: document.getElementById('programmer-pending-view'),
  programmerProfileEditor: document.getElementById('programmer-profile-editor'),
  artistSearchSection: document.getElementById('artist-search-section'),
};

/**
 * Toont één specifieke pagina-sectie en verbergt alle andere.
 * NIEUWE ARCHITECTUUR: Alle content wordt dynamisch gerenderd in #app-content
 * @param {string} pageId - De ID van de pagina-sectie die getoond moet worden.
 * @param {boolean} updateHistory - Whether to update browser history (default: true)
 */
export function showPage(pageId, updateHistory = true) {
  const appContent = document.getElementById('app-content');

  // KRITIEK: Maak de container ALTIJD leeg voordat we nieuwe content renderen
  // Dit voorkomt dat oude views zichtbaar blijven
  if (appContent) {
    appContent.innerHTML = '';
  }

  // Update browser history with hash
  if (updateHistory) {
    const hash = pageId.replace('-view', '');
    if (window.location.hash !== `#${hash}`) {
      window.history.pushState({ pageId }, '', `#${hash}`);
    }
  }

  // Render de juiste view op basis van pageId
  switch(pageId) {
    case 'home-view':
      renderHome();
      break;
    case 'login-view':
      renderLogin();
      break;
    case 'signup-view':
      renderSignup();
      break;
    case 'artist-signup-view':
      renderArtistSignup();
      break;
    case 'programmer-signup-view':
      renderProgrammerSignup();
      break;
    case 'messages-view':
      renderMessagesView();
      break;
    case 'dashboard-view':
      renderDashboardView();
      break;
    case 'account-settings-view':
      renderAccountSettings();
      // Setup account settings form handlers after rendering
      setupAccountSettingsHandlers();
      break;
    default:
      console.warn(`Unknown page: ${pageId}`);
      renderHome();
  }

  // Re-initialize Lucide icons after rendering new content
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Setup global form handlers with event delegation
 * Handles all auth forms (login, signup) regardless of when they're rendered
 * Uses capture phase to intercept events before any other handlers
 */
let globalFormHandlersInitialized = false;

export function setupGlobalFormHandlers() {
  if (globalFormHandlersInitialized) {
    console.log('[UI] Global form handlers already initialized, skipping');
    return;
  }

  console.log('[UI] Setting up global form handlers with capture phase');

  // PRIMARY: Use event delegation on document (highest level) with capture phase
  document.addEventListener('submit', async (e) => {
    console.log('⚡️ Global SUBMIT caught:', e.target.tagName, 'id:', e.target.id);

    const form = e.target;

    // Login form
    if (form.id === 'login-form') {
      console.log('[UI] ✅ Login form submit intercepted - calling handleLogin');
      await handleLogin(e);
      return;
    }

    // Artist signup form
    if (form.id === 'artist-signup-form') {
      console.log('[UI] ✅ Artist signup form submit intercepted');
      await handleArtistSignup(e);
      return;
    }

    // Programmer signup form
    if (form.id === 'programmer-signup-form') {
      console.log('[UI] ✅ Programmer signup form submit intercepted');
      await handleProgrammerSignup(e);
      return;
    }

    // ✅ FIX: Message form (inline chat messages)
    if (form.id === 'message-form') {
      console.log('[UI] ✅ Message form submit intercepted');
      await handleInlineMessageSubmit(e);
      return;
    }

    // ✅ FIX: Mobile message form (separate handler for mobile)
    if (form.id === 'mobile-message-form') {
      e.preventDefault();
      const input = document.getElementById('mobile-message-input');
      const text = input?.value?.trim();
      if (!text) return;

      const chatContainer = document.getElementById('chat-container');
      const conversationId = chatContainer?.dataset?.conversationId;
      if (!conversationId) {
        console.error('[UI] No conversation ID found for mobile message');
        return;
      }

      input.value = '';

      // Import and call message functions
      import('../modules/messaging/messaging-controller.js').then(async ({ addMessage, loadMessages }) => {
        const { getStore } = await import('../utils/store.js');
        const currentUser = getStore('currentUser');
        const currentUserData = getStore('currentUserData');
        if (currentUser && currentUserData) {
          await addMessage(conversationId, currentUser.uid, currentUserData, text);
          await loadMessages(conversationId);
        }
      });
      return;
    }
  }, { capture: true }); // CRITICAL: Capture phase ensures we intercept FIRST

  globalFormHandlersInitialized = true;
  console.log('[UI] ✅ Global form handlers initialized successfully');
}

/**
 * ✨ OPTIMISTIC UI: Handle inline message form submission (chat replies)
 * Messages are added to UI immediately without re-rendering the entire chat
 */
async function handleInlineMessageSubmit(e) {
  e.preventDefault();

  // Support both desktop and mobile forms
  const messageInput = document.getElementById('message-input');
  const mobileMessageInput = document.getElementById('mobile-message-input');
  const activeInput = messageInput || mobileMessageInput;
  const messageText = activeInput?.value.trim();

  if (!messageText) return;

  // Get conversation ID from either desktop or mobile container
  const chatContainer = document.getElementById('chat-container');
  const mobileChatView = document.getElementById('mobile-chat-view');
  const conversationId = chatContainer?.dataset.conversationId || mobileChatView?.dataset.conversationId;

  if (!conversationId) {
    console.error('[UI] No conversation ID found');
    return;
  }

  try {
    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');

    if (!currentUser || !currentUserData) {
      throw new Error('User not logged in');
    }

    console.log('[UI] Sending message to conversation:', conversationId);

    // ✨ OPTIMISTIC UI: Create message object for immediate display
    const optimisticMessage = {
      senderId: currentUser.uid,
      senderName: `${currentUserData.firstName} ${currentUserData.lastName}`,
      senderRole: currentUserData.role,
      senderProfilePic: currentUserData.profilePicUrl || '',
      text: messageText,
      createdAt: null, // Will show "Just now"
      read: false
    };

    // Clear input immediately (better UX)
    activeInput.value = '';

    // Import messaging functions dynamically
    const { addMessage, appendMessageToUI } = await import('../modules/messaging/messaging-controller.js');

    // ✨ OPTIMISTIC UI: Add message to UI immediately (no re-render!)
    appendMessageToUI(optimisticMessage);

    // Send message to Firestore in background
    await addMessage(conversationId, currentUser.uid, currentUserData, messageText);

    console.log('[UI] ✅ Message sent successfully with optimistic UI');

  } catch (error) {
    console.error('[UI] Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
}


/**
 * Werkt de navigatiebalk bij op basis van de inlogstatus.
 * @param {object | null} user - Het Firebase user-object (of null als uitgelogd).
 */
export function updateNav(user) {
  const appHeader = document.getElementById('app-header');
  const navLogoutMobile = document.getElementById('nav-logout-mobile');
  const userEmailMobile = document.getElementById('user-email-mobile');

  if (user) {
    // Ingelogd - Show navigation using centralized function
    setNavigationVisibility(true);

    // Update desktop nav with current user data
    updateDesktopNav();

    // Show app header
    if (appHeader) {
      appHeader.classList.remove('hidden');
    }

    // Show mobile logout button
    if (navLogoutMobile) {
      navLogoutMobile.classList.remove('hidden');
    }

    // Update mobile email
    if (userEmailMobile) {
      userEmailMobile.textContent = user.email;
      userEmailMobile.classList.remove('hidden');
    }

    // Re-initialize icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  } else {
    // Uitgelogd - Hide navigation using centralized function
    setNavigationVisibility(false);

    // Hide app header
    if (appHeader) {
      appHeader.classList.add('hidden');
    }

    // Hide mobile elements
    if (navLogoutMobile) {
      navLogoutMobile.classList.add('hidden');
    }

    if (userEmailMobile) {
      userEmailMobile.textContent = '';
      userEmailMobile.classList.add('hidden');
    }
  }
}

/**
 * Helper: Show/hide artist search section consistently
 * @param {boolean} show - Whether to show (true) or hide (false) the search section
 * Note: Full visibility forcing happens in loadArtists() via forceSearchResultsVisible()
 */
function toggleArtistSearchSection(show) {
  const artistSearchSection = document.getElementById('artist-search-section');
  if (!artistSearchSection) return;

  if (show) {
    // 🔥 NUCLEAR VISIBILITY FORCING
    artistSearchSection.style.display = 'block';
    artistSearchSection.style.opacity = '1';
    artistSearchSection.style.visibility = 'visible';
    artistSearchSection.style.zIndex = '1';
    artistSearchSection.classList.remove('hidden');
    console.log('[UI] 🔥 Artist search section FORCED VISIBLE');
  } else {
    artistSearchSection.style.display = 'none';
    artistSearchSection.classList.add('hidden');
    console.log('[UI] Artist search section hidden');
  }
}

/**
 * Helper: Show/hide profile sections (overview, preview, editor)
 * @param {boolean} show - Whether to show (true) or hide (false)
 */
function toggleProfileSections(show) {
  const profileOverview = document.getElementById('programmer-profile-overview');
  const publicPreview = document.getElementById('programmer-public-preview');

  if (profileOverview) {
    if (show) {
      profileOverview.style.display = 'block';
      profileOverview.classList.remove('hidden');
    } else {
      profileOverview.style.display = 'none';
      profileOverview.classList.add('hidden');
    }
  }

  if (publicPreview) {
    if (show) {
      publicPreview.style.display = 'block';
      publicPreview.classList.remove('hidden');
    } else {
      publicPreview.style.display = 'none';
      publicPreview.classList.add('hidden');
    }
  }
}

/**
 * Toont het juiste dashboard (Artiest of Programmeur) op basis van de rol.
 */
export function showDashboard() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData) {
    console.warn("Geen gebruikersdata gevonden, kan dashboard niet tonen. Terug naar home.");
    showPage('home-view');
    return;
  }

  // STAP 1: Render de dashboard container structuur
  showPage('dashboard-view');

  // STAP 2: Render de specifieke dashboard content op basis van rol
  const { role, status } = currentUserData;

  if (role === 'artist') {
    // Get the dynamically rendered containers
    const artistDashboard = document.getElementById('artist-dashboard');
    const programmerDashboard = document.getElementById('programmer-dashboard');

    if (artistDashboard) {
      artistDashboard.style.display = 'block';
      artistDashboard.classList.remove('hidden');
    }
    if (programmerDashboard) {
      programmerDashboard.style.display = 'none';
      programmerDashboard.classList.add('hidden');
    }

    // Show artist own profile view (programmer-style layout)
    showArtistOwnProfile();
  } else if (role === 'programmer') {
    // Get the dynamically rendered containers
    const artistDashboard = document.getElementById('artist-dashboard');
    const programmerDashboard = document.getElementById('programmer-dashboard');

    if (artistDashboard) {
      artistDashboard.style.display = 'none';
      artistDashboard.classList.add('hidden');
    }
    if (programmerDashboard) {
      // 🔥 FORCE VISIBILITY on programmer dashboard
      programmerDashboard.style.display = 'block';
      programmerDashboard.style.opacity = '1';
      programmerDashboard.style.visibility = 'visible';
      programmerDashboard.style.zIndex = '1';
      programmerDashboard.classList.remove('hidden');
      console.log('[UI] 👀 Programmer dashboard FORCED VISIBLE');
    }

    // Render the programmer dashboard HTML
    renderProgrammerDashboard();
    // Setup dashboard AFTER rendering HTML (so elements exist)
    setupProgrammerDashboard();

    // Get pending view dynamically
    const pendingView = document.getElementById('programmer-pending-view');

    // Get profile editor dynamically
    const programmerProfileEditor = document.getElementById('programmer-profile-editor');
    if (programmerProfileEditor) {
      programmerProfileEditor.classList.add('hidden');
      programmerProfileEditor.style.display = 'none';
    }

    // ✅ FIX: Show profile sections in dashboard view
    toggleProfileSections(true);

    if (status === 'pending') {
      // Verberg de zoekfilters, toon "pending" bericht
      if (pendingView) pendingView.style.display = 'block';
      // ✅ FIX: Hide artist search in pending state
      toggleArtistSearchSection(false);
    } else {
      // Toon de zoekfilters en verberg "pending"
      if (pendingView) pendingView.style.display = 'none';

      // ✅ FIX: Show artist search section
      toggleArtistSearchSection(true);

      // Render the artist search view dynamically
      renderArtistSearch();

      // ✅ FIX: Setup search after rendering HTML (so event listeners can attach)
      setupArtistSearch();

      // Auto-load all artists when dashboard loads
      loadArtists();
    }
  }

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows ONLY the search view (hides profile sections)
 * Used when clicking "Zoeken" in navigation
 */
export function showSearchOnly() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData) {
    console.warn("No user data, cannot show search");
    showPage('home-view');
    return;
  }

  console.log('[UI] Showing search-only view');

  // Render the dashboard container structure
  showPage('dashboard-view');

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  // Hide artist dashboard
  if (artistDashboard) {
    artistDashboard.style.display = 'none';
  }

  // Show programmer dashboard container (needed for search section)
  if (programmerDashboard) {
    programmerDashboard.style.display = 'block';
  }

  // Import programmer dashboard
  import('../modules/programmer/programmer-dashboard.js').then(dashboardModule => {
    dashboardModule.renderProgrammerDashboard();

    // HIDE the entire desktop and mobile profile sections
    const desktopProfile = programmerDashboard.querySelector('.hidden.md\\:block');
    const mobileProfile = programmerDashboard.querySelector('.block.md\\:hidden');

    if (desktopProfile) desktopProfile.style.display = 'none';
    if (mobileProfile) mobileProfile.style.display = 'none';

    // Also hide by ID for safety
    const sectionsToHide = [
      'programmer-pending-view',
      'programmer-profile-editor'
    ];

    sectionsToHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    // SHOW search section
    const searchSection = document.getElementById('artist-search-section');
    if (searchSection) {
      searchSection.style.display = 'block';
      searchSection.classList.remove('hidden');
    }

    // Import and setup search
    import('../modules/search/search-ui.js').then(searchUiModule => {
      searchUiModule.renderArtistSearch();

      import('../modules/search/search-controller.js').then(searchControllerModule => {
        searchControllerModule.setupArtistSearch();
        searchControllerModule.loadArtists();
      });
    });
  });

  // Update URL
  window.history.pushState({ view: 'search' }, '', '#search');

  // Re-initialize icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows ONLY the programmer profile view (hides search)
 * Used when clicking "Profiel" in navigation
 */
export function showProgrammerProfile() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn("Only programmers can view profile");
    showPage('home-view');
    return;
  }

  console.log('[UI] Showing programmer profile view');

  // Ensure navigation is visible FIRST
  setNavigationVisibility(true);
  import('../modules/navigation/navigation.js').then(navModule => {
    navModule.renderDesktopNav();
    navModule.renderMobileNav();
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 50);
    }
  });

  // Render the dashboard container structure
  showPage('dashboard-view', false);

  // Set correct hash
  window.history.pushState({ view: 'profile' }, '', '#profile');

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  // Hide artist dashboard
  if (artistDashboard) {
    artistDashboard.style.display = 'none';
  }

  // Show programmer dashboard
  if (programmerDashboard) {
    programmerDashboard.style.display = 'block';
  }

  // Import, render and setup
  import('../modules/programmer/programmer-dashboard.js').then(module => {
    module.renderProgrammerDashboard();
    module.setupProgrammerDashboard();

    // SHOW profile sections
    const sectionsToShow = [
      'programmer-profile-overview',
      'programmer-public-preview',
      'programmer-about-card'
    ];

    sectionsToShow.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'block';
        el.classList.remove('hidden');
      }
    });

    // HIDE search section and editor on profile page
    const searchSection = document.getElementById('artist-search-section');
    if (searchSection) {
      searchSection.style.display = 'none';
      searchSection.classList.add('hidden');
    }

    // Hide editor
    const editor = document.getElementById('programmer-profile-editor');
    if (editor) {
      editor.style.display = 'none';
      editor.classList.add('hidden');
    }
  });

  updateMobileNavActive('profile');

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows programmer settings (profile editor)
 */
export function showProgrammerSettings() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn("Only programmers can access settings");
    return;
  }

  console.log('[UI] Showing programmer settings view');

  // STAP 1: Render de dashboard container structuur
  showPage('dashboard-view');

  // STAP 2: Get the dynamically rendered containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  // Show programmer dashboard
  if (artistDashboard) {
    artistDashboard.style.display = 'none';
    artistDashboard.classList.add('hidden');
  }
  if (programmerDashboard) {
    programmerDashboard.style.display = 'block';
    programmerDashboard.classList.remove('hidden');
  }

  // Render the programmer dashboard HTML first
  renderProgrammerDashboard();
  // Setup dashboard AFTER rendering HTML
  setupProgrammerDashboard();

  // Get dynamically rendered elements
  const pendingView = document.getElementById('programmer-pending-view');

  // Hide the pending view
  if (pendingView) pendingView.style.display = 'none';

  // ✅ FIX: Hide artist search section in Settings view
  toggleArtistSearchSection(false);

  // ✅ FIX: Show profile sections in Settings view
  toggleProfileSections(true);

  // Get the profile editor dynamically
  const programmerProfileEditor = document.getElementById('programmer-profile-editor');

  // Show the profile editor
  if (programmerProfileEditor) {
    // Render the editor HTML first
    renderProgrammerProfileEditor();

    programmerProfileEditor.classList.remove('hidden');
    programmerProfileEditor.style.display = 'block';

    // Setup form handlers after rendering
    setupProfileFormHandlers();

    // Populate the editor with current data
    populateProgrammerEditor();

    // Scroll to the profile editor
    setTimeout(() => {
      programmerProfileEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows the Edit Profile page
 */
export async function showEditProfile() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn("Only programmers can edit profile");
    showPage('home-view');
    return;
  }

  console.log('[UI] Showing edit profile page');

  // Render the edit profile view
  renderEditProfile();

  // Populate form with current data
  populateEditProfileForm(currentUserData);

  // Setup form handlers
  setupEditProfileHandlers();

  // Update URL
  window.history.pushState({ view: 'edit-profile' }, '', '#edit-profile');

  // Re-initialize icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows the Public Profile Preview page
 */
export function showPublicProfile() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn("Only programmers can view public profile");
    showPage('home-view');
    return;
  }

  console.log('[UI] Showing public profile page');

  // Render the public profile view
  import('./view-renderers.js').then(module => {
    module.renderPublicProfilePage();

    // Setup back button handler
    const backBtn = document.getElementById('back-to-profile-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        showProgrammerProfile();
      });
    }
  });

  // Update URL
  window.history.pushState({ view: 'public-profile' }, '', '#public-profile');
}

/**
 * Populate the edit profile form with current user data
 */
function populateEditProfileForm(userData) {
  const currentUser = getStore('currentUser');

  // Personal Details
  const firstNameInput = document.getElementById('edit-first-name');
  const lastNameInput = document.getElementById('edit-last-name');
  const phoneInput = document.getElementById('edit-phone');

  if (firstNameInput) firstNameInput.value = userData.firstName || '';
  if (lastNameInput) lastNameInput.value = userData.lastName || '';
  if (phoneInput) phoneInput.value = userData.phone || '';

  // Avatar
  const avatarPlaceholder = document.getElementById('edit-avatar-placeholder');
  const avatarInitial = document.getElementById('edit-avatar-initial');
  const avatarPic = document.getElementById('edit-profile-pic-preview');

  if (userData.profilePicUrl) {
    if (avatarPic) {
      avatarPic.src = userData.profilePicUrl;
      avatarPic.classList.remove('hidden');
    }
    if (avatarPlaceholder) avatarPlaceholder.classList.add('hidden');
  } else {
    const initial = (userData.firstName?.charAt(0) || 'P').toUpperCase();
    if (avatarInitial) avatarInitial.textContent = initial;
  }

  // Organization Details
  const orgNameInput = document.getElementById('edit-organization-name');
  const websiteInput = document.getElementById('edit-website');
  const aboutInput = document.getElementById('edit-about');

  if (orgNameInput) orgNameInput.value = userData.organizationName || '';
  if (websiteInput) websiteInput.value = userData.website || '';
  if (aboutInput) aboutInput.value = userData.organizationAbout || '';

  // Preferences
  const languageSelect = document.getElementById('edit-language');
  if (languageSelect) languageSelect.value = userData.language || 'nl';
}

/**
 * Setup form handlers for edit profile page
 */
function setupEditProfileHandlers() {
  const form = document.getElementById('edit-profile-form');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  const fileInput = document.getElementById('edit-profile-pic-input');

  // Cancel button - go back to profile
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      showProgrammerProfile();
    });
  }

  // File input - preview image
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const avatarPic = document.getElementById('edit-profile-pic-preview');
          const avatarPlaceholder = document.getElementById('edit-avatar-placeholder');

          if (avatarPic) {
            avatarPic.src = event.target.result;
            avatarPic.classList.remove('hidden');
          }
          if (avatarPlaceholder) avatarPlaceholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleEditProfileSubmit();
    });
  }
}

/**
 * Handle edit profile form submission
 */
async function handleEditProfileSubmit() {
  const successEl = document.getElementById('edit-profile-success');
  const errorEl = document.getElementById('edit-profile-error');
  const saveBtn = document.getElementById('save-profile-btn');

  // Hide previous messages
  if (successEl) successEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');

  // Disable button
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    const currentUser = getStore('currentUser');
    const currentUserData = getStore('currentUserData');

    if (!currentUser) throw new Error('No user logged in');

    // Gather form data
    const dataToUpdate = {
      firstName: document.getElementById('edit-first-name')?.value.trim() || '',
      lastName: document.getElementById('edit-last-name')?.value.trim() || '',
      phone: document.getElementById('edit-phone')?.value.trim() || '',
      organizationName: document.getElementById('edit-organization-name')?.value.trim() || '',
      website: document.getElementById('edit-website')?.value.trim() || '',
      organizationAbout: document.getElementById('edit-about')?.value.trim() || '',
      language: document.getElementById('edit-language')?.value || 'nl'
    };

    // Handle profile picture upload
    const fileInput = document.getElementById('edit-profile-pic-input');
    const file = fileInput?.files[0];

    if (file) {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const storage = getStorage();
      const storageRef = ref(storage, `programmers/${currentUser.uid}/profile.jpg`);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      dataToUpdate.profilePicUrl = downloadURL;
    }

    // Update Firestore
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../services/firebase.js');

    const docRef = doc(db, 'users', currentUser.uid);
    await updateDoc(docRef, dataToUpdate);

    // Update local store
    setStore('currentUserData', { ...currentUserData, ...dataToUpdate });

    // Apply language change
    const { setLanguage } = await import('../utils/translations.js');
    setLanguage(dataToUpdate.language);

    // Update navigation to reflect new profile picture
    const { renderDesktopNav, renderMobileNav } = await import('../modules/navigation/navigation.js');
    renderDesktopNav();
    renderMobileNav();

    // Show success
    if (successEl) {
      successEl.textContent = '✓ Profile updated successfully!';
      successEl.classList.remove('hidden');
    }

    // Navigate back after short delay
    setTimeout(() => {
      showProgrammerProfile();
    }, 1500);

  } catch (error) {
    console.error('Error updating profile:', error);
    if (errorEl) {
      errorEl.textContent = `Error: ${error.message}`;
      errorEl.classList.remove('hidden');
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save All Changes';
    }
  }
}

/**
 * Toont de messages/conversations pagina
 */
export function showMessages() {
  console.log("Showing messages view");

  // Render the messages view
  showPage('messages-view');

  // Laad conversaties AFTER rendering the view
  loadConversations();
}

/**
 * Show artist search view
 */
export function showArtistSearch() {
  console.log("Showing artist search view");

  // Show the dashboard view (artists see search by default)
  showPage('dashboard-view');

  // Render the search UI
  renderArtistSearch();

  // Load artists
  loadArtists();
}

/**
 * Voegt alle event listeners toe voor de navigatieknoppen.
 * Wordt één keer uitgevoerd bij het laden van de app.
 * ✅ Uses event delegation for all dynamically rendered elements
 */
export function initNavigation() {
  // ✅ Global click handler with event delegation
  document.body.addEventListener('click', (e) => {
    // Mobile logout button
    if (e.target.closest('#nav-logout-mobile')) {
      console.log('[UI] Mobile logout clicked');
      handleLogout();
      return;
    }

    // Home CTA buttons
    if (e.target.closest('#home-cta-artist')) {
      showPage('artist-signup-view');
      return;
    }

    if (e.target.closest('#home-cta-programmer')) {
      showPage('programmer-signup-view');
      return;
    }

    // Home login button
    if (e.target.closest('#home-login-btn')) {
      showPage('login-view');
      return;
    }

    // Signup choice buttons
    if (e.target.closest('#signup-choice-artist')) {
      showPage('artist-signup-view');
      return;
    }

    if (e.target.closest('#signup-choice-programmer')) {
      showPage('programmer-signup-view');
      return;
    }

    // Back buttons
    if (e.target.closest('#back-to-home-from-login')) {
      showPage('home-view');
      return;
    }

    if (e.target.closest('#back-to-home-from-signup')) {
      showPage('home-view');
      return;
    }

    if (e.target.closest('#back-from-artist-signup')) {
      showPage('signup-view');
      return;
    }

    if (e.target.closest('#back-from-programmer-signup')) {
      showPage('signup-view');
      return;
    }
  });

  // Bottom Navigation
  setupBottomNavigation();

  // Desktop Navigation
  setupDesktopNavigation();

  console.log('[UI] Navigation initialization complete with event delegation');
}

/**
 * Setup bottom navigation with event delegation
 */
function setupBottomNavigation() {
  // Use event delegation on document.body so it works even when bottom-nav is re-rendered
  document.body.addEventListener('click', (e) => {
    const navItem = e.target.closest('.bottom-nav-item, [data-nav]');
    if (!navItem) return;

    // Only handle if it's actually in the bottom nav
    const bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav || !bottomNav.contains(navItem)) return;

    const navAction = navItem.dataset.nav;
    if (!navAction) return;

    e.preventDefault();
    e.stopPropagation();

    console.log('[NAV] Mobile nav clicked:', navAction);

    // Update active state
    updateBottomNavActive(navAction);

    // Handle navigation (showPage/showDashboard/etc. handle hash updates now)
    switch(navAction) {
      case 'search':
        showSearch();
        break;
      case 'profile':
        const currentUserData = getStore('currentUserData');
        if (currentUserData?.role === 'artist') {
          showArtistOwnProfile();
        } else if (currentUserData?.role === 'programmer') {
          showProgrammerProfile();
        }
        break;
      case 'messages':
        showMessages(); // Updates hash internally
        break;
      case 'settings':
        showAccountSettings(); // Updates hash internally
        break;
      case 'gigs':
        import('../modules/calendar/calendar-views.js').then(module => {
          module.showGigsPage();
        });
        break;
      case 'agenda':
        import('../modules/calendar/calendar-views.js').then(module => {
          module.showAgendaPage();
        });
        break;
      case 'events':
        import('../modules/calendar/calendar-views.js').then(module => {
          module.showEventsPage();
        });
        break;
    }

    // Re-initialize icons after navigation
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 100);
    }
  });
}

/**
 * Update active state of bottom navigation items
 * (Wrapper function - delegates to navigation.js)
 */
function updateBottomNavActive(activeNav) {
  updateMobileNavActive(activeNav);
}

/**
 * Setup desktop navigation with dropdown and search
 * ✅ FIX: Uses event delegation to handle dynamically rendered navigation
 */
function setupDesktopNavigation() {
  // ✅ Use event delegation on document body to catch clicks from dynamically rendered nav
  document.body.addEventListener('click', (e) => {
    // Desktop Search (Zoeken)
    if (e.target.closest('#desktop-nav-search')) {
      showSearchOnly();
      return;
    }

    // Desktop Profile (Profiel)
    if (e.target.closest('#desktop-nav-profile')) {
      e.preventDefault();
      const currentUserData = getStore('currentUserData');

      if (currentUserData?.role === 'artist') {
        showArtistOwnProfile();
      } else if (currentUserData?.role === 'programmer') {
        showProgrammerProfile();
      } else {
        showProfile();
      }
      return;
    }

    // Desktop Messages
    if (e.target.closest('#desktop-nav-messages')) {
      showMessages(); // Updates hash internally
      return;
    }

    // Desktop Gigs (for artists)
    if (e.target.closest('#desktop-nav-gigs')) {
      import('../modules/calendar/calendar-views.js').then(module => {
        module.showGigsPage();
      });
      return;
    }

    // Desktop Agenda (for programmers)
    if (e.target.closest('#desktop-nav-agenda')) {
      import('../modules/calendar/calendar-views.js').then(module => {
        module.showAgendaPage();
      });
      return;
    }

    // Desktop Events (for artists)
    if (e.target.closest('#desktop-nav-events')) {
      import('../modules/calendar/calendar-views.js').then(module => {
        module.showEventsPage();
      });
      return;
    }

    // Desktop Account Settings (Email/Password)
    if (e.target.closest('#desktop-account-settings')) {
      const dropdown = document.getElementById('desktop-profile-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      showAccountSettings(); // Updates hash internally
      return;
    }

    // ✅ FIX: Desktop Logout with event delegation
    if (e.target.closest('#desktop-logout')) {
      console.log('[UI] Desktop logout clicked');
      const dropdown = document.getElementById('desktop-profile-dropdown');
      if (dropdown) dropdown.classList.add('hidden');
      handleLogout();
      return;
    }

    // Desktop Profile Button (toggle dropdown)
    const profileBtn = e.target.closest('#desktop-profile-btn');
    if (profileBtn) {
      e.stopPropagation();
      const dropdown = document.getElementById('desktop-profile-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('hidden');
      }
      return;
    }

    // Close dropdown when clicking outside
    const dropdown = document.getElementById('desktop-profile-dropdown');
    const profileBtnElement = document.getElementById('desktop-profile-btn');
    if (dropdown && profileBtnElement) {
      if (!dropdown.classList.contains('hidden') &&
          !profileBtnElement.contains(e.target) &&
          !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    }
  });

  console.log('[UI] Desktop navigation event delegation setup complete');
}

/**
 * Setup Account Settings form handlers
 * Called after rendering the Account Settings view
 */
function setupAccountSettingsHandlers() {
  const changeEmailForm = document.getElementById('change-email-form');
  const changePasswordForm = document.getElementById('change-password-form');

  if (!changeEmailForm || !changePasswordForm) {
    console.warn('[UI] Account settings forms not found');
    return;
  }

  // Handle email change
  changeEmailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newEmail = document.getElementById('new-email').value;
    const currentPassword = document.getElementById('confirm-email-password').value;
    const successMsg = document.getElementById('email-success');
    const errorMsg = document.getElementById('email-error');
    const submitBtn = e.submitter || e.target.querySelector('button[type="submit"]');

    // Reset messages
    successMsg.textContent = '';
    errorMsg.textContent = '';

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      await updateUserEmail(newEmail, currentPassword);
      successMsg.textContent = '✓ Email updated successfully! Please log in again with your new email.';

      // Clear form
      changeEmailForm.reset();

      // Log out user after email change (Firebase requirement)
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (error) {
      console.error('[UI] Error updating email:', error);
      errorMsg.textContent = `Error: ${error.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Email';
    }
  });

  // Handle password change
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const successMsg = document.getElementById('password-success');
    const errorMsg = document.getElementById('password-error');
    const submitBtn = e.submitter || e.target.querySelector('button[type="submit"]');

    // Reset messages
    successMsg.textContent = '';
    errorMsg.textContent = '';

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      errorMsg.textContent = 'New passwords do not match';
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
      await updateUserPassword(currentPassword, newPassword);
      successMsg.textContent = '✓ Password updated successfully!';

      // Clear form
      changePasswordForm.reset();
    } catch (error) {
      console.error('[UI] Error updating password:', error);
      errorMsg.textContent = `Error: ${error.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  });

  console.log('[UI] Account settings handlers setup complete');
}

/**
 * Shows the Account Settings page
 */
export function showAccountSettings() {
  console.log('[UI] Showing account settings view');
  showPage('account-settings-view');
}

/**
 * Toon Search view
 */
export function showSearch() {
  console.log('[UI] Showing search view');

  const currentUserData = getStore('currentUserData');

  // Only programmers can access search
  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn('[UI] Access denied: Only programmers can access search');
    showDashboard();
    return;
  }

  // Ensure navigation is visible FIRST
  setNavigationVisibility(true);
  import('../modules/navigation/navigation.js').then(navModule => {
    navModule.renderDesktopNav();
    navModule.renderMobileNav();
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 50);
    }
  });

  // Render dashboard zonder hash update
  showPage('dashboard-view', false);

  // Zet correcte hash
  window.history.pushState({ view: 'search' }, '', '#search');

  // Setup dashboard
  if (currentUserData.role === 'programmer') {
    const programmerDashboard = document.getElementById('programmer-dashboard');
    if (programmerDashboard) {
      programmerDashboard.style.display = 'block';
      programmerDashboard.classList.remove('hidden');
    }

    // Render programmer dashboard
    import('../modules/programmer/programmer-dashboard.js').then(module => {
      module.renderProgrammerDashboard();
      module.setupProgrammerDashboard();

      // CRITICAL: Hide profile sections, show only search
      const sectionsToHide = [
        'programmer-profile-overview',
        'programmer-public-preview',
        'programmer-about-card',
        'programmer-profile-editor',
        'programmer-pending-view'
      ];

      sectionsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.style.display = 'none';
          el.classList.add('hidden');
        }
      });

      // Show search section
      const searchSection = document.getElementById('artist-search-section');
      if (searchSection) {
        searchSection.style.display = 'block';
        searchSection.classList.remove('hidden');
        searchSection.dataset.setupComplete = 'false';  // Reset flag
      }

      // Render search UI EERST, dan setup
      import('../modules/search/search-ui.js').then(uiModule => {
        uiModule.renderArtistSearch();

        // Dan setup interactions en load data
        import('../modules/search/search-controller.js').then(ctrlModule => {
          ctrlModule.setupArtistSearch();
          setTimeout(() => ctrlModule.loadArtists(), 100);
        });
      });
    });
  }

  updateMobileNavActive('search');

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 150);
  }
}

/**
 * Toon Profile view
 */
export function showProfile() {
  console.log('[UI] Showing profile view');

  const currentUserData = getStore('currentUserData');
  if (!currentUserData) {
    console.warn("[UI] No user data found, cannot show profile");
    // Don't redirect to home, just return
    return;
  }

  if (currentUserData.role === 'artist') {
    showArtistOwnProfile();
  } else if (currentUserData.role === 'programmer') {
    showProgrammerProfile();
  }
}

/**
 * Shows the artist's own profile in programmer-view style
 */
export async function showArtistOwnProfile() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData) {
    console.warn("Geen gebruikersdata gevonden");
    return;
  }

  console.log('[UI] Showing artist own profile view');

  // ALWAYS ensure navigation is visible FIRST
  setNavigationVisibility(true);
  const navModule = await import('../modules/navigation/navigation.js');
  navModule.renderDesktopNav();
  navModule.renderMobileNav();

  // Render de dashboard container structuur ZONDER hash update
  showPage('dashboard-view', false);

  // Zet correcte hash voor artist profile (use replaceState to avoid duplicate history)
  if (window.location.hash !== '#profile') {
    window.history.pushState({ view: 'artist-profile' }, '', '#profile');
  }

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  // Show artist dashboard, hide programmer
  if (artistDashboard) {
    artistDashboard.style.display = 'block';
    artistDashboard.classList.remove('hidden');
  }
  if (programmerDashboard) {
    programmerDashboard.style.display = 'none';
    programmerDashboard.classList.add('hidden');
  }

  // Import and render artist own profile view
  const { renderArtistOwnProfile } = await import('../modules/artist/artist-own-profile.js');
  renderArtistOwnProfile(currentUserData);

  // Update mobile nav
  updateMobileNavActive('profile');

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows artist profile editor with correct URL
 */
export async function showArtistEditProfile() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'artist') {
    console.warn('[UI] Only artists can access edit profile');
    return;
  }

  console.log('[UI] Showing artist edit profile');

  // Render dashboard container without hash update
  showPage('dashboard-view', false);

  // Set correct hash
  window.history.pushState({ view: 'artist-edit-profile' }, '', '#edit-profile');

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  if (artistDashboard) {
    artistDashboard.style.display = 'block';
    artistDashboard.classList.remove('hidden');
  }
  if (programmerDashboard) {
    programmerDashboard.style.display = 'none';
    programmerDashboard.classList.add('hidden');
  }

  // Import and show profile editor
  const { showProfileEditorView } = await import('../modules/artist/artist-own-profile.js');
  if (showProfileEditorView) {
    showProfileEditorView();
  }

  updateMobileNavActive('profile');

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}


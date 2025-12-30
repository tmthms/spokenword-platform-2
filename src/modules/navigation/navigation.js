/**
 * navigation.js
 * Centralized navigation component that renders both desktop and mobile navigation.
 * This ensures consistent navigation state across all views.
 */

import { getStore } from '../../utils/store.js';

/**
 * Renders the desktop top navigation bar
 */
export function renderDesktopNav() {
  const container = document.getElementById('desktop-nav-container');
  if (!container) {
    console.warn('Desktop nav container not found');
    return;
  }

  const currentUserData = getStore('currentUserData');

  // Get profile picture URL or generate placeholder
  let profilePicUrl = 'https://placehold.co/40x40';
  if (currentUserData?.profilePicUrl) {
    profilePicUrl = currentUserData.profilePicUrl;
  } else if (currentUserData) {
    const initial = currentUserData.firstName?.charAt(0) || currentUserData.stageName?.charAt(0) || 'U';
    profilePicUrl = `https://placehold.co/40x40/e0e7ff/6366f1?text=${encodeURIComponent(initial)}`;
  }

  // Only show search for programmers
  const isProgrammer = currentUserData?.role === 'programmer';

  container.innerHTML = `
    <nav id="desktop-top-nav" class="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-gray-900 tracking-tight">
              SPOKEN WORD PLATFORM
            </h1>
          </div>

          <!-- Menu Items -->
          <div class="flex items-center space-x-8">
            ${isProgrammer ? `<button id="desktop-nav-search" class="text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Zoeken
            </button>` : ''}
            <button id="desktop-nav-profile" class="text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Profiel
            </button>
            <button id="desktop-nav-messages" class="relative text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Berichten
              <span id="messages-badge-desktop" class="notification-badge hidden">0</span>
            </button>

            <!-- Profile Menu Dropdown -->
            <div class="relative">
              <button id="desktop-profile-btn" class="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
                <img id="desktop-profile-pic" src="${profilePicUrl}" class="h-8 w-8 rounded-full object-cover" style="max-width: 32px; max-height: 32px;" alt="Profile">
                <i data-lucide="chevron-down" class="h-4 w-4"></i>
              </button>

              <!-- Dropdown Menu (hidden by default) -->
              <div id="desktop-profile-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <button id="desktop-profile-settings" class="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 font-medium">
                  Profiel Instellingen
                </button>
                <button id="desktop-account-settings" class="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 font-medium">
                  Account Instellingen
                </button>
                <hr class="my-1 border-gray-200">
                <button id="desktop-logout" class="block w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `;

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Renders the mobile bottom navigation bar
 */
export function renderMobileNav() {
  const container = document.getElementById('mobile-nav-container');
  if (!container) {
    console.warn('Mobile nav container not found');
    return;
  }

  const currentUserData = getStore('currentUserData');

  // Only show search for programmers
  const isProgrammer = currentUserData?.role === 'programmer';

  container.innerHTML = `
    <nav id="bottom-nav" class="bottom-nav">
      ${isProgrammer ? `<button class="bottom-nav-item active" data-nav="search">
        <i data-lucide="search" class="bottom-nav-icon"></i>
        <span class="bottom-nav-label">Zoeken</span>
      </button>` : ''}
      <button class="bottom-nav-item" data-nav="messages">
        <i data-lucide="message-circle" class="bottom-nav-icon"></i>
        <span class="bottom-nav-label">Berichten</span>
      </button>
      <button class="bottom-nav-item" data-nav="profile">
        <i data-lucide="user" class="bottom-nav-icon"></i>
        <span class="bottom-nav-label">Profiel</span>
      </button>
      <button class="bottom-nav-item" data-nav="settings">
        <i data-lucide="settings" class="bottom-nav-icon"></i>
        <span class="bottom-nav-label">Instellingen</span>
      </button>
    </nav>
  `;

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Updates the active state of mobile bottom navigation
 * @param {string} activeNav - The navigation item to mark as active ('search', 'messages', 'profile')
 */
export function updateMobileNavActive(activeNav) {
  const bottomNav = document.getElementById('bottom-nav');
  if (!bottomNav) return;

  const allItems = bottomNav.querySelectorAll('.bottom-nav-item');
  allItems.forEach(item => {
    if (item.dataset.nav === activeNav) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Updates the desktop navigation based on current user state
 * Refreshes profile picture
 */
export function updateDesktopNav() {
  const currentUserData = getStore('currentUserData');
  if (!currentUserData) return;

  // Update profile picture
  const profilePic = document.getElementById('desktop-profile-pic');
  if (profilePic) {
    if (currentUserData.profilePicUrl) {
      profilePic.src = currentUserData.profilePicUrl;
    } else {
      const initial = currentUserData.firstName?.charAt(0) || currentUserData.stageName?.charAt(0) || 'U';
      profilePic.src = `https://placehold.co/40x40/e0e7ff/6366f1?text=${encodeURIComponent(initial)}`;
    }
  }
}

/**
 * Shows or hides navigation based on authentication state
 * @param {boolean} isAuthenticated - Whether the user is logged in
 */
export function setNavigationVisibility(isAuthenticated) {
  const desktopContainer = document.getElementById('desktop-nav-container');
  const mobileContainer = document.getElementById('mobile-nav-container');

  if (isAuthenticated) {
    // Show navigation
    if (desktopContainer) desktopContainer.classList.remove('hidden');
    if (mobileContainer) mobileContainer.classList.remove('hidden');
  } else {
    // Hide navigation AND clear contents
    if (desktopContainer) {
      desktopContainer.classList.add('hidden');
      desktopContainer.innerHTML = ''; // Clear nav HTML
    }
    if (mobileContainer) {
      mobileContainer.classList.add('hidden');
      mobileContainer.innerHTML = ''; // Clear nav HTML
    }
  }
}

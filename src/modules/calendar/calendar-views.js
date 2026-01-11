/**
 * calendar-views.js
 * View rendering functies voor Gigs, Agenda en Evenementen pagina's
 */

import { getCMSText } from '../../services/cms-service.js';

/**
 * Shows the Gigs page for artists (their own gigs)
 */
export async function showGigsPage() {
  const { getStore } = await import('../../utils/store.js');
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'artist') {
    console.warn('[UI] Only artists can access gigs page');
    return;
  }

  console.log('[UI] Showing gigs page');

  // Render navigation
  const navModule = await import('../navigation/navigation.js');
  navModule.renderDesktopNav();
  navModule.renderMobileNav();

  // Show dashboard view container
  const { showPage } = await import('../../ui/ui.js');
  showPage('dashboard-view', false);
  window.history.pushState({ view: 'gigs' }, '', '#gigs');

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  if (artistDashboard) {
    artistDashboard.style.display = 'block';
    artistDashboard.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
        <div id="upcoming-gigs-container">
          <!-- Calendar module renders here -->
        </div>
      </div>
    `;
  }
  if (programmerDashboard) {
    programmerDashboard.style.display = 'none';
  }

  // Initialize calendar
  const { initCalendar } = await import('./calendar-controller.js');
  await initCalendar();

  // Update mobile nav active state
  const { updateMobileNavActive } = await import('../navigation/navigation.js');
  updateMobileNavActive('gigs');

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows the Agenda page for programmers (all upcoming gigs)
 */
export async function showAgendaPage() {
  const { getStore } = await import('../../utils/store.js');
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'programmer') {
    console.warn('[UI] Only programmers can access agenda page');
    return;
  }

  console.log('[UI] Showing agenda page');

  // Render navigation
  const navModule = await import('../navigation/navigation.js');
  navModule.renderDesktopNav();
  navModule.renderMobileNav();

  // Show dashboard view container
  const { showPage } = await import('../../ui/ui.js');
  showPage('dashboard-view', false);
  window.history.pushState({ view: 'agenda' }, '', '#agenda');

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  if (artistDashboard) {
    artistDashboard.style.display = 'none';
  }
  if (programmerDashboard) {
    programmerDashboard.style.display = 'block';
    programmerDashboard.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">${getCMSText('agenda.title', 'Agenda')}</h1>
          <p class="text-gray-500 mt-1">${getCMSText('agenda.subtitle', 'Ontdek waar artiesten binnenkort optreden')}</p>
        </div>

        <!-- Main Content: Responsive Layout -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Filters Sidebar (Desktop Only) -->
          <aside id="agenda-filters-container" class="hidden lg:block w-64 flex-shrink-0">
            <!-- Month Calendar & Filters render here -->
          </aside>

          <!-- Events List -->
          <main class="flex-1">
            <!-- Mobile Date Selector -->
            <div id="mobile-date-selector" class="lg:hidden mb-4">
              <!-- Month/Year header met navigatie -->
              <div class="flex items-center justify-between mb-3">
                <button id="mobile-month-prev" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i data-lucide="chevron-left" class="w-5 h-5 text-gray-600"></i>
                </button>
                <span id="mobile-month-label" class="font-semibold text-gray-900">Januari 2026</span>
                <button id="mobile-month-next" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i data-lucide="chevron-right" class="w-5 h-5 text-gray-600"></i>
                </button>
              </div>

              <!-- Compact calendar grid -->
              <div id="mobile-calendar-grid" class="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <!-- Weekday headers -->
                <div class="grid grid-cols-7 gap-1 mb-2">
                  <div class="text-center text-xs font-medium text-gray-500">Ma</div>
                  <div class="text-center text-xs font-medium text-gray-500">Di</div>
                  <div class="text-center text-xs font-medium text-gray-500">Wo</div>
                  <div class="text-center text-xs font-medium text-gray-500">Do</div>
                  <div class="text-center text-xs font-medium text-gray-500">Vr</div>
                  <div class="text-center text-xs font-medium text-gray-500">Za</div>
                  <div class="text-center text-xs font-medium text-gray-500">Zo</div>
                </div>
                <!-- Days grid renders here -->
                <div id="mobile-calendar-days" class="grid grid-cols-7 gap-1">
                  <!-- Days -->
                </div>
              </div>
            </div>

            <!-- View Mode Toggle -->
            <div class="flex items-center justify-between mb-4">
              <div id="filter-mode-container"></div>

              <!-- List/Map Toggle -->
              <div class="flex gap-2">
                <button id="view-mode-list" class="view-mode-btn px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white">
                  <i data-lucide="list" class="w-4 h-4 inline-block mr-1"></i>
                  ${getCMSText('agenda.list', 'Lijst')}
                </button>
                <button id="view-mode-map" class="view-mode-btn px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <i data-lucide="map" class="w-4 h-4 inline-block mr-1"></i>
                  ${getCMSText('agenda.map', 'Kaart')}
                </button>
              </div>
            </div>

            <!-- List View -->
            <div id="agenda-events-list" class="space-y-4">
              <!-- Loading -->
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>

            <!-- Map View (hidden by default) -->
            <div id="agenda-map-container" class="hidden">
              <div id="community-map" class="w-full h-[500px] lg:h-[600px] rounded-2xl border border-gray-200 shadow-sm"></div>
            </div>
          </main>
        </div>
      </div>
    `;
  }

  // Initialize the new Agenda View
  const { initAgendaView } = await import('./calendar-controller.js');
  await initAgendaView();

  // Update mobile nav active state
  const { updateMobileNavActive } = await import('../navigation/navigation.js');
  updateMobileNavActive('agenda');

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * Shows the Events page for artists (all upcoming events)
 */
export async function showEventsPage() {
  const { getStore } = await import('../../utils/store.js');
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentUserData.role !== 'artist') {
    console.warn('[UI] Only artists can access events page');
    return;
  }

  console.log('[UI] Showing events page');

  // Render navigation
  const navModule = await import('../navigation/navigation.js');
  navModule.renderDesktopNav();
  navModule.renderMobileNav();

  // Show dashboard view container
  const { showPage } = await import('../../ui/ui.js');
  showPage('dashboard-view', false);
  window.history.pushState({ view: 'events' }, '', '#events');

  // Get containers
  const artistDashboard = document.getElementById('artist-dashboard');
  const programmerDashboard = document.getElementById('programmer-dashboard');

  // Use artist dashboard for artists
  if (programmerDashboard) {
    programmerDashboard.style.display = 'none';
  }
  if (artistDashboard) {
    artistDashboard.style.display = 'block';
    artistDashboard.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 py-6">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900">${getCMSText('agenda.title', 'Agenda')}</h1>
          <p class="text-gray-500 mt-1">${getCMSText('agenda.subtitle', 'Ontdek waar artiesten binnenkort optreden')}</p>
        </div>

        <!-- Main Content: Responsive Layout -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Filters Sidebar (Desktop Only) -->
          <aside id="agenda-filters-container" class="hidden lg:block w-64 flex-shrink-0">
            <!-- Month Calendar & Filters render here -->
          </aside>

          <!-- Events List -->
          <main class="flex-1">
            <!-- Mobile Date Selector -->
            <div id="mobile-date-selector" class="lg:hidden mb-4">
              <!-- Month/Year header met navigatie -->
              <div class="flex items-center justify-between mb-3">
                <button id="mobile-month-prev" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i data-lucide="chevron-left" class="w-5 h-5 text-gray-600"></i>
                </button>
                <span id="mobile-month-label" class="font-semibold text-gray-900">Januari 2026</span>
                <button id="mobile-month-next" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <i data-lucide="chevron-right" class="w-5 h-5 text-gray-600"></i>
                </button>
              </div>

              <!-- Compact calendar grid -->
              <div id="mobile-calendar-grid" class="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                <!-- Weekday headers -->
                <div class="grid grid-cols-7 gap-1 mb-2">
                  <div class="text-center text-xs font-medium text-gray-500">Ma</div>
                  <div class="text-center text-xs font-medium text-gray-500">Di</div>
                  <div class="text-center text-xs font-medium text-gray-500">Wo</div>
                  <div class="text-center text-xs font-medium text-gray-500">Do</div>
                  <div class="text-center text-xs font-medium text-gray-500">Vr</div>
                  <div class="text-center text-xs font-medium text-gray-500">Za</div>
                  <div class="text-center text-xs font-medium text-gray-500">Zo</div>
                </div>
                <!-- Days grid renders here -->
                <div id="mobile-calendar-days" class="grid grid-cols-7 gap-1">
                  <!-- Days -->
                </div>
              </div>
            </div>

            <!-- View Mode Toggle -->
            <div class="flex items-center justify-between mb-4">
              <div id="filter-mode-container"></div>

              <!-- List/Map Toggle -->
              <div class="flex gap-2">
                <button id="view-mode-list" class="view-mode-btn px-3 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 text-white">
                  <i data-lucide="list" class="w-4 h-4 inline-block mr-1"></i>
                  ${getCMSText('agenda.list', 'Lijst')}
                </button>
                <button id="view-mode-map" class="view-mode-btn px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
                  <i data-lucide="map" class="w-4 h-4 inline-block mr-1"></i>
                  ${getCMSText('agenda.map', 'Kaart')}
                </button>
              </div>
            </div>

            <!-- List View -->
            <div id="agenda-events-list" class="space-y-4">
              <!-- Loading -->
              <div class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>

            <!-- Map View (hidden by default) -->
            <div id="agenda-map-container" class="hidden">
              <div id="community-map" class="w-full h-[500px] lg:h-[600px] rounded-2xl border border-gray-200 shadow-sm"></div>
            </div>
          </main>
        </div>
      </div>
    `;
  }

  // Initialize the Agenda View (reuse same logic)
  const { initAgendaView } = await import('./calendar-controller.js');
  await initAgendaView();

  // Update mobile nav active state
  const { updateMobileNavActive } = await import('../navigation/navigation.js');
  updateMobileNavActive('events');

  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
  }
}

/**
 * calendar-controller.js
 * Event handling en initialisatie voor calendar module
 */

import { getStore } from '../../utils/store.js';
import {
  addEvent,
  getArtistEvents,
  updateEvent,
  deleteEvent,
  getEvent,
  getAllUpcomingEvents,
  getEventsForDateRange,
  getEventsGroupedByDate,
  getEventCountsPerDate,
  toggleAttendance
} from './calendar-service.js';
import {
  renderUpcomingGigsWidget,
  renderGigModal,
  renderDeleteConfirmModal,
  renderClusterCard,
  renderSoloGigCard,
  renderAgendaFilters,
  renderAgendaLayout,
  renderMonthCalendar
} from './calendar-ui.js';

let currentEvents = [];
let currentPosterCanvas = null;
let currentPosterTheme = 'indigo';
let currentPosterArtistData = null;
let currentPosterEvents = null;

// Agenda state
let agendaState = {
  selectedDate: new Date(),
  filterMode: 'month', // 'day' of 'month'
  events: [],
  filteredEvents: [],
  filters: {
    types: [], // lege array = alle types
    region: 'all' // 'all', 'nederland', 'vlaanderen', 'brussel'
  },
  viewMode: 'list', // 'list' of 'map'
  isLoading: false
};

// Getter voor externe toegang
export function getAgendaState() {
  return { ...agendaState };
}

/**
 * Initialize calendar module voor artist dashboard
 */
export async function initCalendar() {
  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');

  if (!currentUser || currentUserData?.role !== 'artist') {
    console.log('[CALENDAR] Not an artist, skipping calendar init');
    return;
  }

  console.log('[CALENDAR] Initializing calendar module');

  // Load events
  await loadAndRenderEvents();

  // Setup event listeners
  setupCalendarEventListeners();
}

/**
 * Load events en render widget
 */
export async function loadAndRenderEvents() {
  const currentUser = getStore('currentUser');
  if (!currentUser) return;

  try {
    currentEvents = await getArtistEvents(currentUser.uid, { upcomingOnly: true, limitCount: 10 });
    await renderGigsWidget();
  } catch (error) {
    console.error('[CALENDAR] Error loading events:', error);
    currentEvents = [];
    await renderGigsWidget();
  }
}

/**
 * Render de gigs widget in het dashboard
 */
async function renderGigsWidget() {
  const container = document.getElementById('upcoming-gigs-container');
  if (!container) {
    console.warn('[CALENDAR] Gigs container not found');
    return;
  }

  const currentUser = getStore('currentUser');

  // Load and render attendee notifications for artist
  if (currentUser) {
    const { getAttendeeNotifications, getAttendeeProfiles } = await import('./calendar-service.js');
    const notifications = await getAttendeeNotifications(currentUser.uid);

    // Haal profielen op voor elke notificatie
    for (const notification of notifications) {
      notification.profiles = await getAttendeeProfiles(notification.attendees);
    }

    if (notifications.length > 0) {
      const { renderAttendeeNotifications } = await import('./calendar-ui.js');

      // Remove existing notifications first
      const existingNotifications = document.getElementById('attendee-notifications-container');
      if (existingNotifications) {
        existingNotifications.remove();
      }

      const notificationsHtml = renderAttendeeNotifications(notifications);

      // Insert before the gigs container
      container.insertAdjacentHTML('beforebegin', `
        <div id="attendee-notifications-container">
          ${notificationsHtml}
        </div>
      `);
    }
  }

  container.innerHTML = renderUpcomingGigsWidget(currentEvents, true);

  // Render poster button
  const posterContainer = document.getElementById('poster-generator-container');
  if (posterContainer) {
    const { renderPosterButton } = await import('./poster-generator.js');
    posterContainer.innerHTML = renderPosterButton(currentEvents.length);
  }

  // Re-initialize Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Setup event listeners via event delegation
 */
function setupCalendarEventListeners() {
  // Use event delegation on document.body
  document.body.addEventListener('click', handleCalendarClick);
  console.log('[CALENDAR] Event listeners attached');
}

/**
 * Handle all calendar-related clicks
 * @param {Event} e - Click event
 */
async function handleCalendarClick(e) {
  const target = e.target;

  // Add Gig buttons
  if (target.closest('#add-gig-btn') || target.closest('#add-first-gig-btn')) {
    e.preventDefault();
    openGigModal();
    return;
  }

  // Edit Gig button
  if (target.closest('.edit-gig-btn')) {
    e.preventDefault();
    const eventId = target.closest('.edit-gig-btn').dataset.eventId;
    await openEditGigModal(eventId);
    return;
  }

  // Delete Gig button
  if (target.closest('.delete-gig-btn')) {
    e.preventDefault();
    const eventId = target.closest('.delete-gig-btn').dataset.eventId;
    openDeleteConfirmation(eventId);
    return;
  }

  // Close modal
  if (target.closest('#close-gig-modal') || target.closest('#cancel-gig-btn')) {
    e.preventDefault();
    closeGigModal();
    return;
  }

  // Cancel delete
  if (target.closest('#cancel-delete-gig')) {
    e.preventDefault();
    closeDeleteModal();
    return;
  }

  // Confirm delete
  if (target.closest('#confirm-delete-gig')) {
    e.preventDefault();
    const eventId = target.closest('#confirm-delete-gig').dataset.eventId;
    await confirmDeleteGig(eventId);
    return;
  }

  // Close modal on backdrop click
  if (target.id === 'gig-modal' || target.id === 'delete-gig-modal') {
    e.preventDefault();
    closeGigModal();
    closeDeleteModal();
    return;
  }

  // Generate Poster button
  if (target.closest('#generate-poster-btn')) {
    e.preventDefault();
    await openPosterGenerator();
    return;
  }

  // Close poster modal
  if (target.closest('#close-poster-modal') || target.closest('#close-poster-modal-btn')) {
    e.preventDefault();
    closePosterModal();
    return;
  }

  // Download poster
  if (target.closest('#download-poster-btn')) {
    e.preventDefault();
    await downloadCurrentPoster();
    return;
  }

  // Click op backdrop sluit modal
  if (target.id === 'poster-modal') {
    e.preventDefault();
    closePosterModal();
    return;
  }

  // Theme select button
  if (target.closest('.theme-select-btn')) {
    e.preventDefault();
    const btn = target.closest('.theme-select-btn');
    const themeKey = btn.dataset.theme;
    if (themeKey) {
      await switchPosterTheme(themeKey);
    }
    return;
  }

  // Toggle attendees list
  if (target.closest('.toggle-attendees-btn')) {
    e.preventDefault();
    const btn = target.closest('.toggle-attendees-btn');
    const eventId = btn.dataset.eventId;
    const listEl = document.getElementById(`attendees-list-${eventId}`);

    if (listEl) {
      listEl.classList.toggle('hidden');
      btn.textContent = listEl.classList.contains('hidden') ? 'Bekijk namen' : 'Verberg namen';
    }
    return;
  }
}

/**
 * Open modal voor nieuwe gig
 */
function openGigModal() {
  // Remove existing modal if any
  closeGigModal();

  // Add modal to DOM
  const modalHtml = renderGigModal(null);
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Setup form submit handler
  const form = document.getElementById('gig-form');
  if (form) {
    form.addEventListener('submit', handleGigFormSubmit);
  }

  // Re-init icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }

  console.log('[CALENDAR] Add gig modal opened');
}

/**
 * Open modal voor edit gig
 * @param {string} eventId - Event ID
 */
async function openEditGigModal(eventId) {
  try {
    const event = await getEvent(eventId);
    if (!event) {
      console.error('[CALENDAR] Event not found:', eventId);
      return;
    }

    // Remove existing modal
    closeGigModal();

    // Add modal with event data
    const modalHtml = renderGigModal(event);
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Setup form submit handler
    const form = document.getElementById('gig-form');
    if (form) {
      form.addEventListener('submit', handleGigFormSubmit);
    }

    // Re-init icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 50);
    }

    console.log('[CALENDAR] Edit gig modal opened for:', eventId);

  } catch (error) {
    console.error('[CALENDAR] Error opening edit modal:', error);
  }
}

/**
 * Handle form submit (add or edit)
 * @param {Event} e - Submit event
 */
async function handleGigFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const currentUser = getStore('currentUser');
  const currentUserData = getStore('currentUserData');

  if (!currentUser || !currentUserData) {
    console.error('[CALENDAR] No user data');
    return;
  }

  const eventData = {
    date: formData.get('date'),
    city: formData.get('city'),
    venue: formData.get('venue'),
    type: formData.get('type'),
    link: formData.get('link') || ''
  };

  const eventId = formData.get('eventId');
  const isEdit = !!eventId;

  // Disable submit button
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = isEdit ? 'Opslaan...' : 'Toevoegen...';
  }

  try {
    if (isEdit) {
      // Update existing event
      await updateEvent(eventId, eventData);
      console.log('[CALENDAR] Event updated:', eventId);
    } else {
      // Add new event
      await addEvent({
        ...eventData,
        artistId: currentUser.uid,
        artistName: currentUserData.stageName || `${currentUserData.firstName} ${currentUserData.lastName}`,
        artistProfilePicUrl: currentUserData.profilePicUrl || ''
      });
      console.log('[CALENDAR] Event added');
    }

    // Close modal and refresh list
    closeGigModal();
    await loadAndRenderEvents();

  } catch (error) {
    console.error('[CALENDAR] Error saving event:', error);
    alert('Er ging iets mis bij het opslaan. Probeer het opnieuw.');

    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Opslaan' : 'Toevoegen';
    }
  }
}

/**
 * Open delete confirmation modal
 * @param {string} eventId - Event ID
 */
function openDeleteConfirmation(eventId) {
  const event = currentEvents.find(e => e.id === eventId);
  if (!event) return;

  // Remove existing modals
  closeDeleteModal();

  const modalHtml = renderDeleteConfirmModal(eventId, event.venue || 'dit optreden');
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Re-init icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Confirm and execute delete
 * @param {string} eventId - Event ID
 */
async function confirmDeleteGig(eventId) {
  try {
    await deleteEvent(eventId);
    closeDeleteModal();
    await loadAndRenderEvents();
    console.log('[CALENDAR] Event deleted:', eventId);
  } catch (error) {
    console.error('[CALENDAR] Error deleting event:', error);
    alert('Er ging iets mis bij het verwijderen.');
  }
}

/**
 * Close gig modal
 */
function closeGigModal() {
  const modal = document.getElementById('gig-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Close delete modal
 */
function closeDeleteModal() {
  const modal = document.getElementById('delete-gig-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Get current events (for external access)
 * @returns {Array} Current events array
 */
export function getCurrentEvents() {
  return currentEvents;
}

/**
 * Load events for a specific artist (for public profile view)
 * @param {string} artistId - Artist UID
 * @returns {Promise<Array>} Events array
 */
export async function loadArtistEventsForProfile(artistId) {
  try {
    return await getArtistEvents(artistId, { upcomingOnly: true, limitCount: 5 });
  } catch (error) {
    console.error('[CALENDAR] Error loading artist events:', error);
    return [];
  }
}

/**
 * Filter events op basis van huidige filters
 */
function applyFilters(events) {
  let filtered = [...events];

  // Filter op type
  if (agendaState.filters.types.length > 0) {
    filtered = filtered.filter(e => agendaState.filters.types.includes(e.type));
  }

  // Filter op regio (simpele string match op city)
  if (agendaState.filters.region !== 'all') {
    const regionCities = {
      'nederland': ['amsterdam', 'rotterdam', 'utrecht', 'den haag', 'eindhoven', 'groningen', 'tilburg', 'almere', 'breda', 'nijmegen'],
      'vlaanderen': ['antwerpen', 'gent', 'brugge', 'leuven', 'mechelen', 'aalst', 'kortrijk', 'hasselt', 'oostende', 'sint-niklaas'],
      'brussel': ['brussel', 'brussels', 'bruxelles']
    };
    const cities = regionCities[agendaState.filters.region] || [];
    filtered = filtered.filter(e => {
      const cityLower = (e.city || '').toLowerCase();
      return cities.some(c => cityLower.includes(c));
    });
  }

  return filtered;
}

/**
 * Filter events voor geselecteerde datum
 */
function getEventsForSelectedDate(events) {
  const selected = agendaState.selectedDate;
  return events.filter(e => {
    if (!e.date) return false;
    const eventDate = new Date(e.date);
    return eventDate.toDateString() === selected.toDateString();
  });
}

/**
 * Filter events op basis van filter mode (dag of maand)
 */
function getFilteredEventsByDateMode(events) {
  const selected = agendaState.selectedDate;

  if (agendaState.filterMode === 'day') {
    // Filter op exacte datum
    return events.filter(e => {
      if (!e.date) return false;
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === selected.toDateString();
    });
  } else {
    // Filter op maand
    return events.filter(e => {
      if (!e.date) return false;
      const eventDate = new Date(e.date);
      return eventDate.getMonth() === selected.getMonth()
        && eventDate.getFullYear() === selected.getFullYear();
    });
  }
}

/**
 * Render mobile calendar days
 */
async function renderMobileCalendarDays() {
  const container = document.getElementById('mobile-calendar-days');
  const monthLabel = document.getElementById('mobile-month-label');

  if (!container) return;

  const selectedDate = agendaState.selectedDate;
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Update month label
  if (monthLabel) {
    const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
                        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    monthLabel.textContent = `${monthNames[month]} ${year}`;
  }

  // Get event counts for this month
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  let eventCounts = {};
  try {
    eventCounts = await getEventCountsPerDate(startOfMonth, endOfMonth);
  } catch (error) {
    console.warn('[CALENDAR] Could not fetch event counts:', error);
  }

  // Calculate days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = '';

  // Empty cells for previous month
  for (let i = 0; i < startDay; i++) {
    html += '<div class="w-8 h-8"></div>';
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const hasEvents = eventCounts[dateStr] > 0;

    let classes = 'w-8 h-8 flex flex-col items-center justify-center text-sm rounded-lg cursor-pointer transition-colors relative';

    if (isSelected) {
      classes += ' bg-indigo-600 text-white font-semibold';
    } else if (isToday) {
      classes += ' bg-indigo-100 text-indigo-700 font-semibold';
    } else {
      classes += ' text-gray-700 hover:bg-gray-100';
    }

    // Event dot
    const dotHtml = hasEvents
      ? `<span class="absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}"></span>`
      : '';

    html += `
      <button class="mobile-calendar-day ${classes}" data-date="${dateStr}">
        <span>${day}</span>
        ${dotHtml}
      </button>
    `;
  }

  container.innerHTML = html;
}

/**
 * Setup event listeners voor Agenda pagina
 */
function setupAgendaEventListeners() {
  document.body.addEventListener('click', handleAgendaClick);
  console.log('[CALENDAR] Agenda event listeners attached');
}

/**
 * Handle alle Agenda-gerelateerde clicks
 */
async function handleAgendaClick(e) {
  const target = e.target;

  // Mobile calendar day click
  if (target.closest('.mobile-calendar-day')) {
    e.preventDefault();
    const dayEl = target.closest('.mobile-calendar-day');
    const dateStr = dayEl.dataset.date;
    if (dateStr) {
      // Parse as local date, not UTC
      const [year, month, day] = dateStr.split('-').map(Number);
      await selectDate(new Date(year, month - 1, day));
    }
    return;
  }

  // Mobile month navigation
  if (target.closest('#mobile-month-prev')) {
    e.preventDefault();
    const newDate = new Date(agendaState.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    agendaState.selectedDate = newDate;
    await renderAgendaContent();
    return;
  }

  if (target.closest('#mobile-month-next')) {
    e.preventDefault();
    const newDate = new Date(agendaState.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    agendaState.selectedDate = newDate;
    await renderAgendaContent();
    return;
  }

  // Month calendar day click (desktop)
  if (target.closest('.calendar-day')) {
    e.preventDefault();
    const dayEl = target.closest('.calendar-day');
    const dateStr = dayEl.dataset.date;
    if (dateStr) {
      // Parse as local date, not UTC
      const [year, month, day] = dateStr.split('-').map(Number);
      await selectDate(new Date(year, month - 1, day));
    }
    return;
  }

  // Month navigation
  if (target.closest('#month-prev')) {
    e.preventDefault();
    const newDate = new Date(agendaState.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    agendaState.selectedDate = newDate;
    await renderAgendaContent();
    return;
  }

  if (target.closest('#month-next')) {
    e.preventDefault();
    const newDate = new Date(agendaState.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    agendaState.selectedDate = newDate;
    await renderAgendaContent();
    return;
  }

  // Filter mode toggle
  if (target.closest('#filter-mode-day')) {
    e.preventDefault();
    agendaState.filterMode = 'day';
    await renderAgendaContent();
    return;
  }

  if (target.closest('#filter-mode-month')) {
    e.preventDefault();
    agendaState.filterMode = 'month';
    await renderAgendaContent();
    return;
  }

  // Type filter checkbox
  if (target.name === 'event-type') {
    const type = target.value;
    await toggleTypeFilter(type);
    return;
  }

  // Regio filter dropdown
  if (target.name === 'region-filter') {
    const region = target.value;
    await setRegionFilter(region);
    return;
  }

  // "Ik ga ook" button
  if (target.closest('.attend-event-btn')) {
    e.preventDefault();
    const btn = target.closest('.attend-event-btn');
    const eventId = btn.dataset.eventId;
    await toggleEventAttendance(eventId);
    return;
  }

  // View mode toggle - List
  if (target.closest('#view-mode-list')) {
    e.preventDefault();
    setViewMode('list');
    return;
  }

  // View mode toggle - Map
  if (target.closest('#view-mode-map')) {
    e.preventDefault();
    setViewMode('map');
    return;
  }

  // Event card click (naar detail of artiest profiel)
  if (target.closest('.solo-gig-card')) {
    const card = target.closest('.solo-gig-card');
    const artistId = card.dataset.artistId;
    if (artistId && !target.closest('a') && !target.closest('button')) {
      // Navigeer naar artiest profiel
      window.location.hash = `#artist/${artistId}`;
    }
    return;
  }
}

/**
 * Selecteer een datum en herlaad events
 */
async function selectDate(date) {
  agendaState.selectedDate = date;
  console.log('[CALENDAR] Date selected:', date.toDateString());
  await renderAgendaContent();
}

/**
 * Toggle type filter
 */
async function toggleTypeFilter(type) {
  const types = agendaState.filters.types;
  const index = types.indexOf(type);

  if (index > -1) {
    types.splice(index, 1);
  } else {
    types.push(type);
  }

  console.log('[CALENDAR] Type filters:', types);
  await renderAgendaContent();
}

/**
 * Set regio filter
 */
async function setRegionFilter(region) {
  agendaState.filters.region = region;
  console.log('[CALENDAR] Region filter:', region);
  await renderAgendaContent();
}

/**
 * Toggle attendance voor een event
 */
async function toggleEventAttendance(eventId) {
  const currentUser = getStore('currentUser');

  if (!currentUser) {
    console.warn('[CALENDAR] Must be logged in to attend');
    return;
  }

  try {
    await toggleAttendance(eventId, currentUser.uid);

    // Update lokale state en UI
    const event = agendaState.events.find(e => e.id === eventId);
    if (event) {
      const isAttending = event.attendees?.includes(currentUser.uid);
      if (isAttending) {
        event.attendees = event.attendees.filter(id => id !== currentUser.uid);
        event.attendeeCount = (event.attendeeCount || 1) - 1;
      } else {
        event.attendees = [...(event.attendees || []), currentUser.uid];
        event.attendeeCount = (event.attendeeCount || 0) + 1;
      }
    }

    await renderAgendaContent();
    console.log('[CALENDAR] Attendance toggled for event:', eventId);

  } catch (error) {
    console.error('[CALENDAR] Error toggling attendance:', error);
  }
}

/**
 * Switch tussen lijst en kaart weergave
 * @param {string} mode - 'list' of 'map'
 */
async function setViewMode(mode) {
  agendaState.viewMode = mode;

  const listContainer = document.getElementById('agenda-events-list');
  const mapContainer = document.getElementById('agenda-map-container');
  const listBtn = document.getElementById('view-mode-list');
  const mapBtn = document.getElementById('view-mode-map');

  if (mode === 'list') {
    // Show list, hide map
    if (listContainer) listContainer.classList.remove('hidden');
    if (mapContainer) mapContainer.classList.add('hidden');

    // Update button styles
    if (listBtn) {
      listBtn.classList.remove('bg-gray-100', 'text-gray-700');
      listBtn.classList.add('bg-indigo-600', 'text-white');
    }
    if (mapBtn) {
      mapBtn.classList.remove('bg-indigo-600', 'text-white');
      mapBtn.classList.add('bg-gray-100', 'text-gray-700');
    }

  } else {
    // Show map, hide list
    if (listContainer) listContainer.classList.add('hidden');
    if (mapContainer) mapContainer.classList.remove('hidden');

    // Update button styles
    if (mapBtn) {
      mapBtn.classList.remove('bg-gray-100', 'text-gray-700');
      mapBtn.classList.add('bg-indigo-600', 'text-white');
    }
    if (listBtn) {
      listBtn.classList.remove('bg-indigo-600', 'text-white');
      listBtn.classList.add('bg-gray-100', 'text-gray-700');
    }

    // Initialize map if needed
    const { initMap, updateMapMarkers } = await import('./calendar-map.js');

    if (!document.getElementById('community-map')._leaflet_id) {
      initMap('community-map');
    }

    // Update markers with current filtered events
    const filteredEvents = applyFilters(agendaState.events);
    updateMapMarkers(filteredEvents, (city, cityEvents) => {
      console.log('[MAP] City clicked:', city, cityEvents.length, 'events');
      // Optioneel: filter events op deze stad
    });
  }

  // Re-init Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }

  console.log('[CALENDAR] View mode:', mode);
}

/**
 * Render/update de Agenda content (events lijst)
 */
async function renderAgendaContent() {
  const container = document.getElementById('agenda-events-list');
  if (!container) {
    console.warn('[CALENDAR] agenda-events-list container not found');
    return;
  }

  // Haal event counts voor date tape
  const startDate = new Date(agendaState.selectedDate);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(agendaState.selectedDate);
  endDate.setDate(endDate.getDate() + 14);

  const eventCounts = await getEventCountsPerDate(startDate, endDate);

  // Filter events
  const filteredEvents = applyFilters(agendaState.events);
  // Apply date/month filtering
  const eventsForDate = getFilteredEventsByDateMode(filteredEvents);

  // Render Filters (desktop) with month calendar
  const filtersContainer = document.getElementById('agenda-filters-container');
  if (filtersContainer) {
    filtersContainer.innerHTML = renderAgendaFilters(agendaState.filters, agendaState.selectedDate, eventCounts);
  }

  // Render Mobile Calendar
  renderMobileCalendarDays();

  // Render Filter Mode Toggle
  const filterModeContainer = document.getElementById('filter-mode-container');
  if (filterModeContainer) {
    filterModeContainer.innerHTML = `
      <div class="flex gap-2">
        <button id="filter-mode-day" class="px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
          agendaState.filterMode === 'day'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }">
          Dag
        </button>
        <button id="filter-mode-month" class="px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
          agendaState.filterMode === 'month'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }">
          Maand
        </button>
      </div>
    `;
  }

  // Render Events
  const eventsContainer = document.getElementById('agenda-events-list');
  if (eventsContainer) {
    if (eventsForDate.length === 0) {
      eventsContainer.innerHTML = `
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="calendar-x" class="w-8 h-8 text-gray-400"></i>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Geen events op deze datum</h3>
          <p class="text-sm text-gray-500">Selecteer een andere datum of pas je filters aan.</p>
        </div>
      `;
    } else {
      const currentUser = getStore('currentUser');
      const currentUserId = currentUser?.uid || null;

      eventsContainer.innerHTML = eventsForDate.map(event => {
        if (event.isClusterEvent && event.participants?.length > 0) {
          return renderClusterCard(event, currentUserId);
        }
        return renderSoloGigCard(event, currentUserId);
      }).join('');
    }
  }

  // Update map markers if map is visible
  if (agendaState.viewMode === 'map') {
    const { updateMapMarkers } = await import('./calendar-map.js');
    updateMapMarkers(eventsForDate);
  }

  // Re-init Lucide icons
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

/**
 * Initialize Agenda view (voor programmeurs)
 */
export async function initAgendaView() {
  console.log('[CALENDAR] Initializing Agenda view');

  agendaState.isLoading = true;
  agendaState.selectedDate = new Date(); // Start met vandaag

  try {
    // Laad alle upcoming events
    agendaState.events = await getAllUpcomingEvents({ limitCount: 100, daysAhead: 90 });

    console.log(`[CALENDAR] Loaded ${agendaState.events.length} events`);

    // Setup event listeners
    setupAgendaEventListeners();

    // Render content
    await renderAgendaContent();

  } catch (error) {
    console.error('[CALENDAR] Error initializing agenda:', error);
  } finally {
    agendaState.isLoading = false;
  }
}

/**
 * Cleanup functie voor wanneer je weg navigeert van Agenda
 */
export function cleanupAgendaView() {
  document.body.removeEventListener('click', handleAgendaClick);

  // Cleanup map
  import('./calendar-map.js').then(({ destroyMap }) => {
    destroyMap();
  });

  agendaState = {
    selectedDate: new Date(),
    filterMode: 'month',
    events: [],
    filteredEvents: [],
    filters: { types: [], region: 'all' },
    viewMode: 'list',
    isLoading: false
  };
  console.log('[CALENDAR] Agenda view cleaned up');
}

/**
 * Open de poster generator
 */
async function openPosterGenerator() {
  const currentUserData = getStore('currentUserData');

  if (!currentUserData || currentEvents.length < 3) {
    console.warn('[POSTER] Not enough events or no user data');
    return;
  }

  console.log('[POSTER] Generating poster...');

  try {
    const { generatePosterCanvas, renderPosterModal } = await import('./poster-generator.js');

    // Store data voor regeneratie bij thema wissel
    currentPosterArtistData = currentUserData;
    currentPosterEvents = currentEvents;
    currentPosterTheme = 'indigo';

    // Genereer canvas
    currentPosterCanvas = await generatePosterCanvas(currentUserData, currentEvents, currentPosterTheme);

    // Render modal
    const modalHtml = renderPosterModal(currentPosterCanvas, currentPosterTheme);
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Re-init Lucide icons
    if (window.lucide) {
      setTimeout(() => lucide.createIcons(), 50);
    }

    console.log('[POSTER] Modal opened');

  } catch (error) {
    console.error('[POSTER] Error generating poster:', error);
    alert('Er ging iets mis bij het genereren van de poster.');
  }
}

/**
 * Wissel poster thema
 */
async function switchPosterTheme(themeKey) {
  if (!currentPosterArtistData || !currentPosterEvents) {
    console.warn('[POSTER] No data to regenerate poster');
    return;
  }

  console.log('[POSTER] Switching theme to:', themeKey);
  currentPosterTheme = themeKey;

  try {
    const { generatePosterCanvas } = await import('./poster-generator.js');

    // Regenereer canvas met nieuw thema
    currentPosterCanvas = await generatePosterCanvas(
      currentPosterArtistData,
      currentPosterEvents,
      themeKey
    );

    // Update preview image
    const previewImg = document.getElementById('poster-preview-img');
    if (previewImg) {
      previewImg.src = currentPosterCanvas.toDataURL('image/png');
    }

    // Update active state op theme buttons
    document.querySelectorAll('.theme-select-btn').forEach(btn => {
      const isActive = btn.dataset.theme === themeKey;
      btn.classList.toggle('border-indigo-600', isActive);
      btn.classList.toggle('ring-2', isActive);
      btn.classList.toggle('ring-indigo-300', isActive);
      btn.classList.toggle('border-gray-200', !isActive);
    });

  } catch (error) {
    console.error('[POSTER] Error switching theme:', error);
  }
}

/**
 * Sluit de poster modal
 */
function closePosterModal() {
  const modal = document.getElementById('poster-modal');
  if (modal) {
    modal.remove();
  }
  currentPosterCanvas = null;
  currentPosterArtistData = null;
  currentPosterEvents = null;
  currentPosterTheme = 'indigo';
}

/**
 * Download de huidige poster
 */
async function downloadCurrentPoster() {
  if (!currentPosterCanvas) {
    console.warn('[POSTER] No canvas to download');
    return;
  }

  const currentUserData = getStore('currentUserData');
  const artistName = currentUserData?.stageName || 'artist';
  const filename = `${artistName.toLowerCase().replace(/\s+/g, '-')}-tour-poster.png`;

  const { downloadPoster } = await import('./poster-generator.js');
  downloadPoster(currentPosterCanvas, filename);

  console.log('[POSTER] Downloaded:', filename);
}

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
  renderDateTape,
  renderClusterCard,
  renderSoloGigCard,
  renderAgendaFilters,
  renderAgendaLayout
} from './calendar-ui.js';

let currentEvents = [];

// Agenda state
let agendaState = {
  selectedDate: new Date(),
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
    renderGigsWidget();
  } catch (error) {
    console.error('[CALENDAR] Error loading events:', error);
    currentEvents = [];
    renderGigsWidget();
  }
}

/**
 * Render de gigs widget in het dashboard
 */
function renderGigsWidget() {
  const container = document.getElementById('upcoming-gigs-container');
  if (!container) {
    console.warn('[CALENDAR] Gigs container not found');
    return;
  }

  container.innerHTML = renderUpcomingGigsWidget(currentEvents, true);

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

  // Date Tape dag selectie
  if (target.closest('.date-tape-day')) {
    e.preventDefault();
    const dayEl = target.closest('.date-tape-day');
    const dateStr = dayEl.dataset.date;
    if (dateStr) {
      await selectDate(new Date(dateStr));
    }
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

  // View mode toggle (list/map)
  if (target.closest('#toggle-map-view')) {
    e.preventDefault();
    toggleViewMode();
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
 * Toggle view mode (list/map)
 */
function toggleViewMode() {
  agendaState.viewMode = agendaState.viewMode === 'list' ? 'map' : 'list';
  console.log('[CALENDAR] View mode:', agendaState.viewMode);
  renderAgendaContent();
}

/**
 * Render/update de Agenda content (events lijst)
 */
async function renderAgendaContent() {
  const container = document.getElementById('agenda-content');
  if (!container) return;

  // Haal event counts voor date tape
  const startDate = new Date(agendaState.selectedDate);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(agendaState.selectedDate);
  endDate.setDate(endDate.getDate() + 14);

  const eventCounts = await getEventCountsPerDate(startDate, endDate);

  // Filter events
  const filteredEvents = applyFilters(agendaState.events);
  const eventsForDate = getEventsForSelectedDate(filteredEvents);

  // Render Date Tape
  const dateTapeContainer = document.getElementById('date-tape-container');
  if (dateTapeContainer) {
    dateTapeContainer.innerHTML = renderDateTape(agendaState.selectedDate, eventCounts);
  }

  // Render Filters (desktop)
  const filtersContainer = document.getElementById('agenda-filters-container');
  if (filtersContainer) {
    filtersContainer.innerHTML = renderAgendaFilters(agendaState.filters);
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
        return renderSoloGigCard(event);
      }).join('');
    }
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

    // Detect mobile
    const isMobile = window.innerWidth < 1024;

    // Render layout
    const container = document.getElementById('programmer-dashboard');
    if (container) {
      container.innerHTML = renderAgendaLayout(isMobile);
    }

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
  agendaState = {
    selectedDate: new Date(),
    events: [],
    filteredEvents: [],
    filters: { types: [], region: 'all' },
    viewMode: 'list',
    isLoading: false
  };
  console.log('[CALENDAR] Agenda view cleaned up');
}

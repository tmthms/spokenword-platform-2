/**
 * calendar-ui.js
 * UI rendering voor artist gigs/events
 * Apple-style widgets en modals
 */

import { EVENT_TYPE_LABELS, formatEventDate, formatShortDate } from './calendar-service.js';

/**
 * Render de "Upcoming Gigs" widget voor het artist dashboard
 * @param {Array} events - Array van event objecten
 * @param {boolean} isOwnProfile - Is dit het eigen profiel van de artiest?
 * @returns {string} HTML string
 */
export function renderUpcomingGigsWidget(events = [], isOwnProfile = true) {
  const hasEvents = events && events.length > 0;

  return `
    <div id="upcoming-gigs-widget" class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900 tracking-tight">Upcoming Gigs</h3>
          <p class="text-sm text-gray-500 mt-1">${hasEvents ? `${events.length} optreden${events.length > 1 ? 's' : ''} gepland` : 'Geen geplande optredens'}</p>
        </div>
        ${isOwnProfile ? `
          <button id="add-gig-btn" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Gig</span>
          </button>
        ` : ''}
      </div>

      ${hasEvents ? renderGigsList(events, isOwnProfile) : renderEmptyGigsState(isOwnProfile)}
    </div>
  `;
}

/**
 * Render de lijst met gigs
 * @param {Array} events - Array van events
 * @param {boolean} isOwnProfile - Is eigen profiel?
 * @returns {string} HTML string
 */
function renderGigsList(events, isOwnProfile) {
  const gigsHtml = events.slice(0, 5).map(event => renderGigItem(event, isOwnProfile)).join('');

  return `
    <div class="space-y-3">
      ${gigsHtml}
    </div>
    ${events.length > 5 ? `
      <button id="view-all-gigs-btn" class="mt-4 w-full text-center text-indigo-600 font-medium hover:text-indigo-700 py-2">
        Bekijk alle ${events.length} optredens
      </button>
    ` : ''}
  `;
}

/**
 * Render een enkel gig item
 * @param {object} event - Event object
 * @param {boolean} isOwnProfile - Is eigen profiel?
 * @returns {string} HTML string
 */
function renderGigItem(event, isOwnProfile) {
  const date = event.date ? new Date(event.date) : null;
  const dayNum = date ? date.getDate() : '--';
  const monthShort = date ? date.toLocaleDateString('nl-BE', { month: 'short' }).toUpperCase() : '---';
  const typeLabel = EVENT_TYPE_LABELS[event.type] || event.type;
  const typeBadgeColor = getTypeBadgeColor(event.type);

  return `
    <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group" data-event-id="${event.id}">
      <!-- Date Block -->
      <div class="flex-shrink-0 w-14 h-14 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
        <span class="text-lg font-bold text-gray-900 leading-none">${dayNum}</span>
        <span class="text-xs font-medium text-gray-500 uppercase">${monthShort}</span>
      </div>

      <!-- Event Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="font-semibold text-gray-900 truncate">${event.venue || 'TBA'}</h4>
          <span class="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${typeBadgeColor}">${typeLabel}</span>
        </div>
        <p class="text-sm text-gray-500 flex items-center gap-1">
          <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
          ${event.city || 'Locatie TBA'}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        ${event.link ? `
          <a href="${event.link}" target="_blank" rel="noopener noreferrer" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors" title="Open link">
            <i data-lucide="external-link" class="w-4 h-4"></i>
          </a>
        ` : ''}
        ${isOwnProfile ? `
          <button class="edit-gig-btn p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors" data-event-id="${event.id}" title="Bewerk">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button class="delete-gig-btn p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors" data-event-id="${event.id}" title="Verwijder">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render lege staat voor gigs widget
 * @param {boolean} isOwnProfile - Is eigen profiel?
 * @returns {string} HTML string
 */
function renderEmptyGigsState(isOwnProfile) {
  if (isOwnProfile) {
    return `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="calendar-plus" class="w-8 h-8 text-indigo-400"></i>
        </div>
        <h4 class="font-semibold text-gray-900 mb-2">Nog geen optredens gepland</h4>
        <p class="text-sm text-gray-500 mb-4">Laat de wereld weten waar je te zien bent!</p>
        <button id="add-first-gig-btn" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm">
          Voeg je eerste gig toe
        </button>
      </div>
    `;
  }

  return `
    <div class="text-center py-8">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i data-lucide="calendar-x" class="w-8 h-8 text-gray-400"></i>
      </div>
      <p class="text-sm text-gray-500">Geen aankomende optredens</p>
    </div>
  `;
}

/**
 * Render de "See [Artist] Live" sectie voor publieke profielen
 * @param {Array} events - Array van events
 * @param {string} artistName - Naam van de artiest
 * @returns {string} HTML string
 */
export function renderPublicGigsSection(events = [], artistName = 'deze artiest') {
  if (!events || events.length === 0) {
    return '';
  }

  const upcomingEvents = events.slice(0, 3);

  return `
    <div class="mt-8">
      <h3 class="text-lg font-bold text-gray-900 mb-4">See ${artistName} Live</h3>
      <div class="space-y-3">
        ${upcomingEvents.map(event => renderPublicGigItem(event)).join('')}
      </div>
      ${events.length > 3 ? `
        <p class="text-sm text-gray-500 mt-3 text-center">+ ${events.length - 3} meer optredens</p>
      ` : ''}
    </div>
  `;
}

/**
 * Render een gig item voor publieke weergave
 * @param {object} event - Event object
 * @returns {string} HTML string
 */
function renderPublicGigItem(event) {
  const date = event.date ? new Date(event.date) : null;
  const formattedDate = date ? formatEventDate(date) : 'Datum TBA';
  const typeLabel = EVENT_TYPE_LABELS[event.type] || event.type;

  return `
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div class="flex items-center gap-4">
        <div class="text-center">
          <p class="text-sm font-medium text-gray-900">${formattedDate}</p>
        </div>
        <div>
          <p class="font-medium text-gray-900">${event.venue || 'TBA'}</p>
          <p class="text-sm text-gray-500">${event.city || ''} • ${typeLabel}</p>
        </div>
      </div>
      ${event.link ? `
        <a href="${event.link}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          Tickets
        </a>
      ` : ''}
    </div>
  `;
}

/**
 * Render de Add/Edit Gig Modal
 * @param {object|null} event - Bestaand event voor edit, of null voor nieuw
 * @returns {string} HTML string
 */
export function renderGigModal(event = null) {
  const isEdit = event !== null;
  const title = isEdit ? 'Bewerk Optreden' : 'Nieuw Optreden';
  const submitText = isEdit ? 'Opslaan' : 'Toevoegen';

  // Format date for input
  const dateValue = event?.date ? new Date(event.date).toISOString().split('T')[0] : '';

  return `
    <div id="gig-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0,0,0,0.5);">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 class="text-xl font-bold text-gray-900">${title}</h2>
          <button id="close-gig-modal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Form -->
        <form id="gig-form" class="p-6 space-y-5">
          ${isEdit ? `<input type="hidden" name="eventId" value="${event.id}">` : ''}

          <!-- Date -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Datum *</label>
            <input type="date" name="date" required value="${dateValue}"
              class="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>

          <!-- City -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Stad *</label>
            <input type="text" name="city" required value="${event?.city || ''}" placeholder="bijv. Gent, Amsterdam"
              class="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>

          <!-- Venue -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Venue *</label>
            <input type="text" name="venue" required value="${event?.venue || ''}" placeholder="bijv. De Centrale, Paradiso"
              class="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>

          <!-- Type -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type *</label>
            <select name="type" required
              class="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
              <option value="">Selecteer type...</option>
              ${Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => `
                <option value="${value}" ${event?.type === value ? 'selected' : ''}>${label}</option>
              `).join('')}
            </select>
          </div>

          <!-- Link (optional) -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Link (optioneel)</label>
            <input type="url" name="link" value="${event?.link || ''}" placeholder="https://tickets.example.com"
              class="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" id="cancel-gig-btn" class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              Annuleren
            </button>
            <button type="submit" class="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              ${submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/**
 * Render delete confirmation modal
 * @param {string} eventId - Event ID
 * @param {string} venueName - Venue naam voor bevestiging
 * @returns {string} HTML string
 */
export function renderDeleteConfirmModal(eventId, venueName) {
  return `
    <div id="delete-gig-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0,0,0,0.5);">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="trash-2" class="w-6 h-6 text-red-500"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Optreden verwijderen?</h3>
        <p class="text-sm text-gray-500 mb-6">Weet je zeker dat je "${venueName}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.</p>
        <div class="flex gap-3">
          <button id="cancel-delete-gig" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            Annuleren
          </button>
          <button id="confirm-delete-gig" data-event-id="${eventId}" class="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors">
            Verwijderen
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get badge color class based on event type
 * @param {string} type - Event type
 * @param {boolean} darkMode - Use dark mode colors
 * @returns {string} Tailwind classes
 */
function getTypeBadgeColor(type, darkMode = false) {
  if (darkMode) {
    const colors = {
      'slam': 'bg-purple-500 text-white',
      'slam-finale': 'bg-purple-500 text-white',
      'showcase': 'bg-gray-700 text-gray-200',
      'gig': 'bg-gray-600 text-gray-200',
      'open-mic': 'bg-green-600 text-white',
      'workshop': 'bg-blue-600 text-white',
      'feature': 'bg-pink-500 text-white'
    };
    return colors[type] || 'bg-gray-600 text-gray-200';
  }

  const colors = {
    'gig': 'bg-indigo-100 text-indigo-700',
    'open-mic': 'bg-green-100 text-green-700',
    'slam': 'bg-orange-100 text-orange-700',
    'slam-finale': 'bg-purple-100 text-purple-700',
    'showcase': 'bg-gray-100 text-gray-700',
    'workshop': 'bg-blue-100 text-blue-700',
    'feature': 'bg-purple-100 text-purple-700'
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

/**
 * a) Render Date Tape - Horizontale datumkiezer
 * @param {Date} selectedDate - Geselecteerde datum
 * @param {Object} eventCounts - Object met dateString keys en count values
 * @param {number} daysToShow - Aantal dagen om te tonen (default 14)
 * @returns {string} HTML string
 */
export function renderDateTape(selectedDate, eventCounts = {}, daysToShow = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0);

  // Calculate start date (7 days before selected)
  const startDate = new Date(selected);
  startDate.setDate(startDate.getDate() - Math.floor(daysToShow / 2));

  const days = [];
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dateString = date.toISOString().split('T')[0];
    const isSelected = date.getTime() === selected.getTime();
    const isToday = date.getTime() === today.getTime();
    const eventCount = eventCounts[dateString] || 0;
    const hasEvents = eventCount > 0;

    const dayName = date.toLocaleDateString('nl-BE', { weekday: 'short' });
    const dayNum = date.getDate();

    days.push(`
      <button
        class="date-tape-day flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl transition-all ${
          isSelected
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
        }"
        data-date="${dateString}"
      >
        <span class="text-xs font-medium uppercase mb-1">${dayName}</span>
        <span class="text-xl font-bold">${dayNum}</span>
        ${hasEvents ? `
          <div class="mt-1.5 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-red-500' : 'bg-indigo-400'}"></div>
        ` : isToday ? `
          <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></div>
        ` : '<div class="h-3"></div>'}
      </button>
    `);
  }

  return `
    <div class="date-tape-container sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4 shadow-sm">
      <div class="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory" id="date-tape-scroll">
        ${days.join('')}
      </div>
    </div>
  `;
}

/**
 * b) Render Cluster Card - Multi-artiest event
 * @param {object} event - Event object
 * @param {string} currentUserId - UID van de huidige user
 * @returns {string} HTML string
 */
export function renderClusterCard(event, currentUserId = null) {
  const date = event.date ? new Date(event.date) : null;
  const formattedDate = date ? date.toLocaleDateString('nl-BE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }) : 'Datum TBA';

  const typeLabel = EVENT_TYPE_LABELS[event.type] || event.type;
  const typeBadgeColor = getTypeBadgeColor(event.type, false);

  const eventName = event.eventName || event.venue || 'Event';
  const participants = event.participants || [];
  const visibleParticipants = participants.slice(0, 5);
  const hiddenCount = Math.max(0, participants.length - 5);

  const attendeeCount = event.attendeeCount || 0;
  const isAttending = currentUserId && (event.attendees || []).includes(currentUserId);

  return `
    <div class="cluster-card bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all" data-event-id="${event.id}">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">${eventName}</h3>
          <div class="flex items-center gap-2 text-gray-600 text-sm">
            <i data-lucide="calendar" class="w-4 h-4"></i>
            <span>${formattedDate}</span>
            ${event.eventTime ? `<span>• ${event.eventTime}</span>` : ''}
          </div>
          <div class="flex items-center gap-2 text-gray-600 text-sm mt-1">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
            <span>${event.city || 'Locatie TBA'}${event.venue ? ` • ${event.venue}` : ''}</span>
          </div>
        </div>
        <span class="px-3 py-1.5 text-xs font-bold rounded-full ${typeBadgeColor}">${typeLabel}</span>
      </div>

      <!-- Participants -->
      ${participants.length > 0 ? `
        <div class="mb-6">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Line-up</p>
          <div class="flex items-center gap-2">
            <!-- Avatar Stack -->
            <div class="flex -space-x-3">
              ${visibleParticipants.map((p, idx) => `
                <img
                  src="${p.artistProfilePicUrl || '/default-avatar.png'}"
                  alt="${p.artistName}"
                  class="w-10 h-10 rounded-full border-2 border-white object-cover hover:z-10 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                  title="${p.artistName}"
                  style="z-index: ${10 - idx}"
                >
              `).join('')}
              ${hiddenCount > 0 ? `
                <div class="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center shadow-sm">
                  <span class="text-xs font-bold text-gray-600">+${hiddenCount}</span>
                </div>
              ` : ''}
            </div>
            <span class="text-sm text-gray-600">${participants.length} artiest${participants.length > 1 ? 'en' : ''}</span>
          </div>
        </div>
      ` : ''}

      <!-- Actions -->
      <div class="flex gap-3">
        ${event.link ? `
          <a href="${event.link}" target="_blank" rel="noopener noreferrer"
            class="flex-1 px-5 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-center">
            Tickets
          </a>
        ` : ''}
        <button
          class="attend-event-btn flex-1 px-5 py-3 font-semibold rounded-xl transition-all ${
            isAttending
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
              : 'bg-indigo-50 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
          }"
          data-event-id="${event.id}"
        >
          ${isAttending ? '✓ ' : ''}Ik ga ook${attendeeCount > 0 ? ` (${attendeeCount})` : ''}
        </button>
      </div>
    </div>
  `;
}

/**
 * c) Render Solo Gig Card - Enkele artiest optreden
 * @param {object} event - Event object
 * @returns {string} HTML string
 */
export function renderSoloGigCard(event) {
  const date = event.date ? new Date(event.date) : null;
  const dayNum = date ? date.getDate() : '--';
  const monthShort = date ? date.toLocaleDateString('nl-BE', { month: 'short' }).toUpperCase() : '';

  const typeLabel = EVENT_TYPE_LABELS[event.type] || event.type;
  const typeBadgeColor = getTypeBadgeColor(event.type, false);

  return `
    <div class="solo-gig-card bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer" data-event-id="${event.id}">
      <div class="flex items-center gap-4">
        <!-- Date Block -->
        <div class="flex-shrink-0 w-14 h-14 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col items-center justify-center">
          <span class="text-lg font-bold text-indigo-600 leading-none">${dayNum}</span>
          <span class="text-xs font-medium text-indigo-500 uppercase">${monthShort}</span>
        </div>

        <!-- Artist Info -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          ${event.artistProfilePicUrl ? `
            <img src="${event.artistProfilePicUrl}" alt="${event.artistName}"
              class="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shadow-sm">
          ` : `
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <i data-lucide="user" class="w-5 h-5 text-gray-400"></i>
            </div>
          `}

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-semibold text-gray-900 truncate">${event.artistName || 'Artiest'}</h4>
              <span class="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${typeBadgeColor}">${typeLabel}</span>
            </div>
            <p class="text-sm text-gray-500 truncate">
              ${event.venue || 'Venue TBA'} • ${event.city || 'Locatie TBA'}
            </p>
          </div>
        </div>

        <!-- Chevron -->
        <div class="flex-shrink-0">
          <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
        </div>
      </div>
    </div>
  `;
}

/**
 * d) Render Agenda Filters (desktop sidebar)
 * @param {Object} activeFilters - Actieve filters { types: [], regions: [] }
 * @returns {string} HTML string
 */
export function renderAgendaFilters(activeFilters = { types: [], regions: [] }) {
  const eventTypes = [
    { value: 'slam-finale', label: 'Slam Finales' },
    { value: 'slam', label: 'Slams & Battles' },
    { value: 'showcase', label: 'Showcases' },
    { value: 'gig', label: 'Optredens' },
    { value: 'open-mic', label: 'Open Mics' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'feature', label: 'Features' }
  ];

  const regions = [
    { value: 'all', label: 'Alle regio\'s' },
    { value: 'vlaanderen', label: 'Vlaanderen' },
    { value: 'nederland', label: 'Nederland' },
    { value: 'brussel', label: 'Brussel' }
  ];

  return `
    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Filters</h3>

      <!-- Event Type Checkboxes -->
      <div class="mb-6">
        <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Type Event</p>
        <div class="space-y-2">
          ${eventTypes.map(type => `
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="event-type"
                value="${type.value}"
                ${activeFilters.types.includes(type.value) ? 'checked' : ''}
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0"
              >
              <span class="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">${type.label}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Region Dropdown -->
      <div>
        <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Regio</p>
        <select
          name="region-filter"
          class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          ${regions.map(region => `
            <option value="${region.value}" ${activeFilters.regions.includes(region.value) ? 'selected' : ''}>
              ${region.label}
            </option>
          `).join('')}
        </select>
      </div>

      <!-- Clear Filters -->
      <button id="clear-filters-btn" class="mt-4 w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        Filters wissen
      </button>
    </div>
  `;
}

/**
 * e) Render Agenda Layout - Volledige layout container
 * @param {boolean} isMobile - Is mobile viewport
 * @returns {string} HTML string
 */
export function renderAgendaLayout(isMobile = false) {
  if (isMobile) {
    return `
      <div class="agenda-mobile-layout min-h-screen bg-white pb-20">
        <!-- Date Tape wordt hier geïnjecteerd -->
        <div id="agenda-date-tape"></div>

        <!-- Events List -->
        <div id="agenda-events-list" class="p-4 space-y-4">
          <!-- Events worden hier geïnjecteerd -->
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>

        <!-- Map Toggle FAB -->
        <button id="toggle-map-view" class="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-20">
          <i data-lucide="map" class="w-6 h-6"></i>
        </button>
      </div>
    `;
  }

  // Desktop 3-column layout
  return `
    <div class="agenda-desktop-layout min-h-screen bg-white">
      <div class="flex gap-6 p-6 max-w-[1800px] mx-auto">
        <!-- Left Sidebar: Calendar + Filters -->
        <aside class="w-72 flex-shrink-0 space-y-6">
          <!-- Mini Calendar placeholder -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Kalender</h3>
            <p class="text-sm text-gray-500">Maandkalender komt hier...</p>
          </div>

          <!-- Filters -->
          <div id="agenda-filters"></div>
        </aside>

        <!-- Middle: Date Tape + Events -->
        <main class="flex-1 min-w-0 space-y-6">
          <!-- Date Tape -->
          <div id="agenda-date-tape"></div>

          <!-- Events List -->
          <div id="agenda-events-list" class="space-y-4">
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </main>

        <!-- Right Sidebar: Map -->
        <aside class="w-96 flex-shrink-0">
          <div class="sticky top-6 bg-white border border-gray-200 rounded-2xl p-6 h-[calc(100vh-3rem)] shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Kaart</h3>
            <div class="flex items-center justify-center h-full text-gray-400">
              <p class="text-sm">Kaart integratie komt later...</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `;
}

/**
 * calendar-map.js
 * Community Map voor events met Leaflet.js
 */

// Predefined coordinates voor steden (NL/BE)
const CITY_COORDINATES = {
  // Nederland
  'amsterdam': [52.3676, 4.9041],
  'rotterdam': [51.9225, 4.4792],
  'den haag': [52.0705, 4.3007],
  'utrecht': [52.0907, 5.1214],
  'eindhoven': [51.4416, 5.4697],
  'groningen': [53.2194, 6.5665],
  'tilburg': [51.5555, 5.0913],
  'almere': [52.3508, 5.2647],
  'breda': [51.5719, 4.7683],
  'nijmegen': [51.8426, 5.8546],
  'arnhem': [51.9851, 5.8987],
  'haarlem': [52.3874, 4.6462],
  'enschede': [52.2215, 6.8937],
  'maastricht': [50.8514, 5.6910],
  'leiden': [52.1601, 4.4970],
  'dordrecht': [51.8133, 4.6901],
  'zwolle': [52.5168, 6.0830],
  'deventer': [52.2551, 6.1639],
  'delft': [52.0116, 4.3571],
  'alkmaar': [52.6324, 4.7534],

  // België - Vlaanderen
  'antwerpen': [51.2194, 4.4025],
  'gent': [51.0543, 3.7174],
  'brugge': [51.2093, 3.2247],
  'leuven': [50.8798, 4.7005],
  'mechelen': [51.0259, 4.4776],
  'aalst': [50.9365, 4.0382],
  'kortrijk': [50.8279, 3.2649],
  'hasselt': [50.9307, 5.3378],
  'oostende': [51.2154, 2.9286],
  'sint-niklaas': [51.1565, 4.1434],
  'genk': [50.9654, 5.5022],
  'roeselare': [50.9446, 3.1256],
  'turnhout': [51.3227, 4.9484],

  // Brussel
  'brussel': [50.8503, 4.3517],
  'brussels': [50.8503, 4.3517],
  'bruxelles': [50.8503, 4.3517]
};

// Map instance
let mapInstance = null;
let markersLayer = null;

/**
 * Haal coordinates op voor een stad
 * @param {string} city - Stad naam
 * @returns {Array|null} [lat, lng] of null
 */
export function getCityCoordinates(city) {
  if (!city) return null;
  const cityLower = city.toLowerCase().trim();

  // Directe match
  if (CITY_COORDINATES[cityLower]) {
    return CITY_COORDINATES[cityLower];
  }

  // Partial match
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cityLower.includes(key) || key.includes(cityLower)) {
      return coords;
    }
  }

  return null;
}

/**
 * Groepeer events per stad met coordinates
 * @param {Array} events - Array van events
 * @returns {Object} Object met stad als key en {coords, events} als value
 */
export function groupEventsByCity(events) {
  const grouped = {};

  events.forEach(event => {
    if (!event.city) return;

    const cityLower = event.city.toLowerCase().trim();
    const coords = getCityCoordinates(event.city);

    if (!coords) {
      console.warn(`[MAP] No coordinates for city: ${event.city}`);
      return;
    }

    const cityKey = cityLower;

    if (!grouped[cityKey]) {
      grouped[cityKey] = {
        city: event.city,
        coords: coords,
        events: []
      };
    }

    grouped[cityKey].events.push(event);
  });

  return grouped;
}

/**
 * Initialize de kaart
 * @param {string} containerId - ID van de container
 * @returns {Object} Leaflet map instance
 */
export function initMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('[MAP] Container not found:', containerId);
    return null;
  }

  // Prevent clicks from bubbling up to prevent unwanted redirects
  container.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Cleanup bestaande map
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // Maak nieuwe map, gecentreerd op BeNeLux
  mapInstance = L.map(containerId, {
    center: [51.5, 4.5], // Centrum van NL/BE
    zoom: 7,
    minZoom: 6,
    maxZoom: 15
  });

  // Voeg tile layer toe (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);

  // Maak markers layer
  markersLayer = L.layerGroup().addTo(mapInstance);

  // Handle clicks on popup content
  mapInstance.on('popupopen', function(e) {
    const popup = e.popup;
    const container = popup.getElement();

    if (container) {
      container.addEventListener('click', async function(evt) {
        const eventItem = evt.target.closest('.map-popup-event[data-artist-id]');
        if (eventItem) {
          evt.preventDefault();
          evt.stopPropagation();

          const artistId = eventItem.dataset.artistId;
          if (artistId) {
            console.log('[MAP] Navigating to artist:', artistId);

            // Sluit popup eerst
            mapInstance.closePopup();

            // Navigeer naar artiest profiel via import
            try {
              const { showArtistDetail } = await import('../search/search-controller.js');
              await showArtistDetail(artistId);
            } catch (error) {
              console.error('[MAP] Error navigating to artist:', error);
            }
          }
        }
      });
    }
  });

  console.log('[MAP] Map initialized');
  return mapInstance;
}

/**
 * Update markers op de kaart
 * @param {Array} events - Array van events
 * @param {Function} onCityClick - Callback wanneer op stad wordt geklikt
 */
export function updateMapMarkers(events, onCityClick = null) {
  if (!mapInstance || !markersLayer) {
    console.warn('[MAP] Map not initialized');
    return;
  }

  // Clear bestaande markers
  markersLayer.clearLayers();

  // Groepeer events per stad
  const grouped = groupEventsByCity(events);

  // Voeg markers toe
  for (const [cityKey, data] of Object.entries(grouped)) {
    const { city, coords, events: cityEvents } = data;
    const eventCount = cityEvents.length;

    // Custom marker icon met aantal
    const markerIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative">
          <div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white cursor-pointer hover:bg-indigo-700 transition-colors">
            ${eventCount}
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-indigo-600"></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48]
    });

    const marker = L.marker(coords, { icon: markerIcon });

    // Popup met event info
    const popupContent = createPopupContent(city, cityEvents);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-map-popup'
    });

    // Click handler
    marker.on('click', function(e) {
      // Stop propagation om te voorkomen dat andere handlers dit opvangen
      if (e.originalEvent) {
        e.originalEvent.stopPropagation();
        e.originalEvent.preventDefault();
      }

      console.log('[MAP] Marker clicked:', city);
      this.openPopup();

      if (onCityClick) {
        onCityClick(city, cityEvents);
      }
    });

    markersLayer.addLayer(marker);
  }

  console.log(`[MAP] Added ${Object.keys(grouped).length} markers`);
}

/**
 * Maak popup content voor een stad
 * @param {string} city - Stad naam
 * @param {Array} events - Events in deze stad
 * @returns {string} HTML string
 */
function createPopupContent(city, events) {
  const eventsList = events.slice(0, 5).map(event => {
    const date = event.date ? new Date(event.date).toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'short'
    }) : 'TBA';

    const artistId = event.artistId || '';
    const cursorClass = artistId ? 'cursor-pointer hover:bg-gray-50' : '';
    const dataAttr = artistId ? `data-artist-id="${artistId}"` : '';

    return `
      <div class="map-popup-event flex items-center justify-between py-2 border-b border-gray-100 last:border-0 ${cursorClass} rounded px-2 -mx-2 transition-colors" ${dataAttr}>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">${event.venue || 'TBA'}</p>
          <p class="text-xs text-gray-500">${event.artistName || 'Artiest'}</p>
        </div>
        <span class="text-xs font-medium text-indigo-600 ml-2">${date}</span>
      </div>
    `;
  }).join('');

  const moreText = events.length > 5 ? `<p class="text-xs text-gray-500 mt-2">+ ${events.length - 5} meer</p>` : '';

  return `
    <div class="map-popup-content p-1">
      <h3 class="font-bold text-gray-900 mb-2">${city}</h3>
      <p class="text-xs text-gray-500 mb-3">${events.length} event${events.length > 1 ? 's' : ''}</p>
      <div class="max-h-48 overflow-y-auto">
        ${eventsList}
      </div>
      ${moreText}
    </div>
  `;
}

/**
 * Resize map (nodig na container size change)
 */
export function resizeMap() {
  if (mapInstance) {
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);
  }
}

/**
 * Destroy map instance
 */
export function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markersLayer = null;
    console.log('[MAP] Map destroyed');
  }
}

/**
 * Fly to een specifieke stad
 * @param {string} city - Stad naam
 */
export function flyToCity(city) {
  if (!mapInstance) return;

  const coords = getCityCoordinates(city);
  if (coords) {
    mapInstance.flyTo(coords, 12, { duration: 1 });
  }
}

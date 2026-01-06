/**
 * poster-generator.js
 * Genereer downloadbare tour posters voor artiesten
 */

// Poster dimensies (Instagram Story formaat)
const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1920;

/**
 * Poster thema's met kleuren
 */
export const POSTER_THEMES = {
  indigo: {
    name: 'Indigo Night',
    preview: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    background: ['#1e1b4b', '#312e81', '#1e1b4b'],
    accent: '#4f46e5',
    accentLight: '#818cf8',
    text: '#ffffff',
    textMuted: '#a5b4fc',
    decorCircle: '#818cf8'
  },
  purple: {
    name: 'Purple Haze',
    preview: 'linear-gradient(135deg, #2e1065 0%, #581c87 100%)',
    background: ['#2e1065', '#581c87', '#2e1065'],
    accent: '#9333ea',
    accentLight: '#c084fc',
    text: '#ffffff',
    textMuted: '#d8b4fe',
    decorCircle: '#a855f7'
  },
  midnight: {
    name: 'Midnight Black',
    preview: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)',
    background: ['#0a0a0a', '#171717', '#0a0a0a'],
    accent: '#525252',
    accentLight: '#a3a3a3',
    text: '#ffffff',
    textMuted: '#a3a3a3',
    decorCircle: '#404040'
  },
  clean: {
    name: 'Clean White',
    preview: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    background: ['#ffffff', '#fafafa', '#ffffff'],
    accent: '#6366f1',
    accentLight: '#818cf8',
    text: '#111827',
    textMuted: '#6b7280',
    decorCircle: '#e0e7ff'
  },
  sunset: {
    name: 'Sunset Glow',
    preview: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
    background: ['#7c2d12', '#c2410c', '#7c2d12'],
    accent: '#f97316',
    accentLight: '#fdba74',
    text: '#ffffff',
    textMuted: '#fed7aa',
    decorCircle: '#fb923c'
  },
  ocean: {
    name: 'Ocean Deep',
    preview: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
    background: ['#0c4a6e', '#0369a1', '#0c4a6e'],
    accent: '#0ea5e9',
    accentLight: '#7dd3fc',
    text: '#ffffff',
    textMuted: '#bae6fd',
    decorCircle: '#38bdf8'
  },
  forest: {
    name: 'Forest Green',
    preview: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
    background: ['#14532d', '#166534', '#14532d'],
    accent: '#22c55e',
    accentLight: '#86efac',
    text: '#ffffff',
    textMuted: '#bbf7d0',
    decorCircle: '#4ade80'
  }
};

/**
 * Huidige geselecteerde thema
 */
let currentTheme = 'indigo';

/**
 * Get thema keys als array
 */
export function getThemeKeys() {
  return Object.keys(POSTER_THEMES);
}

/**
 * Set het huidige thema
 */
export function setCurrentTheme(themeKey) {
  if (POSTER_THEMES[themeKey]) {
    currentTheme = themeKey;
  }
}

/**
 * Get het huidige thema
 */
export function getCurrentTheme() {
  return currentTheme;
}

/**
 * Genereer een tour poster canvas
 * @param {object} artistData - Artiest gegevens
 * @param {Array} events - Array van gigs (minimaal 3)
 * @param {string} themeKey - Thema key (default: 'indigo')
 * @returns {Promise<HTMLCanvasElement>} Canvas element
 */
export async function generatePosterCanvas(artistData, events, themeKey = 'indigo') {
  const theme = POSTER_THEMES[themeKey] || POSTER_THEMES.indigo;

  const canvas = document.createElement('canvas');
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');

  // Achtergrond gradient met thema kleuren
  const gradient = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
  gradient.addColorStop(0, theme.background[0]);
  gradient.addColorStop(0.5, theme.background[1]);
  gradient.addColorStop(1, theme.background[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Decoratieve elementen met thema kleur
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = theme.decorCircle;
  ctx.beginPath();
  ctx.arc(900, 200, 300, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 1600, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ====== DYNAMIC SCALING ======
  const eventCount = Math.min(events.length, 10);

  // Bereken scaling factor op basis van aantal events
  // Minder events = grotere tekst en meer spacing
  // Meer events = kleinere tekst en minder spacing
  const scaleFactor = eventCount <= 3 ? 1.5 : eventCount <= 5 ? 1.2 : eventCount <= 7 ? 1.0 : 0.85;

  // Base sizes
  const profileSize = Math.round(200 * scaleFactor);
  const nameSize = Math.round(72 * scaleFactor);
  const tourLabelSize = Math.round(36 * scaleFactor);
  const gigDateSize = Math.round(36 * scaleFactor);
  const gigMonthSize = Math.round(20 * scaleFactor);
  const gigVenueSize = Math.round(32 * scaleFactor);
  const gigCitySize = Math.round(26 * scaleFactor);
  const dateBoxWidth = Math.round(120 * scaleFactor);
  const dateBoxHeight = Math.round(80 * scaleFactor);
  const gigHeight = Math.round(140 * scaleFactor);

  // Bereken verticale centrering
  const totalContentHeight = profileSize + 100 + (eventCount * gigHeight) + 200;
  let yOffset = Math.max(100, (POSTER_HEIGHT - totalContentHeight) / 2);

  // Load en draw profielfoto (als beschikbaar)
  if (artistData.profilePicUrl) {
    try {
      const img = await loadImage(artistData.profilePicUrl);

      // Circulaire clip voor profielfoto
      const imgSize = profileSize;
      const imgX = (POSTER_WIDTH - imgSize) / 2;
      const imgY = yOffset;

      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
      ctx.restore();

      // Border rond foto
      ctx.strokeStyle = theme.accentLight;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
      ctx.stroke();

      yOffset += imgSize + Math.round(40 * scaleFactor);
    } catch (error) {
      console.warn('[POSTER] Could not load profile image:', error);
      yOffset += Math.round(40 * scaleFactor);
    }
  }

  // Artiest naam
  ctx.fillStyle = theme.text;
  ctx.font = `bold ${nameSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  const artistName = artistData.stageName || `${artistData.firstName} ${artistData.lastName}`;
  ctx.fillText(artistName.toUpperCase(), POSTER_WIDTH / 2, yOffset + nameSize * 0.8);
  yOffset += nameSize + Math.round(20 * scaleFactor);

  // "ON TOUR" label
  ctx.fillStyle = theme.textMuted;
  ctx.font = `bold ${tourLabelSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('ON TOUR', POSTER_WIDTH / 2, yOffset + tourLabelSize);
  yOffset += tourLabelSize + Math.round(40 * scaleFactor);

  // Divider lijn
  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(POSTER_WIDTH * 0.2, yOffset);
  ctx.lineTo(POSTER_WIDTH * 0.8, yOffset);
  ctx.stroke();
  yOffset += Math.round(50 * scaleFactor);

  // Gigs lijst
  const maxGigs = Math.min(events.length, 10);

  for (let i = 0; i < maxGigs; i++) {
    const event = events[i];
    const date = event.date ? new Date(event.date) : null;

    // Datum box X positie (links uitlijnen met scaling)
    const dateBoxX = Math.round(100 * scaleFactor);
    const textStartX = dateBoxX + dateBoxWidth + Math.round(30 * scaleFactor);

    // Datum
    if (date) {
      const day = date.getDate();
      const month = date.toLocaleDateString('nl-BE', { month: 'short' }).toUpperCase();

      // Datum box
      ctx.fillStyle = theme.accent;
      roundRect(ctx, dateBoxX, yOffset, dateBoxWidth, dateBoxHeight, 12);
      ctx.fill();

      ctx.fillStyle = theme.text;
      ctx.font = `bold ${gigDateSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(day.toString(), dateBoxX + dateBoxWidth/2, yOffset + dateBoxHeight * 0.45);
      ctx.font = `${gigMonthSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(month, dateBoxX + dateBoxWidth/2, yOffset + dateBoxHeight * 0.8);
    }

    // Venue en stad
    ctx.textAlign = 'left';
    ctx.fillStyle = theme.text;
    ctx.font = `bold ${gigVenueSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(event.venue || 'TBA', textStartX, yOffset + dateBoxHeight * 0.4);

    ctx.fillStyle = theme.textMuted;
    ctx.font = `${gigCitySize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(event.city || '', textStartX, yOffset + dateBoxHeight * 0.75);

    yOffset += gigHeight;
  }

  // "Meer shows" indicator als er meer dan 10 gigs zijn
  if (events.length > 10) {
    ctx.fillStyle = theme.textMuted;
    ctx.font = `${Math.round(24 * scaleFactor)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`+ ${events.length - 10} meer shows`, POSTER_WIDTH / 2, yOffset + 20);
  }

  // Footer (altijd onderaan)
  ctx.fillStyle = theme.accent;
  ctx.font = '20px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('spokenword.community', POSTER_WIDTH / 2, POSTER_HEIGHT - 60);

  return canvas;
}

/**
 * Helper: Load image als Promise
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Helper: Draw rounded rectangle
 */
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Download poster als PNG
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} filename - Bestandsnaam
 */
export function downloadPoster(canvas, filename = 'tour-poster.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Render poster preview modal
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} currentThemeKey - Huidige thema key
 * @returns {string} HTML string
 */
export function renderPosterModal(canvas, currentThemeKey = 'indigo') {
  // Converteer canvas naar data URL voor preview
  const previewUrl = canvas.toDataURL('image/png');

  // Render thema knoppen
  const themeButtons = Object.entries(POSTER_THEMES).map(([key, theme]) => `
    <button
      class="theme-select-btn w-10 h-10 rounded-lg border-2 transition-all ${
        key === currentThemeKey
          ? 'border-indigo-600 ring-2 ring-indigo-300'
          : 'border-gray-200 hover:border-gray-400'
      }"
      data-theme="${key}"
      title="${theme.name}"
      style="background: ${theme.preview};"
    ></button>
  `).join('');

  return `
    <div id="poster-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background-color: rgba(0,0,0,0.8);">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h2 class="text-xl font-bold text-gray-900">Tour Poster</h2>
          <button id="close-poster-modal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Theme Selector -->
        <div class="px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <p class="text-sm font-medium text-gray-700 mb-2">Kies een stijl:</p>
          <div class="flex gap-2 flex-wrap">
            ${themeButtons}
          </div>
        </div>

        <!-- Preview (scrollable) -->
        <div class="p-4 bg-gray-100 overflow-y-auto flex-1">
          <div id="poster-preview-container" class="aspect-[9/16] max-h-[50vh] mx-auto rounded-xl overflow-hidden shadow-lg">
            <img id="poster-preview-img" src="${previewUrl}" alt="Tour Poster Preview" class="w-full h-full object-contain">
          </div>
        </div>

        <!-- Actions -->
        <div class="p-4 flex gap-3 flex-shrink-0">
          <button id="download-poster-btn" class="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
            <i data-lucide="download" class="w-5 h-5"></i>
            Download PNG
          </button>
          <button id="close-poster-modal-btn" class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            Sluiten
          </button>
        </div>

        <!-- Tip -->
        <div class="px-4 pb-4 flex-shrink-0">
          <p class="text-xs text-gray-500 text-center">
            💡 Perfect formaat voor Instagram Stories (1080x1920px)
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render de "Maak Tour Poster" knop
 * @param {number} eventCount - Aantal events
 * @returns {string} HTML string
 */
export function renderPosterButton(eventCount) {
  if (eventCount < 3) {
    return `
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-sm text-gray-500">
          <i data-lucide="image" class="w-4 h-4 inline-block mr-1"></i>
          Voeg nog ${3 - eventCount} gig${3 - eventCount > 1 ? 's' : ''} toe om een tour poster te maken
        </p>
      </div>
    `;
  }

  return `
    <button id="generate-poster-btn" class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3">
      <i data-lucide="sparkles" class="w-5 h-5"></i>
      Maak Tour Poster
      <span class="text-indigo-200 text-sm">(${eventCount} shows)</span>
    </button>
  `;
}

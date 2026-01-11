/**
 * search-visibility-fix.js
 * 🔥 NUCLEAR VISIBILITY FIX
 * Forces ALL parent containers to be visible when showing artist search results
 */

/**
 * Force visibility on an element with ALL CSS properties
 * @param {HTMLElement} element - The element to show
 * @param {string} displayType - The display type to use (default: 'block')
 */
function forceVisible(element, displayType = 'block') {
  if (!element) return false;

  element.style.display = displayType;
  element.style.opacity = '1';
  element.style.visibility = 'visible';
  element.style.zIndex = '1';
  element.classList.remove('hidden');

  return true;
}

/**
 * Debug: Log the visibility status of an element
 * @param {string} elementId - The ID of the element to check
 */
function debugElementVisibility(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.log(`[DEBUG] ❌ Element #${elementId} NOT FOUND`);
    return;
  }

  const computed = window.getComputedStyle(element);
  console.log(`[DEBUG] 👀 #${elementId}:`);
  console.log(`  - exists: YES`);
  console.log(`  - display: ${computed.display}`);
  console.log(`  - opacity: ${computed.opacity}`);
  console.log(`  - visibility: ${computed.visibility}`);
  console.log(`  - classes: ${element.className}`);
}

/**
 * 🔍 Debug: Check entire parent hierarchy for visibility blockers
 * @param {string} elementId - The ID of the element to start from
 */
function debugParentHierarchy(elementId) {
  console.log(`[DEBUG HIERARCHY] 🔍 Checking parent chain for #${elementId}:`);

  let element = document.getElementById(elementId);
  if (!element) {
    console.log(`[DEBUG HIERARCHY] ❌ Element #${elementId} NOT FOUND`);
    return;
  }

  let level = 0;
  while (element && level < 10) {
    const computed = window.getComputedStyle(element);
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';

    console.log(`[DEBUG HIERARCHY] Level ${level}: <${tag}${id}${classes}>`);
    console.log(`  - display: ${computed.display}`);
    console.log(`  - opacity: ${computed.opacity}`);
    console.log(`  - visibility: ${computed.visibility}`);

    // Check for visibility blockers
    if (computed.display === 'none') {
      console.log(`  ⚠️  BLOCKER: display: none`);
    }
    if (computed.opacity === '0') {
      console.log(`  ⚠️  BLOCKER: opacity: 0`);
    }
    if (computed.visibility === 'hidden') {
      console.log(`  ⚠️  BLOCKER: visibility: hidden`);
    }

    element = element.parentElement;
    level++;
  }

  console.log(`[DEBUG HIERARCHY] ✅ Checked ${level} levels`);
}

/**
 * 🔥 NUCLEAR OPTION: Force visibility on ALL parent containers
 * Call this after rendering artists to ensure everything is visible
 */
export function forceSearchResultsVisible() {
  console.log('[VISIBILITY FIX] 🔥 FORCING VISIBILITY ON ALL CONTAINERS');

  // 1. Force visibility on the results container (grid)
  const resultsContainer = document.getElementById('artist-list-container');
  if (forceVisible(resultsContainer, 'grid')) {
    console.log('[VISIBILITY FIX] ✅ artist-list-container forced visible (grid)');
  } else {
    console.error('[VISIBILITY FIX] ❌ artist-list-container NOT FOUND!');
  }

  // 1.5. Force visibility on the PARENT <main> element (CRITICAL!)
  const resultsMain = document.getElementById('artist-results-main');
  if (forceVisible(resultsMain, 'block')) {
    console.log('[VISIBILITY FIX] ✅ artist-results-main forced visible');
  } else {
    console.error('[VISIBILITY FIX] ❌ artist-results-main NOT FOUND!');
  }

  // 2. Force visibility on artist search section
  const artistSearchSection = document.getElementById('artist-search-section');
  if (forceVisible(artistSearchSection, 'block')) {
    console.log('[VISIBILITY FIX] ✅ artist-search-section forced visible');
  } else {
    console.error('[VISIBILITY FIX] ❌ artist-search-section NOT FOUND!');
  }

  // 3. Force visibility on programmer dashboard
  const programmerDashboard = document.getElementById('programmer-dashboard');
  if (forceVisible(programmerDashboard, 'block')) {
    console.log('[VISIBILITY FIX] ✅ programmer-dashboard forced visible');
  } else {
    console.error('[VISIBILITY FIX] ❌ programmer-dashboard NOT FOUND!');
  }

  // 4. Force visibility on dashboard view
  const dashboardView = document.getElementById('dashboard-view');
  if (forceVisible(dashboardView, 'block')) {
    console.log('[VISIBILITY FIX] ✅ dashboard-view forced visible');
  } else {
    console.error('[VISIBILITY FIX] ❌ dashboard-view NOT FOUND!');
  }

  // 5. Force visibility on app-content (root container)
  const appContent = document.getElementById('app-content');
  if (forceVisible(appContent, 'block')) {
    console.log('[VISIBILITY FIX] ✅ app-content forced visible');
  } else {
    console.error('[VISIBILITY FIX] ❌ app-content NOT FOUND!');
  }

  // 6. Debug: Log computed styles after forcing
  console.log('[VISIBILITY FIX] 🔍 DEBUG: Checking computed styles...');
  debugElementVisibility('artist-list-container');
  debugElementVisibility('artist-results-main');
  debugElementVisibility('artist-search-section');
  debugElementVisibility('programmer-dashboard');
  debugElementVisibility('dashboard-view');

  // 7. 🔍 DEBUG HIERARCHY: Check entire parent chain for hidden blockers
  console.log('[VISIBILITY FIX] 🔍 DEBUG: Checking parent hierarchy...');
  debugParentHierarchy('artist-list-container');

  console.log('[VISIBILITY FIX] ✅ ALL CONTAINERS FORCED VISIBLE');
}

/**
 * 🔥 NUCLEAR OPTION 2: Hide profile sections when showing search
 * Call this to ensure profile sections don't overlap with search results
 */
export function hideProfileSectionsForSearch() {
  console.log('[VISIBILITY FIX] 🧹 Hiding profile sections for search view');

  const profileOverview = document.getElementById('programmer-profile-overview');
  const publicPreview = document.getElementById('programmer-public-preview');
  const profileEditor = document.getElementById('programmer-profile-editor');

  [profileOverview, publicPreview, profileEditor].forEach(element => {
    if (element) {
      element.style.display = 'none';
      element.classList.add('hidden');
    }
  });

  console.log('[VISIBILITY FIX] ✅ Profile sections hidden');
}

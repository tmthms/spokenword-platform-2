/**
 * search-ui.js
 * Handles all HTML generation for artist search
 * Responsive layout - mobile pills & desktop sidebar
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import { loadArtistsData, calculateAge, isProgrammer } from './search-data.js';
import { showArtistDetail } from './search-controller.js';
import { getStore } from '../../utils/store.js';
import { openMessageModal } from '../messaging/messaging-controller.js';

/**
 * Render the artist search view - Responsive with Tailwind
 * Mobile: Horizontal pills + dropdown panels + 2-col grid
 * Desktop: Sidebar filters + 4-col grid
 */
export function renderArtistSearch() {
  const searchSection = document.getElementById('artist-search-section');
  if (!searchSection) {
    console.error('[RENDER] artist-search-section not found');
    return;
  }

  // Apply pattern background
  searchSection.className = 'search-pattern';
  searchSection.style.cssText = 'display: block; opacity: 1; visibility: visible;';

  // Detect if desktop
  const isDesktop = window.innerWidth >= 1024;

  searchSection.innerHTML = `
    <div id="search-module-root" style="max-width: 1400px; margin: 0 auto; position: relative; z-index: 1;">

      <!-- ===================== MOBILE LAYOUT ===================== -->
      <div id="mobile-search-layout" style="display: ${isDesktop ? 'none' : 'block'};">

        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;">Zoeken</h1>

        <!-- Filter Pills -->
        <div class="no-scrollbar" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 8px;">
          <button data-action="toggle-filter" data-target="name" id="btn-filter-name"
                  style="flex-shrink: 0; padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer;">
            Naam
          </button>
          <button data-action="toggle-filter" data-target="location" id="btn-filter-location"
                  style="flex-shrink: 0; padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer;">
            Locatie
          </button>
          <button data-action="toggle-filter" data-target="keywords" id="btn-filter-keywords"
                  style="flex-shrink: 0; padding: 10px 18px; background: white; border: 1px solid #e5e7eb; border-radius: 24px; font-size: 14px; font-weight: 500; color: #4a4a68; cursor: pointer;">
            Keywords
          </button>
        </div>

        <!-- Filter Panels -->
        <div id="filter-name" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-name" placeholder="Naam artiest..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="name"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px;">✓</button>
          </div>
        </div>

        <div id="filter-location" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-location" placeholder="Stad of regio..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="location"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px;">✓</button>
          </div>
        </div>

        <!-- ===== COLLAPSIBLE FILTER PANELS ===== -->

        <!-- GENRE FILTER -->
        <div class="filter-section" style="background: white; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <button data-action="toggle-filter" data-target="genre"
                  style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px; background: none; border: none; cursor: pointer;">
            <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">Genre</span>
            <svg id="chevron-genre" style="width: 20px; height: 20px; color: #9ca3af; transition: transform 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div id="filter-genre" style="display: none; padding: 0 16px 16px 16px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="performance-poetry" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Performance Poetry</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="slam-poetry" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Slam Poetry</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="hip-hop-poetry" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Hip Hop Poetry</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="storytelling" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Storytelling</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="experimental" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Experimental</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="musical-poetry" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Musical Poetry</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="lyrical" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Lyrical</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-genre" value="political-poetry" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Political Poetry</span>
              </label>
            </div>
          </div>
        </div>

        <!-- THEMES FILTER -->
        <div class="filter-section" style="background: white; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <button data-action="toggle-filter" data-target="themes"
                  style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px; background: none; border: none; cursor: pointer;">
            <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">Themes</span>
            <svg id="chevron-themes" style="width: 20px; height: 20px; color: #9ca3af; transition: transform 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div id="filter-themes" style="display: none; padding: 0 16px 16px 16px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="identity" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Identity</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="social-justice" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Social Justice</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="mental-health" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Mental Health</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="love-relationships" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Love/Relationships</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="politics" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Politics</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="climate-change" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Climate Change</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-theme" value="coming-of-age" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Coming of Age</span>
              </label>
            </div>
          </div>
        </div>

        <!-- VIBE FILTER -->
        <div class="filter-section" style="background: white; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <button data-action="toggle-filter" data-target="vibe"
                  style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px; background: none; border: none; cursor: pointer;">
            <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">Vibe</span>
            <svg id="chevron-vibe" style="width: 20px; height: 20px; color: #9ca3af; transition: transform 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div id="filter-vibe" style="display: none; padding: 0 16px 16px 16px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-energy" value="intiem" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Intiem</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-energy" value="interactief" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Interactief</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-energy" value="energiek" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Energiek</span>
              </label>
            </div>
          </div>
        </div>

        <!-- FORMATS FILTER -->
        <div class="filter-section" style="background: white; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <button data-action="toggle-filter" data-target="formats"
                  style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 16px; background: none; border: none; cursor: pointer;">
            <span style="font-size: 16px; font-weight: 600; color: #1a1a2e;">Diensten</span>
            <svg id="chevron-formats" style="width: 20px; height: 20px; color: #9ca3af; transition: transform 0.2s;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div id="filter-formats" style="display: none; padding: 0 16px 16px 16px;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-format" value="podiumperformance" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Podiumperformance</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-format" value="workshops" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Workshops</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-format" value="hosting" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Hosting / Presentatie</span>
              </label>
              <label class="chip-label" style="display: inline-flex; align-items: center; padding: 8px 16px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" name="mobile-format" value="gedichten-op-maat" class="chip-input" style="position: absolute; opacity: 0; width: 0; height: 0;">
                <span class="chip-text" style="font-size: 14px; font-weight: 500; color: #374151;">Gedichten op Maat</span>
              </label>
            </div>
          </div>
        </div>

        <!-- ===== END COLLAPSIBLE FILTER PANELS ===== -->

        <div id="filter-keywords" style="display: none; background: white; border-radius: 16px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(128,90,213,0.1);">
          <div style="display: flex; gap: 8px;">
            <input type="text" id="mobile-input-keywords" placeholder="bijv. slam, poetry, rap..."
                   style="flex: 1; padding: 12px 16px; background: #f9fafb; border-radius: 12px; border: none; font-size: 14px; outline: none;">
            <button data-action="apply-filter" data-target="keywords"
                    style="width: 44px; height: 44px; background: #805ad5; color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 18px;">✓</button>
          </div>
        </div>

        <!-- Results -->
        <p id="mobile-results-count" style="color: #9ca3af; font-size: 14px; margin-bottom: 12px;">0 gevonden</p>
        <div id="mobile-search-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <!-- Cards here -->
        </div>
      </div>

      <!-- ===================== DESKTOP 3-COLUMN LAYOUT ===================== -->
      <div id="desktop-search-layout" style="display: ${isDesktop ? 'flex' : 'none'}; gap: 24px; align-items: flex-start;">

        <!-- LEFT COLUMN: Filters -->
        <aside style="width: 220px; flex-shrink: 0;">
          <h1 style="font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 24px;">Zoeken</h1>

          <div style="background: white; border-radius: 20px; padding: 24px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1);">

            <!-- Keywords (moved to top) -->
            <div style="margin-bottom: 16px;">
              <label style="font-size: 14px; font-weight: 600; color: #1a1a2e; display: block; margin-bottom: 8px;">Keywords</label>
              <input id="desktop-input-keywords" type="text" placeholder="bijv. slam, poetry, rap..."
                     style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e9e3f5; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>

            <hr style="border: none; border-top: 1px solid #e9e3f5; margin: 20px 0;">

            <!-- Name Search -->
            <div style="margin-bottom: 16px;">
              <input id="desktop-input-name" type="text" placeholder="Zoek op naam..."
                     style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e9e3f5; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>

            <!-- Location Search -->
            <div style="margin-bottom: 20px;">
              <input id="desktop-input-location" type="text" placeholder="Locatie..."
                     style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e9e3f5; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>

            <hr style="border: none; border-top: 1px solid #e9e3f5; margin: 20px 0;">

            <!-- Genre Section (collapsible, at bottom) -->
            <div id="desktop-genre-section">
              <button id="desktop-genre-toggle" type="button" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; cursor: pointer; padding: 0; margin-bottom: 0;">
                <h3 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0;">Genre</h3>
                <svg id="desktop-genre-chevron" width="20" height="20" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style="transition: transform 0.2s;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Genre Checkboxes (hidden by default) -->
              <div id="desktop-genre-checkboxes" style="display: none; flex-direction: column; gap: 12px; margin-top: 16px; max-height: 300px; overflow-y: auto;">
                <p style="color: #9ca3af; font-size: 14px;">Laden...</p>
              </div>
            </div>

            <hr style="border: none; border-top: 1px solid #e9e3f5; margin: 20px 0;">

            <!-- Desktop Themes Filter -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 13px; font-weight: 600; color: #4a4a68; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Themes</h4>
              <div id="desktop-theme-checkboxes" style="display: flex; flex-wrap: wrap; gap: 8px;">
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="identity" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Identity</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="social-justice" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Social Justice</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="mental-health" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Mental Health</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="love-relationships" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Love/Relationships</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="politics" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Politics</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="climate-change" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Climate Change</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-theme" value="coming-of-age" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Coming of Age</span>
                </label>
              </div>
            </div>

            <!-- Desktop Vibe Filter -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 13px; font-weight: 600; color: #4a4a68; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Vibe</h4>
              <div id="desktop-vibe-checkboxes" style="display: flex; flex-wrap: wrap; gap: 8px;">
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-energy" value="intiem" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Intiem</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-energy" value="interactief" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Interactief</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-energy" value="energiek" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Energiek</span>
                </label>
              </div>
            </div>

            <!-- Desktop Formats Filter -->
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 13px; font-weight: 600; color: #4a4a68; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Diensten</h4>
              <div id="desktop-format-checkboxes" style="display: flex; flex-wrap: wrap; gap: 8px;">
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-format" value="podiumperformance" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Podiumperformance</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-format" value="workshops" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Workshops</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-format" value="hosting" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Hosting / Presentatie</span>
                </label>
                <label class="chip-label" style="display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 9999px; border: 2px solid #d1d5db; background: white; cursor: pointer; font-size: 13px;">
                  <input type="checkbox" name="desktop-format" value="gedichten-op-maat" class="chip-input sr-only">
                  <span class="chip-text" style="color: #4a4a68;">Gedichten op Maat</span>
                </label>
              </div>
            </div>

          </div>
        </aside>

        <!-- MIDDLE COLUMN: Results Grid (3 cols) -->
        <main style="flex: 1; min-width: 0;">
          <p id="desktop-results-count" style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">0 gevonden</p>
          <div id="desktop-search-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <!-- Cards here -->
          </div>
        </main>

        <!-- RIGHT COLUMN: Artist Detail Panel -->
        <aside id="search-detail-panel" style="width: 300px; flex-shrink: 0;">
          <div style="background: white; border-radius: 20px; padding: 28px; box-shadow: 0 4px 20px rgba(128, 90, 213, 0.08); border: 1px solid rgba(128, 90, 213, 0.1); position: sticky; top: 100px;">

            <!-- Empty State -->
            <div id="detail-empty-state" style="text-align: center; padding: 40px 0;">
              <div style="width: 80px; height: 80px; background: #f3e8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <svg width="32" height="32" fill="none" stroke="#805ad5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <p style="color: #9ca3af; font-size: 14px;">Selecteer een artiest</p>
            </div>

            <!-- Filled State (hidden by default) -->
            <div id="detail-content" style="display: none;">
              <h2 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 24px;">Profiel</h2>

              <!-- Photo -->
              <div style="display: flex; justify-content: center; margin-bottom: 16px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid #805ad5;">
                  <img id="detail-photo" src="" alt="Artist" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
              </div>

              <!-- Name -->
              <h3 id="detail-name" style="font-size: 20px; font-weight: 600; color: #1a1a2e; text-align: center; margin-bottom: 20px;">Artist Name</h3>

              <!-- Edit Button -->
              <button id="detail-edit-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px;">
                Edit Profile
              </button>

              <!-- Over Mij -->
              <div style="margin-bottom: 20px;">
                <h4 style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Over Mij</h4>
                <p id="detail-bio" style="font-size: 13px; color: #4a4a68; line-height: 1.7;">Bio komt hier...</p>
              </div>

              <!-- Mijn Werk -->
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px;">Mijn Werk</h4>
                <p id="detail-work" style="font-size: 13px; color: #4a4a68; line-height: 1.7;">Mijn Werk</p>
              </div>
            </div>
          </div>
        </aside>

      </div>

    </div>
  `;

  // Populate filter checkboxes
  // populateGenreFilters(); // Nu statisch in HTML

  // Setup interactions
  setupSearchInteractions();

  // Load artists
  loadArtists();

  // Handle resize
  window.removeEventListener('resize', handleSearchResize);
  window.addEventListener('resize', handleSearchResize);

  searchSection.dataset.setupComplete = 'false';

  console.log('[RENDER] Search UI rendered, isDesktop:', isDesktop);
}

function handleSearchResize() {
  const isDesktop = window.innerWidth >= 1024;
  const mobileLayout = document.getElementById('mobile-search-layout');
  const desktopLayout = document.getElementById('desktop-search-layout');

  if (mobileLayout) mobileLayout.style.display = isDesktop ? 'none' : 'block';
  if (desktopLayout) desktopLayout.style.display = isDesktop ? 'flex' : 'none';
}

/*
async function populateGenreFilters() {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const snapshot = await getDocs(collection(db, 'artists'));
    const genres = new Set();
    snapshot.forEach(doc => {
      (doc.data().genres || []).forEach(g => genres.add(g));
    });

    const sorted = Array.from(genres).sort();

    // Desktop genre checkboxes only (mobile now has static chips)
    const desktopGenres = document.getElementById('desktop-genre-checkboxes');
    if (desktopGenres) {
      desktopGenres.innerHTML = sorted.map(g => `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
          <input type="checkbox" name="desktop-genre" value="${g}"
                 style="width: 18px; height: 18px; accent-color: #805ad5; cursor: pointer;">
          <span style="font-size: 14px; color: #4a4a68;">${g}</span>
        </label>
      `).join('');
    }

    console.log('[FILTERS] Populated', sorted.length, 'desktop genres');
  } catch (err) {
    console.error('[FILTERS] Error:', err);
  }
}
*/

/**
 * Populate genre checkboxes in both mobile and desktop
 */
async function populateGenres() {
  try {
    const snapshot = await getDocs(collection(db, 'artists'));
    const genres = new Set();
    snapshot.forEach(doc => {
      (doc.data().genres || []).forEach(g => genres.add(g));
    });

    const sorted = Array.from(genres).sort();

    // Desktop checkboxes
    const desktopContainer = document.getElementById('desktop-genre-checkboxes');
    if (desktopContainer) {
      desktopContainer.innerHTML = sorted.map(g => `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" name="desktop-genre" value="${g}"
                 style="width: 16px; height: 16px; accent-color: #805ad5; cursor: pointer;">
          <span style="font-size: 13px; color: #4a4a68;">${g}</span>
        </label>
      `).join('');
    }

    // Mobile checkboxes
    const mobileContainer = document.getElementById('mobile-genre-checkboxes');
    if (mobileContainer) {
      mobileContainer.innerHTML = sorted.map(g => `
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
          <input type="checkbox" name="mobile-genre" value="${g}" class="w-5 h-5 rounded text-purple-600">
          <span class="text-gray-900">${g}</span>
        </label>
      `).join('');
    }
  } catch (err) {
    console.error('[GENRES] Error:', err);
  }
}

/**
 * Setup search interactions for responsive layout
 */
function setupSearchInteractions() {
  const root = document.getElementById('search-module-root');
  if (!root) return;

  // Mobile: Toggle filter panels
  root.addEventListener('click', (e) => {
    // Toggle filter button
    const toggleBtn = e.target.closest('[data-action="toggle-filter"]');
    if (toggleBtn) {
      const target = toggleBtn.dataset.target;
      const panel = document.getElementById(`filter-${target}`);
      const chevron = document.getElementById(`chevron-${target}`);

      if (panel) {
        const isOpen = panel.style.display !== 'none';

        // Toggle panel
        panel.style.display = isOpen ? 'none' : 'block';

        // Rotate chevron
        if (chevron) {
          chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      }
      return;
    }

    // Chip click handler
    const chipLabel = e.target.closest('.chip-label');
    if (chipLabel) {
      const checkbox = chipLabel.querySelector('.chip-input');
      if (checkbox) {
        // Toggle checkbox
        checkbox.checked = !checkbox.checked;

        // Update styling
        if (checkbox.checked) {
          chipLabel.style.backgroundColor = '#7c3aed';
          chipLabel.style.borderColor = '#7c3aed';
          chipLabel.querySelector('.chip-text').style.color = 'white';
        } else {
          chipLabel.style.backgroundColor = 'white';
          chipLabel.style.borderColor = '#d1d5db';
          chipLabel.querySelector('.chip-text').style.color = '#374151';
        }

        // Reload artists
        loadArtists();
      }
      return;
    }

    // Apply filter button
    const applyBtn = e.target.closest('[data-action="apply-filter"]');
    if (applyBtn) {
      const target = applyBtn.dataset.target;
      const panel = document.getElementById(`filter-${target}`);
      if (panel) panel.style.display = 'none';
      loadArtists();
      return;
    }

    // Artist card click
    const card = e.target.closest('[data-artist-id]');
    if (card) {
      const artistId = card.dataset.artistId;
      console.log('[SEARCH] Card clicked:', artistId);

      // Desktop: show in detail panel
      const detailPanel = document.getElementById('search-detail-panel');
      const isDesktop = window.innerWidth >= 1024;

      if (detailPanel && isDesktop) {
        import('./search-data.js').then(dataModule => {
          dataModule.fetchArtistById(artistId).then(artist => {
            if (artist) {
              showArtistInDetailPanel(artist);
            }
          });
        });
      } else {
        // Mobile: navigate to full page
        showArtistDetail(artistId);
      }
      return;
    }
  });

  // Desktop: Apply filters button
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      loadArtists();
    });
  }

  // Desktop: Input changes - debounced
  root.addEventListener('input', (e) => {
    if (e.target.matches('#desktop-input-name, #desktop-input-location, #desktop-input-keywords')) {
      clearTimeout(window.searchDebounce);
      window.searchDebounce = setTimeout(() => loadArtists(), 500);
    }
  });

  // Desktop: Checkbox changes - immediate
  root.addEventListener('change', (e) => {
    // Handle chip selection visual feedback
    if (e.target.matches('.chip-input')) {
      const label = e.target.closest('.chip-label');
      if (label) {
        if (e.target.checked) {
          label.style.backgroundColor = '#7c3aed';
          label.style.borderColor = '#7c3aed';
          const chipText = label.querySelector('.chip-text');
          if (chipText) chipText.style.color = 'white';
        } else {
          label.style.backgroundColor = 'white';
          label.style.borderColor = '#d1d5db';
          const chipText = label.querySelector('.chip-text');
          if (chipText) chipText.style.color = '#374151';
        }
      }
      // Trigger search update
      loadArtists();
    } else if (e.target.matches('[name="desktop-genre"], [name="mobile-genre"]')) {
      loadArtists();
    }
  });

  console.log('[SETUP] Interactions ready');
}

/**
 * Load artists with filters from both mobile and desktop
 */
async function loadArtists() {
  const desktopGrid = document.getElementById('desktop-search-grid');
  const mobileGrid = document.getElementById('mobile-search-grid');
  const desktopCount = document.getElementById('desktop-results-count');
  const mobileCount = document.getElementById('mobile-results-count');

  // Show loading
  if (desktopGrid) desktopGrid.style.opacity = '0.5';
  if (mobileGrid) mobileGrid.style.opacity = '0.5';

  try {
    // Collect filters from both mobile and desktop
    const nameFilter = (
      document.getElementById('desktop-input-name')?.value ||
      document.getElementById('mobile-input-name')?.value || ''
    ).toLowerCase().trim();

    const locationFilter = (
      document.getElementById('desktop-input-location')?.value ||
      document.getElementById('mobile-input-location')?.value || ''
    ).toLowerCase().trim();

    const genreCheckboxes = document.querySelectorAll(
      'input[name="desktop-genre"]:checked, input[name="mobile-genre"]:checked'
    );
    // Normalize genres same way as search-data.js: trim, lowercase, replace spaces with dashes
    const genreFilters = Array.from(genreCheckboxes).map(cb =>
      cb.value.trim().toLowerCase().replace(/\s+/g, '-')
    );

    const themeCheckboxes = document.querySelectorAll('input[name="mobile-theme"]:checked, input[name="desktop-theme"]:checked');
    const themeFilters = Array.from(themeCheckboxes).map(cb =>
      cb.value.trim().toLowerCase().replace(/\s+/g, '-')
    );

    const vibeCheckboxes = document.querySelectorAll('input[name="mobile-energy"]:checked, input[name="desktop-energy"]:checked');
    const vibeFilters = Array.from(vibeCheckboxes).map(cb =>
      cb.value.trim().toLowerCase()
    );

    const formatCheckboxes = document.querySelectorAll('input[name="mobile-format"]:checked, input[name="desktop-format"]:checked');
    const formatFilters = Array.from(formatCheckboxes).map(cb =>
      cb.value.trim().toLowerCase().replace(/\s+/g, '-')
    );

    const keywordsFilter = (
      document.getElementById('desktop-input-keywords')?.value ||
      document.getElementById('mobile-input-keywords')?.value || ''
    ).toLowerCase().trim();

    console.log('[SEARCH UI] Filters collected:', { nameFilter, locationFilter, genreFilters, themeFilters, vibeFilters, formatFilters, keywordsFilter });

    // Load and filter
    const artists = await loadArtistsData({ nameFilter, locationFilter, genreFilters, themeFilters, vibeFilters, formatFilters, keywordsFilter });

    // Update counts
    const countText = `${artists.length} gevonden`;
    if (desktopCount) desktopCount.textContent = countText;
    if (mobileCount) mobileCount.textContent = countText;

    // Render to both grids
    renderArtists(artists);

  } catch (error) {
    console.error('Error loading artists:', error);
  } finally {
    if (desktopGrid) desktopGrid.style.opacity = '1';
    if (mobileGrid) mobileGrid.style.opacity = '1';
  }
}

/**
 * Render artists to both mobile and desktop grids
 */
export function renderArtists(artists) {
  const desktopGrid = document.getElementById('desktop-search-grid');
  const mobileGrid = document.getElementById('mobile-search-grid');
  const desktopCount = document.getElementById('desktop-results-count');
  const mobileCount = document.getElementById('mobile-results-count');

  const countText = `${artists.length} gevonden`;
  if (desktopCount) desktopCount.textContent = countText;
  if (mobileCount) mobileCount.textContent = countText;

  // Generate desktop card HTML
  const desktopCardHTML = (artist) => {
    const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
    const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
    const genre = (artist.genres || [])[0] || '';

    return `
      <div class="artist-card" data-artist-id="${artist.id}"
           style="background: white; border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: 0 2px 12px rgba(128,90,213,0.06);">
        <div style="width: 80px; height: 80px; margin: 0 auto 12px; border-radius: 50%; overflow: hidden; border: 2px solid #e9e3f5; background: #f3e8ff;">
          <img src="${pic}" alt="${name}"
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:#805ad5;\\'>${name.charAt(0)}</div>'">
        </div>
        <h3 style="font-size: 14px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</h3>
        ${genre ? `<p style="font-size: 12px; color: #9ca3af;">${genre}</p>` : '<p style="font-size: 12px; color: #9ca3af;">&nbsp;</p>'}
      </div>
    `;
  };

  // Generate mobile card HTML
  const mobileCardHTML = (artist) => {
    const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.stageName || 'A')}&background=e0e7ff&color=6366f1&size=150`;
    const name = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
    const genre = (artist.genres || [])[0] || '';

    return `
      <div data-artist-id="${artist.id}" style="text-align: center; cursor: pointer;">
        <div style="width: 100px; height: 100px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 2px solid #e9e3f5; background: #f3e8ff;">
          <img src="${pic}" alt="${name}"
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:#805ad5;\\'>${name.charAt(0)}</div>'">
        </div>
        <h3 style="font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 10px;">${name}</h3>
        ${genre ? `<p style="font-size: 11px; color: #9ca3af;">${genre}</p>` : ''}
      </div>
    `;
  };

  // Render desktop grid
  if (desktopGrid) {
    desktopGrid.innerHTML = artists.length > 0
      ? artists.map(desktopCardHTML).join('')
      : '<p style="grid-column: span 3; text-align: center; color: #9ca3af; padding: 60px 0;">Geen artiesten gevonden</p>';
  }

  // Render mobile grid
  if (mobileGrid) {
    mobileGrid.innerHTML = artists.length > 0
      ? artists.map(mobileCardHTML).join('')
      : '<p style="grid-column: span 2; text-align: center; color: #9ca3af; padding: 40px 0;">Geen artiesten gevonden</p>';
  }

  console.log('[RENDER] Rendered', artists.length, 'artists');
}

/**
 * Show artist in detail panel (desktop 3-column layout)
 */
export function showArtistInDetailPanel(artist) {
  const emptyState = document.getElementById('detail-empty-state');
  const detailContent = document.getElementById('detail-content');

  if (!emptyState || !detailContent) return;

  emptyState.style.display = 'none';
  detailContent.style.display = 'block';

  const photo = document.getElementById('detail-photo');
  const name = document.getElementById('detail-name');
  const bio = document.getElementById('detail-bio');
  const work = document.getElementById('detail-work');
  const editBtn = document.getElementById('detail-edit-btn');

  const artistName = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown';
  const pic = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=e0e7ff&color=6366f1&size=150`;

  if (photo) photo.src = pic;
  if (name) name.textContent = artistName;
  if (bio) bio.textContent = artist.bio || artist.pitch || 'Geen bio beschikbaar.';
  if (work) work.textContent = artist.work || 'Geen werk beschikbaar.';

  if (editBtn) {
    editBtn.textContent = 'Bekijk Profiel';
    editBtn.onclick = () => {
      import('./search-controller.js').then(m => m.showArtistDetail(artist.id));
    };
  }

  // Highlight selected card
  document.querySelectorAll('.artist-card').forEach(card => {
    card.style.borderColor = card.dataset.artistId === artist.id ? '#805ad5' : 'transparent';
    card.style.boxShadow = card.dataset.artistId === artist.id
      ? '0 4px 20px rgba(128,90,213,0.2)'
      : '0 2px 12px rgba(128,90,213,0.06)';
  });
}

/**
 * Populate artist detail view with artist data
 */
export function populateArtistDetail(artist) {
  if (!artist) {
    console.error('[DETAIL] No artist data provided');
    return;
  }

  console.log('[DETAIL] Populating artist:', artist.stageName || artist.id);

  const artistName = artist.stageName || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown Artist';
  const profilePicUrl = artist.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&background=f3f4f6&color=1a1a2e&size=140`;
  const age = artist.dob ? calculateAge(artist.dob) : null;
  const genderMap = { 'f': 'Female', 'm': 'Male', 'x': 'Other' };
  const genderText = genderMap[artist.gender] || artist.gender || 'Not specified';

  // ========== DESKTOP ELEMENTS ==========

  const detailProfilePic = document.getElementById('detail-profile-pic');
  if (detailProfilePic) detailProfilePic.src = profilePicUrl;

  const detailArtistName = document.getElementById('detail-artist-name');
  if (detailArtistName) detailArtistName.textContent = artistName;

  const detailAge = document.getElementById('detail-age');
  if (detailAge) detailAge.textContent = age ? `${age} years old` : 'Age unknown';

  const detailGender = document.getElementById('detail-gender');
  if (detailGender) detailGender.textContent = genderText;

  const detailLocation = document.getElementById('detail-location');
  if (detailLocation) detailLocation.textContent = artist.location || 'Location unknown';

  const detailGenres = document.getElementById('detail-genres');
  if (detailGenres) {
    const genres = artist.genres || [];
    detailGenres.innerHTML = genres.length > 0
      ? genres.map(g => `<span style="padding: 6px 14px; background: #f3e8ff; color: #805ad5; border-radius: 20px; font-size: 13px; font-weight: 500;">${g}</span>`).join('')
      : '<span style="color: #9ca3af; font-size: 13px;">No genres specified</span>';
  }

  const detailLanguages = document.getElementById('detail-languages');
  if (detailLanguages) {
    const languages = artist.languages || [];
    detailLanguages.innerHTML = languages.length > 0
      ? languages.map(l => `<span style="padding: 6px 12px; background: #805ad5; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">${(l || '').substring(0,2).toUpperCase()}</span>`).join('')
      : '<span style="color: #9ca3af; font-size: 13px;">No languages specified</span>';
  }

  const detailBio = document.getElementById('detail-bio');
  if (detailBio) detailBio.textContent = artist.bio || 'No biography available.';

  const detailPitch = document.getElementById('detail-pitch');
  if (detailPitch) detailPitch.textContent = artist.pitch || 'No pitch available.';

  const detailEmailContainer = document.getElementById('detail-email-container');
  const detailEmail = document.getElementById('detail-email');
  if (detailEmail && artist.email) {
    detailEmail.textContent = artist.email;
    detailEmail.href = `mailto:${artist.email}`;
    if (detailEmailContainer) detailEmailContainer.style.display = 'flex';
  } else if (detailEmailContainer) {
    detailEmailContainer.style.display = 'none';
  }

  const detailPhoneContainer = document.getElementById('detail-phone-container');
  const detailPhone = document.getElementById('detail-phone');
  if (detailPhone && artist.phone) {
    detailPhone.textContent = artist.phone;
    if (detailPhoneContainer) detailPhoneContainer.style.display = 'flex';
  } else if (detailPhoneContainer) {
    detailPhoneContainer.style.display = 'none';
  }

  const chatHeader = document.getElementById('chat-header-name');
  if (chatHeader) chatHeader.textContent = `Chat met ${artistName}`;

  // Media Gallery
  const galleryEl = document.getElementById('detail-media-gallery');
  if (galleryEl) {
    const mediaItems = [];

    if (artist.galleryPhotos && artist.galleryPhotos.length > 0) {
      artist.galleryPhotos.forEach((photo) => {
        mediaItems.push(`
          <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
            <img src="${photo}" alt="Gallery photo" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `);
      });
    }

    if (mediaItems.length === 0 && artist.profilePicUrl) {
      mediaItems.push(`
        <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
          <img src="${artist.profilePicUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `);
    }

    if (artist.youtubeVideos && artist.youtubeVideos.length > 0) {
      artist.youtubeVideos.forEach((video) => {
        const videoId = video.videoId || (video.url ? video.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] : null);
        if (videoId) {
          mediaItems.push(`
            <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden; position: relative;">
              <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3);">
                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <svg width="20" height="20" fill="#805ad5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          `);
        }
      });
    }

    galleryEl.innerHTML = mediaItems.length > 0
      ? mediaItems.join('')
      : '<div style="grid-column: span 2; aspect-ratio: 16/9; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;"><span style="color: #9ca3af; font-size: 14px;">Geen media beschikbaar</span></div>';
  }

  // ========== MOBILE ELEMENTS ==========

  const mobilePhoto = document.getElementById('mobile-detail-photo');
  if (mobilePhoto) mobilePhoto.src = profilePicUrl;

  const mobileName = document.getElementById('mobile-detail-name');
  if (mobileName) mobileName.textContent = artistName;

  const mobileAge = document.getElementById('mobile-detail-age');
  if (mobileAge) mobileAge.textContent = age ? `${age} years old` : 'Age unknown';

  const mobileGender = document.getElementById('mobile-detail-gender');
  if (mobileGender) mobileGender.textContent = genderText;

  const mobileLocation = document.getElementById('mobile-detail-location');
  if (mobileLocation) mobileLocation.textContent = artist.location || 'Location unknown';

  const mobileGenres = document.getElementById('mobile-detail-genres');
  if (mobileGenres) {
    const genres = artist.genres || [];
    mobileGenres.innerHTML = genres.length > 0
      ? genres.map(g => `<span style="padding: 8px 16px; background: white; border: 1px solid #1a1a2e; border-radius: 20px; font-size: 14px; color: #1a1a2e;">${g}</span>`).join('')
      : '<span style="color: #9ca3af; font-size: 14px;">No genres specified</span>';
  }

  const mobileLanguages = document.getElementById('mobile-detail-languages');
  if (mobileLanguages) {
    const languages = artist.languages || [];
    mobileLanguages.innerHTML = languages.length > 0
      ? languages.map(l => `<span style="padding: 6px 12px; background: white; border: 1px solid #1a1a2e; border-radius: 20px; font-size: 13px; font-weight: 600; color: #1a1a2e;">${(l || '').substring(0,2).toUpperCase()}</span>`).join('')
      : '<span style="color: #9ca3af; font-size: 14px;">No languages specified</span>';
  }

  const mobileBio = document.getElementById('mobile-detail-bio');
  if (mobileBio) mobileBio.textContent = artist.bio || 'No biography available.';

  const mobilePitch = document.getElementById('mobile-detail-pitch');
  if (mobilePitch) mobilePitch.textContent = artist.pitch || 'No pitch available.';

  const mobileEmailContainer = document.getElementById('mobile-detail-email-container');
  const mobileEmail = document.getElementById('mobile-detail-email');
  if (mobileEmail && artist.email) {
    mobileEmail.textContent = artist.email;
    mobileEmail.href = `mailto:${artist.email}`;
    if (mobileEmailContainer) mobileEmailContainer.style.display = 'flex';
  } else if (mobileEmailContainer) {
    mobileEmailContainer.style.display = 'none';
  }

  const mobilePhoneContainer = document.getElementById('mobile-detail-phone-container');
  const mobilePhone = document.getElementById('mobile-detail-phone');
  if (mobilePhone && artist.phone) {
    mobilePhone.textContent = artist.phone;
    if (mobilePhoneContainer) mobilePhoneContainer.style.display = 'flex';
  } else if (mobilePhoneContainer) {
    mobilePhoneContainer.style.display = 'none';
  }

  // ========== ROLE-BASED VISIBILITY ==========
  const isUserProgrammer = isProgrammer();
  console.log('[DETAIL VIEW] User is programmer:', isUserProgrammer);

  // === DESKTOP ELEMENTS ===
  // Hide/show email
  if (detailEmailContainer) {
    detailEmailContainer.style.display = isUserProgrammer && artist.email ? 'flex' : 'none';
  }

  // Hide/show phone
  if (detailPhoneContainer) {
    detailPhoneContainer.style.display = isUserProgrammer && artist.phone ? 'flex' : 'none';
  }

  // Hide/show Contact Information section (desktop)
  // Find the parent section and hide if not programmer
  const contactSection = detailEmailContainer?.closest('div[style*="border-bottom"]');
  if (contactSection && !isUserProgrammer) {
    contactSection.style.display = 'none';
  }

  // Hide/show chat panel (desktop - right column)
  const chatPanel = document.querySelector('#desktop-artist-detail aside:last-child');
  if (chatPanel) {
    chatPanel.style.display = isUserProgrammer ? 'block' : 'none';
  }

  // === MOBILE ELEMENTS ===
  // Hide/show email
  if (mobileEmailContainer) {
    mobileEmailContainer.style.display = isUserProgrammer && artist.email ? 'flex' : 'none';
  }

  // Hide/show phone
  if (mobilePhoneContainer) {
    mobilePhoneContainer.style.display = isUserProgrammer && artist.phone ? 'flex' : 'none';
  }

  // Hide/show Send Message button (mobile)
  const mobileSendMessageBtn = document.getElementById('mobile-send-message-btn');
  if (mobileSendMessageBtn) {
    mobileSendMessageBtn.style.display = isUserProgrammer ? 'flex' : 'none';
  }

  // Hide/show Contact Information section header (mobile)
  const mobileContactHeader = mobileEmailContainer?.parentElement?.previousElementSibling;
  if (mobileContactHeader && mobileContactHeader.tagName === 'H2' && mobileContactHeader.textContent.includes('Contact')) {
    mobileContactHeader.style.display = isUserProgrammer ? 'block' : 'none';
  }

  // Also hide the contact info container div for artists
  const mobileContactContainer = mobileEmailContainer?.parentElement;
  if (mobileContactContainer && !isUserProgrammer) {
    mobileContactContainer.style.display = 'none';
  }

  // ========== BUTTON HANDLERS ==========

  // Mobile Send Message - only for programmers
  if (mobileSendMessageBtn && isUserProgrammer) {
    mobileSendMessageBtn.onclick = () => {
      import('../messaging/messaging-controller.js').then(module => {
        if (module.openMessageModal) module.openMessageModal(artist);
      }).catch(err => console.error('[MESSAGE] Error:', err));
    };
  }

  // Write Recommendation button - only for programmers
  const mobileWriteRecBtn = document.getElementById('mobile-write-recommendation-btn');
  if (mobileWriteRecBtn) {
    if (isUserProgrammer) {
      mobileWriteRecBtn.style.display = 'block';
      mobileWriteRecBtn.onclick = () => alert('Schrijf recommendation functie komt binnenkort.');
    } else {
      mobileWriteRecBtn.style.display = 'none';
    }
  }

  const writeRecBtn = document.getElementById('write-recommendation-btn');
  if (writeRecBtn) {
    if (isUserProgrammer) {
      writeRecBtn.style.display = 'inline-block';
      writeRecBtn.onclick = () => alert('Schrijf recommendation functie komt binnenkort.');
    } else {
      writeRecBtn.style.display = 'none';
    }
  }

  const viewRecsBtn = document.getElementById('view-recommendations-btn');
  if (viewRecsBtn) {
    viewRecsBtn.onclick = () => alert('View recommendations functie komt binnenkort.');
  }

  // ========== FORCE RESPONSIVE LAYOUT ==========
  const isDesktop = window.innerWidth >= 1024;
  const mobileLayout = document.getElementById('mobile-artist-detail');
  const desktopLayout = document.getElementById('desktop-artist-detail');

  console.log('[DETAIL] Layout switch - isDesktop:', isDesktop);
  console.log('[DETAIL] Mobile element:', mobileLayout);
  console.log('[DETAIL] Desktop element:', desktopLayout);

  if (mobileLayout) {
    mobileLayout.style.display = isDesktop ? 'none' : 'block';
    console.log('[DETAIL] Mobile display set to:', mobileLayout.style.display);
  }

  if (desktopLayout) {
    // Remove hidden class and force display
    desktopLayout.classList.remove('hidden');
    desktopLayout.style.display = isDesktop ? 'grid' : 'none';
    console.log('[DETAIL] Desktop display set to:', desktopLayout.style.display);
  }

  // Resize listener
  const handleResize = () => {
    const nowDesktop = window.innerWidth >= 1024;
    if (mobileLayout) mobileLayout.style.display = nowDesktop ? 'none' : 'block';
    if (desktopLayout) {
      desktopLayout.classList.remove('hidden');
      desktopLayout.style.display = nowDesktop ? 'grid' : 'none';
    }
  };
  window.removeEventListener('resize', handleResize);
  window.addEventListener('resize', handleResize);

  console.log('[DETAIL] Artist detail populated successfully');
}

function populateMediaGallery(artist) {
  const galleryEl = document.getElementById('detail-media-gallery');
  if (!galleryEl) return;

  const mediaItems = [];

  // Add photos from gallery
  if (artist.galleryPhotos && artist.galleryPhotos.length > 0) {
    artist.galleryPhotos.forEach((photo, index) => {
      mediaItems.push(`
        <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden; cursor: pointer;">
          <img src="${photo}" alt="Gallery photo" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `);
    });
  }

  // Add profile pic if no gallery photos
  if (mediaItems.length === 0 && artist.profilePicUrl) {
    mediaItems.push(`
      <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
        <img src="${artist.profilePicUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `);
  }

  // Add YouTube videos
  if (artist.youtubeVideos && artist.youtubeVideos.length > 0) {
    artist.youtubeVideos.forEach((video) => {
      const videoId = video.videoId || extractYouTubeId(video.url || video);
      if (videoId) {
        mediaItems.push(`
          <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden; cursor: pointer; position: relative;">
            <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3);">
              <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" fill="#805ad5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        `);
      }
    });
  }

  // Render gallery
  if (mediaItems.length > 0) {
    galleryEl.innerHTML = mediaItems.join('');
  } else {
    galleryEl.innerHTML = `
      <div style="grid-column: span 2; aspect-ratio: 16/9; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #9ca3af; font-size: 14px;">Geen media beschikbaar</span>
      </div>
    `;
  }
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

/**
 * Populate mobile recommendations
 */
async function populateMobileRecommendations(artist) {
  const container = document.getElementById('mobile-detail-recommendations');
  if (!container || !artist) return;

  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const recsRef = collection(db, 'recommendations');
    const q = query(
      recsRef,
      where('artistId', '==', artist.id),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = '<p style="color: #9ca3af; font-size: 14px; text-align: center; padding: 20px;">Nog geen recommendations.</p>';
      return;
    }

    const currentUser = getStore('currentUser');

    container.innerHTML = '';
    snapshot.forEach(doc => {
      const rec = doc.data();
      const date = rec.createdAt?.toDate?.() || new Date();
      const formattedDate = date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
      const isOwn = currentUser && rec.authorId === currentUser.uid;

      const card = document.createElement('div');
      card.style.cssText = 'background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; position: relative;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <p style="font-size: 15px; font-weight: 600; color: #1a1a2e;">${rec.authorName || 'Anonymous'}</p>
            <p style="font-size: 13px; color: #9ca3af;">${formattedDate}</p>
          </div>
          ${isOwn ? `
            <button onclick="window.deleteRecommendation && window.deleteRecommendation('${doc.id}')"
                    style="background: none; border: none; cursor: pointer; padding: 4px;">
              <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          ` : ''}
        </div>
        <p style="font-size: 14px; color: #4a4a68; line-height: 1.6;">"${rec.text || rec.content || ''}"</p>
      `;
      container.appendChild(card);
    });

    // Expose delete function
    window.deleteRecommendation = async (recId) => {
      if (!confirm('Weet je zeker dat je deze recommendation wilt verwijderen?')) return;
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../../services/firebase.js');
        await deleteDoc(doc(db, 'recommendations', recId));
        populateMobileRecommendations(artist);
      } catch (err) {
        console.error('Error deleting recommendation:', err);
        alert('Fout bij verwijderen.');
      }
    };

  } catch (error) {
    console.error('[RECOMMENDATIONS] Error loading:', error);
    container.innerHTML = '<p style="color: #9ca3af; font-size: 14px;">Kon recommendations niet laden.</p>';
  }
}

/**
 * Convert video/audio URL to embed URL
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

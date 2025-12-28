/**
 * search-lightbox.js
 * Lightbox functionality for media gallery viewing
 */

let currentGallery = [];
let currentIndex = 0;

/**
 * Open lightbox with media gallery
 */
export function openLightbox(mediaGallery, startIndex = 0) {
  currentGallery = mediaGallery;
  currentIndex = startIndex;

  const modal = document.getElementById('media-lightbox-modal');
  const content = document.getElementById('lightbox-content');

  if (!modal || !content) return;

  // Render current item
  renderLightboxItem();

  // Show/hide navigation arrows
  updateNavigationVisibility();

  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Close lightbox
 */
export function closeLightbox() {
  const modal = document.getElementById('media-lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  currentGallery = [];
  currentIndex = 0;
}

/**
 * Navigate to previous item
 */
function navigatePrev() {
  if (currentIndex > 0) {
    currentIndex--;
    renderLightboxItem();
    updateNavigationVisibility();
  }
}

/**
 * Navigate to next item
 */
function navigateNext() {
  if (currentIndex < currentGallery.length - 1) {
    currentIndex++;
    renderLightboxItem();
    updateNavigationVisibility();
  }
}

/**
 * Render current lightbox item
 */
function renderLightboxItem() {
  const content = document.getElementById('lightbox-content');
  if (!content) return;

  const item = currentGallery[currentIndex];

  if (item.type === 'image') {
    content.innerHTML = `
      <img src="${item.url}" alt="Gallery image" style="max-height: 80vh; width: 100%; object-fit: contain;">
    `;
  } else {
    content.innerHTML = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0;">
        <iframe
          src="https://www.youtube.com/embed/${item.videoId}?autoplay=1"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }
}

/**
 * Update navigation button visibility
 */
function updateNavigationVisibility() {
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (prevBtn) {
    prevBtn.classList.toggle('hidden', currentIndex === 0 || currentGallery.length <= 1);
  }

  if (nextBtn) {
    nextBtn.classList.toggle('hidden', currentIndex === currentGallery.length - 1 || currentGallery.length <= 1);
  }
}

/**
 * Initialize lightbox event listeners (call from main.js or ui.js)
 */
export function initializeLightbox() {
  const modal = document.getElementById('media-lightbox-modal');
  const closeBtn = document.getElementById('close-lightbox');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', navigatePrev);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', navigateNext);
  }

  // Close on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLightbox();
      }
    });
  }

  // Close on ESC key, navigate with arrow keys
  document.addEventListener('keydown', (e) => {
    if (!modal || modal.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    }
    if (e.key === 'ArrowLeft') {
      navigatePrev();
    }
    if (e.key === 'ArrowRight') {
      navigateNext();
    }
  });
}

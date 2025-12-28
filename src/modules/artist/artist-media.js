/**
 * artist-media.js
 * Handle photo gallery and YouTube video management for artists
 */

import { getStore, setStore } from '../../utils/store.js';

/**
 * Initialize media gallery management for artist profile edit
 */
export function initArtistMediaGallery() {
  setupPhotoUpload();
  setupYouTubeVideos();
  loadExistingMedia();
}

/**
 * Setup photo upload functionality
 */
function setupPhotoUpload() {
  const uploadBtn = document.getElementById('add-gallery-photo-btn');
  const uploadInput = document.getElementById('gallery-photo-input');

  if (uploadBtn && uploadInput) {
    uploadBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      for (const file of files) {
        await uploadGalleryPhoto(file);
      }

      // Clear input
      uploadInput.value = '';
    });
  }
}

/**
 * Upload a photo to Firebase Storage
 */
async function uploadGalleryPhoto(file) {
  const currentUser = getStore('currentUser');
  if (!currentUser) {
    alert('Je moet ingelogd zijn om foto\'s te uploaden.');
    return;
  }

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('Alleen afbeeldingen zijn toegestaan.');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Afbeelding mag maximaal 5MB zijn.');
    return;
  }

  try {
    showUploadProgress(true);

    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    const { storage, db } = await import('../../services/firebase.js');

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `gallery_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `artists/${currentUser.uid}/gallery/${filename}`);

    // Upload
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update Firestore
    await updateDoc(doc(db, 'artists', currentUser.uid), {
      galleryPhotos: arrayUnion(downloadURL)
    });

    // Update local store
    const userData = getStore('currentUserData');
    const photos = userData.galleryPhotos || [];
    photos.push(downloadURL);
    setStore('currentUserData', { ...userData, galleryPhotos: photos });

    // Refresh UI
    renderGalleryPhotos();

    console.log('[MEDIA] Photo uploaded:', downloadURL);

  } catch (error) {
    console.error('[MEDIA] Upload error:', error);
    alert('Fout bij uploaden. Probeer opnieuw.');
  } finally {
    showUploadProgress(false);
  }
}

/**
 * Delete a gallery photo
 */
export async function deleteGalleryPhoto(photoUrl) {
  const currentUser = getStore('currentUser');
  if (!currentUser) return;

  if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return;

  try {
    const { doc, updateDoc, arrayRemove } = await import('firebase/firestore');
    const { ref, deleteObject } = await import('firebase/storage');
    const { storage, db } = await import('../../services/firebase.js');

    // Remove from Firestore
    await updateDoc(doc(db, 'artists', currentUser.uid), {
      galleryPhotos: arrayRemove(photoUrl)
    });

    // Try to delete from Storage (may fail if URL format differs)
    try {
      const storageRef = ref(storage, photoUrl);
      await deleteObject(storageRef);
    } catch (storageErr) {
      console.warn('[MEDIA] Could not delete from storage:', storageErr);
    }

    // Update local store
    const userData = getStore('currentUserData');
    const photos = (userData.galleryPhotos || []).filter(p => p !== photoUrl);
    setStore('currentUserData', { ...userData, galleryPhotos: photos });

    // Refresh UI
    renderGalleryPhotos();

    console.log('[MEDIA] Photo deleted');

  } catch (error) {
    console.error('[MEDIA] Delete error:', error);
    alert('Fout bij verwijderen. Probeer opnieuw.');
  }
}

/**
 * Setup YouTube video management
 */
function setupYouTubeVideos() {
  const addBtn = document.getElementById('add-youtube-btn');
  const input = document.getElementById('youtube-url-input');

  if (addBtn && input) {
    addBtn.addEventListener('click', async () => {
      const url = input.value.trim();
      if (!url) {
        alert('Voer een YouTube URL in.');
        return;
      }

      const videoId = extractYouTubeId(url);
      if (!videoId) {
        alert('Ongeldige YouTube URL.');
        return;
      }

      await addYouTubeVideo(url, videoId);
      input.value = '';
    });
  }
}

/**
 * Add YouTube video to profile
 */
async function addYouTubeVideo(url, videoId) {
  const currentUser = getStore('currentUser');
  if (!currentUser) return;

  try {
    const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    const videoData = {
      url: url,
      videoId: videoId,
      addedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'artists', currentUser.uid), {
      youtubeVideos: arrayUnion(videoData)
    });

    // Update local store
    const userData = getStore('currentUserData');
    const videos = userData.youtubeVideos || [];
    videos.push(videoData);
    setStore('currentUserData', { ...userData, youtubeVideos: videos });

    // Refresh UI
    renderYouTubeVideos();

    console.log('[MEDIA] YouTube video added:', videoId);

  } catch (error) {
    console.error('[MEDIA] Add video error:', error);
    alert('Fout bij toevoegen video. Probeer opnieuw.');
  }
}

/**
 * Delete YouTube video
 */
export async function deleteYouTubeVideo(videoId) {
  const currentUser = getStore('currentUser');
  if (!currentUser) return;

  if (!confirm('Weet je zeker dat je deze video wilt verwijderen?')) return;

  try {
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../../services/firebase.js');

    // Get current videos
    const docRef = doc(db, 'artists', currentUser.uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const updatedVideos = (data.youtubeVideos || []).filter(v => v.videoId !== videoId);

    await updateDoc(docRef, {
      youtubeVideos: updatedVideos
    });

    // Update local store
    const userData = getStore('currentUserData');
    setStore('currentUserData', { ...userData, youtubeVideos: updatedVideos });

    // Refresh UI
    renderYouTubeVideos();

    console.log('[MEDIA] YouTube video deleted:', videoId);

  } catch (error) {
    console.error('[MEDIA] Delete video error:', error);
    alert('Fout bij verwijderen video. Probeer opnieuw.');
  }
}

/**
 * Load and render existing media
 */
function loadExistingMedia() {
  renderGalleryPhotos();
  renderYouTubeVideos();
}

/**
 * Render gallery photos in edit form
 */
function renderGalleryPhotos() {
  const container = document.getElementById('gallery-photos-grid');
  if (!container) return;

  const userData = getStore('currentUserData');
  const photos = userData?.galleryPhotos || [];

  if (photos.length === 0) {
    container.innerHTML = `
      <p style="color: #9ca3af; font-size: 14px; grid-column: span 3;">Geen foto's toegevoegd.</p>
    `;
    return;
  }

  container.innerHTML = photos.map(photo => `
    <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
      <img src="${photo}" alt="Gallery photo" style="width: 100%; height: 100%; object-fit: cover;">
      <button onclick="window.deleteGalleryPhoto && window.deleteGalleryPhoto('${photo}')"
              style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: rgba(239,68,68,0.9); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');

  // Expose delete function globally for onclick
  window.deleteGalleryPhoto = deleteGalleryPhoto;
}

/**
 * Render YouTube videos in edit form
 */
function renderYouTubeVideos() {
  const container = document.getElementById('youtube-videos-grid');
  if (!container) return;

  const userData = getStore('currentUserData');
  const videos = userData?.youtubeVideos || [];

  if (videos.length === 0) {
    container.innerHTML = `
      <p style="color: #9ca3af; font-size: 14px;">Geen video's toegevoegd.</p>
    `;
    return;
  }

  container.innerHTML = videos.map(video => {
    const videoId = video.videoId || extractYouTubeId(video.url || video);
    return `
      <div style="position: relative; border-radius: 12px; overflow: hidden; background: #f3f4f6;">
        <div style="aspect-ratio: 16/9;">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            style="width: 100%; height: 100%; border: none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
        <button onclick="window.deleteYouTubeVideo && window.deleteYouTubeVideo('${videoId}')"
                style="position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; background: rgba(239,68,68,0.9); border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `;
  }).join('');

  // Expose delete function globally
  window.deleteYouTubeVideo = deleteYouTubeVideo;
}

function showUploadProgress(show) {
  const indicator = document.getElementById('upload-progress');
  if (indicator) {
    indicator.style.display = show ? 'flex' : 'none';
  }
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export { renderGalleryPhotos, renderYouTubeVideos };

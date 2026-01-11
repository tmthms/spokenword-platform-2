/**
 * media-gallery.js
 * Service layer for media gallery management
 */

import { db } from '../../services/firebase.js';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Upload image to gallery
 */
export async function uploadGalleryImage(uid, file, currentGallery) {
  try {
    const storage = getStorage();

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `artists/${uid}/gallery/${filename}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create new gallery item
    const newItem = {
      type: 'image',
      url: downloadURL,
      storagePath: storagePath,
      uploadedAt: new Date(),
      order: currentGallery.length
    };

    // Add to gallery array
    const updatedGallery = [...currentGallery, newItem];

    // Update Firestore
    const docRef = doc(db, 'artists', uid);
    await updateDoc(docRef, { mediaGallery: updatedGallery });

    console.log('Gallery image uploaded:', downloadURL);
    return updatedGallery;

  } catch (error) {
    console.error('Error uploading gallery image:', error);
    throw new Error('Failed to upload image: ' + error.message);
  }
}

/**
 * Add YouTube video to gallery
 */
export async function addYouTubeVideo(uid, youtubeUrl, currentGallery) {
  try {
    const videoId = extractYouTubeId(youtubeUrl);

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Create new gallery item
    const newItem = {
      type: 'video',
      url: youtubeUrl,
      videoId: videoId,
      uploadedAt: new Date(),
      order: currentGallery.length
    };

    // Add to gallery array
    const updatedGallery = [...currentGallery, newItem];

    // Update Firestore
    const docRef = doc(db, 'artists', uid);
    await updateDoc(docRef, { mediaGallery: updatedGallery });

    console.log('YouTube video added:', videoId);
    return updatedGallery;

  } catch (error) {
    console.error('Error adding YouTube video:', error);
    throw new Error('Failed to add video: ' + error.message);
  }
}

/**
 * Remove item from gallery
 */
export async function removeGalleryItem(uid, index, currentGallery) {
  try {
    const item = currentGallery[index];

    if (!item) {
      throw new Error('Item not found');
    }

    // If it's an image, delete from storage
    if (item.type === 'image' && item.storagePath) {
      try {
        const storage = getStorage();
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef);
        console.log('Storage file deleted:', item.storagePath);
      } catch (storageError) {
        // Log but don't fail - file might already be deleted
        console.warn('Storage deletion failed (file may not exist):', storageError);
      }
    }

    // Remove from gallery array
    const updatedGallery = currentGallery.filter((_, i) => i !== index);

    // Update Firestore
    const docRef = doc(db, 'artists', uid);
    await updateDoc(docRef, { mediaGallery: updatedGallery });

    console.log('Gallery item removed at index:', index);
    return updatedGallery;

  } catch (error) {
    console.error('Error removing gallery item:', error);
    throw new Error('Failed to remove item: ' + error.message);
  }
}

/**
 * Extract YouTube video ID from URL
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(url) {
  if (!url) return null;

  // Try standard watch URL
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }

  // Try embed URL
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&\s]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db, auth } from '../lib/firebase';

export interface VoiceNoteUploadResult {
  url: string;
  storageType: 'cloud_storage' | 'firestore_database';
  storagePath?: string;
  durationSec: number;
  sizeBytes: number;
}

export interface StoredVoiceNote {
  id: string;
  audioUrl: string;
  durationSec: number;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  senderUserId?: string;
  category: string;
  title?: string;
  storageType: 'cloud_storage' | 'firestore_database';
  createdAt: string;
  isListenedByPastor?: boolean;
}

/**
 * Validates audio file size and format
 */
export function validateAudioBlob(blob: Blob): { valid: boolean; error?: string } {
  if (!blob || blob.size === 0) {
    return { valid: false, error: 'No audio was recorded.' };
  }

  // Max 15MB limit for audio recordings
  const maxBytes = 15 * 1024 * 1024;
  if (blob.size > maxBytes) {
    return { valid: false, error: 'Voice note exceeds maximum allowable size (15MB).' };
  }

  return { valid: true };
}

/**
 * Converts audio blob to a persistent Base64 Data URL (for Firestore storage fallback)
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to encode audio file.'));
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/**
 * Permanently uploads a voice note for cross-device playback.
 * 1. Attempts Firebase Storage upload.
 * 2. If bucket is unavailable or returns an error, encodes audio directly into Firestore DataURL.
 * This guarantees audio persistence and cross-device playback across Android, iOS, and PC.
 */
export async function uploadVoiceNotePermanently(
  audioBlob: Blob,
  durationSec: number,
  category: string = 'prayer_voice_note',
  onProgress?: (percent: number) => void
): Promise<VoiceNoteUploadResult> {
  const validation = validateAudioBlob(audioBlob);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (onProgress) onProgress(15);

  const timestamp = Date.now();
  const userId = auth.currentUser?.uid || 'anonymous';
  const extension = audioBlob.type.includes('mp4') ? 'm4a' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
  const storagePath = `voice_notes/${timestamp}_${userId}.${extension}`;

  // Attempt Firebase Cloud Storage upload
  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, audioBlob, {
      contentType: audioBlob.type || 'audio/webm',
      customMetadata: {
        category,
        durationSec: durationSec.toString(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser?.email || 'member',
      },
    });

    const downloadUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snap) => {
          if (onProgress && snap.totalBytes > 0) {
            const pct = 15 + Math.round((snap.bytesTransferred / snap.totalBytes) * 80);
            onProgress(pct);
          }
        },
        (err) => reject(err),
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });

    if (onProgress) onProgress(100);

    return {
      url: downloadUrl,
      storageType: 'cloud_storage',
      storagePath,
      durationSec,
      sizeBytes: audioBlob.size,
    };
  } catch (storageErr: any) {
    console.info(
      'Cloud Storage bucket upload fell back to server-side permanent storage:',
      storageErr?.message || storageErr
    );

    if (onProgress) onProgress(40);

    // Try server-side persistent file storage
    try {
      const dataUrl = await blobToDataUrl(audioBlob);
      const res = await fetch('/api/voice-notes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: dataUrl,
          durationSec,
          mimeType: audioBlob.type,
          category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          if (onProgress) onProgress(100);
          return {
            url: data.url,
            storageType: 'cloud_storage',
            storagePath: data.filename,
            durationSec,
            sizeBytes: audioBlob.size,
          };
        }
      }
    } catch (serverErr) {
      console.warn('Server storage fallback notice:', serverErr);
    }

    if (onProgress) onProgress(70);
    const dataUrl = await blobToDataUrl(audioBlob);
    if (onProgress) onProgress(100);

    return {
      url: dataUrl,
      storageType: 'firestore_database',
      durationSec,
      sizeBytes: audioBlob.size,
    };
  }
}

/**
 * Saves a private voice note document in Firestore under /voiceNotes
 */
export async function savePrivateVoiceNote(note: {
  audioUrl: string;
  storagePath?: string;
  storageType: 'cloud_storage' | 'firestore_database';
  durationSec: number;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  category: string;
  title?: string;
}): Promise<string> {
  const currentUid = auth.currentUser?.uid || null;

  const docRef = await addDoc(collection(db, 'voiceNotes'), {
    audioUrl: note.audioUrl,
    storagePath: note.storagePath || null,
    storageType: note.storageType,
    durationSec: note.durationSec,
    senderName: note.senderName || 'Church Member',
    senderEmail: note.senderEmail || '',
    senderPhone: note.senderPhone || '',
    userId: currentUid,
    category: note.category || 'Personal Prayer Voice Note',
    title: note.title || 'Private Voice Note to Pastoral Team',
    createdAt: serverTimestamp(),
    isListenedByPastor: false,
  });

  return docRef.id;
}

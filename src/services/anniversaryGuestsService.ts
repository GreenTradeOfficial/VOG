import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  deleteObject,
} from 'firebase/storage';
import {
  db,
  storage,
  handleFirestoreError,
  OperationType,
  auth,
} from '../lib/firebase';
import { AnniversaryGuest } from '../types';
import { uploadPhotoPermanently } from './photoStorageService';

const COLLECTION_NAME = 'anniversaryGuests';

export interface StorageUploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Permanently uploads an image file with live progress callback.
 * Uses Firebase Cloud Storage when available, or saves the high-resolution
 * optimized image directly to the Cloud Database so it persists across all devices.
 */
export async function uploadGuestPhotoToStorage(
  file: File | Blob,
  guestName: string,
  onProgress?: (percent: number) => void
): Promise<StorageUploadResult> {
  if (!auth.currentUser) {
    throw new Error('Authentication required: Please sign in as an authorized administrator to upload photographs.');
  }

  const result = await uploadPhotoPermanently(
    file as File,
    'anniversary-guests',
    guestName,
    onProgress
  );

  return {
    downloadUrl: result.url,
    storagePath: result.storagePath || '',
  };
}

/**
 * Deletes an existing photograph from Firebase Cloud Storage if present
 */
export async function deleteGuestPhotoFromStorage(storagePath: string): Promise<void> {
  if (!storagePath || !auth.currentUser) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Could not delete prior storage object:', storagePath, error);
  }
}

/**
 * Normalizes Firestore document data into client AnniversaryGuest structure
 */
function mapDocToGuest(docId: string, data: any): AnniversaryGuest {
  const fullName = data.fullName || data.name || 'Unnamed Guest';
  let createdAtStr = '';
  let updatedAtStr = '';

  if (data.createdAt instanceof Timestamp) {
    createdAtStr = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    createdAtStr = data.createdAt;
  }

  if (data.updatedAt instanceof Timestamp) {
    updatedAtStr = data.updatedAt.toDate().toISOString();
  } else if (typeof data.updatedAt === 'string') {
    updatedAtStr = data.updatedAt;
  }

  return {
    id: docId,
    fullName,
    name: fullName,
    role: data.role || 'Guest Speaker',
    customTitle: data.customTitle || '',
    ministry: data.ministry || '',
    biography: data.biography || '',
    photoUrl: data.photoUrl || '',
    photoStoragePath: data.photoStoragePath || '',
    displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 1,
    eventOrVisitDate: data.eventOrVisitDate || data.visitDate || '',
    isPublished: data.isPublished !== false,
    createdAt: createdAtStr,
    updatedAt: updatedAtStr,
  };
}

/**
 * Subscribes to real-time updates of anniversary guests and guest ministers
 */
export function subscribeToAnniversaryGuests(
  onUpdate: (guests: AnniversaryGuest[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), orderBy('displayOrder', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const guests: AnniversaryGuest[] = [];
      snapshot.forEach((docSnap) => {
        guests.push(mapDocToGuest(docSnap.id, docSnap.data()));
      });
      onUpdate(guests);
    },
    (error) => {
      console.warn('Realtime guests listener notice:', error.message);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetches all anniversary guests once
 */
export async function fetchAnniversaryGuestsOnce(): Promise<AnniversaryGuest[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const guests: AnniversaryGuest[] = [];
    snap.forEach((docSnap) => {
      guests.push(mapDocToGuest(docSnap.id, docSnap.data()));
    });
    guests.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return guests;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

/**
 * Creates a new anniversary guest document in Cloud Firestore
 */
export async function addAnniversaryGuestToFirestore(
  guest: Omit<AnniversaryGuest, 'id'>
): Promise<string> {
  const path = COLLECTION_NAME;
  try {
    const payload: any = {
      fullName: (guest.fullName || guest.name || '').trim(),
      role: guest.role,
      displayOrder: Number(guest.displayOrder) || 1,
      isPublished: guest.isPublished !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (guest.customTitle && guest.customTitle.trim()) {
      payload.customTitle = guest.customTitle.trim();
    }
    if (guest.ministry && guest.ministry.trim()) {
      payload.ministry = guest.ministry.trim();
    }
    if (guest.biography && guest.biography.trim()) {
      payload.biography = guest.biography.trim();
    }
    if (guest.photoUrl && guest.photoUrl.trim()) {
      payload.photoUrl = guest.photoUrl.trim();
    }
    if (guest.photoStoragePath && guest.photoStoragePath.trim()) {
      payload.photoStoragePath = guest.photoStoragePath.trim();
    }
    if (guest.eventOrVisitDate && guest.eventOrVisitDate.trim()) {
      payload.eventOrVisitDate = guest.eventOrVisitDate.trim();
    }

    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Updates an existing guest document in Cloud Firestore using merge setDoc
 * to ensure newly edited guests persist reliably even if document was not pre-seeded.
 */
export async function updateAnniversaryGuestInFirestore(
  id: string,
  updates: Partial<AnniversaryGuest>
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const payload: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.fullName !== undefined || updates.name !== undefined) {
      payload.fullName = (updates.fullName || updates.name || '').trim();
    }
    if (updates.role !== undefined) {
      payload.role = updates.role;
    }
    if (updates.customTitle !== undefined) {
      payload.customTitle = updates.customTitle.trim();
    }
    if (updates.displayOrder !== undefined) {
      payload.displayOrder = Number(updates.displayOrder) || 1;
    }
    if (updates.isPublished !== undefined) {
      payload.isPublished = updates.isPublished;
    }
    if (updates.ministry !== undefined) {
      payload.ministry = updates.ministry.trim();
    }
    if (updates.biography !== undefined) {
      payload.biography = updates.biography.trim();
    }
    if (updates.photoUrl !== undefined) {
      payload.photoUrl = updates.photoUrl.trim();
    }
    if (updates.photoStoragePath !== undefined) {
      payload.photoStoragePath = updates.photoStoragePath.trim();
    }
    if (updates.eventOrVisitDate !== undefined) {
      payload.eventOrVisitDate = updates.eventOrVisitDate.trim();
    }

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Deletes a guest profile from Firestore and deletes its photo from Cloud Storage
 */
export async function deleteAnniversaryGuestFromFirestore(
  id: string,
  photoStoragePath?: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));

    if (photoStoragePath) {
      await deleteGuestPhotoFromStorage(photoStoragePath);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Reorders multiple guest documents using a Firestore atomic batch
 */
export async function batchReorderAnniversaryGuests(
  guests: AnniversaryGuest[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    guests.forEach((guest, index) => {
      const docRef = doc(db, COLLECTION_NAME, guest.id);
      batch.set(
        docRef,
        {
          displayOrder: index + 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

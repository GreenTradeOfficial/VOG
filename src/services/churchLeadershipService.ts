import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ChurchLeader } from '../types';

const COLLECTION_NAME = 'churchLeadership';

export const initialLeadership: ChurchLeader[] = [
  {
    id: 'lead-pastor',
    fullName: 'Pastor West Somina',
    role: 'Global Union Pastor',
    title: 'Lead Pastor & Founder',
    biography:
      'Spiritual father, apostle of faith, and Lead Pastor of Vessel of Grace Christian Center. Dedicated to raising champions, establishing divine order, and releasing the transformative power of God’s grace across the nations.',
    photoUrl: '',
    photoStoragePath: '',
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: 'co-lead-pastor',
    fullName: 'Pastor (Mrs.) Somina',
    role: 'Co-Lead Pastor',
    title: 'Co-Lead Pastor & Spiritual Mother',
    biography:
      'Spiritual mother, prophetic intercessor, and pillar of virtue partnering with the Global Union Pastor in apostolic vision, ministry, and benevolent community transformation.',
    photoUrl: '',
    photoStoragePath: '',
    displayOrder: 2,
    isPublished: true,
  },
];

/**
 * Subscribes to real-time church leadership profiles in Firestore
 */
export function subscribeToChurchLeadership(
  onUpdate: (leaders: ChurchLeader[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = collection(db, COLLECTION_NAME);
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const leaders: ChurchLeader[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            leaders.push({
              id: d.id,
              fullName: data.fullName || '',
              role: data.role || 'Pastor',
              title: data.title || '',
              biography: data.biography || '',
              photoUrl: data.photoUrl || '',
              photoStoragePath: data.photoStoragePath || '',
              displayOrder: Number(data.displayOrder) || 1,
              isPublished: data.isPublished !== false,
              updatedAt: data.updatedAt ? String(data.updatedAt) : undefined,
            });
          });
          leaders.sort((a, b) => a.displayOrder - b.displayOrder);
          onUpdate(leaders);
        } else {
          onUpdate(initialLeadership);
        }
      },
      (err) => {
        console.warn('Church leadership sync fallback:', err.message);
        onUpdate(initialLeadership);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    onUpdate(initialLeadership);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

/**
 * Saves or updates a pastor / church leader profile in Cloud Firestore
 */
export async function saveChurchLeaderToFirestore(
  leader: ChurchLeader
): Promise<void> {
  const path = `${COLLECTION_NAME}/${leader.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, leader.id);
    await setDoc(
      docRef,
      {
        fullName: leader.fullName.trim(),
        role: leader.role,
        title: leader.title.trim(),
        biography: leader.biography.trim(),
        photoUrl: (leader.photoUrl || '').trim(),
        photoStoragePath: (leader.photoStoragePath || '').trim(),
        displayOrder: Number(leader.displayOrder) || 1,
        isPublished: leader.isPublished !== false,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a leader profile from Firestore
 */
export async function deleteChurchLeaderFromFirestore(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

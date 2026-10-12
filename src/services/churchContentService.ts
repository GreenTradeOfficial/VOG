import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Sermon,
  ChurchEvent,
  Announcement,
  DailyLift,
  DailyDevotion,
  PrayerRequest,
  ChurchServiceSchedule,
} from '../types';
import {
  initialSermons,
  initialEvents,
  initialAnnouncements,
  initialDailyLifts,
  initialDailyDevotions,
} from '../data/mockData';

// -------------------------------------------------------------
// Real-time Listeners with local fallback & initial sync
// -------------------------------------------------------------

export function subscribeToSermons(
  onUpdate: (sermons: Sermon[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = collection(db, 'sermons');
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Sermon[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Sermon);
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          onUpdate(list);
        } else {
          onUpdate(initialSermons);
        }
      },
      (err) => {
        console.warn('Sermons sync error (using church baseline):', err.message);
        onUpdate(initialSermons);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    onUpdate(initialSermons);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

export function subscribeToEvents(
  onUpdate: (events: ChurchEvent[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = collection(db, 'events');
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ChurchEvent[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as ChurchEvent);
          });
          list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          onUpdate(list);
        } else {
          onUpdate(initialEvents);
        }
      },
      (err) => {
        console.warn('Events sync error (using church baseline):', err.message);
        onUpdate(initialEvents);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    onUpdate(initialEvents);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

export function subscribeToAnnouncements(
  onUpdate: (announcements: Announcement[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = collection(db, 'announcements');
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Announcement[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Announcement);
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          onUpdate(list);
        } else {
          onUpdate(initialAnnouncements);
        }
      },
      (err) => {
        console.warn('Announcements sync error (using church baseline):', err.message);
        onUpdate(initialAnnouncements);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    onUpdate(initialAnnouncements);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

export function subscribeToDailyLifts(
  onUpdate: (lifts: DailyLift[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = collection(db, 'dailyLifts');
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DailyLift[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as DailyLift);
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          onUpdate(list);
        } else {
          onUpdate(initialDailyLifts);
        }
      },
      (err) => {
        console.warn('Daily Lifts sync error (using church baseline):', err.message);
        onUpdate(initialDailyLifts);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    onUpdate(initialDailyLifts);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

export function subscribeToDailyDevotions(
  onUpdate: (devotions: DailyDevotion[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = collection(db, 'dailyDevotions');
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DailyDevotion[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as DailyDevotion);
          });
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          onUpdate(list);
        } else {
          onUpdate(initialDailyDevotions);
        }
      },
      (err) => {
        console.warn('Devotions sync error (using church baseline):', err.message);
        onUpdate(initialDailyDevotions);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    onUpdate(initialDailyDevotions);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

export function subscribeToPrayerRequests(
  isAdmin: boolean,
  currentUserId?: string,
  onUpdate?: (requests: PrayerRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    // Only administrators or authenticated users can listen to requests in Firestore
    if (!isAdmin && !currentUserId) {
      return () => {};
    }

    const q = collection(db, 'prayerRequests');
    return onSnapshot(
      q,
      (snapshot) => {
        const list: PrayerRequest[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as PrayerRequest);
        });
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (onUpdate) onUpdate(list);
      },
      (err) => {
        console.warn('Prayer requests listener note:', err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}

// -------------------------------------------------------------
// Seeding Helpers (ensures fresh database has church records)
// -------------------------------------------------------------

async function seedSermonsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'sermons'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const sermon of initialSermons) {
        const ref = doc(db, 'sermons', sermon.id);
        batch.set(ref, { ...sermon, createdAt: new Date().toISOString() });
      }
      await batch.commit();
    }
  } catch {}
}

async function seedEventsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'events'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const event of initialEvents) {
        const ref = doc(db, 'events', event.id);
        batch.set(ref, { ...event, createdAt: new Date().toISOString() });
      }
      await batch.commit();
    }
  } catch {}
}

async function seedAnnouncementsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const ann of initialAnnouncements) {
        const ref = doc(db, 'announcements', ann.id);
        batch.set(ref, { ...ann, createdAt: new Date().toISOString() });
      }
      await batch.commit();
    }
  } catch {}
}

async function seedDailyLiftsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'dailyLifts'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const lift of initialDailyLifts) {
        const ref = doc(db, 'dailyLifts', lift.id);
        batch.set(ref, { ...lift, createdAt: new Date().toISOString() });
      }
      await batch.commit();
    }
  } catch {}
}

async function seedDailyDevotionsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'dailyDevotions'));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const dev of initialDailyDevotions) {
        const ref = doc(db, 'dailyDevotions', dev.id);
        batch.set(ref, { ...dev, createdAt: new Date().toISOString() });
      }
      await batch.commit();
    }
  } catch {}
}

// -------------------------------------------------------------
// Database Mutations (Admin & Member writes)
// -------------------------------------------------------------

export async function saveSermonToCloud(sermon: Sermon): Promise<void> {
  const ref = doc(db, 'sermons', sermon.id);
  await setDoc(ref, { ...sermon, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteSermonFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'sermons', id));
}

export async function saveEventToCloud(event: ChurchEvent): Promise<void> {
  const ref = doc(db, 'events', event.id);
  await setDoc(ref, { ...event, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteEventFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}

export async function saveAnnouncementToCloud(ann: Announcement): Promise<void> {
  const ref = doc(db, 'announcements', ann.id);
  await setDoc(ref, { ...ann, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteAnnouncementFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'announcements', id));
}

export async function saveDailyLiftToCloud(lift: DailyLift): Promise<void> {
  const ref = doc(db, 'dailyLifts', lift.id);
  await setDoc(ref, { ...lift, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteDailyLiftFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'dailyLifts', id));
}

export async function saveDailyDevotionToCloud(dev: DailyDevotion): Promise<void> {
  const ref = doc(db, 'dailyDevotions', dev.id);
  await setDoc(ref, { ...dev, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteDailyDevotionFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'dailyDevotions', id));
}

export async function savePrayerRequestToCloud(req: PrayerRequest): Promise<void> {
  const ref = doc(db, 'prayerRequests', req.id);
  await setDoc(ref, {
    ...req,
    createdAt: new Date().toISOString(),
  });
}

export async function updatePrayerRequestStatusInCloud(
  id: string,
  status: PrayerRequest['status']
): Promise<void> {
  await updateDoc(doc(db, 'prayerRequests', id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deletePrayerRequestFromCloud(id: string): Promise<void> {
  await deleteDoc(doc(db, 'prayerRequests', id));
}

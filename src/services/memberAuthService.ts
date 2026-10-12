import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase';
import {
  UserProfile,
  MemberActivityItem,
  MemberActivityType,
  MemberRole,
} from '../types';

export interface FavoriteCloudItem {
  id: string;
  type: 'lift' | 'devotion' | 'sermon';
  title: string;
  date: string;
  createdAt?: string;
}

// Authorized church administrative emails
export const ADMIN_EMAILS = ['mehedebaedmond@gmail.com'];

/**
 * Synchronously checks if a user's email matches the known administrative roster
 */
export function isUserAuthorizedAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
}

/**
 * Asynchronously verifies if user is an administrator via email check OR
 * verified /admins/{uid} Firestore record (server-side authorization).
 */
export async function checkIfUserIsAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user) return false;

  // 1. Direct verified administrative email check
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
    return true;
  }

  // 2. Query Firestore /admins/{uid} registry
  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      return true;
    }
  } catch (err) {
    console.warn('Admin Firestore check note:', err);
  }

  return false;
}

/**
 * Admin portal login with email and password, enforcing strict server-side role check
 */
export async function loginAdminWithCredentials(
  email: string,
  password: string
): Promise<{ user: User; isAdmin: boolean }> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;
  const authorized = await checkIfUserIsAdmin(user);

  if (!authorized) {
    // If ordinary member tried to use Admin login, revoke session or raise explicit permission error
    throw new Error(
      `Access Denied: Account (${user.email || 'Member'}) does not possess administrative privileges. Church content editing is restricted to authorized pastoral personnel.`
    );
  }

  return { user, isAdmin: true };
}

/**
 * Admin portal login with Google, enforcing strict server-side role check
 */
export async function loginAdminWithGoogle(): Promise<{ user: User; isAdmin: boolean }> {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  const user = cred.user;
  const authorized = await checkIfUserIsAdmin(user);

  if (!authorized) {
    throw new Error(
      `Access Denied: Google Account (${user.email}) is registered as a regular congregation member. Administrative access is restricted to verified church administrators.`
    );
  }

  return { user, isAdmin: true };
}

/**
 * Register a new member using Email and Password
 */
export async function registerMemberWithEmail(
  email: string,
  password: string,
  displayName: string,
  phoneNumber?: string
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;

  const trimmedName = displayName.trim() || 'Church Member';
  try {
    await updateProfile(user, { displayName: trimmedName });
  } catch (err) {
    console.warn('Update profile note:', err);
  }

  const role: MemberRole = isUserAuthorizedAdmin(user) ? 'admin' : 'member';
  const nowIso = new Date().toISOString();

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || email.trim(),
    displayName: trimmedName,
    role,
    phoneNumber: phoneNumber?.trim() || '',
    photoURL: user.photoURL || '',
    memberSince: nowIso,
    lastLoginAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  try {
    await setDoc(doc(db, 'users', user.uid), profile);
  } catch (err) {
    console.warn('Profile doc create note:', err);
  }

  // Log initial account registration activity
  logMemberActivity(
    user.uid,
    'login',
    'Account Created & Signed In',
    'Welcome to the Vessel of Grace digital fellowship!'
  ).catch(() => {});

  return profile;
}

/**
 * Sign in existing member using Email and Password
 */
export async function loginMemberWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = cred.user;
  const nowIso = new Date().toISOString();

  let profile = await fetchMemberProfile(user.uid);
  if (!profile) {
    const role: MemberRole = isUserAuthorizedAdmin(user) ? 'admin' : 'member';
    profile = {
      uid: user.uid,
      email: user.email || email.trim(),
      displayName: user.displayName || 'Church Member',
      role,
      phoneNumber: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      memberSince: nowIso,
      lastLoginAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch {}
  } else {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: nowIso,
        updatedAt: nowIso,
      });
      profile.lastLoginAt = nowIso;
    } catch {}
  }

  // Log sign-in activity
  logMemberActivity(
    user.uid,
    'login',
    'Member Signed In',
    'Logged in to Vessel of Grace digital app'
  ).catch(() => {});

  return profile;
}

/**
 * Sign in or sign up member using Google Auth Provider
 */
export async function loginMemberWithGoogle(): Promise<UserProfile> {
  const cred = await signInWithPopup(auth, googleAuthProvider);
  const user = cred.user;
  const nowIso = new Date().toISOString();

  let profile = await fetchMemberProfile(user.uid);
  const role: MemberRole = isUserAuthorizedAdmin(user) ? 'admin' : 'member';

  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Church Member',
      role,
      phoneNumber: user.phoneNumber || '',
      photoURL: user.photoURL || '',
      memberSince: nowIso,
      lastLoginAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch {}
  } else {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: nowIso,
        photoURL: user.photoURL || profile.photoURL || '',
        updatedAt: nowIso,
      });
      profile.lastLoginAt = nowIso;
      if (user.photoURL) profile.photoURL = user.photoURL;
    } catch {}
  }

  // Log sign-in activity
  logMemberActivity(
    user.uid,
    'login',
    'Signed In with Google',
    'Authenticated via Google Account'
  ).catch(() => {});

  return profile;
}

/**
 * Send Password Reset Email
 */
export async function sendMemberPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Logout member
 */
export async function logoutMember(): Promise<void> {
  await signOut(auth);
}

/**
 * Fetch member profile from Firestore
 */
export async function fetchMemberProfile(userId: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Fetch profile error:', err);
  }
  return null;
}

/**
 * Update member profile in Firestore
 */
export async function updateMemberProfileData(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  const nowIso = new Date().toISOString();
  await updateDoc(userDocRef, {
    ...data,
    updatedAt: nowIso,
  });
}

// ----------------------------------------------------------------------
// FAVORITES CLOUD SYNC SERVICES (/users/{userId}/favorites/{itemId})
// ----------------------------------------------------------------------

/**
 * Real-time listener for member favorites in Firestore
 */
export function subscribeToMemberFavorites(
  userId: string,
  onUpdate: (favorites: FavoriteCloudItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const unsub = onSnapshot(
      favoritesRef,
      (snapshot) => {
        const items: FavoriteCloudItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            type: data.type || 'lift',
            title: data.title || '',
            date: data.date || '',
            createdAt: data.createdAt,
          });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Real-time favorites sync note:', error);
        if (onError) onError(error);
      }
    );
    return unsub;
  } catch (err: any) {
    console.warn('Failed to subscribe to member favorites:', err);
    return () => {};
  }
}

/**
 * Save favorite item to member's Firestore cloud storage
 */
export async function saveMemberFavoriteToCloud(
  userId: string,
  item: FavoriteCloudItem
): Promise<void> {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', item.id);
    await setDoc(favRef, {
      userId,
      itemId: item.id,
      type: item.type,
      title: item.title,
      date: item.date,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Save favorite cloud error:', err);
    throw err;
  }
}

/**
 * Remove favorite item from member's Firestore cloud storage
 */
export async function removeMemberFavoriteFromCloud(
  userId: string,
  itemId: string
): Promise<void> {
  try {
    const favRef = doc(db, 'users', userId, 'favorites', itemId);
    await deleteDoc(favRef);
  } catch (err) {
    console.warn('Remove favorite cloud error:', err);
    throw err;
  }
}

/**
 * Batch upload local guest favorites when member signs in
 */
export async function batchSyncLocalFavoritesToCloud(
  userId: string,
  localFavorites: FavoriteCloudItem[]
): Promise<void> {
  if (!localFavorites || localFavorites.length === 0) return;
  for (const item of localFavorites) {
    try {
      await saveMemberFavoriteToCloud(userId, item);
    } catch {}
  }
}

// ----------------------------------------------------------------------
// MEMBER ACTIVITY TRACKING LOG (/users/{userId}/activity/{activityId})
// ----------------------------------------------------------------------

/**
 * Record a member activity item into Firestore and local cache
 */
export async function logMemberActivity(
  userId: string,
  type: MemberActivityType,
  title: string,
  description?: string,
  referenceId?: string
): Promise<void> {
  const now = new Date();
  const nowIso = now.toISOString();
  const timestampMs = now.getTime();
  const activityDocId = `act-${timestampMs}-${Math.random().toString(36).substring(2, 6)}`;

  const activityItem: MemberActivityItem = {
    id: activityDocId,
    userId,
    type,
    title,
    description,
    referenceId,
    createdAt: nowIso,
    timestampMs,
  };

  // 1. Save to local storage for fast instant timeline preview
  try {
    const cacheKey = `vog_activity_${userId}`;
    const cached = localStorage.getItem(cacheKey);
    const list: MemberActivityItem[] = cached ? JSON.parse(cached) : [];
    const updated = [activityItem, ...list].slice(0, 50);
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  } catch {}

  // 2. Persist to Firestore
  try {
    const actRef = doc(db, 'users', userId, 'activity', activityDocId);
    await setDoc(actRef, {
      ...activityItem,
      createdAtServer: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Log activity Firestore note:', err);
  }
}

/**
 * Subscribe to real-time activity stream for a member
 */
export function subscribeToMemberActivity(
  userId: string,
  onUpdate: (activities: MemberActivityItem[]) => void
): () => void {
  try {
    const actRef = collection(db, 'users', userId, 'activity');
    const q = query(actRef, orderBy('createdAt', 'desc'), limit(40));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: MemberActivityItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            userId,
            type: data.type || 'login',
            title: data.title || '',
            description: data.description || '',
            referenceId: data.referenceId,
            createdAt: data.createdAt || new Date().toISOString(),
            timestampMs: data.timestampMs || 0,
          });
        });

        // Also update local storage cache
        try {
          localStorage.setItem(`vog_activity_${userId}`, JSON.stringify(items));
        } catch {}

        onUpdate(items);
      },
      (error) => {
        console.warn('Activity feed subscription note, using cached:', error);
        try {
          const cached = localStorage.getItem(`vog_activity_${userId}`);
          if (cached) onUpdate(JSON.parse(cached));
        } catch {}
      }
    );

    return unsub;
  } catch (err) {
    console.warn('Failed to subscribe to member activity:', err);
    try {
      const cached = localStorage.getItem(`vog_activity_${userId}`);
      if (cached) onUpdate(JSON.parse(cached));
    } catch {}
    return () => {};
  }
}

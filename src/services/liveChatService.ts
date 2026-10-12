import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { LiveChatMessage, LiveChatMessageType } from '../types';

const CHAT_COLLECTION = 'liveChatMessages';
const LOCAL_MEMBER_KEY = 'vog_live_member_name';

/**
 * Retrieve saved worshipper name or default
 */
export function getSavedWorshipperName(): string {
  try {
    const saved = localStorage.getItem(LOCAL_MEMBER_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // localStorage may be unavailable in private modes
  }
  return '';
}

/**
 * Persist worshipper name for quick subsequent messages
 */
export function saveWorshipperName(name: string): void {
  try {
    if (name && name.trim()) {
      localStorage.setItem(LOCAL_MEMBER_KEY, name.trim());
    }
  } catch {
    // ignore
  }
}

/**
 * Real-time listener for live chat messages
 * Orders messages chronologically by timestamp
 */
export function subscribeToLiveChat(
  onMessages: (messages: LiveChatMessage[]) => void,
  onError?: (error: Error) => void,
  messageLimit: number = 60
): () => void {
  try {
    // Query last N messages ordered by clientTimestamp ascending
    const chatRef = collection(db, CHAT_COLLECTION);
    const chatQuery = query(
      chatRef,
      orderBy('clientTimestamp', 'asc'),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(
      chatQuery,
      (snapshot) => {
        const messages: LiveChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userName: data.userName || 'Congregation Member',
            message: data.message || '',
            type: (data.type as LiveChatMessageType) || (data.isAmen ? 'amen' : 'chat'),
            isAmen: Boolean(data.isAmen),
            createdAt: data.createdAt,
            clientTimestamp: typeof data.clientTimestamp === 'number' ? data.clientTimestamp : Date.now(),
            userId: data.userId,
            isPastorOrAdmin: Boolean(data.isPastorOrAdmin),
          };
        });

        onMessages(messages);
      },
      (err) => {
        console.warn('Firestore live chat listener notice:', err);
        onError?.(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to initialize live chat listener:', err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return () => {};
  }
}

/**
 * Send a message or prayer point into the real-time sanctuary chat
 */
export async function sendLiveChatMessage(params: {
  userName: string;
  message: string;
  type?: LiveChatMessageType;
  isAmen?: boolean;
}): Promise<string> {
  const trimmedName = params.userName.trim() || 'Worshipper';
  const trimmedMessage = params.message.trim();

  if (!trimmedMessage) {
    throw new Error('Message cannot be empty.');
  }

  saveWorshipperName(trimmedName);

  const currentUser = auth.currentUser;
  const isPastorOrAdmin = Boolean(
    currentUser && (currentUser.email === 'mehedebaedmond@gmail.com')
  );

  const payload = {
    userName: trimmedName,
    message: trimmedMessage.slice(0, 1000), // Enforce max length
    type: params.type || (params.isAmen ? 'amen' : 'chat'),
    isAmen: Boolean(params.isAmen),
    clientTimestamp: Date.now(),
    createdAt: serverTimestamp(),
    userId: currentUser?.uid || null,
    isPastorOrAdmin,
  };

  const docRef = await addDoc(collection(db, CHAT_COLLECTION), payload);
  return docRef.id;
}

/**
 * Quick send an "Amen" or praise reaction
 */
export async function sendQuickAmen(
  userName: string,
  reactionText: string = 'AMEN & HALLELUJAH! 🙌'
): Promise<string> {
  return sendLiveChatMessage({
    userName: userName || 'Worshipper',
    message: reactionText,
    type: 'amen',
    isAmen: true,
  });
}

/**
 * Moderator / Admin function to delete a chat message
 */
export async function deleteLiveChatMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, CHAT_COLLECTION, messageId));
}

/**
 * Formats relative timestamp for messages
 */
export function formatMessageTime(timestamp?: any, clientTimestamp?: number): string {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (typeof clientTimestamp === 'number') {
    return new Date(clientTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

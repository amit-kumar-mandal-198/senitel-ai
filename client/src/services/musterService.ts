import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, push, serverTimestamp, off } from 'firebase/database';

// Firebase configuration (Placeholders - USER: Please fill these in with actual values from your Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export interface MusterEntry {
  guestName: string;
  roomNumber: string;
  floor: number;
  status: "occupied" | "safe" | "unknown";
  markedSafeAt: number | null;
  guestId: string;
}

export interface EmergencyRecord {
  id?: string;
  status: "active" | "resolved";
  triggeredAt: number;
  triggeredBy: string;
  type: "fire" | "evacuation" | "lockdown" | "other";
}

export interface MusterSummary {
  total: number;
  safe: number;
  occupied: number;
  percentage: number;
}

/**
 * Triggers a new emergency record and populates the muster list.
 */
export const triggerEmergency = async (
  type: EmergencyRecord['type'],
  triggeredBy: string,
  occupiedRooms: Omit<MusterEntry, 'status' | 'markedSafeAt'>[]
): Promise<string> => {
  try {
    const emergencyRef = ref(db, 'emergencies');
    const newEmergencyRef = push(emergencyRef);
    const emergencyId = newEmergencyRef.key!;

    const emergencyData: EmergencyRecord = {
      status: 'active',
      triggeredAt: Date.now(),
      triggeredBy,
      type
    };

    await set(newEmergencyRef, emergencyData);

    // Populate muster list
    const updates: Record<string, MusterEntry> = {};
    occupiedRooms.forEach((room) => {
      updates[`emergencies/${emergencyId}/muster/${room.roomNumber}`] = {
        ...room,
        status: 'occupied',
        markedSafeAt: null
      };
    });

    await update(ref(db), updates);
    return emergencyId;
  } catch (error) {
    console.error('Error triggering emergency:', error);
    throw error;
  }
};

/**
 * Marks a guest as safe.
 */
export const markGuestSafe = async (
  emergencyId: string,
  roomNumber: string,
  guestId: string
): Promise<void> => {
  try {
    const musterRef = ref(db, `emergencies/${emergencyId}/muster/${roomNumber}`);
    await update(musterRef, {
      status: 'safe',
      markedSafeAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking guest safe:', error);
    throw error;
  }
};

/**
 * Subscribes to the muster board for real-time updates.
 */
export const subscribeToMusterBoard = (
  emergencyId: string,
  callback: (musterData: Record<string, MusterEntry>) => void
): () => void => {
  const musterRef = ref(db, `emergencies/${emergencyId}/muster`);
  const listener = onValue(musterRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });

  return () => off(musterRef, 'value', listener);
};

/**
 * Resolves an active emergency.
 */
export const resolveEmergency = async (emergencyId: string): Promise<void> => {
  try {
    const emergencyRef = ref(db, `emergencies/${emergencyId}`);
    await update(emergencyRef, { status: 'resolved' });
  } catch (error) {
    console.error('Error resolving emergency:', error);
    throw error;
  }
};

/**
 * Calculates a summary of the muster data.
 */
export const getMusterSummary = (musterData: Record<string, MusterEntry>): MusterSummary => {
  const entries = Object.values(musterData);
  const total = entries.length;
  const safe = entries.filter(e => e.status === 'safe').length;
  const occupied = total - safe;
  const percentage = total > 0 ? (safe / total) * 100 : 0;

  return { total, safe, occupied, percentage };
};

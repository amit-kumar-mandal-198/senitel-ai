import { nanoid } from 'nanoid';
import { getDatabase, ref, set, get, update, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { ResponderLinkRecord, TokenValidationResult, ValidatedLink } from '../types/responder';

const db = getDatabase();

/**
 * Generates a secure, time-limited dispatch link for first responders.
 */
export const generateResponderLink = async (
  emergencyId: string,
  propertyId: string,
  propertyName: string,
  createdBy: string
): Promise<string> => {
  const token = nanoid(16);
  const expiresAt = Date.now() + (4 * 60 * 60 * 1000); // 4 hours from now

  const linkRecord: ResponderLinkRecord = {
    emergencyId,
    propertyId,
    propertyName,
    createdAt: Date.now(),
    expiresAt,
    createdBy,
    isRevoked: false,
    accessCount: 0,
    lastAccessedAt: null
  };

  await set(ref(db, `responderLinks/${token}`), linkRecord);

  return `${window.location.origin}/responder/${token}`;
};

/**
 * Validates a responder token and increments access metrics.
 */
export const validateResponderToken = async (token: string): Promise<TokenValidationResult> => {
  try {
    const tokenRef = ref(db, `responderLinks/${token}`);
    const snapshot = await get(tokenRef);

    if (!snapshot.exists()) {
      return { valid: false, reason: "not_found" };
    }

    const data = snapshot.val() as ResponderLinkRecord;

    if (data.isRevoked) {
      return { valid: false, reason: "revoked" };
    }

    if (Date.now() > data.expiresAt) {
      return { valid: false, reason: "expired" };
    }

    // Increment access count and update last accessed time
    await update(tokenRef, {
      accessCount: (data.accessCount || 0) + 1,
      lastAccessedAt: Date.now()
    });

    return { 
      valid: true, 
      linkData: { ...data, token } as ValidatedLink 
    };
  } catch (error) {
    console.error("Token validation error:", error);
    return { valid: false, reason: "not_found" };
  }
};

/**
 * Manually revokes a dispatch link.
 */
export const revokeResponderLink = async (token: string): Promise<void> => {
  await update(ref(db, `responderLinks/${token}`), {
    isRevoked: true
  });
};

/**
 * Fetches all active (non-revoked, non-expired) links for an emergency.
 */
export const getActiveLinksForEmergency = (
  emergencyId: string,
  callback: (links: ValidatedLink[]) => void
): (() => void) => {
  const linksRef = ref(db, 'responderLinks');
  const emergencyQuery = query(linksRef, orderByChild('emergencyId'), equalTo(emergencyId));

  const unsubscribe = onValue(emergencyQuery, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const now = Date.now();
    
    const activeLinks = Object.entries(data)
      .map(([token, record]) => ({ ...(record as ResponderLinkRecord), token }))
      .filter(link => !link.isRevoked && link.expiresAt > now);

    callback(activeLinks as ValidatedLink[]);
  });

  return unsubscribe;
};

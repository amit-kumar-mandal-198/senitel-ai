import { getDatabase, ref, set, update, serverTimestamp } from 'firebase/database';
import { generateAllTranslations, getTranslationForGuest } from './translationService';
import { BroadcastSummary, BroadcastLogEntry, DeliveryStatus } from '../types/translation';
import { EmergencyType } from '../constants/alertMessages';

const db = getDatabase();

export interface BroadcastGuest {
  id: string;
  name: string;
  roomNumber: string;
  language: string;
  phone: string;
  whatsapp?: string;
}

/**
 * Orchestrates the translation and delivery of emergency alerts to all guests.
 */
export const orchestrateBroadcast = async (
  emergencyId: string,
  masterMessage: string,
  emergencyType: EmergencyType,
  guests: BroadcastGuest[]
): Promise<BroadcastSummary> => {
  const startTime = Date.now();
  const uniqueLangs = Array.from(new Set(guests.map(g => g.language || 'en')));
  
  // Step 1: Pre-translate all required languages
  console.log(`[Broadcast] Starting translation for ${uniqueLangs.length} languages...`);
  const translations = await generateAllTranslations(emergencyId, masterMessage, emergencyType, uniqueLangs);

  // Step 2: Dispatch broadcasts per guest
  console.log(`[Broadcast] Dispatching alerts to ${guests.length} guests...`);
  const deliveryPromises = guests.map(async (guest) => {
    const lang = guest.language || 'en';
    const translation = translations[lang] || await getTranslationForGuest(emergencyId, lang);
    
    const smsContent = `[HOTEL EMERGENCY] ${translation.body} - Sentinel AI`;
    
    // Simulate SMS Send
    console.log(`[SMS OUT] To: ${guest.phone} (${lang}) - "${smsContent}"`);
    
    const logEntry: BroadcastLogEntry = {
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      language: lang,
      smsStatus: "sent",
      whatsappStatus: guest.whatsapp ? "sent" : "not_applicable",
      translationUsed: translation.body,
      sentAt: Date.now()
    };

    await set(ref(db, `emergencies/${emergencyId}/broadcastLog/${guest.id}`), logEntry);
    
    // Simulate 200ms delay per dispatch
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update status to delivered
    await update(ref(db, `emergencies/${emergencyId}/broadcastLog/${guest.id}`), {
      smsStatus: "delivered" as DeliveryStatus,
      whatsappStatus: guest.whatsapp ? "delivered" : "not_applicable"
    });
  });

  await Promise.all(deliveryPromises);

  // Step 3: Update Firebase with summary
  const summary: BroadcastSummary = {
    totalGuests: guests.length,
    languagesUsed: uniqueLangs,
    translationCacheHits: 0, // In a real app, track this in generateAllTranslations
    translationApiCalls: uniqueLangs.filter(l => l !== 'en').length,
    broadcastCompletedAt: Date.now(),
    deliveryRate: 100 // Simulated success
  };

  await set(ref(db, `emergencies/${emergencyId}/broadcastSummary`), {
    ...summary,
    broadcastCompletedAt: serverTimestamp()
  });

  return summary;
};

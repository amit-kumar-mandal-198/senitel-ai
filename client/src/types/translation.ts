export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed" | "not_applicable";

export interface TranslatedAlert {
  title: string;
  body: string;
  cta: string;
  isRTL: boolean;
  langCode: string;
  langName: string;
}

export interface TranslationCacheEntry extends TranslatedAlert {
  status: "pending" | "done" | "failed";
  generatedAt: number;
  characterCount: number;
}

export interface BroadcastLogEntry {
  guestId: string;
  guestName: string;
  roomNumber: string;
  language: string;
  smsStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  translationUsed: string;
  sentAt: number;
}

export interface BroadcastSummary {
  totalGuests: number;
  languagesUsed: string[];
  translationCacheHits: number;
  translationApiCalls: number;
  broadcastCompletedAt: number;
  deliveryRate: number;
}

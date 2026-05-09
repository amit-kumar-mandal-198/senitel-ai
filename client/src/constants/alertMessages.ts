export const ALERT_MESSAGES = {
  FIRE: {
    title: "FIRE EMERGENCY",
    body: "FIRE ALERT: Please evacuate immediately. Leave belongings. Use stairs only. Do not use elevators. Proceed to assembly point."
  },
  FLOOD: {
    title: "FLOOD WARNING",
    body: "FLOOD WARNING: Move to higher floors immediately. Avoid ground floor areas. Follow staff instructions."
  },
  LOCKDOWN: {
    title: "SECURITY LOCKDOWN",
    body: "SECURITY ALERT: Stay in your room. Lock your door. Do not open for anyone except uniformed police. Await further instructions."
  },
  MEDICAL: {
    title: "MEDICAL EMERGENCY",
    body: "Medical emergency in progress. Please stay clear of corridors. Follow staff guidance."
  },
  EVACUATION: {
    title: "EVACUATION ORDER",
    body: "EVACUATION ORDER: Leave the building immediately via nearest emergency exit. Do not use elevators. Report to assembly point."
  }
} as const;

export type EmergencyType = keyof typeof ALERT_MESSAGES;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese (Simp.)', native: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', isRTL: true },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'th', name: 'Thai', native: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰', isRTL: true }
] as const;

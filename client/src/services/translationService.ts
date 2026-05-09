import { getDatabase, ref, set, get, update } from 'firebase/database';
import { TranslationCacheEntry, TranslatedAlert } from '../types/translation';
import { SUPPORTED_LANGUAGES, EmergencyType } from '../constants/alertMessages';

const db = getDatabase();
// USER: Replace with your actual Claude API Key
const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY";

/**
 * Translates a master alert message into a target language using Claude.
 */
export const translateAlertMessage = async (
  masterMessage: string,
  targetLangCode: string,
  emergencyType: string
): Promise<TranslatedAlert | null> => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === targetLangCode);
  if (!lang) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per request

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true" // Note: In production, proxy this through your backend
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 300,
        system: `You are an emergency alert translation system for a hotel safety platform. Translate the following emergency alert message into ${lang.name}.
        
        STRICT RULES:
        1. Preserve ALL urgency and severity of the original
        2. Keep the message concise — max 160 characters for SMS compatibility
        3. Use formal/official register, not casual speech
        4. Do NOT add any extra words, disclaimers, or explanations — translate ONLY
        5. For Arabic and Urdu, ensure right-to-left text direction is natural in the output
        6. Return ONLY a JSON object, nothing else:
           {
             "title": "short alert title (max 40 chars)",
             "body": "full alert message (max 160 chars)",
             "cta": "I Am Safe button text (max 20 chars)",
             "isRTL": true/false
           }`,
        messages: [
          {
            role: "user",
            content: `Translate this emergency alert to ${lang.name}:
                      
                      EMERGENCY TYPE: ${emergencyType}
                      MESSAGE: ${masterMessage}
                      
                      Return ONLY the JSON object. No explanation.`
          }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Claude API error: ${response.status}`);

    const data = await response.json();
    const rawText = data.content[0].text.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    console.log(`[AI Translation] Translated to ${lang.code}:`, {
      inputChars: masterMessage.length,
      outputChars: parsed.body.length,
      langCode: lang.code,
      estimatedCost: (masterMessage.length + 300) * 0.000015 // Rough estimate
    });

    return {
      ...parsed,
      langCode: lang.code,
      langName: lang.name
    };
  } catch (error) {
    console.error(`[AI Translation] Failed for ${lang.code}:`, error);
    return null;
  }
};

/**
 * Generates translations for all unique guest languages for an emergency.
 */
export const generateAllTranslations = async (
  emergencyId: string,
  masterMessage: string,
  emergencyType: EmergencyType,
  uniqueLangCodes: string[]
): Promise<Record<string, TranslationCacheEntry>> => {
  const translations: Record<string, TranslationCacheEntry> = {};
  
  const translationPromises = uniqueLangCodes.map(async (langCode) => {
    if (langCode === 'en') return;

    // Check cache
    const cacheRef = ref(db, `emergencies/${emergencyId}/translations/${langCode}`);
    const cacheSnap = await get(cacheRef);
    
    if (cacheSnap.exists() && cacheSnap.val().status === 'done') {
      translations[langCode] = cacheSnap.val();
      return;
    }

    // Set pending status
    await update(cacheRef, { status: 'pending', langCode });

    const result = await translateAlertMessage(masterMessage, langCode, emergencyType);

    const entry: TranslationCacheEntry = result ? {
      ...result,
      status: 'done',
      generatedAt: Date.now(),
      characterCount: result.body.length
    } : {
      title: "EMERGENCY",
      body: masterMessage,
      cta: "I AM SAFE",
      isRTL: false,
      langCode,
      langName: SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || 'Unknown',
      status: 'failed',
      generatedAt: Date.now(),
      characterCount: masterMessage.length
    };

    await set(cacheRef, entry);
    translations[langCode] = entry;
  });

  await Promise.all(translationPromises);
  return translations;
};

/**
 * Gets a specific translation for a guest.
 */
export const getTranslationForGuest = async (
  emergencyId: string,
  langCode: string
): Promise<TranslatedAlert> => {
  if (langCode === 'en') {
    return {
      title: "EMERGENCY ALERT",
      body: "Emergency in progress. Please check in.",
      cta: "I AM SAFE",
      isRTL: false,
      langCode: 'en',
      langName: 'English'
    };
  }

  const cacheRef = ref(db, `emergencies/${emergencyId}/translations/${langCode}`);
  const snap = await get(cacheRef);
  
  if (snap.exists() && snap.val().status === 'done') {
    return snap.val();
  }

  // Fallback to English
  return {
    title: "EMERGENCY ALERT",
    body: "Emergency in progress. Please check in.",
    cta: "I AM SAFE",
    isRTL: false,
    langCode: 'en',
    langName: 'English'
  };
};

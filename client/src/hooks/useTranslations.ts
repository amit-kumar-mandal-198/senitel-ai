import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { TranslationCacheEntry, BroadcastLogEntry, BroadcastSummary } from '../types/translation';

export const useTranslations = (emergencyId: string | null) => {
  const [translations, setTranslations] = useState<Record<string, TranslationCacheEntry>>({});
  const [broadcastLog, setBroadcastLog] = useState<Record<string, BroadcastLogEntry>>({});
  const [broadcastSummary, setBroadcastSummary] = useState<BroadcastSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!emergencyId) {
      setTranslations({});
      setBroadcastLog({});
      setBroadcastSummary(null);
      setLoading(false);
      return;
    }

    const db = getDatabase();
    setLoading(true);

    // 1. Translation cache listener
    const transRef = ref(db, `emergencies/${emergencyId}/translations`);
    const onTransUpdate = onValue(transRef, (snap) => {
      setTranslations(snap.val() || {});
    });

    // 2. Broadcast log listener
    const logRef = ref(db, `emergencies/${emergencyId}/broadcastLog`);
    const onLogUpdate = onValue(logRef, (snap) => {
      setBroadcastLog(snap.val() || {});
    });

    // 3. Summary listener
    const summaryRef = ref(db, `emergencies/${emergencyId}/broadcastSummary`);
    const onSummaryUpdate = onValue(summaryRef, (snap) => {
      setBroadcastSummary(snap.val());
      setLoading(false);
    });

    return () => {
      off(transRef, 'value', onTransUpdate);
      off(logRef, 'value', onLogUpdate);
      off(summaryRef, 'value', onSummaryUpdate);
    };
  }, [emergencyId]);

  const languagesDetected = Array.from(new Set(Object.values(broadcastLog).map(l => l.language)));
  const totalGuests = Object.keys(broadcastLog).length;

  return { 
    translations, 
    broadcastLog, 
    broadcastSummary, 
    languagesDetected, 
    totalGuests, 
    loading 
  };
};

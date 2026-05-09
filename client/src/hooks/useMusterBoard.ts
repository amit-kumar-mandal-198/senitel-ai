import { useState, useEffect } from 'react';
import { subscribeToMusterBoard, getMusterSummary, MusterEntry, MusterSummary } from '../services/musterService';

export const useMusterBoard = (emergencyId: string | null) => {
  const [musterData, setMusterData] = useState<Record<string, MusterEntry>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emergencyId) {
      setMusterData({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const unsubscribe = subscribeToMusterBoard(emergencyId, (data) => {
        setMusterData(data);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError('Failed to connect to muster board.');
      setLoading(false);
    }
  }, [emergencyId]);

  const summary = getMusterSummary(musterData);

  return { musterData, summary, loading, error };
};

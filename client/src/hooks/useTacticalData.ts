import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { EmergencyRecord, MusterEntry, MusterSummary } from '../services/musterService';
import { getMusterSummary } from '../services/musterService';
import { Hazard } from '../types/responder';

export const useTacticalData = (emergencyId: string) => {
  const [emergency, setEmergency] = useState<EmergencyRecord | null>(null);
  const [musterData, setMusterData] = useState<Record<string, MusterEntry>>({});
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDatabase();
    
    // 1. Connection state listener
    const connectedRef = ref(db, ".info/connected");
    const onConnectChange = onValue(connectedRef, (snap) => {
      setIsConnected(snap.val() === true);
    });

    // 2. Emergency details listener
    const emergencyRef = ref(db, `emergencies/${emergencyId}`);
    const onEmergencyChange = onValue(emergencyRef, (snap) => {
      if (snap.exists()) {
        setEmergency({ id: emergencyId, ...snap.val() });
      } else {
        setError("Emergency not found");
      }
    });

    // 3. Muster data listener
    const musterRef = ref(db, `emergencies/${emergencyId}/muster`);
    const onMusterChange = onValue(musterRef, (snap) => {
      setMusterData(snap.val() || {});
      setLoading(false);
    });

    // 4. Hazards listener (mocking for now as existing project doesn't have a dedicated hazard path)
    // In a real implementation, this would be a path like `emergencies/${emergencyId}/hazards`
    const hazardsRef = ref(db, `emergencies/${emergencyId}/hazards`);
    const onHazardsChange = onValue(hazardsRef, (snap) => {
      setHazards(snap.val() ? Object.values(snap.val()) : []);
    });

    return () => {
      off(connectedRef, 'value', onConnectChange);
      off(emergencyRef, 'value', onEmergencyChange);
      off(musterRef, 'value', onMusterChange);
      off(hazardsRef, 'value', onHazardsChange);
    };
  }, [emergencyId]);

  const summary = getMusterSummary(musterData);

  return { emergency, musterData, summary, hazards, isConnected, loading, error };
};

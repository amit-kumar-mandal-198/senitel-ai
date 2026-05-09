import { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, query, limitToLast } from 'firebase/database';
import { SENSORS } from '../constants/sensorConfigs';
import { 
  SensorWithLatestReading, 
  MaintenanceTicket, 
  PredictiveAlert, 
  PreventionStats,
  SensorReading,
  SensorBaseline
} from '../types/maintenance';

export const usePredictiveMaintenance = (propertyId: string) => {
  const [sensors, setSensors] = useState<Record<string, SensorWithLatestReading>>({});
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDatabase();
    const unsubscribes: (() => void)[] = [];

    // 1. Subscribe to sensor readings (last 20 for each)
    SENSORS.forEach(config => {
      const readingsRef = query(ref(db, `sensorReadings/${config.sensorId}`), limitToLast(20));
      const unsubReadings = onValue(readingsRef, (snap) => {
        const readingsData = snap.val() || {};
        const readings: SensorReading[] = Object.values(readingsData).sort((a: any, b: any) => b.timestamp - a.timestamp) as any;
        
        // Subscribe to baseline
        const baselineRef = ref(db, `sensorBaselines/${config.sensorId}`);
        onValue(baselineRef, (baseSnap) => {
          const baseline: SensorBaseline = baseSnap.val();
          
          // Subscribe to simulation mode
          const modeRef = ref(db, `properties/${propertyId}/sensorState/${config.sensorId}/mode`);
          onValue(modeRef, (modeSnap) => {
            const mode = modeSnap.val() || 'normal';

            setSensors(prev => ({
              ...prev,
              [config.sensorId]: {
                ...config,
                latestReading: readings[0],
                baseline,
                simulationMode: mode,
                sparklineData: readings.map(r => r.value).reverse()
              }
            }));
          });
        });
      });
      unsubscribes.push(unsubReadings);
    });

    // 2. Subscribe to maintenance tickets
    const ticketsRef = ref(db, 'maintenanceTickets');
    const unsubTickets = onValue(ticketsRef, (snap) => {
      const data = snap.val() || {};
      const ticketList = Object.values(data) as MaintenanceTicket[];
      setTickets(ticketList.sort((a, b) => b.detectedAt - a.detectedAt));
      setLoading(false);
    });
    unsubscribes.push(unsubTickets);

    // 3. Subscribe to predictive alerts
    const alertsRef = ref(db, 'predictiveAlerts');
    const unsubAlerts = onValue(alertsRef, (snap) => {
      const data = snap.val() || {};
      const alertList = Object.values(data) as PredictiveAlert[];
      setAlerts(alertList.sort((a, b) => b.createdAt - a.createdAt));
    });
    unsubscribes.push(unsubAlerts);

    return () => unsubscribes.forEach(unsub => unsub());
  }, [propertyId]);

  const openTickets = useMemo(() => 
    tickets.filter(t => t.status !== 'resolved' && t.status !== 'prevented'),
  [tickets]);

  const unreadAlertCount = useMemo(() => 
    alerts.filter(a => !a.isRead).length,
  [alerts]);

  const stats: PreventionStats = useMemo(() => {
    const prevented = tickets.filter(t => t.status === 'resolved' || t.status === 'prevented').length;
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'prevented').length;
    const total = tickets.length;
    
    // Mocking some stats for the record
    return {
      totalPrevented: prevented,
      openTickets: openTickets.length,
      avgLeadTimeHours: 31,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      totalApiCalls: tickets.reduce((acc, t) => acc + (t.dataPointsAnalyzed > 0 ? 1 : 0), 0) + 12, // + baseline
      avgConfidence: tickets.length > 0 ? Math.round(tickets.reduce((acc, t) => acc + t.confidenceScore, 0) / tickets.length) : 0
    };
  }, [tickets, openTickets]);

  return {
    sensors,
    tickets,
    openTickets,
    alerts,
    unreadAlertCount,
    stats,
    loading,
    error
  };
};

import { getDatabase, ref, set, push, onValue, get, update, query, limitToLast, remove } from 'firebase/database';
import { SENSORS } from '../constants/sensorConfigs';
import { SensorReading, SimulationMode, DriftConfig, SensorBaseline } from '../types/maintenance';

let simulationInterval: any = null;

export const startSensorSimulation = (propertyId: string) => {
  if (simulationInterval) return;

  // Initialize sensors if they don't exist
  initializeSimulationState(propertyId);

  simulationInterval = setInterval(async () => {
    const db = getDatabase();
    
    for (const sensor of SENSORS) {
      // 1. Get current mode and config from Firebase
      const stateRef = ref(db, `properties/${propertyId}/sensorState/${sensor.sensorId}`);
      const stateSnap = await get(stateRef);
      let state: DriftConfig = stateSnap.exists() 
        ? stateSnap.val() 
        : { mode: 'normal', lastModeChange: Date.now() };

      // 2. Get latest reading for baseline/drift calc
      const lastReadingRef = query(ref(db, `sensorReadings/${sensor.sensorId}`), limitToLast(1));
      const lastSnap = await get(lastReadingRef);
      let lastValue = sensor.normalMin + (sensor.normalMax - sensor.normalMin) / 2;
      
      if (lastSnap.exists()) {
        const readings = lastSnap.val();
        lastValue = Object.values(readings)[0] as any;
        if (typeof lastValue === 'object') lastValue = (lastValue as any).value;
      }

      // 3. Get baseline
      const baselineRef = ref(db, `sensorBaselines/${sensor.sensorId}`);
      const baselineSnap = await get(baselineRef);
      const baseline: SensorBaseline = baselineSnap.exists()
        ? baselineSnap.val()
        : { sensorId: sensor.sensorId, baselineValue: lastValue, lastUpdated: Date.now(), readingCount: 1 };

      // 4. Calculate next value
      let nextValue = lastValue;
      const noise = (Math.random() - 0.5) * (sensor.normalMax - sensor.normalMin) * 0.05;

      switch (state.mode) {
        case 'normal':
          nextValue = lastValue + noise;
          // Soft clamp to normal range
          if (nextValue > sensor.normalMax) nextValue -= Math.abs(noise);
          if (nextValue < sensor.normalMin) nextValue += Math.abs(noise);
          break;

        case 'drifting':
          // For demo, we use a faster drift if configured, otherwise per hour
          const driftRate = state.driftRate || (sensor.normalMax - sensor.normalMin) * 0.02; // Default 2% of range per hour
          const elapsedMinutes = (Date.now() - (state.lastModeChange || Date.now())) / 60000;
          
          // Calculate drift: value changes by (driftRate/60) per minute
          // But we run every 10s, so change by (driftRate/360) per tick
          const direction = state.driftDirection === 'up' ? 1 : -1;
          nextValue = lastValue + (direction * driftRate / 360) + (noise * 0.2);
          break;

        case 'spike':
          if (Math.random() > 0.8) {
            nextValue = lastValue + (Math.random() > 0.5 ? 1 : -1) * (sensor.normalMax - sensor.normalMin) * 0.4;
          } else {
            // Return to normal
            const target = (sensor.normalMax + sensor.normalMin) / 2;
            nextValue = lastValue + (target - lastValue) * 0.3 + noise;
          }
          break;

        case 'critical':
          nextValue = sensor.criticalThreshold + noise;
          break;
      }

      // 5. Calculate drift %
      const driftPct = ((nextValue - baseline.baselineValue) / baseline.baselineValue) * 100;

      // 6. Write reading
      const timestamp = Date.now();
      const reading: SensorReading = {
        sensorId: sensor.sensorId,
        value: Number(nextValue.toFixed(2)),
        timestamp,
        isAnomaly: Math.abs(driftPct) > 15 || nextValue < Math.min(sensor.normalMin, sensor.criticalThreshold) || nextValue > Math.max(sensor.normalMax, sensor.criticalThreshold),
        drift: Number(driftPct.toFixed(2))
      };

      await set(ref(db, `sensorReadings/${sensor.sensorId}/${timestamp}`), reading);

      // 7. Update baseline (rolling average)
      const newCount = baseline.readingCount + 1;
      const newBaseline = (baseline.baselineValue * baseline.readingCount + nextValue) / newCount;
      await update(baselineRef, {
        baselineValue: Number(newBaseline.toFixed(2)),
        readingCount: Math.min(newCount, 1000), // Cap for rolling window
        lastUpdated: timestamp
      });

      // 8. Cleanup old readings (> 48 hours)
      // This is expensive to do every tick for all, so we do it randomly or every N ticks
      if (Math.random() > 0.95) {
        cleanupOldReadings(sensor.sensorId);
      }
    }
  }, 10000);
};

export const stopSensorSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

const initializeSimulationState = async (propertyId: string) => {
  const db = getDatabase();
  const stateRef = ref(db, `properties/${propertyId}/sensorState`);
  const snap = await get(stateRef);
  
  if (!snap.exists()) {
    const initialState: Record<string, DriftConfig> = {};
    SENSORS.forEach(s => {
      // Flagship story: PIPE_F2_MAIN starts drifting
      if (s.sensorId === 'PIPE_F2_MAIN') {
        initialState[s.sensorId] = {
          mode: 'drifting',
          driftStartValue: 72,
          driftRate: 30, // 30 PSI per hour -> visible in demo
          driftDirection: 'down',
          lastModeChange: Date.now()
        };
      } else {
        initialState[s.sensorId] = { mode: 'normal', lastModeChange: Date.now() };
      }
    });
    await set(stateRef, initialState);
  }
};

const cleanupOldReadings = async (sensorId: string) => {
  const db = getDatabase();
  const cutoff = Date.now() - (48 * 60 * 60 * 1000);
  const oldQuery = query(ref(db, `sensorReadings/${sensorId}`), limitToLast(1000)); // Just get a chunk
  const snap = await get(oldQuery);
  
  if (snap.exists()) {
    const data = snap.val();
    const updates: any = {};
    Object.keys(data).forEach(key => {
      if (parseInt(key) < cutoff) {
        updates[`sensorReadings/${sensorId}/${key}`] = null;
      }
    });
    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
    }
  }
};

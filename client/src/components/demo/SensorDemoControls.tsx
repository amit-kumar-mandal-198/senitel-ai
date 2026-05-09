import React, { useState } from 'react';
import { getDatabase, ref, update, set } from 'firebase/database';
import { SENSORS } from '../../constants/sensorConfigs';

const SensorDemoControls: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSequenceRunning, setIsSequenceRunning] = useState(false);

  const setSensorMode = async (sensorId: string, mode: string) => {
    const db = getDatabase();
    const updates: any = {
      [`properties/PROP-01/sensorState/${sensorId}/mode`]: mode,
      [`properties/PROP-01/sensorState/${sensorId}/lastModeChange`]: Date.now()
    };

    if (mode === 'drifting') {
      updates[`properties/PROP-01/sensorState/${sensorId}/driftRate`] = 60; // 60 PSI/hr (1 PSI/min)
      updates[`properties/PROP-01/sensorState/${sensorId}/driftDirection`] = 'down';
    }

    await update(ref(db), updates);
  };

  const runFullSequence = async () => {
    setIsSequenceRunning(true);
    // 1. Reset all to normal
    const db = getDatabase();
    for (const s of SENSORS) {
      await setSensorMode(s.sensorId, 'normal');
    }

    // 2. Start drift on PIPE_F2_MAIN
    setTimeout(() => {
      setSensorMode('PIPE_F2_MAIN', 'drifting');
    }, 2000);

    // 3. Start drift on HVAC_FILTER_1
    setTimeout(() => {
      setSensorMode('HVAC_FILTER_1', 'drifting');
    }, 15000);

    setTimeout(() => {
      setIsSequenceRunning(false);
      alert("Demo sequence initiated. Watch the dashboard for AI detection.");
    }, 20000);
  };

  const resetAll = async () => {
    const db = getDatabase();
    const updates: any = {};
    SENSORS.forEach(s => {
      updates[`properties/PROP-01/sensorState/${s.sensorId}/mode`] = 'normal';
      updates[`properties/PROP-01/sensorState/${s.sensorId}/lastModeChange`] = Date.now();
    });
    // Also clear tickets/alerts for a fresh start
    updates['maintenanceTickets'] = null;
    updates['predictiveAlerts'] = null;
    
    await update(ref(db), updates);
    alert("All sensors reset to normal. Tickets cleared.");
  };

  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('demo=true')) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 ${isExpanded ? 'w-80' : 'w-12 h-12 overflow-hidden'}`}>
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-full h-full bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          🎮
        </button>
      ) : (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <span className="text-sm">🎮</span> Sensor Demo Controls
            </h3>
            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white">✕</button>
          </div>

          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            {SENSORS.slice(0, 3).map(sensor => (
              <div key={sensor.sensorId} className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase">{sensor.name}</p>
                <div className="grid grid-cols-3 gap-1">
                  {['normal', 'drifting', 'critical'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSensorMode(sensor.sensorId, mode)}
                      className="text-[8px] font-black uppercase py-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:border-blue-500 hover:text-white transition-colors"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 space-y-2">
              <button 
                onClick={runFullSequence}
                disabled={isSequenceRunning}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isSequenceRunning ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95'
                }`}
              >
                {isSequenceRunning ? 'Sequence Running...' : '🚀 Run Full Demo Sequence'}
              </button>
              <button 
                onClick={resetAll}
                className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 transition-all"
              >
                🔄 Reset All Sensors
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorDemoControls;

import React, { useState } from 'react';
import { getDatabase, ref, update, set } from 'firebase/database';
import { SENSORS } from '../../constants/sensorConfigs';

const SensorDemoControls: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
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
    <div className={`fixed bottom-4 right-4 z-[9999] transition-all duration-300 ${isExpanded ? 'w-[450px] h-[600px]' : 'w-12 h-12 overflow-hidden'}`}>
      {!isExpanded ? (
        <button 
          onClick={() => setIsExpanded(true)}
          className="w-full h-full bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          🎮
        </button>
      ) : (
        <div className="bg-gray-950/90 backdrop-blur-xl border-2 border-gray-800 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-full relative group">
          {/* Glowing Side Boundary Accent */}
          <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-blue-500 via-indigo-600 to-purple-600 shadow-[2px_0_15px_rgba(59,130,246,0.5)]" />
          
          <div className="p-8 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center backdrop-blur-md">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="text-2xl">🎮</span> Sensor Demo Controls
            </h3>
            <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
          </div>

          <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 bg-gradient-to-b from-transparent to-gray-900/30">
            {SENSORS.map(sensor => (
              <div key={sensor.sensorId} className="space-y-4 pl-2">
                <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{sensor.name}</p>
                <div className="grid grid-cols-3 gap-3">
                  {['normal', 'drifting', 'critical'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSensorMode(sensor.sensorId, mode)}
                      className="text-xs font-black uppercase py-4 rounded-xl bg-gray-900/50 border border-gray-800 text-gray-400 hover:border-blue-500/50 hover:text-white hover:bg-blue-600/10 transition-all active:scale-95 shadow-inner"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-8 space-y-4 border-t border-gray-800 pb-4">
              <button 
                onClick={runFullSequence}
                disabled={isSequenceRunning}
                className={`w-full py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${
                  isSequenceRunning 
                    ? 'bg-gray-800 text-gray-500' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-[0_10px_25px_rgba(59,130,246,0.3)] active:scale-[0.98]'
                }`}
              >
                {isSequenceRunning ? 'Sequence Running...' : '🚀 Run Full Demo Sequence'}
              </button>
              <button 
                onClick={resetAll}
                className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600/5 text-red-500/80 border border-red-500/10 hover:bg-red-600/10 hover:text-red-500 transition-all active:scale-95"
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

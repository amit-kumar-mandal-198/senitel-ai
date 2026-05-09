import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceStatusCard, { DeviceStatus } from './DeviceStatusCard';
import ActionLogFeed, { ActionLog } from './ActionLogFeed';
import OverrideModal from './OverrideModal';
import { useIoTSocket } from '../../hooks/useIoTSocket';

interface ThreatSummary {
  type: string;
  location: string;
  triggeredCount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}

const playCriticalAlert = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const playBeep = (freq: number, start: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.5);
  };
  playBeep(880, ctx.currentTime);
  playBeep(880, ctx.currentTime + 0.2);
  playBeep(440, ctx.currentTime + 0.4);
};

/**
 * Main dashboard panel for monitoring and simulating IoT automated responses to threats.
 */
const IoTActionPanel: React.FC = () => {
  const { lastEvent } = useIoTSocket('http://localhost:8000'); // FastAPI URL
  const [devices, setDevices] = useState<any[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [activeThreat, setActiveThreat] = useState<ThreatSummary | null>(null);
  const [isManualExpanded, setIsManualExpanded] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  // Handle incoming socket events
  useEffect(() => {
    if (!lastEvent) return;

    switch (lastEvent.type) {
      case 'iot:action_update':
        // Update specific log status
        setLogs(prev => prev.map(log => 
          log.action_id === lastEvent.data.action_id 
          ? { ...log, execution_status: lastEvent.data.status, response_time_ms: lastEvent.data.response_time_ms } 
          : log
        ));

        // Life-Critical Failure Alert
        if (lastEvent.data.status === 'FAILED') {
          const failedLog = logs.find(l => l.action_id === lastEvent.data.action_id);
          const isCritical = failedLog && ['OXYGEN_VALVE', 'BACKUP_POWER', 'FIRE_SUPPRESSION'].includes(failedLog.device_type);
          if (isCritical) playCriticalAlert();
        }
        break;
      case 'iot:action_triggered':
      case 'iot:device_status':
        // Update device grid
        setDevices(prev => prev.map(d => 
          d.device_id === lastEvent.data.device_id 
          ? { ...d, current_status: lastEvent.data.status, last_action: lastEvent.data.last_action } 
          : d
        ));
        break;
      case 'iot:override_applied':
        // Set manual override flag
        setDevices(prev => prev.map(d => 
          d.device_id === lastEvent.data.device_id 
          ? { ...d, is_manual_override: true, current_status: lastEvent.data.status } 
          : d
        ));
        break;
    }
  }, [lastEvent]);

  const completionPercentage = useMemo(() => {
    if (!activeThreat || activeThreat.triggeredCount === 0) return 0;
    return Math.round((activeThreat.completedCount / activeThreat.triggeredCount) * 100);
  }, [activeThreat]);

  const handleOverrideConfirm = (operatorId: string, command: string) => {
    console.log(`Sending manual override for ${selectedDevice?.device_name} by ${operatorId}: ${command}`);
    setSelectedDevice(null);
    // In real app: fetch('/api/v1/iot/override', { method: 'POST', ... })
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full max-h-[1000px]">
      {/* HEADER */}
      <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            IoT Response Actions
            <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse">Connected</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Real-time Cyber-Physical Countermeasures
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-8">
        {/* A. THREAT RESPONSE SUMMARY */}
        <AnimatePresence>
          {activeThreat && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-950/20 border-2 border-red-900/50 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-red-500 text-xs font-black uppercase tracking-widest">Active Containment In Progress</h3>
                  <p className="text-lg font-black text-white mt-1">
                    Responding to: {activeThreat.type} — {activeThreat.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{completionPercentage}%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Containment Progress</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  className="h-full bg-red-600"
                />
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: 'Triggered', val: activeThreat.triggeredCount, color: 'text-white' },
                  { label: 'Completed', val: activeThreat.completedCount, color: 'text-green-500' },
                  { label: 'Pending', val: activeThreat.pendingCount, color: 'text-amber-500' },
                  { label: 'Failed', val: activeThreat.failedCount, color: 'text-red-500' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* B. DEVICE STATUS GRID */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Device Status Registry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Seed placeholders if devices not loaded */}
            {devices.length === 0 ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-900 h-32 rounded-xl animate-pulse border border-slate-800" />
              ))
            ) : (
              devices.map(device => (
                <DeviceStatusCard 
                  key={device.device_id} 
                  device={device} 
                  onClick={() => setSelectedDevice(device)}
                />
              ))
            )}
          </div>
        </div>

        {/* C. LIVE ACTION LOG & MANUAL CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Action Log (Left 2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Live Action Log Feed
            </h3>
            <ActionLogFeed 
              logs={logs} 
              onOverride={(log) => setSelectedDevice(devices.find(d => d.device_name === log.device_name))} 
            />
          </div>

          {/* Manual Controls (Right 1/3) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              Manual Override Systems
            </h3>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button 
                onClick={() => setIsManualExpanded(!isManualExpanded)}
                className="w-full p-4 flex justify-between items-center hover:bg-slate-800 transition-colors"
              >
                <span className="text-[10px] font-black text-white uppercase">Authorized Override Access</span>
                <span className="text-slate-500">{isManualExpanded ? '▲' : '▼'}</span>
              </button>
              
              <AnimatePresence>
                {isManualExpanded && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-slate-800"
                  >
                    <div className="p-4 space-y-3">
                      {devices.slice(0, 5).map(device => (
                        <div key={device.device_id} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white">{device.device_name}</span>
                            <span className="text-[8px] text-slate-500 uppercase">{device.current_status}</span>
                          </div>
                          <button 
                            onClick={() => setSelectedDevice(device)}
                            className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase px-3 py-1 rounded"
                          >
                            Control
                          </button>
                        </div>
                      ))}
                      <p className="text-[9px] text-slate-600 italic text-center pt-2">
                        Only authorized Level 3 personnel can override automated crisis responses.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      <OverrideModal 
        isOpen={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onConfirm={handleOverrideConfirm}
        deviceName={selectedDevice?.device_name || ''}
      />
    </div>
  );
};

export default IoTActionPanel;

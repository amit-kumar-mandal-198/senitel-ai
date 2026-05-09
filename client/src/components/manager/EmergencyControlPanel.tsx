import React, { useState, useEffect } from 'react';
import { triggerEmergency, resolveEmergency, EmergencyRecord } from '../../services/musterService';
import { useMusterBoard } from '../../hooks/useMusterBoard';
import DispatchLinkPanel from './DispatchLinkPanel';
import TranslationStatusPanel from './TranslationStatusPanel';
import { orchestrateBroadcast } from '../../services/broadcastService';
import { ALERT_MESSAGES, EmergencyType } from '../../constants/alertMessages';
import { get, getDatabase, ref, query, orderByChild, equalTo, limitToLast, onValue } from 'firebase/database';
const EmergencyControlPanel: React.FC = () => {
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRecord | null>(null);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('FIRE');
  const [isTriggering, setIsTriggering] = useState(false);
  const [timer, setTimer] = useState(0);

  const { musterData, summary } = useMusterBoard(activeEmergency?.id || null);

  // Listen for active emergency
  useEffect(() => {
    const db = getDatabase();
    const activeQuery = query(ref(db, 'emergencies'), orderByChild('status'), equalTo('active'), limitToLast(1));
    
    const unsubscribe = onValue(activeQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const id = Object.keys(data)[0];
        setActiveEmergency({ id, ...data[id] });
      } else {
        setActiveEmergency(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (activeEmergency) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - activeEmergency.triggeredAt) / 1000));
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeEmergency]);

  const handleTrigger = async () => {
    const typeUpper = emergencyType.toUpperCase() as EmergencyType;
    if (!window.confirm(`Are you sure you want to trigger a ${typeUpper} evacuation? This will activate all guest safety screens and send multilingual alerts.`)) return;
    
    setIsTriggering(true);
    try {
      const db = getDatabase();
      const guestsSnap = await get(ref(db, 'guests'));
      const guests = guestsSnap.exists() 
        ? Object.entries(guestsSnap.val()).map(([id, g]: any) => ({ ...g, id })) 
        : [];

      // 1. Trigger the emergency record
      const emergencyId = await triggerEmergency(emergencyType.toLowerCase(), 'Admin User', guests.map(g => ({
        roomNumber: g.roomNumber,
        floor: g.floor,
        guestName: g.name,
        guestId: g.id
      })));

      // 2. Orchestrate multilingual broadcast in background
      const masterMsg = ALERT_MESSAGES[typeUpper];
      orchestrateBroadcast(emergencyId, masterMsg.body, typeUpper, guests);

    } catch (error) {
      console.error("Trigger failed:", error);
      alert('Failed to trigger emergency.');
    } finally {
      setIsTriggering(false);
    }
  };

  const handleResolve = async () => {
    if (!activeEmergency?.id) return;
    if (!window.confirm('Mark this emergency as RESOLVED? This will clear all guest safety screens.')) return;
    
    try {
      await resolveEmergency(activeEmergency.id);
    } catch (error) {
      alert('Failed to resolve emergency.');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
        {!activeEmergency ? (
          /* INACTIVE STATE */
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-2xl">🛡️</div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Emergency Shield</h2>
                <p className="text-xs text-gray-500 font-bold">System ready. No active threats detected.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-1 mb-1">Type</label>
                <select 
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as any)}
                  className="bg-gray-900 border-none rounded-lg px-4 py-2 text-sm font-bold text-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="FIRE">🔥 Fire</option>
                  <option value="EVACUATION">🚨 Evacuation</option>
                  <option value="LOCKDOWN">🔒 Lockdown</option>
                  <option value="MEDICAL">🚑 Medical</option>
                  <option value="FLOOD">🌊 Flood</option>
                </select>
              </div>

              <button
                onClick={handleTrigger}
                disabled={isTriggering}
                className="mt-5 bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2 rounded-lg text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isTriggering ? 'Activating...' : 'Trigger Evacuation'}
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE STATE */
          <div className="p-0">
            <div className="bg-red-600 p-4 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div className="leading-none">
                  <h2 className="text-lg font-black text-white uppercase">{activeEmergency.type} EMERGENCY ACTIVE</h2>
                  <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Triggered by {activeEmergency.triggeredBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-black/20 px-3 py-1 rounded-lg text-xl font-mono font-bold text-white">
                  {formatTime(timer)}
                </div>
                <button
                  onClick={handleResolve}
                  className="bg-white text-red-600 font-black px-4 py-2 rounded-lg text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-900/50">
              {/* Quick Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Live Muster Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Safe</p>
                    <p className="text-3xl font-black text-green-500">{summary.safe}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Remaining</p>
                    <p className="text-3xl font-black text-purple-500">{summary.occupied}</p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Progress</p>
                    <p className="text-3xl font-black text-white">{Math.round(summary.percentage)}%</p>
                  </div>
                </div>

                {/* FIRST RESPONDER DISPATCH LINK PANEL */}
                <div className="pt-4">
                  <DispatchLinkPanel 
                    emergencyId={activeEmergency.id || ''} 
                    propertyId="PROP-01"
                  />
                </div>
              </div>

              {/* Unaccounted List */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  Unaccounted Guests
                </h3>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800">
                  {Object.values(musterData)
                    .filter(r => r.status === 'occupied')
                    .sort((a, b) => a.floor - b.floor || a.roomNumber.localeCompare(b.roomNumber))
                    .map(r => (
                      <div key={r.roomNumber} className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-lg border border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <span className="w-8 text-xs font-black text-purple-500">R{r.roomNumber}</span>
                          <span className="text-xs font-bold text-white uppercase">{r.guestName}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-600 uppercase">Floor {r.floor}</span>
                      </div>
                    ))}
                  {summary.occupied === 0 && (
                    <p className="text-center py-4 text-green-500 font-bold italic text-sm">
                      ✨ All guests are accounted for!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeEmergency && (
        <TranslationStatusPanel emergencyId={activeEmergency.id || null} />
      )}
    </div>
  );
};

export default EmergencyControlPanel;

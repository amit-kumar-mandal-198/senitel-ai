import React, { useState, useEffect } from 'react';
import { useTacticalData } from '../../hooks/useTacticalData';
import { ValidatedLink } from '../../types/responder';

interface TacticalResponderViewProps {
  linkData: ValidatedLink;
}

const TacticalResponderView: React.FC<TacticalResponderViewProps> = ({ linkData }) => {
  const { emergency, musterData, summary, hazards, isConnected, loading, error } = useTacticalData(linkData.emergencyId);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [duration, setDuration] = useState("00:00:00");

  useEffect(() => {
    if (!emergency) return;
    const interval = setInterval(() => {
      const diff = Date.now() - emergency.triggeredAt;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [emergency]);

  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400 font-black uppercase tracking-widest">
      Initializing Tactical View...
    </div>
  );

  if (error || !emergency) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 text-center">
      <div className="bg-slate-900 p-10 rounded-3xl border border-red-500/20">
        <h1 className="text-2xl font-black text-white mb-4">VIEW UNAVAILABLE</h1>
        <p className="text-slate-400">The incident data is no longer accessible. Contact the incident commander.</p>
      </div>
    </div>
  );

  const rooms = Object.values(musterData);
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);
  
  const filteredRooms = rooms
    .filter(r => selectedFloor === 'all' || r.floor === selectedFloor)
    .sort((a, b) => {
      // Priority: Unconfirmed (occupied) first
      if (a.status === 'occupied' && b.status !== 'occupied') return -1;
      if (a.status !== 'occupied' && b.status === 'occupied') return 1;
      return a.roomNumber.localeCompare(b.roomNumber);
    });

  const priorityRooms = rooms.filter(r => r.status === 'occupied');

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex flex-col font-sans selection:bg-blue-500/30">
      <noscript>
        <div className="bg-red-600 text-white p-4 text-center font-bold">
          JavaScript is required for live updates. Please enable it to view real-time safety data.
        </div>
      </noscript>

      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-[#1E293B]/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 bg-red-600 px-2 py-1 rounded text-[10px] font-black uppercase animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full" /> LIVE
          </span>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tight leading-none">{linkData.propertyName}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Floor Map View</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black uppercase text-red-500">{emergency.type} EVACUATION</div>
          <div className="text-lg font-mono font-bold leading-none mt-1">{duration}</div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-ping'}`} />
          {isConnected ? '🔄 Live Updating' : '⚠️ Connection Lost'}
        </div>
      </header>

      {/* EMERGENCY RESOLVED OVERLAY */}
      {emergency.status === 'resolved' && (
        <div className="bg-green-600 text-white p-3 text-center text-sm font-black uppercase tracking-[0.2em] shadow-xl animate-bounce">
          ✅ Emergency Resolved by Incident Commander
        </div>
      )}

      {/* MUSTER SUMMARY STRIP */}
      <section className="bg-[#1E293B] border-b border-white/5 px-4 py-3 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-6 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <span className="text-xs font-black uppercase tracking-tight">
              <span className="text-red-500 mr-1">{summary.occupied}</span> PRIORITY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <span className="text-xs font-black uppercase tracking-tight">
              <span className="text-green-500 mr-1">{summary.safe}</span> CLEAR
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⬜</span>
            <span className="text-xs font-black uppercase tracking-tight text-slate-500">VACANT</span>
          </div>
        </div>
      </section>

      <main className="flex-1 p-4 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* ALL ACCOUNTED STATE */}
        {summary.total > 0 && summary.occupied === 0 && (
          <div className="py-20 text-center space-y-6">
            <div className="text-9xl">✅</div>
            <h2 className="text-4xl font-black text-green-500 uppercase tracking-tighter">All Guests Accounted For</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest">Facility status: Clear</p>
          </div>
        )}

        {summary.occupied > 0 && (
          <>
            {/* HAZARD PANEL */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                  <span>⚠️</span> Active Hazards ({hazards.length})
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {hazards.length > 0 ? hazards.map(h => (
                  <div key={h.id} className="flex items-start gap-4 p-3 bg-slate-950 rounded-xl border-l-4 border-orange-500">
                    <span className="text-xl">{h.type === 'fire' ? '🔥' : '💨'}</span>
                    <div>
                      <div className="text-sm font-black uppercase">Floor {h.floor} — {h.type} reported</div>
                      <div className="text-xs text-slate-500 font-bold uppercase mt-0.5">{h.location} — {Math.floor((Date.now() - h.reportedAt) / 60000)}m ago</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-4 text-xs font-bold text-slate-600 uppercase italic tracking-widest">No hazards reported</p>
                )}
              </div>
            </section>

            {/* FLOOR MAP SECTION */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live Tactical Map</h3>
                {/* Floor Filter Tabs */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button 
                    onClick={() => setSelectedFloor('all')}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded ${selectedFloor === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    All
                  </button>
                  {floors.map(f => (
                    <button 
                      key={f}
                      onClick={() => setSelectedFloor(f)}
                      className={`px-3 py-1 text-[10px] font-black uppercase rounded ${selectedFloor === f ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      F{f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredRooms.map(room => {
                  const isSafe = room.status === 'safe';
                  return (
                    <div 
                      key={room.roomNumber}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        isSafe 
                          ? 'bg-green-900/10 border-green-500/30' 
                          : 'bg-red-900/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isSafe ? 'text-green-500/50' : 'text-red-500/50'}`}>R{room.roomNumber}</span>
                        {isSafe && <span className="text-green-500 text-[10px]">✓</span>}
                      </div>
                      <div className={`text-xl font-black mb-1 ${isSafe ? 'text-green-500/80' : 'text-white'}`}>{room.roomNumber}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase truncate">{room.guestName}</div>
                      <div className={`mt-3 pt-2 border-t border-white/5 text-[9px] font-black uppercase ${isSafe ? 'text-green-600' : 'text-red-500'}`}>
                        {isSafe ? `Safe ${Math.floor((Date.now() - (room.markedSafeAt || 0)) / 60000)}m ago` : '⚠️ NOT CONFIRMED'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PRIORITY LIST (Mobile optimized) */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                Rooms Requiring Check ({priorityRooms.length})
              </h3>
              <div className="space-y-2">
                {priorityRooms.map(r => (
                  <div key={r.roomNumber} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">Room {r.roomNumber}</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[9px] font-black text-slate-400 uppercase">Floor {r.floor}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase mt-1">{r.guestName} — Priority Search</p>
                    </div>
                    <div className="text-right">
                      <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 font-black text-xl">!</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="sticky bottom-0 bg-[#0F172A] border-t border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
          <span>Read-only View</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>Powered by Sentinel AI</span>
        </div>
        <div className="text-[10px] font-black uppercase text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
          Link expires at {new Date(linkData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </footer>
    </div>
  );
};

export default TacticalResponderView;

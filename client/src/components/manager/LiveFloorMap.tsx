import React, { useState } from 'react';
import { useMusterBoard } from '../../hooks/useMusterBoard';
import { MusterEntry } from '../../services/musterService';

interface LiveFloorMapProps {
  emergencyId: string | null;
}

const LiveFloorMap: React.FC<LiveFloorMapProps> = ({ emergencyId }) => {
  const { musterData, summary, loading } = useMusterBoard(emergencyId);
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');

  // Convert muster data to array and filter by floor
  const musterEntries = Object.values(musterData);
  const filteredRooms = selectedFloor === 'all' 
    ? musterEntries 
    : musterEntries.filter(r => r.floor === selectedFloor);

  // Group rooms by floor for better visualization if 'all' is selected
  const floors = Array.from(new Set(musterEntries.map(r => r.floor))).sort((a, b) => a - b);

  if (loading && !musterEntries.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 italic">
        Loading muster board...
      </div>
    );
  }

  if (!emergencyId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-800 text-gray-500">
        No active emergency muster data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Muster Summary Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold text-green-500">{summary.safe} Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-600 rounded-full animate-ping" />
            <span className="font-bold text-purple-400">{summary.occupied} Not Confirmed</span>
          </div>
          <div className="h-6 w-px bg-gray-800 hidden sm:block" />
          <div className="text-gray-400">Total: <span className="text-white font-mono">{summary.total}</span></div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-full">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accounted</span>
            <span className="text-lg font-black text-white">{Math.round(summary.percentage)}%</span>
          </div>
          
          {/* Floor Filter */}
          <select 
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="bg-gray-800 border-none rounded-lg px-3 py-1.5 text-sm font-bold text-white focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="all">All Floors</option>
            {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
          </select>
        </div>
      </div>

      {/* Floor Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredRooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map((room) => {
          const isSafe = room.status === 'safe';
          return (
            <div 
              key={room.roomNumber}
              className={`relative overflow-hidden group transition-all duration-300 p-4 rounded-xl border-2 shadow-lg transform hover:-translate-y-1 ${
                isSafe 
                  ? 'bg-green-900/20 border-green-500/50' 
                  : 'bg-purple-900/20 border-purple-500/50 animate-pulse'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black opacity-50 uppercase tracking-tighter">Room</span>
                {isSafe ? (
                  <span className="bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </div>
              
              <h3 className="text-2xl font-black text-white mb-1">{room.roomNumber}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase truncate">{room.guestName}</p>
              
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-end">
                <span className="text-[10px] text-gray-500 font-bold">FL {room.floor}</span>
                {isSafe && room.markedSafeAt && (
                  <span className="text-[9px] text-green-500 font-mono italic">
                    {new Date(room.markedSafeAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              {/* Decorative background pulse for unsafe rooms */}
              {!isSafe && (
                <div className="absolute inset-0 bg-purple-600/5 pointer-events-none group-hover:bg-purple-600/10 transition-colors" />
              )}
            </div>
          );
        })}
      </div>
      
      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-gray-900/30 rounded-3xl border border-gray-800 italic">
          No guests currently on this floor selection.
        </div>
      )}
    </div>
  );
};

export default LiveFloorMap;

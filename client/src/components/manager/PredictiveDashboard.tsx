import React, { useState } from 'react';
import { usePredictiveMaintenance } from '../../hooks/usePredictiveMaintenance';
import { SensorWithLatestReading, MaintenanceTicket } from '../../types/maintenance';
import { getDatabase, ref, update } from 'firebase/database';
import TicketDetailModal from './TicketDetailModal';

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const SensorCard: React.FC<{ sensor: SensorWithLatestReading, onOpenTicket: (t: MaintenanceTicket) => void, activeTicket?: MaintenanceTicket }> = ({ sensor, onOpenTicket, activeTicket }) => {
  const isDrifting = sensor.simulationMode === 'drifting';
  const isCritical = sensor.simulationMode === 'critical';
  const latest = sensor.latestReading;
  const drift = latest?.drift || 0;

  let borderColor = 'border-gray-800';
  if (activeTicket) {
    borderColor = activeTicket.severity === 'critical' || activeTicket.severity === 'high' ? 'border-red-500' : 'border-orange-500';
  } else if (isCritical) {
    borderColor = 'border-red-500';
  } else if (isDrifting || Math.abs(drift) > 8) {
    borderColor = 'border-yellow-500';
  } else if (latest) {
    borderColor = 'border-green-500/50';
  }

  const sparkColor = drift < 0 ? '#ef4444' : '#22c55e';

  return (
    <div className={`bg-gray-900/50 border-2 ${borderColor} rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer`}
         onClick={() => activeTicket && onOpenTicket(activeTicket)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sensor.name}</h4>
        {isDrifting && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-bold animate-pulse">DRIFTING ↓</span>}
      </div>
      
      <div className="flex items-end gap-2 mb-3">
        <span className="text-2xl font-black text-white">{latest?.value ?? '--'}</span>
        <span className="text-xs font-bold text-gray-500 mb-1">{sensor.unit}</span>
      </div>

      <div className="h-8 mb-3">
        <Sparkline data={sensor.sparklineData} color={sparkColor} />
      </div>

      <div className="flex justify-between items-center text-[10px] font-bold">
        <span className="text-gray-500 uppercase">Normal: {sensor.normalMin}-{sensor.normalMax}</span>
        <span className={Math.abs(drift) > 8 ? 'text-orange-500' : 'text-green-500'}>
          {drift > 0 ? '+' : ''}{drift}% from baseline
        </span>
      </div>
    </div>
  );
};

const PredictiveDashboard: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const { sensors, openTickets, stats, loading } = usePredictiveMaintenance(propertyId);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAcknowledge = async (ticketId: string) => {
    const db = getDatabase();
    await update(ref(db, `maintenanceTickets/${ticketId}`), {
      status: 'acknowledged',
      acknowledgedAt: Date.now(),
      acknowledgedBy: 'Admin'
    });
  };

  const handleResolve = async (ticketId: string) => {
    if (!window.confirm("Confirm maintenance resolved? This will prevent the predicted emergency.")) return;
    const db = getDatabase();
    await update(ref(db, `maintenanceTickets/${ticketId}`), {
      status: 'resolved',
      resolvedAt: Date.now()
    });
  };

  if (loading) return <div className="animate-pulse bg-gray-900 h-64 rounded-2xl" />;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-900/50 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                Predictive Intelligence
                <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
              </h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                AI is monitoring {Object.keys(sensors).length} sensors · {openTickets.length} Active Warnings
              </p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-white font-black text-xs uppercase tracking-widest">
            {isCollapsed ? '[ ▲ Expand ]' : '[ ▼ Collapse ]'}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-6 border-t border-gray-800 bg-gray-900/30">
            {/* SENSOR GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.values(sensors).map(sensor => (
                <SensorCard 
                  key={sensor.sensorId} 
                  sensor={sensor} 
                  onOpenTicket={setSelectedTicket}
                  activeTicket={openTickets.find(t => t.sensorId === sensor.sensorId)}
                />
              ))}
            </div>

            {/* ACTIVE TICKETS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                Open Maintenance Tickets ({openTickets.length})
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {openTickets.length === 0 && (
                  <div className="text-center py-8 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
                    <p className="text-sm font-bold text-gray-500 italic">✨ No maintenance required. All systems optimal.</p>
                  </div>
                )}
                
                {openTickets.map(ticket => (
                  <div key={ticket.ticketId} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        ticket.severity === 'critical' || ticket.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{ticket.ticketId}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            ticket.severity === 'critical' || ticket.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>{ticket.severity}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{ticket.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          {ticket.location} · Detected {Math.floor((Date.now() - ticket.detectedAt) / 60000)}m ago
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">Est. Failure: {ticket.estimatedTimeToFailure}</span>
                          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-bold">Prevents: {ticket.preventedEmergencyType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                      {ticket.status === 'open' && (
                        <button 
                          onClick={() => handleAcknowledge(ticket.ticketId)}
                          className="flex-1 md:flex-none bg-blue-600/20 hover:bg-blue-600/30 text-blue-500 text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button 
                        onClick={() => handleResolve(ticket.ticketId)}
                        className="flex-1 md:flex-none bg-green-600/20 hover:bg-green-600/30 text-green-500 text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PREVENTION STATS BAR */}
            <div className="mt-8 pt-6 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Prevented</p>
                <p className="text-xl font-black text-green-500">{stats.totalPrevented} Emergencies</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Resolution Rate</p>
                <p className="text-xl font-black text-blue-500">{stats.resolutionRate}%</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Avg Lead Time</p>
                <p className="text-xl font-black text-orange-500">{stats.avgLeadTimeHours}h Before Failure</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">AI Confidence</p>
                <p className="text-xl font-black text-white">{stats.avgConfidence}% Avg</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  );
};

export default PredictiveDashboard;

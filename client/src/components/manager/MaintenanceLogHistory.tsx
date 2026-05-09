import React, { useState } from 'react';
import { usePredictiveMaintenance } from '../../hooks/usePredictiveMaintenance';
import { MaintenanceTicket, TicketStatus, TicketSeverity } from '../../types/maintenance';

const MaintenanceLogHistory: React.FC<{ propertyId: string }> = ({ propertyId }) => {
  const { tickets, stats, loading } = usePredictiveMaintenance(propertyId);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<TicketSeverity | 'all'>('all');

  const filteredTickets = tickets.filter(t => {
    const statusMatch = filterStatus === 'all' || t.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || t.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  if (loading) return <div className="animate-pulse bg-gray-900 h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      {/* STATS BAR */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span> Prevention Record
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase">Emergencies Prevented</p>
            <p className="text-2xl font-black text-green-500">{stats.totalPrevented}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase">Ticket Resolution Rate</p>
            <p className="text-2xl font-black text-blue-500">{stats.resolutionRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase">Avg Detection Lead Time</p>
            <p className="text-2xl font-black text-orange-500">{stats.avgLeadTimeHours}h</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase">Total AI Analyses</p>
            <p className="text-2xl font-black text-white">{stats.totalApiCalls}</p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800 w-full md:w-auto overflow-x-auto">
          {['all', 'open', 'acknowledged', 'resolved', 'prevented'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                filterStatus === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800 w-full md:w-auto">
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s as any)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                filterSeverity === s ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticket ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Severity</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Sensor & Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Prevention Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Detected</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTickets.map(ticket => (
                <tr key={ticket.ticketId} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-gray-400">{ticket.ticketId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      ticket.severity === 'critical' || ticket.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>{ticket.severity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white mb-0.5">{ticket.sensorName}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{ticket.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-black uppercase ${
                        ticket.status === 'resolved' || ticket.status === 'prevented' ? 'text-green-500' : 'text-blue-400'
                      }`}>
                        {ticket.status === 'resolved' ? '🛡️ Prevented Emergency' : ticket.status}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase italic">{ticket.preventedEmergencyType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-300 font-medium">{new Date(ticket.detectedAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(ticket.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-400 line-clamp-1">{ticket.trendSummary}</p>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-gray-600 italic">
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLogHistory;

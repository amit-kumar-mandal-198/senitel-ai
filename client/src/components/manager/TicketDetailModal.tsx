import React from 'react';
import { MaintenanceTicket } from '../../types/maintenance';
import { SENSORS } from '../../constants/sensorConfigs';

interface Props {
  ticket: MaintenanceTicket;
  onClose: () => void;
}

const TrendChart: React.FC<{ history: any[], sensorId: string }> = ({ history, sensorId }) => {
  const sensor = SENSORS.find(s => s.sensorId === sensorId);
  if (!sensor || history.length < 2) return null;

  const width = 600;
  const height = 180;
  const padding = 30;

  // Values for Y scale
  const values = history.map(h => h.value);
  const minVal = Math.min(...values, sensor.normalMin, sensor.criticalThreshold);
  const maxVal = Math.max(...values, sensor.normalMax, sensor.criticalThreshold);
  const range = (maxVal - minVal) * 1.2 || 1;
  const base = minVal - (range * 0.1);

  const getX = (i: number) => (i / (history.length - 1)) * (width - padding * 2) + padding;
  const getY = (v: number) => height - padding - ((v - base) / range) * (height - padding * 2);

  // Normal range band
  const normalTop = getY(sensor.normalMax);
  const normalBottom = getY(sensor.normalMin);
  
  // Critical line
  const criticalY = getY(sensor.criticalThreshold);

  // Path data (newest is history[0], so we reverse for X-axis time flow)
  const sortedHistory = [...history].reverse();
  const pathData = sortedHistory.map((h, i) => `${getX(i)},${getY(h.value)}`).join(' L ');

  return (
    <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        {/* Normal Band */}
        <rect 
          x={padding} 
          y={normalTop} 
          width={width - padding * 2} 
          height={normalBottom - normalTop} 
          fill="rgba(34, 197, 94, 0.05)"
        />
        
        {/* Grid Lines */}
        <line x1={padding} y1={normalTop} x2={width-padding} y2={normalTop} stroke="#374151" strokeDasharray="4" />
        <line x1={padding} y1={normalBottom} x2={width-padding} y2={normalBottom} stroke="#374151" strokeDasharray="4" />
        <line x1={padding} y1={criticalY} x2={width-padding} y2={criticalY} stroke="#ef4444" strokeDasharray="4" strokeWidth="2" opacity="0.5" />
        
        {/* Critical Label */}
        <text x={width - padding + 5} y={criticalY + 4} fill="#ef4444" className="text-[8px] font-black uppercase">Critical</text>

        {/* Data Line */}
        <path
          d={`M ${pathData}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {sortedHistory.map((h, i) => (
          <circle 
            key={i} 
            cx={getX(i)} 
            cy={getY(h.value)} 
            r={i === sortedHistory.length - 1 ? 4 : 2} 
            fill={i === sortedHistory.length - 1 ? '#f97316' : '#3b82f6'} 
          />
        ))}

        {/* AI Annotation */}
        <line x1={getX(history.length - 10)} y1={0} x2={getX(history.length - 10)} y2={height - padding} stroke="#3b82f6" strokeDasharray="2" opacity="0.3" />
        <text x={getX(history.length - 10)} y={20} fill="#3b82f6" className="text-[10px] font-bold uppercase" textAnchor="middle">🤖 AI Flagged Here</text>
      </svg>
    </div>
  );
};

const TicketDetailModal: React.FC<Props> = ({ ticket, onClose }) => {
  const sensor = SENSORS.find(s => s.sensorId === ticket.sensorId);
  const timeSince = Math.floor((Date.now() - ticket.detectedAt) / 60000);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl scrollbar-thin scrollbar-thumb-gray-800">
        
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md p-6 border-b border-gray-800 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                ticket.severity === 'critical' || ticket.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {ticket.severity} Severity — {ticket.ticketId}
              </span>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">{ticket.location}</span>
            </div>
            <h2 className="text-2xl font-black text-white">{ticket.title}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1">
              Detected {new Date(ticket.detectedAt).toLocaleString()} · {timeSince}m ago
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl p-2">✕</button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: AI ANALYSIS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Reasoning Box */}
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6">
              <h3 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="text-lg">🤖</span> AI Analysis Report
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Detected Trend</p>
                  <p className="text-sm font-bold text-white">{ticket.trendSummary}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-1">AI Confidence</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${ticket.confidenceScore}%` }} />
                    </div>
                    <span className="text-sm font-black text-blue-400">{ticket.confidenceScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Est. Time to Failure</p>
                  <p className="text-sm font-black text-orange-500 uppercase">{ticket.estimatedTimeToFailure}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Prevented Crisis</p>
                  <p className="text-sm font-black text-green-500 uppercase">🚫 {ticket.preventedEmergencyType}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Technical Reasoning</p>
                  <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
                    "{ticket.aiReasoning}"
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Recommended Action</p>
                  <div className="bg-gray-900/50 rounded-xl p-4 text-sm text-white space-y-2">
                    {ticket.recommendedAction.split('\n').map((line, i) => (
                      <p key={i} className="flex gap-3">
                        <span className="text-blue-500 font-black">{i+1}.</span>
                        {line.replace(/^\d+\.\s*/, '')}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SENSOR TREND CHART */}
            <div>
              <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4">Live Sensor Trend (Last 48 Points)</h3>
              <TrendChart history={ticket.sensorHistory} sensorId={ticket.sensorId} />
              <div className="mt-4 flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                <span>← 48 Reading History</span>
                <span>Current Reading: {ticket.sensorHistory[0]?.value} {sensor?.unit} →</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVENTION TIMELINE */}
          <div className="space-y-6">
            <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">Crisis Prevention Narrative</h3>
            
            <div className="relative pl-6 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
              
              {/* Timeline Item: Normal */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-950" />
                <p className="text-[10px] font-black text-gray-500 uppercase">48h Ago — Baseline</p>
                <p className="text-xs text-gray-300 font-bold mt-1">Sensor Reading Normal</p>
                <p className="text-[10px] text-gray-500">{sensor?.name} stable at {sensor?.normalMax} {sensor?.unit}</p>
              </div>

              {/* Timeline Item: Drift */}
              <div className="relative">
                <div className="absolute -left-[23px] top-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-950" />
                <p className="text-[10px] font-black text-yellow-500 uppercase">24h Ago — Anomaly</p>
                <p className="text-xs text-gray-300 font-bold mt-1">Drift Detected</p>
                <p className="text-[10px] text-gray-500">Value dropped below 7-day baseline</p>
              </div>

              {/* Timeline Item: AI */}
              <div className="relative bg-blue-600/10 border border-blue-500/20 rounded-xl p-3 -ml-2">
                <div className="absolute -left-[15px] top-4 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-950" />
                <p className="text-[10px] font-black text-blue-400 uppercase">2h Ago — Intelligence</p>
                <p className="text-xs text-white font-black mt-1">🤖 AI Analysis Triggered</p>
                <p className="text-[10px] text-blue-200/60 mt-1">Claude analyzed trend pattern. Pattern consistent with degradation.</p>
              </div>

              {/* Timeline Item: Ticket */}
              <div className="relative bg-green-600/10 border border-green-500/20 rounded-xl p-3 -ml-2">
                <div className="absolute -left-[15px] top-4 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950" />
                <p className="text-[10px] font-black text-green-400 uppercase">Instant — Protection</p>
                <p className="text-xs text-white font-black mt-1">🎫 Ticket Generated</p>
                <p className="text-[10px] text-green-200/60 mt-1">{ticket.ticketId} raised for proactive maintenance.</p>
              </div>

              {/* Timeline Item: Prevention */}
              <div className="relative border-2 border-dashed border-gray-800 rounded-xl p-3 -ml-2 opacity-50">
                <div className="absolute -left-[15px] top-4 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-950" />
                <p className="text-[10px] font-black text-gray-500 uppercase">Future — Prevented</p>
                <p className="text-xs text-gray-500 font-black mt-1 italic">🚫 {ticket.preventedEmergencyType}</p>
                <p className="text-[10px] text-gray-600 mt-1 italic">This emergency event will NOT occur if ticket is resolved.</p>
              </div>
            </div>

            <div className="pt-6">
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest py-3 rounded-xl shadow-lg transition-all active:scale-95">
                Print AI Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ActionLog {
  action_id: string;
  device_name: string;
  device_type: string;
  location: string;
  command_sent: string;
  execution_status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  response_time_ms?: number;
  timestamp: string;
}

interface FeedProps {
  logs: ActionLog[];
  onRetry?: (actionId: string) => void;
  onOverride?: (action: ActionLog) => void;
}

const statusStyles = {
  PENDING: 'text-slate-500',
  EXECUTING: 'text-amber-500 animate-pulse',
  SUCCESS: 'text-green-500',
  FAILED: 'text-red-500',
};

/**
 * Real-time scrolling feed of IoT response actions.
 */
const ActionLogFeed: React.FC<FeedProps> = ({ logs, onRetry, onOverride }) => {
  return (
    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-2">
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.div
            key={log.action_id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Type Icon Placeholder (Mapping ti-* icons) */}
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                {log.device_type === 'HVAC' && '🌬️'}
                {log.device_type === 'DOOR_LOCK' && '🔒'}
                {log.device_type === 'ELEVATOR' && '🛗'}
                {log.device_type === 'FIRE_SUPPRESSION' && '💧'}
                {log.device_type === 'LIGHTING' && '💡'}
                {log.device_type === 'NURSE_CALL' && '🔔'}
                {log.device_type === 'BACKUP_POWER' && '🔋'}
                {log.device_type === 'INFUSION_PUMP_NETWORK' && '🏥'}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h5 className="text-xs font-bold text-white">{log.device_name}</h5>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">{log.location}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {log.command_sent}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-[9px] font-black uppercase ${statusStyles[log.execution_status]}`}>
                    {log.execution_status}
                  </span>
                  {log.response_time_ms && (
                    <span className="text-[9px] text-slate-600 font-bold uppercase">
                      {log.response_time_ms}ms
                    </span>
                  )}
                  <span className="text-[9px] text-slate-600 font-bold uppercase">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {log.execution_status === 'FAILED' && (
                <button 
                  onClick={() => onRetry?.(log.action_id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded transition-colors"
                >
                  Retry
                </button>
              )}
              <button 
                onClick={() => onOverride?.(log)}
                className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase rounded transition-colors"
              >
                Override
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {logs.length === 0 && (
        <div className="py-12 text-center text-slate-600 italic text-sm font-bold">
          Waiting for system response events...
        </div>
      )}
    </div>
  );
};

export default ActionLogFeed;

import React from 'react';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ACTIVE' | 'STANDBY' | 'LOCKED' | 'UNLOCKED' | 'EXECUTING' | 'ERROR';

interface DeviceProps {
  device: {
    device_id: string;
    device_name: string;
    device_type: string;
    location: string;
    current_status: DeviceStatus;
    last_action: string;
    last_action_timestamp: string;
    is_manual_override: boolean;
  };
  onClick?: () => void;
}

const statusConfig = {
  ONLINE: { color: 'bg-green-500', label: 'Online' },
  OFFLINE: { color: 'bg-gray-500', label: 'Offline' },
  ACTIVE: { color: 'bg-green-600', label: 'Active' },
  STANDBY: { color: 'bg-yellow-500', label: 'Standby' },
  LOCKED: { color: 'bg-blue-600', label: 'Locked' },
  UNLOCKED: { color: 'bg-blue-400', label: 'Unlocked' },
  EXECUTING: { color: 'bg-amber-500 animate-pulse', label: 'Executing' },
  ERROR: { color: 'bg-red-500', label: 'Error' },
};

/**
 * Renders an individual IoT device card with real-time status indicators.
 */
const DeviceStatusCard: React.FC<DeviceProps> = ({ device, onClick }) => {
  const isLifeCritical = ['OXYGEN_VALVE', 'BACKUP_POWER', 'FIRE_SUPPRESSION'].includes(device.device_type);
  const status = statusConfig[device.current_status] || statusConfig.ONLINE;

  return (
    <div 
      onClick={onClick}
      className={`
        relative bg-slate-900 border-2 rounded-xl p-4 transition-all hover:scale-[1.02] cursor-pointer
        ${device.current_status === 'EXECUTING' ? 'ring-2 ring-amber-500/50' : ''}
        ${isLifeCritical ? 'border-red-600 shadow-lg shadow-red-900/20' : 'border-slate-800'}
      `}
    >
      {/* Badges */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          {isLifeCritical && (
            <span className="bg-red-600 text-[10px] font-black text-white px-2 py-0.5 rounded-full w-fit uppercase">
              Life Critical
            </span>
          )}
          {device.is_manual_override && (
            <span className="bg-amber-500 text-[10px] font-black text-black px-2 py-0.5 rounded-full w-fit uppercase">
              Manual Override
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${status.color}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status.label}</span>
        </div>
      </div>

      {/* Device Info */}
      <h4 className="text-sm font-bold text-white mb-0.5 truncate">{device.device_name}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase mb-4">{device.location}</p>

      {/* Last Action */}
      <div className="mt-auto pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-400 italic mb-1 truncate">
          {device.last_action || 'No recent actions'}
        </p>
        <p className="text-[9px] text-slate-600 font-bold uppercase">
          {device.last_action_timestamp ? new Date(device.last_action_timestamp).toLocaleTimeString() : '--:--'}
        </p>
      </div>

      {/* Progress bar for EXECUTING state */}
      {device.current_status === 'EXECUTING' && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800 rounded-b-xl overflow-hidden">
          <div className="h-full bg-amber-500 animate-[loading_2s_linear_infinite]" />
        </div>
      )}
    </div>
  );
};

export default DeviceStatusCard;

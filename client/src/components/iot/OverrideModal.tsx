import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (operatorId: string, command: string) => void;
  deviceName: string;
}

/**
 * Confirmation dialog for manually overriding automated IoT actions.
 */
const OverrideModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, deviceName }) => {
  const [operatorId, setOperatorId] = useState('');
  const [command, setCommand] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-xl font-black text-white">Manual Device Override</h3>
          <p className="text-sm text-slate-400 mt-1">Target Device: {deviceName}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
            <p className="text-xs text-amber-500 font-bold leading-relaxed">
              ⚠️ WARNING: You are manually overriding an automated response. This action will be logged with your operator ID. Confirm?
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Operator ID / Badge Number</label>
            <input 
              type="text" 
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="e.g. SEC-8842"
              className="w-full bg-black border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Override Command</label>
            <select 
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="w-full bg-black border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-amber-500 transition-colors"
            >
              <option value="">Select Command...</option>
              <option value="FORCE_LOCK">Force Lockdown</option>
              <option value="FORCE_UNLOCK">Force Unlock</option>
              <option value="SHUT_DOWN">Emergency Shutdown</option>
              <option value="RESTORE">Restore Automation</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-slate-950 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(operatorId, command)}
            disabled={!operatorId || !command}
            className={`
              flex-1 px-4 py-2 text-xs font-black uppercase rounded-xl transition-all
              ${!operatorId || !command ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-95'}
            `}
          >
            Confirm Override
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverrideModal;

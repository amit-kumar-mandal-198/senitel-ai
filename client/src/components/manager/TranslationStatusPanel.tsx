import React, { useState } from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { SUPPORTED_LANGUAGES } from '../../constants/alertMessages';

interface TranslationStatusPanelProps {
  emergencyId: string | null;
}

const TranslationStatusPanel: React.FC<TranslationStatusPanelProps> = ({ emergencyId }) => {
  const { translations, broadcastLog, broadcastSummary, loading } = useTranslations(emergencyId);
  const [showFullLog, setShowFullLog] = useState(false);

  if (!emergencyId || (loading && !Object.keys(translations).length)) return null;

  const logs = Object.values(broadcastLog);
  const deliveredCount = logs.filter(l => l.smsStatus === 'delivered').length;
  const pendingCount = logs.filter(l => l.smsStatus === 'sent' || l.smsStatus === 'pending').length;
  const failedCount = logs.filter(l => l.smsStatus === 'failed').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Multilingual Broadcast Status</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Safety Communications Active</p>
          </div>
        </div>

        {/* TRANSLATION PIPELINE */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Translation Pipeline</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map(lang => {
              const trans = translations[lang.code];
              const guestsWithLang = logs.filter(l => l.language === lang.code).length;
              
              if (guestsWithLang === 0 && lang.code !== 'en') return null;

              return (
                <div key={lang.code} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{lang.name}</div>
                      <div className="text-[9px] text-slate-500 font-black uppercase">
                        {guestsWithLang} guests
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {lang.code === 'en' ? (
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">✓ Master</span>
                    ) : !trans ? (
                      <span className="text-[9px] font-black text-orange-500 uppercase animate-pulse">⏳ Translating...</span>
                    ) : trans.status === 'done' ? (
                      <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">✓ Translated {lang.isRTL ? 'RTL' : ''}</span>
                    ) : (
                      <span className="text-[9px] font-black text-red-500 uppercase">✗ Failed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DELIVERY SUMMARY */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery Summary</h4>
            <div className="text-xs font-black text-white">
              {deliveredCount} / {logs.length} SMS Sent
            </div>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-1000"
              style={{ width: `${(deliveredCount / logs.length) * 100 || 0}%` }}
            />
          </div>
          <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
            <span className="text-green-500">{deliveredCount} Delivered</span>
            <span className="text-orange-500">{pendingCount} Pending</span>
            <span className="text-red-500">{failedCount} Failed</span>
          </div>
        </div>

        {/* API EFFICIENCY */}
        {broadcastSummary && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] font-bold text-slate-500">
            <div className="flex gap-4">
              <span>{broadcastSummary.translationApiCalls} Claude API calls</span>
              <span>{broadcastSummary.translationCacheHits} Cache hits</span>
            </div>
            <span className="text-blue-500">Est. Cost: ~$0.003</span>
          </div>
        )}

        <button 
          onClick={() => setShowFullLog(!showFullLog)}
          className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
        >
          {showFullLog ? '↑ Hide Delivery Log' : '↓ View Full Delivery Log'}
        </button>
      </div>

      {showFullLog && (
        <div className="border-t border-slate-800 bg-slate-950 overflow-x-auto">
          <table className="w-full text-left text-[10px] font-bold">
            <thead className="bg-slate-900 text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">SMS Status</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map(log => (
                <tr key={log.guestId} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 text-white">R{log.roomNumber}</td>
                  <td className="px-4 py-3 text-slate-300 uppercase">{log.guestName}</td>
                  <td className="px-4 py-3 text-slate-400">{SUPPORTED_LANGUAGES.find(l => l.code === log.language)?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`uppercase ${
                      log.smsStatus === 'delivered' ? 'text-green-500' : 
                      log.smsStatus === 'failed' ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {log.smsStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">
                    {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TranslationStatusPanel;

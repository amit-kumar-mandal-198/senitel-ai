import React, { useState, useEffect } from 'react';
import { generateResponderLink, revokeResponderLink, getActiveLinksForEmergency } from '../../services/responderLinkService';
import { ValidatedLink } from '../../types/responder';

interface DispatchLinkPanelProps {
  emergencyId: string;
  propertyId: string;
}

const DispatchLinkPanel: React.FC<DispatchLinkPanelProps> = ({ emergencyId, propertyId }) => {
  const [activeLinks, setActiveLinks] = useState<ValidatedLink[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = getActiveLinksForEmergency(emergencyId, (links) => {
      setActiveLinks(links);
    });
    return () => unsubscribe();
  }, [emergencyId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // In a real app, propertyName and createdBy would come from context/props
      await generateResponderLink(
        emergencyId,
        propertyId,
        "Grand Hyatt Mumbai - Floor 4",
        "Manager-01"
      );
    } catch (error) {
      alert("Failed to generate dispatch link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopyFeedback(url);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleRevoke = async (token: string) => {
    if (!window.confirm("This will immediately disconnect any first responders using this link. Are you sure?")) return;
    try {
      await revokeResponderLink(token);
    } catch (error) {
      alert("Failed to revoke link.");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🚨</span>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Dispatch to First Responders</h3>
          <p className="text-xs text-slate-400 font-bold">Share a secure live view with on-site emergency services. No login required.</p>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-lg text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50"
      >
        {isGenerating ? "Generating..." : "Generate Dispatch Link"}
      </button>

      {activeLinks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Dispatch Links</h4>
          <div className="space-y-3">
            {activeLinks.map((link) => (
              <ActiveLinkItem 
                key={link.token} 
                link={link} 
                onCopy={handleCopy} 
                onRevoke={handleRevoke}
                isCopied={copyFeedback === `${window.location.origin}/responder/${link.token}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ActiveLinkItem: React.FC<{ 
  link: ValidatedLink; 
  onCopy: (url: string) => void; 
  onRevoke: (token: string) => void;
  isCopied: boolean;
}> = ({ link, onCopy, onRevoke, isCopied }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const url = `${window.location.origin}/responder/${link.token}`;

  useEffect(() => {
    const updateTimer = () => {
      const remaining = link.expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [link.expiresAt]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">{url}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">👁 {link.accessCount} views</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onCopy(url)}
          className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2 rounded transition-colors ${
            isCopied ? "bg-green-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {isCopied ? "✓ Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => window.open(url, '_blank')}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider py-2 rounded transition-colors"
        >
          Open View
        </button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${timeLeft === "Expired" ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
          <span className={`text-[10px] font-bold uppercase ${timeLeft === "Expired" ? "text-red-500" : "text-slate-400"}`}>
            Expires in: {timeLeft}
          </span>
        </div>
        <button
          onClick={() => onRevoke(link.token)}
          className="text-[10px] font-black text-red-500 uppercase hover:underline"
        >
          Revoke Link
        </button>
      </div>
    </div>
  );
};

export default DispatchLinkPanel;

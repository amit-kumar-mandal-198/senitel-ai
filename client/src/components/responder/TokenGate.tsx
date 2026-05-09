import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { validateResponderToken } from '../../services/responderLinkService';
import { ValidatedLink } from '../../types/responder';

interface TokenGateProps {
  children: (linkData: ValidatedLink) => React.ReactNode;
}

const TokenGate: React.FC<TokenGateProps> = ({ children }) => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"expired" | "revoked" | "not_found" | null>(null);
  const [linkData, setLinkData] = useState<ValidatedLink | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("not_found");
        setLoading(false);
        return;
      }

      const result = await validateResponderToken(token);
      if (result.valid) {
        setLinkData(result.linkData);
      } else {
        setError(result.reason);
      }
      setLoading(false);
    };

    checkToken();
  }, [token]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] flex flex-col items-center justify-center text-white space-y-6">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Verifying secure access...</p>
      </div>
    );
  }

  if (error || !linkData) {
    const errorInfo = {
      expired: {
        title: "This link has expired",
        sub: "Valid for 4 hours only.",
        instr: "Contact the incident commander for a new link."
      },
      revoked: {
        title: "This link was revoked",
        sub: "Access has been removed",
        instr: "by the incident commander."
      },
      not_found: {
        title: "Invalid access link",
        sub: "This link does not exist.",
        instr: "Verify the URL and retry."
      }
    }[error || "not_found"];

    return (
      <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border-2 border-red-900/30 p-10 rounded-3xl space-y-6 shadow-2xl">
          <div className="text-6xl text-red-500 mb-2">🔒</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight">{errorInfo.title}</h1>
            <p className="text-slate-400 font-bold">{errorInfo.sub}</p>
          </div>
          <p className="text-sm text-slate-500 font-medium pt-4 border-t border-slate-800">
            {errorInfo.instr}
          </p>
        </div>
      </div>
    );
  }

  return <>{children(linkData)}</>;
};

export default TokenGate;

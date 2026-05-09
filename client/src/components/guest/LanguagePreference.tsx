import React, { useState, useEffect } from 'react';
import { getDatabase, ref, update, onValue } from 'firebase/database';
import { SUPPORTED_LANGUAGES } from '../../constants/alertMessages';

interface LanguagePreferenceProps {
  guestId: string;
}

const LanguagePreference: React.FC<LanguagePreferenceProps> = ({ guestId }) => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isSaved, setIsSaved] = useState(false);
  const db = getDatabase();

  useEffect(() => {
    // Load existing preference
    const guestRef = ref(db, `guests/${guestId}/language`);
    const unsubscribe = onValue(guestRef, (snapshot) => {
      if (snapshot.exists()) {
        setSelectedLang(snapshot.val());
      } else {
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0];
        const isSupported = SUPPORTED_LANGUAGES.some(l => l.code === browserLang);
        setSelectedLang(isSupported ? browserLang : 'en');
      }
    });

    return () => unsubscribe();
  }, [guestId]);

  const handleLanguageChange = async (newLang: string) => {
    setSelectedLang(newLang);
    try {
      await update(ref(db, `guests/${guestId}`), {
        language: newLang
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🌐</span>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Your Alert Language</h3>
          <p className="text-[10px] text-slate-400 font-bold">Emergency alerts will be sent in your chosen language.</p>
        </div>
      </div>

      <div className="relative">
        <select
          value={selectedLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.native} — {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          ▼
        </div>
      </div>

      {isSaved && (
        <p className="text-[10px] text-green-500 font-black uppercase text-center animate-fade-in">
          ✓ Saved automatically
        </p>
      )}
    </div>
  );
};

export default LanguagePreference;

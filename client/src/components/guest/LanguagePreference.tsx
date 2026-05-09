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
    <div className="dash-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🌐</span>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Alert Language
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
            Choose your preferred language.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <select
          value={selectedLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            appearance: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} style={{ color: '#000', background: '#fff' }}>
              {lang.flag} {lang.native} — {lang.name}
            </option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--text-tertiary)',
          fontSize: '10px'
        }}>
          ▼
        </div>
      </div>

      {isSaved && (
        <p style={{ margin: '12px 0 0 0', fontSize: '11px', color: '#10B981', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center', animation: 'pulse-glow 2s infinite alternate' }}>
          ✓ Saved automatically
        </p>
      )}
    </div>
  );
};

export default LanguagePreference;

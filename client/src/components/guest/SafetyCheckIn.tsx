import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { markGuestSafe, EmergencyRecord, MusterEntry } from '../../services/musterService';
import { getTranslationForGuest } from '../../services/translationService';
import { TranslatedAlert } from '../../types/translation';

interface GuestIdentity {
  id: string;
  name: string;
  roomNumber: string;
  language?: string;
}

// Mock Auth Hook - In a real app, this would come from an AuthContext
const useAuth = (db: any): GuestIdentity => {
  const [guest, setGuest] = useState<GuestIdentity>({
    id: 'guest_123',
    name: 'Satyam Kushwaha',
    roomNumber: '302',
    language: 'en'
  });

  useEffect(() => {
    // Try to get real guest language from Firebase if seeded
    const guestRef = ref(db, `guests/guest_123`);
    onValue(guestRef, (snap) => {
      if (snap.exists()) setGuest({ ...snap.val(), id: snap.key });
    }, { onlyOnce: true });
  }, [db]);

  return guest;
};

const SafetyCheckIn: React.FC = () => {
  const db = getDatabase();
  const guest = useAuth(db);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRecord | null>(null);
  const [musterEntry, setMusterEntry] = useState<MusterEntry | null>(null);
  const [status, setStatus] = useState<'idle' | 'emergency' | 'confirmed'>('idle');
  const [translation, setTranslation] = useState<TranslatedAlert | null>(null);

  useEffect(() => {
    const emergenciesRef = ref(db, 'emergencies');
    const activeQuery = query(emergenciesRef, orderByChild('status'), equalTo('active'), limitToLast(1));

    const unsubscribe = onValue(activeQuery, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const emergencyId = Object.keys(data)[0];
        const emergency = { id: emergencyId, ...data[emergencyId] } as EmergencyRecord;
        setActiveEmergency(emergency);
        
        // Fetch Translation
        if (guest.language) {
          const trans = await getTranslationForGuest(emergencyId, guest.language);
          setTranslation(trans);
        }
        
        const guestMusterRef = ref(db, `emergencies/${emergencyId}/muster/${guest.roomNumber}`);
        onValue(guestMusterRef, (musterSnap) => {
          if (musterSnap.exists()) {
            const entry = musterSnap.val() as MusterEntry;
            setMusterEntry(entry);
            setStatus(entry.status === 'safe' ? 'confirmed' : 'emergency');
          }
        }, { onlyOnce: true });
      } else {
        setActiveEmergency(null);
        setStatus('idle');
      }
    });

    return () => unsubscribe();
  }, [guest.roomNumber, guest.language, db]);

  const handleMarkSafe = async () => {
    if (!activeEmergency || !activeEmergency.id) return;
    try {
      await markGuestSafe(activeEmergency.id, guest.roomNumber, guest.id);
      setStatus('confirmed');
    } catch (error) {
      alert('Failed to mark as safe.');
    }
  };

  if (status === 'idle') return null;

  const isRTL = translation?.isRTL || false;

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-white transition-colors duration-500 ${
        status === 'confirmed' ? 'bg-green-600' : 'bg-red-600'
      } ${isRTL ? 'text-right' : 'text-center'}`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="animate-bounce text-center">
          <span className="text-8xl" role="img" aria-label="Warning">⚠️</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight uppercase">
            {status === 'confirmed' 
              ? (translation?.cta ? `${translation.cta} ✓` : 'Safe Confirmed') 
              : (translation?.title || 'Emergency Evacuation')}
          </h1>
          <p className="text-xl font-medium opacity-90">
            {status === 'confirmed' 
              ? (translation?.isRTL ? 'تم تسجيل حالتك' : 'Your safety status has been logged.') 
              : 'IN PROGRESS'}
          </p>
        </div>

        <p className="text-lg leading-relaxed">
          {status === 'confirmed'
            ? (translation?.isRTL ? 'يرجى البقاء في مكان آمن.' : 'Please remain in a safe location.')
            : (translation?.body || 'Please evacuate immediately. Once safe, tap the button below.')}
        </p>

        <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <p className="text-sm uppercase tracking-widest opacity-60">Guest Details</p>
          <p className="text-xl font-bold">{guest.name}</p>
          <p className="text-lg">Room {guest.roomNumber}</p>
        </div>

        <button
          onClick={handleMarkSafe}
          disabled={status === 'confirmed'}
          className={`w-full py-6 rounded-2xl text-2xl font-black shadow-2xl transform active:scale-95 transition-all duration-300 ${
            status === 'confirmed'
              ? 'bg-white/20 cursor-not-allowed border-2 border-white/50'
              : 'bg-green-500 hover:bg-green-400 border-b-8 border-green-700 hover:border-b-4'
          }`}
        >
          {status === 'confirmed' 
            ? `✓ ${translation?.cta || 'Confirmed'} — ${guest.name.split(' ')[0]}` 
            : (translation?.cta || '✓ I AM SAFE')}
        </button>

        <div className="flex flex-col items-center gap-2 opacity-60">
          {status !== 'confirmed' && <p className="text-sm animate-pulse">Sharing location with emergency response team...</p>}
          <p className="text-[10px] font-bold uppercase tracking-widest">
            🌐 Displaying in: {translation?.langName || 'English'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyCheckIn;

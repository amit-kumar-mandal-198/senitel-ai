import { getDatabase, ref, set, remove } from 'firebase/database';

const db = getDatabase();

export const DEMO_GUESTS = [
  { id: 'g1', name: 'Yuki Tanaka', roomNumber: '101', floor: 1, language: 'ja', phone: '+81-90-0000-0001' },
  { id: 'g2', name: 'Ahmed Al-Rashid', roomNumber: '102', floor: 1, language: 'ar', phone: '+966-50-000-0002', whatsapp: '+966-50-000-0002' },
  { id: 'g3', name: 'Priya Sharma', roomNumber: '103', floor: 1, language: 'hi', phone: '+91-98000-00003' },
  { id: 'g4', name: 'Hans Mueller', roomNumber: '104', floor: 1, language: 'de', phone: '+49-170-000-0004' },
  { id: 'g5', name: 'Sarah Johnson', roomNumber: '105', floor: 1, language: 'en', phone: '+1-555-000-0005' },
  { id: 'g6', name: 'Wei Zhang', roomNumber: '201', floor: 2, language: 'zh', phone: '+86-138-0000-0006' },
  { id: 'g7', name: 'Marie Dubois', roomNumber: '202', floor: 2, language: 'fr', phone: '+33-6-00-00-00-07' },
  { id: 'g8', name: 'Ji-ho Kim', roomNumber: '203', floor: 2, language: 'ko', phone: '+82-10-0000-0008' },
  { id: 'g9', name: 'Carlos Silva', roomNumber: '204', floor: 2, language: 'pt', phone: '+55-11-00000-0009' },
  { id: 'g10', name: 'Fatima Malik', roomNumber: '205', floor: 2, language: 'ur', phone: '+92-300-0000-010' }
];

export const seedDemoGuests = async () => {
  console.log("[Demo] Seeding multilingual guests...");
  const guestsRef = ref(db, 'guests');
  const now = Date.now();
  
  const updates: any = {};
  DEMO_GUESTS.forEach(guest => {
    updates[guest.id] = {
      ...guest,
      checkInDate: now - (24 * 60 * 60 * 1000), // Yesterday
      checkOutDate: now + (48 * 60 * 60 * 1000) // 2 days from now
    };
  });
  
  await set(guestsRef, updates);
  return DEMO_GUESTS;
};

export const resetDemoGuests = async () => {
  console.log("[Demo] Resetting guest database...");
  await remove(ref(db, 'guests'));
  return seedDemoGuests();
};

import * as admin from 'firebase-admin';
import { config } from '../config/channels.config';

if (!admin.apps.length && config.firebase.projectId) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.firebase.projectId,
            clientEmail: config.firebase.clientEmail,
            privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n').replace(/^"(.*)"$/, '$1'),
        }),
    });
}

const db = admin.firestore();

export class FirestoreService {
    /**
     * Get the full hotel overview including floors and rooms
     */
    static async getHotelOverview() {
        const hotelSnapshot = await db.collection('hotels').limit(1).get();
        if (hotelSnapshot.empty) return null;

        const hotelDoc = hotelSnapshot.docs[0];
        const hotelData = hotelDoc.data();

        // Get floors
        const floorsSnapshot = await hotelDoc.ref.collection('floors').orderBy('level').get();
        const floors = await Promise.all(floorsSnapshot.docs.map(async (floorDoc) => {
            const floorData = floorDoc.data();
            
            // Get rooms for each floor
            const roomsSnapshot = await floorDoc.ref.collection('rooms').orderBy('number').get();
            const rooms = roomsSnapshot.docs.map(roomDoc => ({
                id: roomDoc.id,
                ...roomDoc.data()
            }));

            return {
                id: floorDoc.id,
                ...floorData,
                rooms
            };
        }));

        return {
            id: hotelDoc.id,
            ...hotelData,
            floors
        };
    }

    /**
     * Trigger a new incident
     */
    static async triggerIncident(data: { type: string, severity: string, roomNum?: string, floorNum?: number, note?: string }) {
        const incidentRef = await db.collection('incidents').add({
            ...data,
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        const doc = await incidentRef.get();
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Get recent incidents
     */
    static async getRecentIncidents(limit = 10) {
        const snapshot = await db.collection('incidents')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data().createdAt as admin.firestore.Timestamp)?.toDate()
        }));
    }

    /**
     * Resolve an active incident
     */
    static async resolveIncident(id: string) {
        const incidentRef = db.collection('incidents').doc(id);
        await incidentRef.update({
            status: 'resolved',
            resolvedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        const doc = await incidentRef.get();
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Get all staff
     */
    static async getStaff() {
        const snapshot = await db.collection('staff').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    /**
     * Dispatch staff to a specific floor
     */
    static async dispatchStaffToFloor(floorNum: number) {
        const snapshot = await db.collection('staff')
            .where('status', '==', 'on_duty')
            .get();
        
        const promises = snapshot.docs
            .filter(doc => doc.data().location?.includes(floorNum.toString()))
            .map(doc => doc.ref.update({ status: 'dispatched' }));
        
        await Promise.all(promises);
    }
}

export { db };

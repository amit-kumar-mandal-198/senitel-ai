import * as admin from 'firebase-admin';

const firebaseConfig = {
    projectId: "sentinel-ai-242fc",
    clientEmail: "firebase-adminsdk-fbsvc@sentinel-ai-242fc.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD6nGG3fb4Cm/21\nDAhqLtIFLvBkj2vVSVsOu7RePcOVzTzCjQSGTX/p824M4YNEpA/vcvf30ukHJWhE\nOBWmqVnRamVxSaA+trcu4ixiAFC5WiuyK9ptSFmwks4R1bsiq5cg2FYlnyh57LIb\ncDHDVddzeC2+V+7A23z/dEOSwAopnmXhW0F29LdfaYrhgtcerNoD3pT8kLNY9zs5\nqrjW1cIAvmoFygSSUqvsaGzqSpDT6TgBbjUyyRrx51nZ/KNiPoXQZ5nCjTe12piy\ngmUJd7xXw4z8C4PgUIjNb4/+tkivjQ0DicYq5t1zdiKh1ihhfPv3WzbRx6AHVycU\nba8/V7ztAgMBAAECggEAANpNXtF3twyO1XHgCXR1VH0vZjgytrwUKj2rRHLTWowj\nO8o9DLPwznv8kOCnkLE6OKdcfqRiFJsk+q5yLGoBGzxQcg09FVmL0AYG/qJfo/HR\nmj6Z9Ks9WuN0/gyLIXgSAJOb327mNVv/0yYTlUWSgRsUlMQ51MAqcbgUjshGgJO+\nrbR7hVnjMxoASo2r3SD3lr8unn0otrFIZUezyhZj4I0uuTEOfmebNlLfLl1WwPn0\nCZzpYm2DmiVcZ+e9dR4h4wKgbLTlXrSyokqeCYekE7V0LTiVD+/WSqbRKcE0k7iH\nvAmrDynTqViVKaatvhhvy0EDBQy/veudFDwBTivGxQKBgQD/g7nYvpmpQsGO4Clp\nr7yaMLHV+CgmfJlD0H12OfEt9jbU7W85N+XxkmgOgILXJWO5QSSDPEHsbfabyc2U\nTXXkaQvX6uv3KmjSBCGHFTbj4lUo0+bmMNMGuLDMLzlYpOp7MsRHuZj8tVbHz3Zq\XHvlLoKh5hc4MEuulp5btXRZuwKBgQD7FkVPp9CqQANfPjw/vlfkUJFZOXhjtDEY\nDl+xD3wnDMHQXFaQRstNX6UZQ0zBWw4WyGHORdrzNeuEW8h429r+Of9rXG2BSe6E\nHEvTdAx9Xdy6oPU5NxFV5Y2dRU6jNiKe8HPgNuNRC+eq6YQGmglAd4/x1iSXSW9Y\nhb/Ibj4ldwKBgQDL7AVWxkc8ntp7fMuQXYDYTiSf7/2bObXYOXzn7jZdyDLanOQ3\ndjU+JuqFKGtD6cM9BpBtbJnwZ5J5owU/ZtLACFY7bHIGQQKHGmTnujakiO4ON5AA\nBtdkdeIkE0xhQr0gtdOQqr8+cDtiHGEVYdo/fm8jZs8BOQotvGeGKbtCIQKBgAOa\n7UHYigF3y9SZQyozJHXtxjh+v8DGvJG42xziuQiigUHpoYCO06p3vhofwkFgelJP\nbEAW9q7ZTllnK/i4R2uxD37OI/BgTGFvOpN9rhQ6vcmcOAkrRj9yfVcNwLRNObAI\nidFlWFw4jIoCsleZ7JoVXWa+iWX2sveVbAyHsLK/AoGBAOdW1VVtZ7g4vyiMOcOx\nzQuIxDfmPf86XWXwhAJJjpISCntoX/We+eoiMazQYFMqNPyfmTmOo8Ltbrj3XrfJ\nrZfQFrCyS6VsSs+M2iBjcvqKu3gav0DeFafRccGeEcFcaF2Y7K62jCxEZeApEeNd\nCxwf3sk/jQYd7KeBdIIj0Zgd\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
    });
}

const db = admin.firestore();

async function main() {
    console.log('🚀 Starting Firebase seeding...');

    // 1. Create Hotel
    const hotelRef = db.collection('hotels').doc('grand-hotel');
    await hotelRef.set({
        name: 'Grand Hotel',
        location: 'City Center',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Create Floors
    for (let f = 1; f <= 3; f++) {
        const floorRef = hotelRef.collection('floors').doc(`floor-${f}`);
        await floorRef.set({
            level: f,
            hotelId: 'grand-hotel'
        });

        // 3. Create 10 Rooms per floor
        for (let r = 1; r <= 10; r++) {
            const roomNum = `${f}${r < 10 ? '0' : ''}${r}`;
            let type = 'standard';
            if (r % 5 === 0) type = 'suite';
            else if (r % 3 === 0) type = 'deluxe';

            const isOccupied = Math.random() > 0.3;
            const status = r === 6 && f === 1 ? 'maintenance' : (isOccupied ? 'occupied' : 'vacant');

            const roomRef = floorRef.collection('rooms').doc(`room-${roomNum}`);
            await roomRef.set({
                number: roomNum,
                type,
                status,
                floorId: f
            });

            // 4. Create Guest if occupied
            if (status === 'occupied') {
                const firstNames = ['Amit', 'Priya', 'Raj', 'Anita', 'Vikram', 'Meera', 'Suresh', 'Neha', 'Rahul', 'Kavita'];
                const lastNames = ['Patel', 'Sharma', 'Singh', 'Desai', 'Nair', 'Kumar', 'Joshi', 'Gupta'];
                const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
                
                await roomRef.collection('guests').add({
                    name,
                    phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
                    checkIn: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    }

    // 5. Create Staff
    const staffMembers = [
        { name: 'Rajesh Kumar', role: 'Security Lead', status: 'on_duty', location: 'Floor 3', phone: 'ext. 301' },
        { name: 'Priya Sharma', role: 'Front Desk Manager', status: 'on_duty', location: 'Lobby', phone: 'ext. 100' },
        { name: 'Vikram Singh', role: 'Maintenance Head', status: 'on_duty', location: 'Floor 1', phone: 'ext. 150' },
        { name: 'Anita Desai', role: 'Security Guard', status: 'on_duty', location: 'Floor 2', phone: 'ext. 202' },
        { name: 'Suresh Patel', role: 'Housekeeping Lead', status: 'off_duty', location: '—', phone: 'ext. 160' },
        { name: 'Meera Nair', role: 'Hotel Doctor', status: 'on_call', location: 'Medical Room', phone: 'ext. 911' },
    ];
    for (const s of staffMembers) {
        await db.collection('staff').add(s);
    }

    // 6. Historic Incidents
    const historicIncidents = [
        { type: 'fire_drill', severity: 'medium', status: 'resolved', note: 'Scheduled drill', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
        { type: 'water_leak', roomNum: '205', floorNum: 2, severity: 'low', status: 'resolved', note: 'Bathroom pipe leak', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
        { type: 'medical', roomNum: '308', floorNum: 3, severity: 'high', status: 'resolved', note: 'Guest medical distress', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
    ];
    for (const i of historicIncidents) {
        await db.collection('incidents').add(i);
    }

    console.log('✅ Firebase seeding complete!');
}

main().catch(console.error);

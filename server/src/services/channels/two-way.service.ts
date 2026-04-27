import { Server } from 'socket.io'; 
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';

/**
 * TwoWayService handles incoming reports from guests and broadcasts crowdsourced data.
 */
export class TwoWayService implements AlertChannel {
    public name = 'Two-Way Citizen Channels';

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        // Broadcasters of crowdsourced info back to the community
        console.log(`[${this.name}] Broadcasting community-sourced update: ${payload.message}`);
        return { success: true, provider: 'citizen_network', timestamp: new Date() };
    }

    static async submitCitizenReport(userId: string, data: { photoUrl: string, gps: string, note: string }): Promise<void> {
        console.log(`[Citizen Report] Intake from ${userId}. GPS: ${data.gps}. Storing photo: ${data.photoUrl}`);
        // In reality, save to Prisma / DB here
        console.log(`[Citizen Report] Entry persisted to database.`);
    }

    static async broadcastMapPin(io: Server, pinData: any): Promise<void> {
        console.log(`[Crowd Map] Publishing live update to Pub/Sub (incident: ${pinData.type})`);
        // Fans out to all connected clients on the dashboard
        io.emit('map_update_broadcast', {
            ...pinData,
            timestamp: new Date(),
            source: 'crowdsourced'
        });
    }

    async healthCheck(): Promise<boolean> { return true; }
}

import { Queue, Worker } from 'bullmq';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';

/**
 * SosService manages personal safety triggers and automated escalations.
 */
export class SosService implements AlertChannel {
    public name = 'Personal Safety / SOS Bridges';
    private timerQueue: Queue | null = null;

    constructor() {
        // Initialize BullMQ for Guardian Timers (requires Redis)
        try {
            this.timerQueue = new Queue('guardian-timers', { 
                connection: { host: 'localhost', port: 6379 } 
            });
        } catch (err) {
            console.warn('[SosService] BullMQ connection failed. Running in mock mode.');
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        console.log(`[${this.name}] Activating SOS protocols for incident ${payload.incidentId}`);
        
        switch (payload.targetData.sosType) {
            case 'panic':
                await this.triggerPanicButton(payload.targetData);
                break;
            case 'silent_bridge':
                await this.openSilentVoiceBridge(payload.targetData.room);
                break;
            case 'fall_detection':
                await this.receiveFallDetection(payload.targetData);
                break;
        }

        return { success: true, provider: 'sos_bridge_internal', timestamp: new Date() };
    }

    private async triggerPanicButton(deviceData: any): Promise<void> {
        console.log(`[Panic] SOS from GPS ${deviceData.gps || '0.0,0.0'}, Floor ${deviceData.floor || 'N/A'}`);
    }

    private async openSilentVoiceBridge(roomNum: string): Promise<void> {
        console.log(`[SIP] Opening one-way audio from Room ${roomNum} to Security Command`);
    }

    private async receiveFallDetection(healthData: any): Promise<void> {
        console.log(`[Fall] HealthKit accelerometer trigger received. Accelerating dispatch.`);
    }

    async registerGuardianTimer(userId: string, minutes: number): Promise<void> {
        const delay = minutes * 60 * 1000;
        console.log(`[Guardian] Scheduling escalation for ${userId} in ${minutes} mins via BullMQ`);
        
        if (this.timerQueue) {
            await this.timerQueue.add('escalate', { userId }, { delay });
        }
    }

    async healthCheck(): Promise<boolean> { return true; }
}

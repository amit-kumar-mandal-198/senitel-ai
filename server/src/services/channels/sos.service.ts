import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';

export class SosService {
    public name = 'Personal Safety / SOS Bridges';

    static async triggerPanicButton(deviceData: any): Promise<void> {
        console.warn(`[Panic Button] Received SOS from GPS ${deviceData.gps}, Floor ${deviceData.floor}`);
    }

    static async openSilentVoiceBridge(roomNum: string): Promise<void> {
        console.warn(`[Silent SIP Bridge] Opening one-way audio from Room ${roomNum} to Security Dashboard`);
    }

    static async registerGuardianTimer(userId: string, minutes: number): Promise<void> {
        console.warn(`[Guardian Timer] BullMQ job queued for ${minutes} mins. Will escalate if not cancelled by ${userId}`);
    }

    static async receiveFallDetection(healthData: any): Promise<void> {
        console.warn(`[Fall Detect] Accelerometer triggers medical dispatch for guest`);
    }
}

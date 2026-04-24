import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';

export class IoTService implements AlertChannel {
    public name = 'Hospitality IoT Controller';

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        const floor = payload.targetData.floor || 'ALL';
        console.warn(`[${this.name}] Triggering IoT overrides for floor ${floor}`);
        
        // 1. Smart TV Override (CEC)
        console.warn(` -> TV Override: Forcing displays to Evacuation Map`);
        
        // 2. Smart Lighting (Zigbee / DALI)
        if (payload.severity === 'critical') {
            console.warn(` -> Lighting: Pulsing Red/Strobe on emergency escape paths`);
        } else {
            console.warn(` -> Lighting: Full brightness to assist egress`);
        }

        // 3. Smart Drapes (Z-Wave)
        if (payload.message.toLowerCase().includes('shooter') || payload.message.toLowerCase().includes('lockdown')) {
            console.warn(` -> Drapes: Auto-closing all room drapes`);
        }

        // 4. BLE Lock Override
        console.warn(` -> Locks: Sealing external doors, unlocking interior stairwells`);

        return { 
            success: true, 
            provider: 'iot_hub_mock', 
            timestamp: new Date(),
            metadata: { devicesTriggered: 154 }
        };
    }

    async healthCheck(): Promise<boolean> { return true; }
}

// Occupancy Sensor Read Mock (Provides data to routing, not strictly a message sender, 
// but added for completion of the IoT scope)
export class OccupancyService {
    static async getDenseFloors(): Promise<number[]> {
        console.warn('[Occupancy PIR] Mocking high-density floor return');
        return [2, 3];
    }
}

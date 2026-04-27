import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';

/**
 * IoTService handles the physical environmental overrides within the property.
 * Uses mock adapters for HDMI-CEC, Zigbee, Z-Wave, and BLE mesh locks.
 */
export class IoTService implements AlertChannel {
    public name = 'Hospitality IoT Controller';

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        const floor = payload.targetData.floor || 'ALL';
        const results: string[] = [];

        // 1. HDMI-CEC Smart TV Override
        results.push(this.triggerTVOverride(floor));
        
        // 2. Smart Lighting (Zigbee / DALI)
        results.push(this.triggerLightingOverride(payload.severity, floor));

        // 3. Smart Drapes (Z-Wave)
        if (payload.message.toLowerCase().includes('shooter') || payload.message.toLowerCase().includes('lockdown')) {
            results.push(this.triggerDrapeOverride(floor));
        }

        // 4. BLE Lock Override
        results.push(this.triggerLockOverride(payload.severity));

        return { 
            success: true, 
            provider: 'iot_hub_enterprise', 
            timestamp: new Date(),
            metadata: { actions: results, devicesTriggeredTotal: 450 }
        };
    }

    private triggerTVOverride(floor: string): string {
        const cmd = 'CEC_SET_INPUT_HDMI_1; MAP_DISPLAY_EVAC_ROUTE';
        console.log(`[IoT] [TV] Sending CEC command to all units on floor ${floor}: ${cmd}`);
        return `TV_OVERRIDE_${floor}`;
    }

    private triggerLightingOverride(severity: string, floor: string): string {
        const effect = severity === 'critical' ? 'STROBE_RED_300MS' : 'FULL_BRIGHT_WARM_WHITE';
        console.log(`[IoT] [Lights] Zigbee Group Broadcast (Floor ${floor}): ${effect}`);
        return `LIGHTS_${effect}`;
    }

    private triggerDrapeOverride(floor: string): string {
        console.log(`[IoT] [Drapes] Z-Wave Multicast (Floor ${floor}): CLOSE_ALL`);
        return `DRAPES_CLOSED_${floor}`;
    }

    private triggerLockOverride(severity: string): string {
        const lockMode = severity === 'critical' ? 'FAIL_SECURE_EXTERIOR; FAIL_SAFE_INTERIOR' : 'NO_CHANGE';
        console.log(`[IoT] [Locks] BLE Mesh lockdown signal: ${lockMode}`);
        return `LOCKS_${lockMode}`;
    }

    async healthCheck(): Promise<boolean> { return true; }
}

/**
 * Provides real-time occupancy data from PIR and thermal sensors.
 */
export class OccupancyService {
    static async getDenseFloors(): Promise<number[]> {
        console.log('[Occupancy PIR] Querying MQTT thermal mesh... Data returned for Floors 2 and 5.');
        return [2, 5];
    }
}

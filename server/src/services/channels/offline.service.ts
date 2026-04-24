import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';

// LoRa Mesh Network for Infrastructure-Failure delivery
export class LoraMeshService implements AlertChannel {
    public name = 'LoRa Mesh (DisasterMesh)';
    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        console.warn(`[${this.name}] Broadcasting MQTT payload to Mosquitto store-and-forward queue for Heltec LoRa32`);
        return { success: true, provider: 'lora_mock', timestamp: new Date() };
    }
    async healthCheck(): Promise<boolean> { return true; }
}

export class BleService implements AlertChannel {
    public name = 'BLE Beacon Delivery';
    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        console.warn(`[${this.name}] Broadcasting via Core Bluetooth background mode to local meshes`);
        return { success: true, provider: 'ble_mock', timestamp: new Date() };
    }
    async healthCheck(): Promise<boolean> { return true; }
}

export class SatelliteService implements AlertChannel {
    public name = 'Satellite Fallback (Starlink/Iridium)';
    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        console.warn(`[${this.name}] Uploading SBD over Iridium as absolute fallback`);
        return { success: true, provider: 'iridium_mock', timestamp: new Date() };
    }
    async healthCheck(): Promise<boolean> { return true; }
}

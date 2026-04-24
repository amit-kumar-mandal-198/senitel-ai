import twilio from 'twilio';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class VoiceService implements AlertChannel {
    public name = 'Voice/IVR (Twilio)';
    private client: twilio.Twilio | null = null;

    constructor() {
        if (isChannelConfigured('twilio')) {
            this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!this.client || !config.twilio.phoneNumber) {
            console.warn(`[${this.name}] Not configured. Simulating Voice Call to ${payload.targetData.phone}: ${payload.message}`);
            return { success: true, provider: 'simulated_twilio_voice', timestamp: new Date(), metadata: { simulated: true } };
        }

        try {
            const call = await this.client.calls.create({
                twiml: `<Response><Say voice="Polly.Matthew">This is a Sentinel AI Emergency Broadcast. ${payload.message}</Say></Response>`,
                from: config.twilio.phoneNumber,
                to: payload.targetData.phone
            });
            return { success: true, provider: 'twilio_voice', timestamp: new Date(), metadata: { callId: call.sid } };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            return { success: false, provider: 'twilio_voice', timestamp: new Date(), error: error.message };
        }
    }

    async healthCheck(): Promise<boolean> { return !!this.client; }
}

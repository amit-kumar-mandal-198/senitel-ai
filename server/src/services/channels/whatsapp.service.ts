import twilio from 'twilio';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class WhatsappService implements AlertChannel {
    public name = 'WhatsApp (Twilio)';
    private client: twilio.Twilio | null = null;

    constructor() {
        if (isChannelConfigured('twilio')) {
            this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!this.client || !config.twilio.phoneNumber) {
            console.warn(`[${this.name}] Not configured. Simulating WhatsApp to ${payload.targetData.phone}: ${payload.message}`);
            return { success: true, provider: 'simulated_twilio_whatsapp', timestamp: new Date(), metadata: { simulated: true } };
        }

        try {
            const message = await this.client.messages.create({
                body: payload.message,
                from: `whatsapp:${config.twilio.phoneNumber}`,
                to: `whatsapp:${payload.targetData.phone}`
            });
            return { success: true, provider: 'twilio_whatsapp', timestamp: new Date(), metadata: { messageId: message.sid } };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            return { success: false, provider: 'twilio_whatsapp', timestamp: new Date(), error: error.message };
        }
    }

    async healthCheck(): Promise<boolean> { return !!this.client; }
}

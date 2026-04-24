import twilio from 'twilio';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class SmsService implements AlertChannel {
    public name = 'SMS (Twilio)';
    private client: twilio.Twilio | null = null;

    constructor() {
        if (isChannelConfigured('twilio')) {
            this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!this.client || !config.twilio.phoneNumber) {
            console.warn(`[${this.name}] Not configured. Simulating SMS to ${payload.targetData.phone}: ${payload.message}`);
            return {
                success: true,
                provider: 'simulated_twilio',
                timestamp: new Date(),
                metadata: { simulated: true }
            };
        }

        try {
            const message = await this.client.messages.create({
                body: payload.message,
                from: config.twilio.phoneNumber,
                to: payload.targetData.phone
            });

            return {
                success: true,
                provider: 'twilio',
                timestamp: new Date(),
                metadata: { messageId: message.sid }
            };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            // In a real system, we would trigger a fallback provider here (e.g., Sinch/Vonage)
            return {
                success: false,
                provider: 'twilio',
                timestamp: new Date(),
                error: error.message
            };
        }
    }

    async healthCheck(): Promise<boolean> {
        return !!this.client;
    }
}

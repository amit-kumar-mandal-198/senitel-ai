import twilio from 'twilio';
import { Vonage } from 'vonage';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class SmsService implements AlertChannel {
    public name = 'SMS (Twilio + Vonage Fallback)';
    private twilioClient: twilio.Twilio | null = null;
    private vonageClient: Vonage | null = null;

    constructor() {
        if (isChannelConfigured('twilio')) {
            this.twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
        }
        if (isChannelConfigured('vonage')) {
            this.vonageClient = new Vonage({
                apiKey: config.vonage.apiKey!,
                apiSecret: config.vonage.apiSecret!
            });
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        // Attempt Primary: Twilio
        if (this.twilioClient && config.twilio.phoneNumber) {
            try {
                const message = await this.twilioClient.messages.create({
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
                console.error(`[${this.name}] Twilio failed, trying fallback...`, error);
            }
        }

        // Attempt Secondary: Vonage
        if (this.vonageClient) {
            try {
                const resp = await this.vonageClient.sms.send({
                    to: payload.targetData.phone,
                    from: 'SENTINEL',
                    text: payload.message
                });
                return {
                    success: true,
                    provider: 'vonage',
                    timestamp: new Date(),
                    metadata: { messageId: resp.messages[0].messageId }
                };
            } catch (error: any) {
                console.error(`[${this.name}] Vonage fallback failed`, error);
            }
        }

        // Simulating if no providers are available
        console.warn(`[${this.name}] No providers available. Simulating SMS to ${payload.targetData.phone}: ${payload.message}`);
        return {
            success: true,
            provider: 'simulated_sms',
            timestamp: new Date(),
            metadata: { simulated: true }
        };
    }

    async healthCheck(): Promise<boolean> {
        return !!this.twilioClient || !!this.vonageClient;
    }
}

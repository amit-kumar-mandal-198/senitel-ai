import sgMail from '@sendgrid/mail';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class EmailService implements AlertChannel {
    public name = 'Email (SendGrid)';
    private initialized = false;

    constructor() {
        if (isChannelConfigured('sendgrid') && config.sendgrid.apiKey) {
            sgMail.setApiKey(config.sendgrid.apiKey);
            this.initialized = true;
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!this.initialized || !payload.targetData.email) {
            console.warn(`[${this.name}] Not configured. Simulating email to ${payload.targetData.email}: ${payload.message}`);
            return {
                success: true,
                provider: 'simulated_sendgrid',
                timestamp: new Date(),
                metadata: { simulated: true }
            };
        }

        try {
            const msg = {
                to: payload.targetData.email,
                from: 'alerts@sentinel-ai.com', 
                subject: `[${payload.severity.toUpperCase()}] Emergency Alert`,
                text: payload.message,
                html: `<strong>EMERGENCY ALERT</strong><br><p>${payload.message}</p>`
            };
            
            await sgMail.send(msg);

            return {
                success: true,
                provider: 'sendgrid',
                timestamp: new Date()
            };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            return {
                success: false,
                provider: 'sendgrid',
                timestamp: new Date(),
                error: error.message
            };
        }
    }

    async healthCheck(): Promise<boolean> {
        return this.initialized;
    }
}

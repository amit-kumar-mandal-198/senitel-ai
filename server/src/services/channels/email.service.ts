import sgMail from '@sendgrid/mail';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class EmailService implements AlertChannel {
    public name = 'Email (SendGrid + AWS SES Fallback)';
    private sgInitialized = false;
    private sesClient: SESClient | null = null;

    constructor() {
        if (isChannelConfigured('sendgrid') && config.sendgrid.apiKey) {
            sgMail.setApiKey(config.sendgrid.apiKey);
            this.sgInitialized = true;
        }
        if (isChannelConfigured('aws')) {
            this.sesClient = new SESClient({
                region: config.aws.region,
                credentials: {
                    accessKeyId: config.aws.accessKeyId!,
                    secretAccessKey: config.aws.secretAccessKey!
                }
            });
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        // Attempt Primary: SendGrid
        if (this.sgInitialized && payload.targetData.email) {
            try {
                const msg = {
                    to: payload.targetData.email,
                    from: 'alerts@sentinel-ai.com',
                    subject: `[${payload.severity.toUpperCase()}] Emergency Alert`,
                    text: payload.message,
                    html: `<strong>EMERGENCY ALERT</strong><br><p>${payload.message}</p>`
                };
                await sgMail.send(msg);
                return { success: true, provider: 'sendgrid', timestamp: new Date() };
            } catch (error: any) {
                console.error(`[${this.name}] SendGrid failed, trying SES...`, error);
            }
        }

        // Attempt Secondary: AWS SES
        if (this.sesClient && payload.targetData.email) {
            try {
                const command = new SendEmailCommand({
                    Destination: { ToAddresses: [payload.targetData.email] },
                    Message: {
                        Body: { Text: { Data: payload.message } },
                        Subject: { Data: `[${payload.severity.toUpperCase()}] Emergency Alert` }
                    },
                    Source: 'alerts@sentinel-ai.com'
                });
                await this.sesClient.send(command);
                return { success: true, provider: 'aws_ses', timestamp: new Date() };
            } catch (error: any) {
                console.error(`[${this.name}] AWS SES fallback failed`, error);
            }
        }

        console.warn(`[${this.name}] No providers available. Simulating email to ${payload.targetData.email}`);
        return { success: true, provider: 'simulated_email', timestamp: new Date(), metadata: { simulated: true } };
    }

    async healthCheck(): Promise<boolean> {
        return this.sgInitialized || !!this.sesClient;
    }
}

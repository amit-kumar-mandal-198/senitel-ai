import * as admin from 'firebase-admin';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class PushService implements AlertChannel {
    public name = 'Push Notification (FCM/APNs)';
    private initialized = false;

    constructor() {
        if (isChannelConfigured('firebase') && !admin.apps.length) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: config.firebase.projectId,
                        clientEmail: config.firebase.clientEmail,
                        privateKey: config.firebase.privateKey?.replace(/\\n/g, '\n')
                    })
                });
                this.initialized = true;
            } catch (err) {
                console.error(`[${this.name}] Init error:`, err);
            }
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!this.initialized || !payload.targetData.deviceToken) {
            console.warn(`[${this.name}] Not configured or missing token. Simulating push: ${payload.message}`);
            return {
                success: true,
                provider: 'simulated_fcm',
                timestamp: new Date(),
                metadata: { simulated: true }
            };
        }

        try {
            const messageId = await admin.messaging().send({
                token: payload.targetData.deviceToken,
                notification: {
                    title: `Sentinel AI Alert: ${payload.severity.toUpperCase()}`,
                    body: payload.message
                },
                data: {
                    incidentId: payload.incidentId,
                    severity: payload.severity
                }
            });

            return {
                success: true,
                provider: 'fcm',
                timestamp: new Date(),
                metadata: { messageId }
            };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            return {
                success: false,
                provider: 'fcm',
                timestamp: new Date(),
                error: error.message
            };
        }
    }

    async healthCheck(): Promise<boolean> {
        return this.initialized;
    }
}

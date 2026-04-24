import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class TeamsService implements AlertChannel {
    public name = 'Microsoft Teams';

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!isChannelConfigured('teams') || !config.teams.webhookUrl) {
            console.warn(`[${this.name}] Not configured. Simulating Teams adaptive card broadcast.`);
            return { success: true, provider: 'simulated_teams', timestamp: new Date(), metadata: { simulated: true } };
        }

        try {
            // Adaptive Cards mapping for Teams webhook
            const card = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "themeColor": payload.severity === 'critical' ? "FF0000" : "FFA500",
                "summary": "Emergency Alert",
                "sections": [{
                    "activityTitle": `🚨 CRISIS ALERT: ${payload.severity.toUpperCase()}`,
                    "text": payload.message
                }]
            };

            const response = await fetch(config.teams.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(card)
            });

            if (!response.ok) throw new Error(`Teams API responded with ${response.status}`);

            return { success: true, provider: 'teams', timestamp: new Date() };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            return { success: false, provider: 'teams', timestamp: new Date(), error: error.message };
        }
    }

    async healthCheck(): Promise<boolean> { return isChannelConfigured('teams'); }
}

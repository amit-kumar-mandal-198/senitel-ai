import { App } from '@slack/bolt';
import { AlertChannel, AlertPayload, DeliveryReceipt } from './channel.interface';
import { config, isChannelConfigured } from '../../config/channels.config';

export class SlackService implements AlertChannel {
    public name = 'Slack';
    private app: App | null = null;

    constructor() {
        if (isChannelConfigured('slack')) {
            this.app = new App({
                token: config.slack.botToken,
                signingSecret: process.env.SLACK_SIGNING_SECRET || 'dummy' // Dummy fallback logic for mocked environment
            });
        }
    }

    async send(payload: AlertPayload): Promise<DeliveryReceipt> {
        if (!this.app || !payload.targetData.slackChannel) {
            console.warn(`[${this.name}] Not configured. Simulating Slack block message to ${payload.targetData.slackChannel}`);
            return { success: true, provider: 'simulated_slack', timestamp: new Date(), metadata: { simulated: true } };
        }

        try {
            await this.app.client.chat.postMessage({
                channel: payload.targetData.slackChannel,
                text: `[${payload.severity}] Emergency Alert!`,
                blocks: [
                    {
                        type: 'header',
                        text: { type: 'plain_text', text: '🚨 CRISIS ALERT 🚨', emoji: true }
                    },
                    {
                        type: 'section',
                        text: { type: 'mrkdwn', text: `*Severity:* ${payload.severity.toUpperCase()}\n\n${payload.message}` }
                    }
                ]
            });
            return { success: true, provider: 'slack', timestamp: new Date() };
        } catch (error: any) {
            console.error(`[${this.name}] Delivery failed`, error);
            return { success: false, provider: 'slack', timestamp: new Date(), error: error.message };
        }
    }

    async healthCheck(): Promise<boolean> { return !!this.app; }
}

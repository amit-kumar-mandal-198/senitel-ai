import { AlertChannel, AlertPayload } from './channels/channel.interface';
import { SmsService } from './channels/sms.service';
import { PushService } from './channels/push.service';
import { EmailService } from './channels/email.service';
import { VoiceService } from './channels/voice.service';
import { WhatsappService } from './channels/whatsapp.service';
import { SlackService } from './channels/slack.service';
import { TeamsService } from './channels/teams.service';
import { PASystemService } from './channels/pa.service';
import { GovtAlertService } from './channels/gov.service';
import { LoraMeshService, BleService, SatelliteService } from './channels/offline.service';
import { IoTService } from './channels/iot.service';
import { SosService } from './channels/sos.service';
import { TwoWayService } from './channels/two-way.service';
import { AiPipelineService } from './channels/ai-pipeline.service';

/**
 * DispatchOrchestrator acts as the central router (mocking Novu + BullMQ + Redis Streams).
 * It receives a master payload and fans it out concurrently across configured providers.
 */
export class DispatchOrchestrator {
    private channels: AlertChannel[] = [];

    constructor() {
        // Register all available channels
        this.channels.push(
            new SmsService(),
            new PushService(),
            new EmailService(),
            new VoiceService(),
            new WhatsappService(),
            new SlackService(),
            new TeamsService(),
            new PASystemService(),
            new GovtAlertService(),
            new LoraMeshService(),
            new BleService(),
            new SatelliteService(),
            new IoTService(),
            new SosService(),
            new TwoWayService()
        );
    }

    async dispatchCrisis(payload: AlertPayload): Promise<void> {
        console.log(`\n=============================================`);
        console.log(`🚀 [ORCHESTRATOR] DISPATCH INITIATED`);
        console.log(`📋 Incident ID: ${payload.incidentId}`);
        console.log(`⚠️ Severity: ${payload.severity.toUpperCase()}`);
        console.log(`=============================================\n`);

        // 1. AI PRE-VALIDATION PIPELINE
        const isValid = await AiPipelineService.preSendValidation(payload);
        if (!isValid) {
            console.error(`[Orchestrator] AI Validation blocked dispatch!`);
            return;
        }

        // 2. CONCURRENT FAN-OUT ALERTS
        const promises = this.channels.map(async (channel) => {
            // Check health first to avoid waiting on dead links
            const isHealthy = await channel.healthCheck();
            if (!isHealthy) {
                console.warn(`[Orchestrator] Skipping ${channel.name} (Not Healthy / Not Configured)`);
                return;
            }

            try {
                const receipt = await channel.send(payload);
                if (receipt.success) {
                    console.log(`✔️ [${channel.name}] Delivered successfully via ${receipt.provider}`);
                } else {
                    console.error(`❌ [${channel.name}] Failed: ${receipt.error}`);
                }
            } catch (err: any) {
                console.error(`❌ [${channel.name}] Uncaught Error: ${err.message}`);
            }
        });

        await Promise.allSettled(promises);
        console.log(`\n=============================================`);
        console.log(`🏁 [ORCHESTRATOR] DISPATCH COMPLETE`);
        console.log(`=============================================\n`);
    }
}

import { SmsService } from '../../src/services/channels/sms.service';
import { AlertPayload } from '../../src/services/channels/channel.interface';

describe('SmsService', () => {
    let service: SmsService;

    beforeEach(() => {
        service = new SmsService();
    });

    it('should implement the AlertChannel interface', () => {
        expect(service.name).toBe('SMS (Twilio)');
    });

    it('should fallback to simulated delivery if env vars are missing', async () => {
        const payload: AlertPayload = {
            incidentId: 'test-123',
            message: 'Test message',
            severity: 'high',
            targetData: { phone: '+1234567890' }
        };

        const result = await service.send(payload);
        expect(result.success).toBe(true);
        expect(result.provider).toContain('simulated');
    });
});

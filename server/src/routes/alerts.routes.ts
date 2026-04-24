import { FastifyInstance } from 'fastify';
import { DispatchOrchestrator } from '../services/orchestrator.service';
import { AlertPayload } from '../services/channels/channel.interface';
import { PrismaClient } from '@prisma/client';

const orchestrator = new DispatchOrchestrator();
// Note: Normally Prisma is passed via Fastify plugin or dependency injection
const prisma = new PrismaClient();

export default async function alertRoutes(app: FastifyInstance) {
    
    app.post('/api/v1/crisis/trigger', async (request, reply) => {
        const { type, roomNum, floorNum, severity } = request.body as any;
        
        // 1. Create active incident in DB (Legacy logic)
        const incident = await prisma.incident.create({
            data: {
                type,
                severity,
                status: 'active',
                roomNum: roomNum.toString(),
                floorNum: parseInt(floorNum),
                note: `Crisis triggered manually for Room ${roomNum}`
            }
        });

        // 2. Dispatch staff nearest to floor (Legacy logic)
        await prisma.staff.updateMany({
            where: { location: { contains: floorNum.toString() }, status: 'on_duty' },
            data: { status: 'dispatched' }
        });

        // 3. ✨ NEW: TRIGGER THE MASTER ORCHESTRATOR
        const payload: AlertPayload = {
            incidentId: incident.id,
            message: `Emergency: ${type} reported at Room ${roomNum}, Floor ${floorNum}. Evacuate immediately.`,
            severity: severity,
            targetData: {
                floor: floorNum,
                room: roomNum,
                phone: '+15555555555', // Mock guest phone
                email: 'guest@example.com',
                slackChannel: '#emergency-response'
            }
        };

        // Fire and forget dispatch
        orchestrator.dispatchCrisis(payload).catch(err => {
            app.log.error(`Orchestrator failed during crisis dispatch: ${err.message}`);
        });

        return { success: true, incident, dispatchStarted: true };
    });

}

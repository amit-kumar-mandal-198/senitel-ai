import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export class DatabaseService {
    /**
     * Get the full hotel overview including floors and rooms
     */
    static async getHotelOverview() {
        const hotel = await prisma.hotel.findFirst({
            include: {
                floors: {
                    orderBy: { level: 'asc' },
                    include: {
                        rooms: {
                            orderBy: { number: 'asc' }
                        }
                    }
                }
            }
        });
        return hotel;
    }

    /**
     * Trigger a new incident
     */
    static async triggerIncident(data: { type: string, severity: string, roomNum?: string, floorNum?: number, note?: string }) {
        return prisma.incident.create({
            data: {
                ...data,
                status: 'active'
            }
        });
    }

    /**
     * Get recent incidents
     */
    static async getRecentIncidents(limit = 10) {
        return prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Resolve an active incident
     */
    static async resolveIncident(id: string) {
        return prisma.incident.update({
            where: { id },
            data: {
                status: 'resolved',
                resolvedAt: new Date()
            }
        });
    }

    /**
     * Get all staff
     */
    static async getStaff() {
        return prisma.staff.findMany();
    }

    /**
     * Dispatch staff to a specific floor
     */
    static async dispatchStaffToFloor(floorNum: number) {
        const staffOnDuty = await prisma.staff.findMany({
            where: { status: 'on_duty' }
        });
        
        // Find staff containing the floor number in their location string
        const staffToDispatch = staffOnDuty.filter(s => s.location.includes(floorNum.toString()));
        
        for (const staff of staffToDispatch) {
            await prisma.staff.update({
                where: { id: staff.id },
                data: { status: 'dispatched' }
            });
        }
    }
}

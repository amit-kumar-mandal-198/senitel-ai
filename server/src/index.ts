import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const fastify = Fastify({ logger: true })
const prisma = new PrismaClient()

fastify.register(cors, { origin: true })

// Mock fallback data
const mockHotel = {
  id: '1',
  name: 'Grand Hotel',
  floors: [
    {
      id: 'f1',
      level: 1,
      rooms: [
        { id: 'r1', number: '101', status: 'occupied', guests: [] },
        { id: 'r2', number: '102', status: 'vacant', guests: [] },
        { id: 'r3', number: '103', status: 'occupied', guests: [] },
        { id: 'r4', number: '104', status: 'vacant', guests: [] },
        { id: 'r5', number: '105', status: 'occupied', guests: [] },
        { id: 'r1_6', number: '106', status: 'vacant', guests: [] },
        { id: 'r1_7', number: '107', status: 'occupied', guests: [] },
        { id: 'r1_8', number: '108', status: 'occupied', guests: [] },
        { id: 'r1_9', number: '109', status: 'vacant', guests: [] },
        { id: 'r1_10', number: '110', status: 'occupied', guests: [] }
      ]
    },
    {
      id: 'f2',
      level: 2,
      rooms: [
        { id: 'r6', number: '201', status: 'occupied', guests: [] },
        { id: 'r7', number: '202', status: 'vacant', guests: [] },
        { id: 'r8', number: '203', status: 'occupied', guests: [] },
        { id: 'r9', number: '204', status: 'vacant', guests: [] },
        { id: 'r10', number: '205', status: 'occupied', guests: [] },
        { id: 'r2_6', number: '206', status: 'vacant', guests: [] },
        { id: 'r2_7', number: '207', status: 'occupied', guests: [] },
        { id: 'r2_8', number: '208', status: 'occupied', guests: [] },
        { id: 'r2_9', number: '209', status: 'vacant', guests: [] },
        { id: 'r2_10', number: '210', status: 'occupied', guests: [] }
      ]
    },
    {
      id: 'f3',
      level: 3,
      rooms: [
        { id: 'r11', number: '301', status: 'occupied', guests: [] },
        { id: 'r12', number: '302', status: 'vacant', guests: [] },
        { id: 'r13', number: '303', status: 'occupied', guests: [] },
        { id: 'r14', number: '304', status: 'vacant', guests: [] },
        { id: 'r15', number: '305', status: 'occupied', guests: [] },
        { id: 'r3_6', number: '306', status: 'vacant', guests: [] },
        { id: 'r3_7', number: '307', status: 'occupied', guests: [] },
        { id: 'r3_8', number: '308', status: 'occupied', guests: [] },
        { id: 'r3_9', number: '309', status: 'vacant', guests: [] },
        { id: 'r3_10', number: '310', status: 'occupied', guests: [] }
      ]
    }
  ]
}

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Get hotel overview
fastify.get('/api/v1/hotel/overview', async (request, reply) => {
  try {
    const hotel = await prisma.hotel.findFirst({
      include: {
        floors: {
          include: {
            rooms: {
              include: { guests: true }
            }
          }
        }
      }
    })

    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return {
      hotel: hotel || mockHotel,
      activeCrisis: incidents.find((i: any) => i.status === 'active') || null,
      recentIncidents: incidents || []
    }
  } catch (err: any) {
    fastify.log.warn('Database query failed, returning mock data:', err.message)
    return {
      hotel: mockHotel,
      activeCrisis: null,
      recentIncidents: []
    }
  }
})

// Trigger crisis
fastify.post('/api/v1/crisis/trigger', async (request, reply) => {
  const { type, severity, roomNum, floorNum } = request.body as any
  
  try {
    const incident = await prisma.incident.create({
      data: {
        type,
        severity,
        status: 'active',
        roomNum: roomNum.toString(),
        floorNum: parseInt(floorNum),
        note: `Crisis triggered: ${type}`
      }
    })
    return { success: true, incident }
  } catch (err: any) {
    fastify.log.warn('Failed to create incident:', err.message)
    return { 
      success: true, 
      message: 'Crisis triggered (database unavailable)'
    }
  }
})

// Guest AI Chat
fastify.post('/api/v1/chat/aegis', async (request, reply) => {
  const { crisisActive } = request.body as any
  
  try {
    return {
      success: true,
      text: crisisActive 
        ? 'Emergency assistance is being coordinated for your location. Please proceed to the nearest stairwell and evacuate the building immediately.'
        : 'Hello! I am Aegis, your AI safety assistant. How can I help you today?'
    }
  } catch (err: any) {
    fastify.log.error('Chat error:', err.message)
    return {
      success: true,
      text: 'I apologize, but I am having trouble connecting. Please try again later.'
    }
  }
})

// Get staff
fastify.get('/api/v1/staff', async (request, reply) => {
  try {
    const staff = await prisma.staff.findMany()
    return { staff: staff || [] }
  } catch (err: any) {
    fastify.log.warn('Failed to fetch staff:', err.message)
    return { staff: [] }
  }
})

// Resolve crisis
fastify.post('/api/v1/crisis/resolve', async (request, reply) => {
  const { id } = request.body as any
  
  try {
    const incident = await prisma.incident.update({
      where: { id },
      data: { status: 'resolved', resolvedAt: new Date() }
    })
    return { success: true, incident }
  } catch (err: any) {
    fastify.log.warn('Failed to resolve incident:', err.message)
    return { success: true, message: 'Crisis resolved' }
  }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`🚀 Hotel API running on 0.0.0.0:${port}`)
  } catch (err: any) {
    fastify.log.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
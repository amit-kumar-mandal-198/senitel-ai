import Fastify from 'fastify'
import cors from '@fastify/cors'
import { processChatbotQuery } from './chatLogic'

const fastify = Fastify({ logger: true })

import { DatabaseService } from './services/db.service'
import { DispatchOrchestrator } from './services/orchestrator.service'
import { AlertPayload } from './services/channels/channel.interface'
import { Server as SocketServer } from 'socket.io'

const orchestrator = new DispatchOrchestrator()

const io = new SocketServer(fastify.server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  fastify.log.info(`Socket connected: ${socket.id}`)
  socket.on('disconnect', () => {
    fastify.log.info(`Socket disconnected: ${socket.id}`)
  })
})

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
    const hotel = await DatabaseService.getHotelOverview()
    const incidents = await DatabaseService.getRecentIncidents(5)

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
    const incident = await DatabaseService.triggerIncident({
      type,
      severity,
      roomNum: roomNum?.toString(),
      floorNum: parseInt(floorNum),
      note: `Crisis triggered: ${type}`
    })

    // 2. Dispatch staff nearest to floor
    await DatabaseService.dispatchStaffToFloor(parseInt(floorNum))

    // 3. Trigger Master Orchestrator (Fan-out alerts)
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
    }

    orchestrator.dispatchCrisis(payload).catch(err => {
      fastify.log.error(`Orchestrator failed during crisis dispatch: ${err.message}`)
    })

    // 4. Broadcast via Socket.io
    io.emit('crisis_triggered', {
      incident,
      message: payload.message
    })

    return { success: true, incident, dispatchStarted: true }
  } catch (err: any) {
    fastify.log.warn('Failed to create incident in Database:', err.message)
    
    const mockIncident = { id: 'mock-' + Date.now(), type, severity, status: 'active', roomNum, floorNum };
    
    // Broadcast mock incident as well for dev purposes
    io.emit('crisis_triggered', {
      incident: mockIncident,
      message: `Emergency: ${type} reported (Mock Mode)`
    })

    return { 
      success: true, 
      incident: mockIncident,
      message: 'Crisis triggered (mock mode due to Database error)'
    }
  }
})

// Guest AI Chat
fastify.post('/api/v1/chat/aegis', async (request, reply) => {
  const { conversationHistory, crisisActive } = request.body as any
  
  try {
    // If conversation history is missing or empty, handle it gracefully
    if (!conversationHistory || conversationHistory.length === 0) {
      return {
        success: true,
        text: 'Hello! I am Aegis, your AI safety assistant. How can I help you today?'
      }
    }

    const responseText = processChatbotQuery(conversationHistory)
    return {
      success: true,
      text: responseText
    }
  } catch (err: any) {
    fastify.log.error('Chat error:', err.message)
    return {
      success: true,
      text: 'Unable to reach server. Please call 112 immediately.'
    }
  }
})

// Get staff
fastify.get('/api/v1/staff', async (request, reply) => {
  try {
    const staff = await DatabaseService.getStaff()
    return { staff: staff || [] }
  } catch (err: any) {
    fastify.log.warn('Failed to fetch staff from Database:', err.message)
    return { staff: [] }
  }
})

// Resolve crisis
fastify.post('/api/v1/crisis/resolve', async (request, reply) => {
  const { id } = request.body as any
  try {
    const incident = await DatabaseService.resolveIncident(id)
    return { success: true, incident }
  } catch (err: any) {
    fastify.log.warn('Failed to resolve incident in Database:', err.message)
    return { success: true, message: 'Crisis resolved (local update failed)' }
  }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`🚀 Hotel API with Real-time Sync running on 0.0.0.0:${port}`)
  } catch (err: any) {
    fastify.log.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

start()
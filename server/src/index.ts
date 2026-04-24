import fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { getAIResponse } from './ai.service'
import alertRoutes from './routes/alerts.routes'

const app = fastify({ logger: true })
const prisma = new PrismaClient()

app.register(cors, {
  origin: true // Allow frontend to connect
})

// Register the new architecture modules
app.register(alertRoutes)

// === OVERVIEW DATA ===
app.get('/api/v1/hotel/overview', async (request, reply) => {
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
  
  if (!hotel) return reply.status(404).send({ error: "Hotel not found" })

  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  
  const activeCrisis = incidents.find(i => i.status === 'active') || null

  return {
    hotel,
    activeCrisis,
    recentIncidents: incidents
  }
})

// === CRISIS TRIGGER ===
// This route has been migrated to routes/alerts.routes.ts for modularity with the Dispatch Orchestrator.

// === IOT SENSOR WEBHOOK ===
app.post('/api/v1/webhooks/iot-sensor', async (request, reply) => {
  const { sensorId, sensorType, roomNum, floorNum, reading } = request.body as any
  
  app.log.info(`[IoT] Alert from Sensor ${sensorId} in Room ${roomNum}: ${reading}`)

  // Map sensor logic to crisis type
  let crisisType = 'Security'
  let severity = 'medium'
  if (sensorType === 'smoke') { crisisType = 'Fire Alarm'; severity = 'critical' }
  if (sensorType === 'water') { crisisType = 'Water Leak'; severity = 'high' }
  if (sensorType === 'gas')   { crisisType = 'Gas Leak'; severity = 'critical' }

  // Check if there's already an active incident in this room to avoid spam
  const existing = await prisma.incident.findFirst({
    where: { roomNum: roomNum.toString(), status: 'active' }
  })

  if (existing) {
    return { success: true, message: 'Incident already active, ignoring duplicate sensor ping.' }
  }

  // Create active incident automatically
  const incident = await prisma.incident.create({
    data: {
      type: crisisType,
      severity,
      status: 'active',
      roomNum: roomNum.toString(),
      floorNum: parseInt(floorNum),
      note: `Autonomously triggered by IoT ${sensorType} sensor (${sensorId}). Reading: ${reading}`
    }
  })

  // Dispatch staff closest to floor automatically
  await prisma.staff.updateMany({
    where: { location: { contains: floorNum.toString() }, status: 'on_duty' },
    data: { status: 'dispatched' }
  })

  return { success: true, incident }
})

// === CRISIS RESOLVE ===
app.post('/api/v1/crisis/resolve', async (request, reply) => {
  const { id } = request.body as any
  
  const incident = await prisma.incident.update({
    where: { id },
    data: { status: 'resolved', resolvedAt: new Date() }
  })

  return { success: true, incident }
})


// === GUEST AI CHAT (AEGIS) ===
app.post('/api/v1/chat/aegis', async (request, reply) => {
  const { conversationHistory, userRoomNum, crisisActive, crisisType, crisisRoomNum } = request.body as any
  
  try {
    const aiResponse = await getAIResponse(conversationHistory, userRoomNum, crisisActive, crisisType, crisisRoomNum)
    return { success: true, text: aiResponse }
  } catch (error) {
    app.log.error(error)
    return reply.status(500).send({ error: "AI Service Error" })
  }
})

// === STAFF DISPATCH ===
app.get('/api/v1/staff', async (request, reply) => {
  const staff = await prisma.staff.findMany()
  return { staff }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Hotel API running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

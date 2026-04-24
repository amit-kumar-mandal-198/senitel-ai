import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing
  await prisma.guest.deleteMany()
  await prisma.room.deleteMany()
  await prisma.floor.deleteMany()
  await prisma.hotel.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.incident.deleteMany()

  // 1. Create Hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Grand Hotel',
      location: 'City Center'
    }
  })

  // 2. Create Floors
  for (let f = 1; f <= 3; f++) {
    const floor = await prisma.floor.create({
      data: {
        level: f,
        hotelId: hotel.id
      }
    })

    // 3. Create 10 Rooms per floor
    for (let r = 1; r <= 10; r++) {
      const roomNum = `${f}${r < 10 ? '0' : ''}${r}`
      let type = 'standard'
      if (r % 5 === 0) type = 'suite'
      else if (r % 3 === 0) type = 'deluxe'

      const isOccupied = Math.random() > 0.3
      const status = r === 6 && f === 1 ? 'maintenance' : (isOccupied ? 'occupied' : 'vacant')

      const room = await prisma.room.create({
        data: {
          number: roomNum,
          type,
          status,
          floorId: floor.id
        }
      })

      // 4. Create Guest if occupied
      if (status === 'occupied') {
        const firstNames = ['Amit', 'Priya', 'Raj', 'Anita', 'Vikram', 'Meera', 'Suresh', 'Neha', 'Rahul', 'Kavita']
        const lastNames = ['Patel', 'Sharma', 'Singh', 'Desai', 'Nair', 'Kumar', 'Joshi', 'Gupta']
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
        
        await prisma.guest.create({
          data: {
            name,
            phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
            roomId: room.id
          }
        })
      }
    }
  }

  // 5. Create Staff
  const staffMembers = [
    { name: 'Rajesh Kumar', role: 'Security Lead', status: 'on_duty', location: 'Floor 3', phone: 'ext. 301' },
    { name: 'Priya Sharma', role: 'Front Desk Manager', status: 'on_duty', location: 'Lobby', phone: 'ext. 100' },
    { name: 'Vikram Singh', role: 'Maintenance Head', status: 'on_duty', location: 'Floor 1', phone: 'ext. 150' },
    { name: 'Anita Desai', role: 'Security Guard', status: 'on_duty', location: 'Floor 2', phone: 'ext. 202' },
    { name: 'Suresh Patel', role: 'Housekeeping Lead', status: 'off_duty', location: '—', phone: 'ext. 160' },
    { name: 'Meera Nair', role: 'Hotel Doctor', status: 'on_call', location: 'Medical Room', phone: 'ext. 911' },
  ]
  for (const s of staffMembers) {
    await prisma.staff.create({ data: s })
  }

  // 6. Historic Incidents
  await prisma.incident.createMany({
    data: [
      { type: 'fire_drill', severity: 'medium', status: 'resolved', note: 'Scheduled drill', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      { type: 'water_leak', roomNum: '205', floorNum: 2, severity: 'low', status: 'resolved', note: 'Bathroom pipe leak', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
      { type: 'medical', roomNum: '308', floorNum: 3, severity: 'high', status: 'resolved', note: 'Guest medical distress', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
    ]
  })

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

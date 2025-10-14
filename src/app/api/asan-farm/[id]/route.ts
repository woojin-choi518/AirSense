import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const farmId = parseInt(id)

    if (isNaN(farmId)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 })
    }

    const farm = await prisma.livestockFarm.findUnique({
      where: { id: farmId },
      select: {
        id: true,
        farmName: true,
        livestockType: true,
        landAddress: true,
        roadAddress: true,
        livestockCount: true,
        barnCount: true,
        areaSqm: true,
        latitude: true,
        longitude: true,
      },
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    const formatted = {
      id: farm.id,
      farm_name: farm.farmName,
      livestock_type: farm.livestockType,
      land_address: farm.landAddress,
      road_address: farm.roadAddress,
      livestock_count: farm.livestockCount,
      barn_count: farm.barnCount,
      area_sqm: farm.areaSqm,
      lat: farm.latitude,
      lng: farm.longitude,
    }

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error('API /api/asan-farm/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch farm details' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

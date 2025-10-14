// pages/api/farms.ts
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const farms = await prisma.livestockFarm.findMany({
      select: {
        id: true,
        farmName: true,
        livestockType: true,
        livestockCount: true,
        latitude: true,
        longitude: true,
      },
    })
    // マーカー表示に必要な最小限のデータのみ
    const formatted = farms.map((farm) => ({
      id: farm.id,
      farm_name: farm.farmName,
      livestock_type: farm.livestockType,
      livestock_count: farm.livestockCount,
      lat: farm.latitude,
      lng: farm.longitude,
    }))

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error('API /api/farms error:', error)
    return NextResponse.json({ error: 'Failed to fetch livestock farms' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

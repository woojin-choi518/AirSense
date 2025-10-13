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
        landAddress: true,
        roadAddress: true,
        livestockCount: true,
        barnCount: true,
        areaSqm: true,
        latitude: true,
        longitude: true,
      },
    })
    // 👉 프론트가 기대하는 필드명으로 매핑
    const formatted = farms.map((farm) => ({
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
    }))

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error('API /api/farms error:', error)
    return NextResponse.json({ error: 'Failed to fetch livestock farms' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

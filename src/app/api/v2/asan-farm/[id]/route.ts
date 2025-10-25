import { NextResponse } from 'next/server'

import { CONVERTED_FARMS } from '@/data/livestockFarms'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const farmId = parseInt(id)

    if (isNaN(farmId)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 })
    }

    // CONVERTED_FARMSから該当IDの農場を検索
    const farm = CONVERTED_FARMS.find((f) => f.id === farmId)

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    // レスポンス形式を既存のAPIと合わせる
    const formatted = {
      id: farm.id,
      farm_name: farm.farm_name,
      livestock_type: farm.livestock_type,
      land_address: farm.land_address,
      road_address: farm.road_address,
      livestock_count: farm.livestock_count,
      barn_count: farm.barn_count,
      area_sqm: farm.area_sqm,
      lat: farm.lat,
      lng: farm.lng,
    }

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error('API /api/v2/asan-farm/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch farm details' }, { status: 500 })
  }
}

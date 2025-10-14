// pages/api/farms.ts
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// 風の方向計算用の定数
const typeMultiplier: Record<string, number> = {
  돼지: 3.0,
  육계: 1.4,
  '종계/산란계': 1.4,
  소: 2.0,
  사슴: 1.0,
}

// 風の方向計算関数
function calculateWindDirection(
  farms: Array<{
    id: number
    livestockType: string
    livestockCount: number
    latitude: number | null
    longitude: number | null
  }>,
  windDir: number,
  windSpeed: number,
  humidity: number,
  stability: 'stable' | 'neutral' | 'unstable' = 'neutral'
) {
  const halfAngle = 30
  const baseRadius = 500
  const maxRadius = 5000

  const maxCount = Math.max(...farms.map((f) => f.livestockCount), 1)
  const safeMax = Math.max(maxCount, 1)

  // 環境係数の計算
  const windMul = windSpeed <= 0.5 ? 1.5 : windSpeed >= 1.5 ? 0.7 : 1.0
  const stabilityMul = stability === 'stable' ? 1.4 : stability === 'unstable' ? 0.8 : 1.0
  const humidityMul = 1 + (humidity / 100) * 0.3

  return farms
    .filter((farm) => farm.latitude !== null && farm.longitude !== null)
    .map((farm) => {
      const mult = (typeMultiplier[farm.livestockType] || 1) * windMul * stabilityMul * humidityMul
      const extraRadius = (farm.livestockCount / safeMax) * (maxRadius - baseRadius)
      const radius = Math.round(Math.max(0, (baseRadius + extraRadius) * mult) * 10) / 10

      const targetDir = ((windDir % 360) + 360) % 360
      const startA = (targetDir - halfAngle + 360) % 360
      const endA = (targetDir + halfAngle + 360) % 360

      return {
        farmId: farm.id,
        type: farm.livestockType,
        center: { lat: farm.latitude!, lng: farm.longitude! },
        radius,
        startA,
        endA,
      }
    })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // クエリパラメータから風の条件を取得（デフォルト値付き）
    const windDir = parseFloat(searchParams.get('windDir') || '0')
    const windSpeed = parseFloat(searchParams.get('windSpeed') || '1')
    const humidity = parseFloat(searchParams.get('humidity') || '50')
    const stability = (searchParams.get('stability') || 'neutral') as 'stable' | 'neutral' | 'unstable'
    const typesParam = searchParams.get('types')
    const types = typesParam ? typesParam.split(',').filter((t) => t.trim().length > 0) : []

    const farms = await prisma.livestockFarm.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        livestockCount: { gt: 0 },
        ...(types.length > 0 ? { livestockType: { in: types } } : {}),
      },
      select: {
        id: true,
        livestockType: true,
        livestockCount: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { livestockCount: 'desc' }, // 大きい農場を優先
    })

    // 風の方向計算
    const windData = calculateWindDirection(farms, windDir, windSpeed, humidity, stability)

    // マーカー表示に必要なデータと風の方向データを統合
    const formatted = farms.map((farm) => {
      const windInfo = windData.find((w) => w.farmId === farm.id)
      return {
        id: farm.id,
        livestock_type: farm.livestockType,
        livestock_count: farm.livestockCount,
        lat: farm.latitude,
        lng: farm.longitude,
        // 風の方向データを追加
        windData: windInfo
          ? {
              radius: windInfo.radius,
              startAngle: windInfo.startA,
              endAngle: windInfo.endA,
            }
          : null,
      }
    })

    return NextResponse.json(formatted, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5分キャッシュ
        'CDN-Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error) {
    console.error('API /api/farms error:', error)
    return NextResponse.json({ error: 'Failed to fetch livestock farms' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

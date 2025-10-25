import { NextRequest, NextResponse } from 'next/server'

import { CONVERTED_FARMS } from '@/data/livestockFarms'

export const runtime = 'nodejs'

// 바람 방향 계산용 상수
const typeMultiplier: Record<string, number> = {
  돼지: 3.0,
  육계: 1.4,
  '종계/산란계': 1.4,
  소: 2.0,
  사슴: 1.0,
}

// 바람 방향 계산 함수
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
  stability: 'stable' | 'neutral' | 'unstable' = 'neutral',
  globalMaxCount: number
) {
  const halfAngle = 30
  const baseRadius = 500
  const maxRadius = 5000

  const safeMax = Math.max(globalMaxCount, 1)

  // 환경 계수 계산
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

    // 쿼리 파라미터에서 바람 조건을 가져옴 (기본값 포함)
    const windDir = parseFloat(searchParams.get('windDir') || '0')
    const windSpeed = parseFloat(searchParams.get('windSpeed') || '1')
    const humidity = parseFloat(searchParams.get('humidity') || '50')
    const stability = (searchParams.get('stability') || 'neutral') as 'stable' | 'neutral' | 'unstable'
    const typesParam = searchParams.get('types')
    const types = typesParam ? typesParam.split(',').filter((t) => t.trim().length > 0) : []

    // CONVERTED_FARMS에서 데이터를 가져와서 Prisma 스키마와 맞게 변환
    const allFarms = CONVERTED_FARMS.map((farm, index) => ({
      id: index + 1, // 임시 ID 생성
      livestockType: farm.livestock_type,
      livestockCount: farm.livestock_count,
      latitude: farm.lat,
      longitude: farm.lng,
    }))

    // 전체 농장 데이터에서 최대 가축 수를 먼저 계산 (필터링과 무관하게 일관된 기준 사용)
    const allFarmsForMaxCount = allFarms.filter(
      (farm) => farm.latitude !== null && farm.longitude !== null && farm.livestockCount > 0
    )
    const globalMaxCount = Math.max(...allFarmsForMaxCount.map((f) => f.livestockCount), 1)

    // 필터링 적용
    const farms = allFarms
      .filter((farm) => {
        const hasValidLocation = farm.latitude !== null && farm.longitude !== null
        const hasValidCount = farm.livestockCount > 0
        const matchesType = types.length === 0 || types.includes(farm.livestockType)

        return hasValidLocation && hasValidCount && matchesType
      })
      .sort((a, b) => b.livestockCount - a.livestockCount) // 큰 농장을 우선

    // 바람 방향 계산 (전체 데이터셋 기준의 maxCount 사용)
    const windData = calculateWindDirection(farms, windDir, windSpeed, humidity, stability, globalMaxCount)

    // 마커 표시에 필요한 데이터와 바람 방향 데이터를 통합
    const formatted = farms.map((farm) => {
      const windInfo = windData.find((w) => w.farmId === farm.id)
      return {
        id: farm.id,
        livestock_type: farm.livestockType,
        livestock_count: farm.livestockCount,
        lat: farm.latitude,
        lng: farm.longitude,
        // 바람 방향 데이터를 추가
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
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5분 캐시
        'CDN-Cache-Control': 'public, max-age=300',
      },
    })
  } catch (error: any) {
    console.error('API /api/asan-farm-test error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch livestock farms', detail: error?.message || String(error) },
      { status: 500 }
    )
  }
}

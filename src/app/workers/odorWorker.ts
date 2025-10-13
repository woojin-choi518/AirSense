// Web Worker: 냄새 범위 계산
export type Payload = {
  farms: { id: number; lat: number; lng: number; livestock_type: string; livestock_count: number }[]
  maxCount: number
  scWindSpeed: number
  scHumidity: number
  scStability: 'stable' | 'neutral' | 'unstable'
  scWindDir: number
}

const typeMultiplier: Record<string, number> = {
  돼지: 3.0,
  육계: 1.4,
  '종계/산란계': 1.4,
  소: 2.0,
  사슴: 1.0,
}

self.onmessage = (e: MessageEvent<Payload>) => {
  const { farms, maxCount, scWindSpeed, scHumidity, scStability, scWindDir } = e.data

  const halfAngle = 30
  const baseRadius = 500
  const maxRadius = 5000

  const safeMax = Math.max(maxCount, 1)

  const windMul = scWindSpeed <= 0.5 ? 1.5 : scWindSpeed >= 1.5 ? 0.7 : 1.0
  const stabilityMul = scStability === 'stable' ? 1.4 : scStability === 'unstable' ? 0.8 : 1.0
  const humidityMul = 1 + (scHumidity / 100) * 0.3

  const fans = farms.map((farm) => {
    const center = { lat: farm.lat, lng: farm.lng }
    const mult = (typeMultiplier[farm.livestock_type] || 1) * windMul * stabilityMul * humidityMul
    const extraRadius = (farm.livestock_count / safeMax) * (maxRadius - baseRadius)
    const radius = Math.round(Math.max(0, (baseRadius + extraRadius) * mult) * 10) / 10

    const targetDir = ((scWindDir % 360) + 360) % 360
    const startA = (targetDir - halfAngle + 360) % 360
    const endA = (targetDir + halfAngle + 360) % 360

    return { farmId: farm.id, type: farm.livestock_type, center, radius, startA, endA }
  })

  ;(self as unknown as Worker).postMessage(fans)
}

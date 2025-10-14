'use client'

import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api'
import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import LivestockCombinedFilterPanel from '@/components/asan/LivestockCombinedFilterPanel'
import LivestockPieChartPanel from '@/components/asan/LivestockPieChartPanel'
import OdorOverlay from '@/components/asan/OdorOverlay'
import WeatherPanel from '@/components/asan/WeatherPanel'
import TogglePanel from '@/components/common/TogglePanel'
import { ASAN_CENTER, containerStyle, DEFAULT_ZOOM, MARKER_SIZE, odorColorMap, typeToGroup } from '@/constants'
import useScrollLock from '@/hooks/useScrollLock'
import type { LivestockFarm } from '@/lib/types'
import { iconMap } from '@/public/images/asanFarm'
import { angleDiffDeg, hashFarmsLite, sameFans, useThrottleCallback } from '@/utils/index'

// ------------------ 컴포넌트 ------------------
export default function FarmMapPage() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  useScrollLock(true)

  // 상태
  const [farms, setFarms] = useState<LivestockFarm[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['한우', '돼지', '젖소', '육우'])
  const [selectedScales, setSelectedScales] = useState<Record<string, { min: number; max: number | null }>>({})
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showOdor, setShowOdor] = useState(true)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [mapIdle, setMapIdle] = useState(true)

  // 날씨
  const [windDir, setWindDir] = useState(0)
  const [humidity, setHumidity] = useState(50)
  const [windSpeed, setWindSpeed] = useState(1)

  // 예보
  const [fcWindSpeed, setFcWindSpeed] = useState(1)
  const [fcHumidity, setFcHumidity] = useState(50)
  const [fcWindDir, setFcWindDir] = useState(0)
  const [selFcIndex, setSelFcIndex] = useState(0)

  // 워커 결과
  const [odorFans, setOdorFans] = useState<
    Array<{
      farmId: number
      type: string
      center: { lat: number; lng: number }
      radius: number
      startA: number
      endA: number
    }>
  >([])

  // 시나리오
  const [scenario] = useState<'worst' | 'average' | 'best'>('average')

  // 맵 로더
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['geometry'],
    id: 'asan-map-loader',
  })

  const globalMaxCount = useMemo(() => (farms.length ? Math.max(...farms.map((f) => f.livestock_count)) : 1), [farms])

  // 화면 안의 농가만 보관
  const [viewportFarms, setViewportFarms] = useState<LivestockFarm[]>([])

  // memo
  const allTypes = useMemo(() => Array.from(new Set(farms.map((f) => f.livestock_type))), [farms])

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      scrollwheel: true,
    }),
    []
  )

  const markerSize = isMobile ? MARKER_SIZE.mobile : MARKER_SIZE.desktop
  const markerIcon = useMemo(
    () => (selected: boolean) => ({
      scaledSize: new google.maps.Size(
        selected ? markerSize.selected : markerSize.default,
        selected ? markerSize.selected : markerSize.default
      ),
      anchor: new google.maps.Point(markerSize.default / 2, markerSize.default),
    }),
    [markerSize]
  )

  const visibleFarms = useMemo(() => {
    return farms
      .filter((f) => selectedTypes.includes(f.livestock_type))
      .filter((f) => {
        const grp = typeToGroup[f.livestock_type]
        const range = selectedScales[grp] || { min: 0, max: null as number | null }
        return f.livestock_count >= range.min && (range.max === null || f.livestock_count < range.max)
      })
  }, [farms, selectedTypes, selectedScales])

  const envApplied = useMemo(() => {
    if (scenario === 'worst')
      return { scWindSpeed: 1, scHumidity: 98, scStability: 'stable' as const, scWindDir: windDir }
    if (scenario === 'best')
      return { scWindSpeed: 3.6, scHumidity: 0, scStability: 'unstable' as const, scWindDir: windDir }
    if (selFcIndex > 0)
      return { scWindSpeed: fcWindSpeed, scHumidity: fcHumidity, scStability: 'neutral' as const, scWindDir: fcWindDir }
    return { scWindSpeed: windSpeed, scHumidity: humidity, scStability: 'neutral' as const, scWindDir: windDir }
  }, [scenario, windDir, windSpeed, humidity, selFcIndex, fcWindSpeed, fcHumidity, fcWindDir])

  const { scWindSpeed, scHumidity, scStability, scWindDir } = envApplied

  const selectedFarm = farms.find((f) => f.id === selectedId) || null

  const visibleFarmsLite = useMemo(
    () =>
      visibleFarms.map((f) => ({
        id: f.id,
        lat: f.lat,
        lng: f.lng,
        livestock_type: f.livestock_type,
        livestock_count: f.livestock_count,
      })),
    [visibleFarms]
  )

  // 핸들러
  const handleToggleType = useCallback((t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }, [])

  const handleToggleAll = useCallback(() => {
    setSelectedTypes((prev) => (prev.length === allTypes.length ? [] : allTypes))
  }, [allTypes])

  const handleScaleChange = useCallback((grp: string, range: { min: number; max: number | null }) => {
    setSelectedScales((prev) => ({ ...prev, [grp]: range }))
  }, [])

  const handleForecastSelect = useCallback(
    (h: { wind: { speed: number; deg: number }; main: { humidity: number } }) => {
      setFcWindSpeed(h.wind.speed)
      setFcHumidity(h.main.humidity)
      setFcWindDir(h.wind.deg)
    },
    []
  )

  // 데이터 fetch
  useEffect(() => {
    fetch('/api/asan-farm')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then((data: LivestockFarm[]) => setFarms(data))
      .catch((err) => {
        console.error(err)
        alert('농가 데이터를 불러오는 중 오류가 발생했습니다.')
      })
  }, [])

  // 날씨 폴링 (setState 남발 방지: 변화 임계값)
  useEffect(() => {
    const lastRef = { dir: 0, hum: 50, spd: 1 }
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY
        if (!apiKey) return
        const lat = 36.7998,
          lon = 127.1375
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        const { data } = await axios.get(url)
        const ndir = data.wind.deg ?? 0
        const nhum = data.main.humidity ?? 50
        const nspd = data.wind.speed ?? 1
        if (angleDiffDeg(ndir, lastRef.dir) > 3) {
          setWindDir(ndir)
          lastRef.dir = ndir
        }
        if (Math.abs(nhum - lastRef.hum) > 3) {
          setHumidity(nhum)
          lastRef.hum = nhum
        }
        if (Math.abs(nspd - lastRef.spd) > 0.2) {
          setWindSpeed(nspd)
          lastRef.spd = nspd
        }
      } catch (e) {
        console.error('Weather API error', e)
      }
    }
    fetchWeather()
    const iv = window.setInterval(fetchWeather, 300_000)
    return () => window.clearInterval(iv)
  }, [])

  // 워커 세팅
  const workerRef = useRef<Worker | null>(null)
  useEffect(() => {
    try {
      const w = new Worker(new URL('@/app/workers/odorWorker.ts', import.meta.url), { type: 'module' })
      workerRef.current = w

      w.onerror = (e) => console.error('[odorWorker] runtime error:', e.message, e)
      w.onmessageerror = (e) => console.error('[odorWorker] messageerror:', e)

      w.onmessage = (e: MessageEvent<typeof odorFans>) => {
        const next = e.data
        requestAnimationFrame(() => {
          setOdorFans((prev) => (sameFans(prev, next) ? prev : next))
        })
      }
    } catch (err) {
      console.error('[odorWorker] create failed:', err)
    }
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  // 워커 호출: 환경값 OR 농가집합이 바뀌면 (스로틀)
  const lastEnvRef = useRef({ spd: 0, hum: 0, dir: 0, stab: 'neutral' as const })
  const farmsHashRef = useRef<string>('')
  const postThrottled = useThrottleCallback((payload: any) => {
    workerRef.current?.postMessage(payload)
  }, 250)

  useEffect(() => {
    if (!workerRef.current) return

    const payload = {
      farms: visibleFarmsLite,
      maxCount: globalMaxCount,
      scWindSpeed,
      scHumidity,
      scStability,
      scWindDir,
    }

    const env = { spd: scWindSpeed, hum: scHumidity, dir: scWindDir, stab: scStability }
    const envDidChange =
      Math.abs(env.spd - lastEnvRef.current.spd) > 0.2 ||
      Math.abs(env.hum - lastEnvRef.current.hum) > 3 ||
      angleDiffDeg(env.dir, lastEnvRef.current.dir) > 3 ||
      env.stab !== lastEnvRef.current.stab

    const nextHash = hashFarmsLite(visibleFarmsLite)
    const farmsDidChange = nextHash !== farmsHashRef.current

    if (!envDidChange && !farmsDidChange) return

    // Fix: Ensure type compatibility for lastEnvRef.current assignment
    lastEnvRef.current = {
      spd: env.spd,
      hum: env.hum,
      dir: env.dir,
      stab: 'neutral' as const, // force stab to 'neutral' to match type
    }
    farmsHashRef.current = nextHash

    postThrottled(payload)
  }, [visibleFarmsLite, globalMaxCount, scWindSpeed, scHumidity, scStability, scWindDir, postThrottled])

  useEffect(() => {
    if (!map) return

    const update = () => {
      const b = map.getBounds?.()
      if (!b) {
        setViewportFarms(visibleFarms)
        return
      }
      const next = visibleFarms.filter((f) => b.contains(new google.maps.LatLng(f.lat, f.lng)))
      setViewportFarms(next)
    }

    // 최초 1회
    update()

    const l1 = map.addListener('idle', update)
    const l2 = map.addListener('zoom_changed', update)
    const l3 = map.addListener('dragend', update)

    return () => {
      l1.remove()
      l2.remove()
      l3.remove()
    }
  }, [map, visibleFarms])

  // ------------------ 렌더 ------------------
  if (loadError) return <div className="flex h-screen items-center justify-center text-red-500">지도 로딩 실패</div>
  if (!isLoaded) return <div className="flex h-screen items-center justify-center">지도 로딩 중…</div>

  return (
    <div className="relative min-h-0 w-screen overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* 좌측 필터 */}
      <TogglePanel
        title="축종 및 규모 필터"
        horizontal="left-4"
        topOffset={64}
        widthClass="min-w-[200px] max-w-[24vw] sm:max-w-[20vw]"
      >
        <LivestockCombinedFilterPanel
          livestockTypes={allTypes}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
          onToggleAllTypes={handleToggleAll}
          allTypesSelected={selectedTypes.length === allTypes.length}
          onScaleChange={handleScaleChange}
          showOdor={showOdor}
          onToggleOdor={() => setShowOdor((v) => !v)}
        />
      </TogglePanel>

      {/* 우측 날씨 */}
      <TogglePanel
        title="날씨 정보"
        horizontal="right-4"
        topOffset={64}
        widthClass="min-w-[160px] max-w-[24vw] sm:max-w-[20vw]"
      >
        <WeatherPanel
          onForecastSelect={handleForecastSelect}
          scWindSpeed={scWindSpeed}
          scHumidity={scHumidity}
          onSelIndexChange={setSelFcIndex}
          selIndex={selFcIndex}
        />
      </TogglePanel>

      {/* 지도 */}
      <div className="fixed inset-0">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={ASAN_CENTER}
          zoom={DEFAULT_ZOOM}
          options={mapOptions}
          onLoad={(m) => {
            setMap(m)
            m.addListener('dragstart', () => setMapIdle(false))
            m.addListener('zoom_changed', () => setMapIdle(false))
            m.addListener('idle', () => setMapIdle(true))
          }}
        >
          {viewportFarms.map((farm) => (
            <Marker
              key={farm.id}
              position={{ lat: farm.lat, lng: farm.lng }}
              icon={{ url: iconMap[farm.livestock_type].src, ...markerIcon(farm.id === selectedId) }}
              onClick={() => setSelectedId(farm.id)}
              title={farm.farm_name}
            />
          ))}

          {/* 지도가 멈췄을 때만 오버레이 표시(원하면 mapIdle 조건 제거 가능) */}
          {showOdor &&
            map &&
            mapIdle &&
            odorFans.map((f) => {
              const cat = ['한우', '육우', '젖소'].includes(f.type)
                ? '소'
                : f.type === '돼지'
                  ? '돼지'
                  : ['종계/산란계', '육계'].includes(f.type)
                    ? '닭'
                    : f.type === '사슴'
                      ? '사슴'
                      : '기타'
              const { stroke } = odorColorMap[cat]
              return (
                // <React.Fragment key={f.farmId}>
                //   <CircleOverlay map={map} center={f.center} radius={f.radius * 0.6} color={stroke} />
                //   <SectorOverlay map={map} center={f.center} radius={f.radius * 0.8} startAngle={f.startA} endAngle={f.endA} color={stroke} />
                // </React.Fragment>
                <OdorOverlay
                  key={f.farmId}
                  map={map}
                  center={f.center}
                  radius={f.radius}
                  startAngle={f.startA}
                  endAngle={f.endA}
                  color={stroke}
                  // 기존의 0.6, 0.8 스케일 유지
                  showCircle
                  showSector
                  circleScale={0.6}
                  sectorScale={0.8}
                  // 필요하면 투명도도 여기서 조절 가능
                  circleAlpha={0.35}
                  sectorAlpha={0.4}
                />
              )
            })}

          {selectedFarm && (
            <InfoWindow
              position={{ lat: selectedFarm.lat, lng: selectedFarm.lng }}
              onCloseClick={() => setSelectedId(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div className="w-full max-w-[90vw] space-y-3 rounded-xl border-2 border-green-300 bg-white/80 p-4 text-sm break-words text-gray-800 backdrop-blur-md sm:max-w-[20rem]">
                <h3 className="text-lg font-bold text-green-700">{selectedFarm.farm_name}</h3>
                <div className="flex items-center gap-2">
                  <span className="min-w-[5rem] rounded-full bg-green-100 px-4 py-2 text-center font-medium text-green-600">
                    축종
                  </span>
                  <span>{selectedFarm.livestock_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[5rem] rounded-full bg-green-100 px-4 py-2 text-center font-medium text-green-600">
                    사육두수
                  </span>
                  <span>{selectedFarm.livestock_count.toLocaleString()}두</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[5rem] rounded-full bg-green-100 px-4 py-2 text-center font-medium text-green-600">
                    면적
                  </span>
                  <span>{selectedFarm.area_sqm.toLocaleString()}㎡</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[5rem] rounded-full bg-green-100 px-4 py-2 text-center font-medium text-green-600">
                    도로명
                  </span>
                  <span>{selectedFarm.road_address || '없음'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[5rem] rounded-full bg-green-100 px-4 py-2 text-center font-medium text-green-600">
                    지번
                  </span>
                  <span>{selectedFarm.land_address || '없음'}</span>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* 하단 차트 */}
      <TogglePanel
        title="축종별 농가 통계"
        horizontal="left-4"
        bottomOffset={12}
        widthClass="min-w-[300px] max-w-[300px] sm:min-w-[400px] sm:max-w-[400px]"
      >
        <LivestockPieChartPanel farms={farms} />
      </TogglePanel>
    </div>
  )
}

'use client'

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import FarmInfoWindow from '@/components/asan/FarmInfoWindow'
import LivestockCombinedFilterPanel from '@/components/asan/LivestockCombinedFilterPanel'
import LivestockPieChartPanel from '@/components/asan/LivestockPieChartPanel'
import OdorOverlay from '@/components/asan/OdorOverlay'
import WeatherPanel from '@/components/asan/WeatherPanel'
import TogglePanel from '@/components/common/TogglePanel'
import {
  ASAN_CENTER,
  containerStyle,
  DEFAULT_ZOOM,
  MARKER_SIZE,
  MAX_MARKERS,
  odorColorMap,
  typeToGroup,
  typeToLivestockType,
} from '@/constants'
import useScrollLock from '@/hooks/useScrollLock'
import type { LivestockFarm } from '@/lib/types'
import { iconMap } from '@/public/images/asanFarm'
import { angleDiffDeg } from '@/utils/index'

// 디바운스 기능
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function FarmMapPage() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  useScrollLock(true)

  // 상태
  const [farms, setFarms] = useState<LivestockFarm[]>([])
  const [selectedFarmDetail, setSelectedFarmDetail] = useState<LivestockFarm | null>(null)

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

  // 시나리오
  const [scenario] = useState<'worst' | 'average' | 'best'>('average')

  // 맵 로더
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['geometry'],
    id: 'asan-map-loader',
  })

  // 화면 안의 농가만 보관
  const [viewportFarms, setViewportFarms] = useState<LivestockFarm[]>([])

  // 마커 표시 제한(성능 향상)
  const [showAllMarkers, setShowAllMarkers] = useState(false)

  // 초기 선택 상태
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    typeToLivestockType.filter((type) => type.initialSelected).map((type) => type.name)
  )

  // 모든 축종 type 목록
  const allTypes = typeToLivestockType.map((type) => type.name)

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
    const filtered = farms
      .filter((f) => selectedTypes.includes(f.livestock_type))
      .filter((f) => {
        const grp = typeToGroup[f.livestock_type]
        const range = selectedScales[grp] || { min: 0, max: null as number | null }
        return f.livestock_count >= range.min && (range.max === null || f.livestock_count < range.max)
      })

    // 마커 수 제한 (성능 향상)
    if (!showAllMarkers && filtered.length > MAX_MARKERS) {
      return filtered.slice(0, MAX_MARKERS)
    }
    return filtered
  }, [farms, selectedTypes, selectedScales, showAllMarkers])

  // 필터링된 농장 풍향 데이터
  const visibleWindData = useMemo(() => {
    return visibleFarms
      .filter((farm) => farm.windData !== null)
      .map((farm) => ({
        farmId: farm.id,
        type: farm.livestock_type,
        center: { lat: farm.lat, lng: farm.lng },
        radius: farm.windData!.radius,
        startA: farm.windData!.startAngle,
        endA: farm.windData!.endAngle,
      }))
  }, [visibleFarms])

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

  // 디바운스된 환경 파라미터(API 호출 빈도 감소)
  const debouncedWindDir = useDebounce(scWindDir, 500)
  const debouncedWindSpeed = useDebounce(scWindSpeed, 500)
  const debouncedHumidity = useDebounce(scHumidity, 500)
  const debouncedStability = useDebounce(scStability, 500)

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

  // 농장 상세 정보 얻기
  const fetchFarmDetail = useCallback(async (farmId: number) => {
    try {
      const response = await fetch(`/api/asan-farm/${farmId}`)
      if (!response.ok) throw new Error(response.statusText)
      const farmDetail: LivestockFarm = await response.json()
      setSelectedFarmDetail(farmDetail)
    } catch (error) {
      console.error('농장 상세 정보 획득 실패: 농장 정보 획득 실패', error)
      setSelectedFarmDetail(null)
    }
  }, [])

  // 농장 선택 시 처리
  const handleFarmSelect = useCallback(
    (farmId: number) => {
      setSelectedId(farmId)
      fetchFarmDetail(farmId)
    },
    [fetchFarmDetail]
  )

  // 데이터 fetch
  const fetchFarmData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        windDir: debouncedWindDir.toString(),
        windSpeed: debouncedWindSpeed.toString(),
        humidity: debouncedHumidity.toString(),
        stability: debouncedStability,
      })
      if (selectedTypes.length > 0) {
        params.set('types', selectedTypes.join(','))
      }

      const response = await fetch(`/api/asan-farm?${params}`)
      if (!response.ok) throw new Error(response.statusText)

      const data = await response.json()
      setFarms(data)
    } catch (err) {
      console.error(err)
      alert('농가 데이터를 불러오는 중 오류가 발생했습니다.')
    }
  }, [debouncedWindDir, debouncedWindSpeed, debouncedHumidity, debouncedStability, selectedTypes])

  useEffect(() => {
    fetchFarmData()
  }, [fetchFarmData])

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

        {/* 마커 표시 제한 UI */}
        {visibleFarms.length > MAX_MARKERS && !showAllMarkers && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="mb-2 text-sm text-yellow-800">
              {visibleFarms.length}개의 농장 중 {MAX_MARKERS}개만 표시됩니다.
            </p>
            <button
              onClick={() => setShowAllMarkers(true)}
              className="rounded bg-yellow-200 px-3 py-1 text-sm transition-colors hover:bg-yellow-300"
            >
              모두 표시
            </button>
          </div>
        )}

        {showAllMarkers && (
          <div className="mt-2">
            <button
              onClick={() => setShowAllMarkers(false)}
              className="rounded bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300"
            >
              표시 제한 해제
            </button>
          </div>
        )}
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
              onClick={() => handleFarmSelect(farm.id)}
            />
          ))}

          {/* 지도가 멈췄을 때만 오버레이 표시(원하면 mapIdle 조건 제거 가능) */}
          {showOdor &&
            map &&
            mapIdle &&
            visibleWindData.map((f) => {
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
                <OdorOverlay
                  key={f.farmId}
                  map={map}
                  center={f.center}
                  radius={f.radius}
                  startAngle={f.startA}
                  endAngle={f.endA}
                  color={stroke}
                  showCircle
                  showSector
                  circleScale={0.6}
                  sectorScale={0.8}
                  circleAlpha={0.35}
                  sectorAlpha={0.4}
                />
              )
            })}

          {selectedFarmDetail && (
            <FarmInfoWindow
              farm={selectedFarmDetail}
              onClose={() => {
                setSelectedId(null)
                setSelectedFarmDetail(null)
              }}
            />
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

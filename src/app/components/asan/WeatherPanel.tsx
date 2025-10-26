'use client'

import axios from 'axios'
import { Cloud, CloudRain, Moon, Sun, Wind } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import { WeatherPanelSkeleton } from '../common/Skeleton'

// 날씨 아이콘 컴포넌트
const WeatherIcon = ({ condition, isNight = false }: { condition: string; isNight?: boolean }) => {
  const getIcon = () => {
    if (isNight) {
      return <Moon className="h-10 w-10 text-white/90 sm:h-16 sm:w-16" />
    }

    if (condition?.toLowerCase().includes('rain')) {
      return <CloudRain className="h-10 w-10 text-white/90 sm:h-16 sm:w-16" />
    }

    if (condition?.toLowerCase().includes('cloud')) {
      return <Cloud className="h-10 w-10 text-white/90 sm:h-16 sm:w-16" />
    }

    // Default: Sunny
    return <Sun className="h-10 w-10 text-yellow-300 sm:h-16 sm:w-16" />
  }

  return <div className="flex items-center justify-center">{getIcon()}</div>
}

interface WeatherPanelProps {
  onForecastSelect?: (hourData: any) => void
  selIndex: number
  onSelIndexChange: (i: number) => void
  scWindSpeed: number
  scHumidity: number
}

const WeatherPanel: React.FC<WeatherPanelProps> = ({
  onForecastSelect,
  scWindSpeed,
  scHumidity,
  selIndex,
  onSelIndexChange,
}) => {
  const [current, setCurrent] = useState<any>(null)
  const [forecastList, setForecastList] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false) // 초기값을 false로 변경
  const [error, setError] = useState<string | null>(null)

  const guidance = useMemo(() => {
    if (scWindSpeed <= 1.0) return '바람이 약해 악취가 넓게 퍼질 수 있습니다.'
    if (scWindSpeed >= 2.0) return '바람이 강해 악취가 빠르게 분산됩니다.'
    if (scHumidity >= 70) return '습도가 높아 악취가 오래 머물 수 있습니다.'
    if (scHumidity <= 30) return '습도가 낮아 악취 확산이 제한될 수 있습니다.'
    return '현재 조건에서 악취 확산은 보통 수준입니다.'
  }, [scWindSpeed, scHumidity])

  // 예보 데이터 1회 로드
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY!
        const lat = 36.7822,
          lon = 127.0006
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
        const res = await axios.get(url)
        setForecastList(res.data.list)
      } catch (e: any) {
        console.error('fetchForecast error', e)
      }
    }
    fetchForecast()
  }, [])

  // 실시간 모드
  useEffect(() => {
    let iv: NodeJS.Timeout
    const fetchCurrent = async () => {
      try {
        setLoading(true)
        const key = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY!
        const lat = 36.7998,
          lon = 127.1375
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
        const res = await axios.get(url)
        setCurrent(res.data)
        setLastUpdated(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }))
        setError(null)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    // selIndex가 변경될 때마다 loading 상태 초기화
    if (selIndex === 0) {
      fetchCurrent()
      iv = setInterval(fetchCurrent, 300_000)
    } else {
      // 예보 모드로 전환할 때는 loading 상태를 즉시 해제
      setLoading(false)
    }

    return () => iv && clearInterval(iv)
  }, [selIndex])

  // 예보 모드: selIndex>0 시 부모 전달
  useEffect(() => {
    if (selIndex > 0 && forecastList[selIndex]) {
      onForecastSelect?.(forecastList[selIndex])
    }
  }, [selIndex, forecastList, onForecastSelect])

  // 실시간 모드에서만 loading 표시
  if (selIndex === 0 && loading) {
    return <WeatherPanelSkeleton />
  }

  if (error) {
    return <WeatherPanelSkeleton error={error} />
  }

  const selFc = forecastList[selIndex]
  const T = current?.main?.temp
  const H = current?.main?.humidity
  const Wsp = current?.wind?.speed
  const Wdir = current?.wind?.deg
  const rain = current?.rain?.['1h'] ?? 0

  // 3시간 단위 5일치 tick
  const tickStep = 8
  const tickIndices = Array.from({ length: Math.ceil(forecastList.length / tickStep) }, (_, i) => i * tickStep).slice(
    0,
    5
  )
  const tickLabels = tickIndices.map((i) =>
    new Date(forecastList[i]?.dt * 1000).toLocaleDateString('ko-KR', {
      weekday: 'short',
    })
  )

  const getWeatherCondition = () => {
    if (selIndex === 0) {
      return current?.weather?.[0]?.main || 'Clear'
    }
    return selFc?.weather?.[0]?.main || 'Clear'
  }

  const weatherCondition = getWeatherCondition()
  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6

  return (
    <div className="max-h-[80vh] w-full overflow-y-auto p-3 sm:p-4">
      {/* 슬라이더 */}
      {forecastList.length > 0 && (
        <div className="mb-4 space-y-2 sm:mb-6">
          <div className="text-center text-xs font-semibold text-white sm:text-sm">
            <span className="text-xs font-semibold text-white sm:text-sm">악취 범위 예측 슬라이더</span>
          </div>
          <input
            type="range"
            min={0}
            max={forecastList.length - 1}
            step={1}
            value={selIndex}
            onChange={(e) => onSelIndexChange(+e.target.value)}
            className="w-full accent-blue-200"
          />
          <div className="mt-2 grid grid-cols-5 text-center text-[10px] text-white/80 sm:text-xs">
            {tickLabels.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>
        </div>
      )}

      {/* 메인 날씨 위젯 */}
      <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-300 p-3 text-white shadow-xl sm:p-6">
        {selIndex === 0 ? (
          <>
            {/* 현재 날씨 카드 */}
            <div className="mb-2 text-xs opacity-90 sm:mb-3 sm:text-sm">
              {current
                ? new Date(current.dt * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) +
                  ' ' +
                  new Date(current.dt * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                : lastUpdated}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-3xl font-bold sm:mb-2 sm:text-5xl">{T && Math.round(T)}°</div>
                <div className="mb-3 min-h-[28px] text-sm leading-tight break-words opacity-90 sm:mb-4 sm:min-h-[40px] sm:text-base sm:text-lg">
                  {current?.weather?.[0]?.description || '맑음'}
                </div>
              </div>
              <div className="flex-shrink-0">
                <WeatherIcon condition={weatherCondition} isNight={isNight} />
              </div>
            </div>
          </>
        ) : (
          selFc && (
            <>
              <div className="mb-2 text-xs opacity-90 sm:mb-3 sm:text-sm">
                {new Date(selFc.dt * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) +
                  ' ' +
                  new Date(selFc.dt * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-3xl font-bold sm:mb-2 sm:text-5xl">{Math.round(selFc.main.temp)}°</div>
                  <div className="mb-3 min-h-[28px] text-sm leading-tight break-words opacity-90 sm:mb-4 sm:min-h-[40px] sm:text-base sm:text-lg">
                    {selFc.weather?.[0]?.description || '맑음'}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <WeatherIcon condition={weatherCondition} isNight={isNight} />
                </div>
              </div>
            </>
          )
        )}
      </div>

      {/* 세부 정보 카드들 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* 습도 */}
        <div className="flex min-h-[85px] flex-col justify-between rounded-xl bg-gradient-to-br p-2 text-white backdrop-blur-sm sm:min-h-[100px] sm:p-4">
          <div className="text-xs opacity-80">습도</div>
          <div className="text-md font-bold sm:text-2xl">{selIndex === 0 ? H : selFc?.main?.humidity}%</div>
        </div>

        {/* 풍속 */}
        <div className="flex min-h-[85px] flex-col justify-between rounded-xl bg-gradient-to-br p-2 text-white backdrop-blur-sm sm:min-h-[100px] sm:p-4">
          <div className="text-xs opacity-80">풍속</div>
          <div>
            <span className="text-md font-bold sm:text-2xl">
              {selIndex === 0 ? Wsp?.toFixed(1) : selFc?.wind?.speed?.toFixed(1) || 0}
            </span>
            <span className="text-[10px] sm:text-xs"> m/s</span>
          </div>
        </div>

        {/* 풍향 */}
        <div className="flex min-h-[85px] flex-col justify-between rounded-xl bg-gradient-to-br p-2 text-white backdrop-blur-sm sm:min-h-[100px] sm:p-4">
          <div className="text-xs opacity-80">풍향</div>
          <div className="flex items-center gap-1">
            <Wind
              className="h-5 w-5 flex-shrink-0 sm:h-7 sm:w-7"
              style={{
                transform: `rotate(${((selIndex === 0 ? Wdir : selFc?.wind?.deg) || 0) - 90}deg)`,
              }}
            />
            <span className="text-md font-bold sm:text-2xl">{(selIndex === 0 ? Wdir : selFc?.wind?.deg) || 0}°</span>
          </div>
        </div>

        {/* 강수량 */}
        <div className="flex min-h-[85px] flex-col justify-between rounded-xl bg-gradient-to-br p-2 text-white backdrop-blur-sm sm:min-h-[100px] sm:p-4">
          <div className="text-xs opacity-80">강수량</div>
          <div>
            <span className="text-md font-bold sm:text-2xl">{selIndex === 0 ? rain : selFc?.rain?.['3h'] || 0}</span>
            <span className="text-[10px] sm:text-xs"> mm</span>
          </div>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="mt-4 rounded-xl bg-gradient-to-br p-3 text-center text-xs font-semibold text-white backdrop-blur-sm sm:p-4 sm:text-sm">
        <p className="break-words">{guidance}</p>
      </div>
    </div>
  )
}

export default WeatherPanel

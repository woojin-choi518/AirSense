'use client'

import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number | undefined
}

export interface ChartConfig {
  title: string
  icon: React.ReactNode
  dataKey: string
  color: string
  gradientColors?: string[]
  showTrend?: boolean
  trendColor?: string
  trendGradientColors?: string[]
  xAxisLabel?: string
  yAxisLabel?: string
  formatXAxis?: (value: string | number) => string
  formatTooltip?: (_value: number, _name: string) => [string, string]
  formatLabel?: (_label: string) => string
}

interface StatChartProps {
  data: ChartData[]
  config: ChartConfig
  height?: number
  showTrend?: boolean
}

// 그라데이션 정의
const gradients = {
  region: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  month: ['#06b6d4', '#67e8f9', '#a5f3fc'],
  trend: ['#10b981', '#34d399', '#6ee7b7'],
}

export default function StatChart({ data, config, height, showTrend = false }: StatChartProps) {
  // 화면 크기 추적
  const [windowWidth, setWindowWidth] = useState<number>(1024)

  useEffect(() => {
    // 초기 크기 설정
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)

      // 리사이즈 이벤트 핸들러
      const handleResize = () => {
        setWindowWidth(window.innerWidth)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value?: number; name?: string }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
          <p className="mb-1 text-sm font-medium text-gray-800">
            {config.formatLabel ? config.formatLabel(label || '') : `${config.xAxisLabel || '항목'}: ${label || ''}`}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
            <p className="text-sm text-gray-600">
              {config.formatTooltip
                ? config.formatTooltip(payload[0].value ?? 0, payload[0].name ?? '')
                : `${payload[0].value ?? 0}건`}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // 커스텀 바 컴포넌트
  const CustomBar = (props: { index?: number; x?: number; y?: number; width?: number; height?: number }) => {
    const { index, x, y, width, height } = props
    const gradientId = `gradient-${index}`
    const gradientColors = config.gradientColors || gradients.region

    // DOM 요소에 전달되면 안 되는 props 제거
    const svgProps = {
      x,
      y,
      width,
      height,
      rx: 4,
      ry: 4,
      fill: `url(#${gradientId})`,
    }

    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="50%" stopColor={gradientColors[1]} />
            <stop offset="100%" stopColor={gradientColors[2]} />
          </linearGradient>
        </defs>
        <rect {...svgProps} />
      </g>
    )
  }

  // 반응형 Y축 너비 계산 (화면 너비에 따라 조정)
  const getYAxisWidth = () => {
    if (windowWidth < 640) {
      // 모바일: 매우 좁게
      return config.title.includes('지역') ? 60 : 40
    } else if (windowWidth < 1024) {
      // 태블릿: 중간
      return config.title.includes('지역') ? 70 : 45
    }
    // 데스크톱: 기본값
    return config.title.includes('지역') ? 80 : 50
  }

  // 반응형 margin 계산
  const getMargin = () => {
    if (windowWidth < 640) {
      return { top: 20, right: 5, left: 5, bottom: 20 }
    } else if (windowWidth < 1024) {
      return { top: 20, right: 10, left: 10, bottom: 20 }
    }
    return { top: 20, right: 30, left: 20, bottom: 20 }
  }

  const yAxisWidth = getYAxisWidth()
  const margin = getMargin()

  // 데이터가 없으면 빈 상태 표시
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-gray-500">데이터가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full" style={{ minHeight: height ? `${height}px` : '300px' }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height || 300}>
        {showTrend || config.showTrend ? (
          <ComposedChart data={data} layout="vertical" margin={margin}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              fontSize={11}
              tickFormatter={config.formatXAxis}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={config.dataKey} shape={<CustomBar />} radius={[0, 4, 4, 0]} />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke="url(#trendGradient)"
              strokeWidth={3}
              dot={{
                fill: '#10b981',
                strokeWidth: 3,
                r: 6,
                stroke: '#ffffff',
              }}
              activeDot={{
                r: 8,
                stroke: '#10b981',
                strokeWidth: 2,
                fill: '#ffffff',
              }}
            />
          </ComposedChart>
        ) : (
          <BarChart data={data} layout="vertical" margin={margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              fontSize={11}
              tickFormatter={config.formatXAxis}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={config.dataKey} shape={<CustomBar />} radius={[0, 4, 4, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

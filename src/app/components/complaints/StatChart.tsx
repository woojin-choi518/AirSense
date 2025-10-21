'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Cell } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'

export interface ChartData {
  name: string
  value: number
  [key: string]: any
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
  formatXAxis?: (value: any) => string
  formatTooltip?: (value: number, name: string) => [string, string]
  formatLabel?: (label: string) => string
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
  trend: ['#10b981', '#34d399', '#6ee7b7']
}

export default function StatChart({ data, config, height = 256, showTrend = false }: StatChartProps) {
  const chartHeight = height

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-3">
          <p className="text-sm font-medium text-gray-800 mb-1">
            {config.formatLabel ? config.formatLabel(label) : `${config.xAxisLabel || '항목'}: ${label}`}
          </p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: config.color }}
            />
            <p className="text-sm text-gray-600">
              {config.formatTooltip ? config.formatTooltip(payload[0].value, payload[0].name)[0] : `${payload[0].value}건`}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // 커스텀 바 컴포넌트
  const CustomBar = (props: any) => {
    const { fill, payload, index, x, y, width, height, ...restProps } = props
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
      fill: `url(#${gradientId})`
    }
    
    return (
      <g>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="50%" stopColor={gradientColors[1]} />
            <stop offset="100%" stopColor={gradientColors[2]} />
          </linearGradient>
        </defs>
        <rect {...svgProps} />
      </g>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {showTrend || config.showTrend ? (
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
            <XAxis 
              dataKey="name" 
              angle={config.title.includes('지역') ? -45 : 0}
              textAnchor={config.title.includes('지역') ? "end" : "middle"}
              height={config.title.includes('지역') ? 80 : 40}
              fontSize={12}
              tickFormatter={config.formatXAxis}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={config.dataKey} shape={<CustomBar />} radius={[4, 4, 0, 0]} />
            <Line 
              type="monotone" 
              dataKey={config.dataKey} 
              stroke="url(#trendGradient)"
              strokeWidth={3}
              dot={{ 
                fill: '#10b981', 
                strokeWidth: 3, 
                r: 6,
                stroke: '#ffffff'
              }}
              activeDot={{ 
                r: 8, 
                stroke: '#10b981', 
                strokeWidth: 2,
                fill: '#ffffff'
              }}
            />
          </ComposedChart>
        ) : (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
            <XAxis 
              dataKey="name" 
              angle={config.title.includes('지역') ? -45 : 0}
              textAnchor={config.title.includes('지역') ? "end" : "middle"}
              height={config.title.includes('지역') ? 80 : 40}
              fontSize={12}
              tickFormatter={config.formatXAxis}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={config.dataKey} shape={<CustomBar />} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

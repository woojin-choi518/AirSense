'use client'

import { BarChart3, TrendingUp, Calendar } from 'lucide-react'
import StatSection from './StatSection'
import { ChartData, ChartConfig } from './StatChart'

interface ComplaintStats {
  total: number
  byRegion: { region: string; count: number }[]
  byMonth: { month: string; count: number }[]
  byTimePeriod: { timePeriod: string; count: number }[]
}

interface ComplaintStatsPanelProps {
  stats: ComplaintStats | null
  // 확장성을 위한 설정 옵션들
  config?: {
    regionChart?: {
      defaultView?: 'chart' | 'list'
      showTrend?: boolean
      height?: number
      maxItems?: number
    }
    monthChart?: {
      defaultView?: 'chart' | 'list'
      showTrend?: boolean
      height?: number
    }
    showTotal?: boolean
  }
}

export default function ComplaintStatsPanel({ stats, config = {} }: ComplaintStatsPanelProps) {
  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="text-gray-500">데이터를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  // 지역별 데이터 변환
  const regionData: ChartData[] = (stats.byRegion || [])
    .slice(0, config.regionChart?.maxItems || 5)
    .map(item => ({
      name: item.region || '알 수 없음',
      value: item.count || 0
    }))

  // 월별 데이터 변환
  const monthData: ChartData[] = (stats.byMonth || [])
    .map(item => ({
      name: item.month || '알 수 없음',
      value: item.count || 0
    }))

  // 지역별 차트 설정
  const regionConfig: ChartConfig = {
    title: '지역별 민원 건수',
    icon: <TrendingUp className="h-5 w-5 text-green-600" />,
    dataKey: 'value',
    color: '#22c55e',
    gradientColors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    trendColor: '#10b981',
    trendGradientColors: ['#10b981', '#34d399', '#6ee7b7'],
    xAxisLabel: '지역',
    formatXAxis: (value: string) => value.length > 6 ? value.substring(0, 6) + '...' : value,
    formatTooltip: (value: number) => [`${value}건`, '민원 수'],
    formatLabel: (label: string) => `지역: ${label}`
  }

  // 월별 차트 설정
  const monthConfig: ChartConfig = {
    title: '월별 민원 건수',
    icon: <Calendar className="h-5 w-5 text-purple-600" />,
    dataKey: 'value',
    color: '#8b5cf6',
    gradientColors: ['#06b6d4', '#67e8f9', '#a5f3fc'],
    trendColor: '#10b981',
    trendGradientColors: ['#10b981', '#34d399', '#6ee7b7'],
    xAxisLabel: '월',
    formatXAxis: (value: string) => `${value}월`,
    formatTooltip: (value: number) => [`${value}건`, '민원 수'],
    formatLabel: (label: string) => `월: ${label}월`
  }

  return (
    <div className="space-y-6">
      {/* 총 민원 건수 */}
      {config.showTotal !== false && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm p-6 shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">총 민원 건수</h3>
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {stats.total || 0}
          </div>
          <p className="text-sm text-gray-600 mt-2 font-medium">건</p>
        </div>
      )}

      {/* 지역별 통계 */}
      <StatSection
        title={regionConfig.title}
        icon={regionConfig.icon}
        data={regionData}
        config={regionConfig}
        defaultView={config.regionChart?.defaultView || 'chart'}
        showTrend={config.regionChart?.showTrend || true}
        height={config.regionChart?.height || 256}
      />

      {/* 월별 통계 */}
      <StatSection
        title={monthConfig.title}
        icon={monthConfig.icon}
        data={monthData}
        config={monthConfig}
        defaultView={config.monthChart?.defaultView || 'chart'}
        showTrend={config.monthChart?.showTrend || true}
        height={config.monthChart?.height || 256}
      />
    </div>
  )
}

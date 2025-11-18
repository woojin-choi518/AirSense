'use client'

import { Calendar, TrendingUp } from 'lucide-react'

import { ChartConfig, ChartData } from './StatChart'
import StatSection from './StatSection'

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
      <div className="space-y-2">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-2 shadow-sm">
          <div className="text-gray-400">데이터를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  // 지역별 데이터 변환
  const regionData: ChartData[] = (stats.byRegion || []).slice(0, config.regionChart?.maxItems || 5).map((item) => ({
    name: item.region || '알 수 없음',
    value: item.count || 0,
  }))

  // 월별 데이터 변환
  const monthData: ChartData[] = (stats.byMonth || []).map((item) => ({
    name: item.month || '알 수 없음',
    value: item.count || 0,
  }))

  // 지역별 차트 설정 (모던 인디고 톤)
  const regionConfig: ChartConfig = {
    title: '지역별 민원 건수',
    icon: <TrendingUp className="h-5 w-5 text-indigo-600" />,
    dataKey: 'value',
    color: '#6366f1',
    gradientColors: ['#e0e7ff', '#c7d2fe', '#a5b4fc'],
    trendColor: '#10b981',
    trendGradientColors: ['#d1fae5', '#a7f3d0', '#86efac'],
    xAxisLabel: '지역',
    formatXAxis: (value: string) => (value.length > 6 ? value.substring(0, 6) + '...' : value),
    formatTooltip: (value: number) => [`${value}건`, '민원 수'],
    formatLabel: (label: string) => `지역: ${label}`,
  }

  // 월별 차트 설정 (모던 퍼플 톤)
  const monthConfig: ChartConfig = {
    title: '월별 민원 건수',
    icon: <Calendar className="h-5 w-5 text-purple-600" />,
    dataKey: 'value',
    color: '#8b5cf6',
    gradientColors: ['#f3e8ff', '#e9d5ff', '#ddd6fe'],
    trendColor: '#10b981',
    trendGradientColors: ['#d1fae5', '#a7f3d0', '#86efac'],
    xAxisLabel: '월',
    formatXAxis: (value: string) => `${value}월`,
    formatTooltip: (value: number) => [`${value}건`, '민원 수'],
    formatLabel: (label: string) => `월: ${label}월`,
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 lg:h-full">
      {/* 지역별 통계 */}
      <div className="min-h-0 flex-1">
        <StatSection
          title={regionConfig.title}
          icon={regionConfig.icon}
          data={regionData}
          config={regionConfig}
          defaultView={config.regionChart?.defaultView || 'chart'}
          showTrend={config.regionChart?.showTrend || true}
          height={config.regionChart?.height || 300}
        />
      </div>

      {/* 월별 통계 */}
      <div className="min-h-0 flex-1">
        <StatSection
          title={monthConfig.title}
          icon={monthConfig.icon}
          data={monthData}
          config={monthConfig}
          defaultView={config.monthChart?.defaultView || 'chart'}
          showTrend={config.monthChart?.showTrend || true}
          height={config.monthChart?.height || 300}
        />
      </div>
    </div>
  )
}

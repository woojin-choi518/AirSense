'use client'

import { BarChart3, Calendar, TrendingUp } from 'lucide-react'

import Panel from '@/components/common/Panel'

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
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="text-gray-500">데이터를 불러오는 중...</div>
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
    formatXAxis: (value: string) => (value.length > 6 ? value.substring(0, 6) + '...' : value),
    formatTooltip: (value: number) => [`${value}건`, '민원 수'],
    formatLabel: (label: string) => `지역: ${label}`,
  }

  // 월별 차트 설정
  const monthConfig: ChartConfig = {
    title: '월별 민원 건수',
    icon: <Calendar className="h-5 w-5 text-green-600" />,
    dataKey: 'value',
    color: '#8b5cf6',
    gradientColors: ['#222222', '#444444', '#f5f5f5'],
    trendColor: '#10b981',
    trendGradientColors: ['#10b981', '#34d399', '#6ee7b7'],
    xAxisLabel: '월',
    formatXAxis: (value: string) => `${value}월`,
    formatTooltip: (value: number) => [`${value}건`, '민원 수'],
    formatLabel: (label: string) => `월: ${label}월`,
  }

  return (
    <div className="space-y-6">
      {/* 총 민원 건수 */}
      {config.showTotal !== false && (
        <Panel title="총 민원 건수" icon={BarChart3} variant="blue" textAlign="left">
          <div>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
              {stats.total || 0}
            </div>
            <p className="mt-2 text-sm font-medium text-gray-600">건</p>
          </div>
        </Panel>
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

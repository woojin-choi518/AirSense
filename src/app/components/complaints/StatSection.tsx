'use client'

import { BarChart3, List } from 'lucide-react'
import { useEffect, useState } from 'react'

import StatChart, { ChartConfig, ChartData } from './StatChart'

interface StatSectionProps {
  title: string
  icon: React.ReactNode
  data: ChartData[]
  config: ChartConfig
  defaultView?: 'chart' | 'list'
  showTrend?: boolean
  height?: number
}

export default function StatSection({
  title,
  icon,
  data,
  config,
  defaultView = 'chart',
  showTrend = false,
  height = 256,
}: StatSectionProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>(defaultView)

  // defaultView prop이 변경되면 상태 동기화
  useEffect(() => {
    setViewMode(defaultView)
  }, [defaultView])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900">
          <div className="rounded-lg bg-gray-50 p-2">{icon}</div>
          {title}
        </h3>
        <button
          onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
        >
          {viewMode === 'chart' ? (
            <>
              <List className="h-4 w-4" />
              목록
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              차트
            </>
          )}
        </button>
      </div>

      {viewMode === 'chart' ? (
        <div
          className="min-h-0 flex-1 rounded-xl border border-gray-100 bg-gray-50/50"
          style={{ minHeight: `${height}px` }}
        >
          <StatChart data={data} config={config} height={height} showTrend={showTrend} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {data.map((item, index) => (
            <div
              key={item.name || index}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
            >
              <span className="truncate text-sm font-medium text-gray-700">{item.name || '알 수 없음'}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-sm font-semibold" style={{ color: config.color }}>
                  {item.value || 0}건
                </span>
              </div>
            </div>
          )) || <div className="py-8 text-center text-sm text-gray-500">데이터가 없습니다.</div>}
        </div>
      )}
    </div>
  )
}

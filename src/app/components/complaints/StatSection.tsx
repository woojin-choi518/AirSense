'use client'

import { useState } from 'react'

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

  return (
    <div className="rounded-2xl border border-gray-100/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-2">{icon}</div>
          {title}
        </h3>
        <button
          onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
          className="rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:from-gray-100 hover:to-gray-200 hover:text-gray-900"
        >
          {viewMode === 'chart' ? '📊 목록' : '📈 차트'}
        </button>
      </div>

      {viewMode === 'chart' ? (
        <div className="rounded-xl border border-gray-100/50 bg-gradient-to-br from-gray-50/50 to-white/50 p-4">
          <StatChart data={data} config={config} height={height} showTrend={showTrend} />
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.name || index}
              className="flex items-center justify-between rounded-xl border border-gray-100/30 bg-gradient-to-r from-gray-50/50 to-white/50 p-3 transition-all duration-200 hover:from-gray-100/50 hover:to-gray-50/50"
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

'use client'

import { useState } from 'react'
import StatChart, { ChartData, ChartConfig } from './StatChart'

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
  height = 256
}: StatSectionProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>(defaultView)

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-800">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
            {icon}
          </div>
          {title}
        </h3>
        <button
          onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
          className="px-4 py-2 text-sm bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 border border-gray-200/50 font-medium text-gray-700 hover:text-gray-900"
        >
          {viewMode === 'chart' ? '📊 목록 보기' : '📈 차트 보기'}
        </button>
      </div>
      
      {viewMode === 'chart' ? (
        <div className="rounded-xl bg-gradient-to-br from-gray-50/50 to-white/50 p-4 border border-gray-100/50">
          <StatChart 
            data={data} 
            config={config} 
            height={height}
            showTrend={showTrend}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.name || index} className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 hover:from-gray-100/50 hover:to-gray-50/50 transition-all duration-200 border border-gray-100/30">
              <span className="text-sm font-medium text-gray-700 truncate">{item.name || '알 수 없음'}</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-semibold" style={{ color: config.color }}>
                  {item.value || 0}건
                </span>
              </div>
            </div>
          )) || <div className="text-sm text-gray-500 text-center py-8">데이터가 없습니다.</div>}
        </div>
      )}
    </div>
  )
}

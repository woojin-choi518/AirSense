'use client'

import { Calendar, ChevronDown, Clock, Filter, MapPin } from 'lucide-react'
import { useState } from 'react'

interface FilterPanelProps {
  dateRange: {
    start: string
    end: string
  }
  setDateRange: (newRange: { start: string; end: string }) => void
  selectedRegion: string
  setSelectedRegion: (region: string) => void
  selectedTimePeriod: string
  setSelectedTimePeriod: (period: string) => void
  allRegions: { region: string; count: number }[]
  stats: {
    byTimePeriod: { timePeriod: string; count: number }[]
  } | null
}

export default function FilterPanel({
  dateRange,
  setDateRange,
  selectedRegion,
  setSelectedRegion,
  selectedTimePeriod,
  setSelectedTimePeriod,
  allRegions,
  stats,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-6 transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">범위 설정</h2>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
        />
      </button>
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 날짜 범위 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <Calendar className="mr-1 inline h-4 w-4" />
            날짜 범위
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* 지역 선택 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <MapPin className="mr-1 inline h-4 w-4" />
            지역
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="all">전체 지역</option>
            {allRegions?.map((item) => (
              <option key={item?.region || 'unknown'} value={item?.region || ''}>
                {item?.region || '알 수 없음'} ({item?.count || 0}건)
              </option>
            )) || <option value="">데이터 없음</option>}
          </select>
        </div>

        {/* 시간대 선택 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <Clock className="mr-1 inline h-4 w-4" />
            시간대
          </label>
          <select
            value={selectedTimePeriod}
            onChange={(e) => setSelectedTimePeriod(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="all">전체 시간대</option>
            {stats?.byTimePeriod?.map((item) => (
              <option key={item?.timePeriod || 'unknown'} value={item?.timePeriod || ''}>
                {item?.timePeriod || '미분류'} ({item?.count || 0}건)
              </option>
            )) || <option value="">데이터 없음</option>}
          </select>
        </div>
      </div>
    </div>
    )}
  </div>
  )
}

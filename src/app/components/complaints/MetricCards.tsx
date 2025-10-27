'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'

interface ComplaintStats {
  total: number
  byRegion: { region: string; count: number }[]
  byMonth: { month: string; count: number }[]
}

interface MetricCardsProps {
  stats: ComplaintStats | null
  dateRange?: { start: string; end: string }
}

export default function MetricCards({ stats, dateRange }: MetricCardsProps) {
  if (!stats) return null

  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}.${date.getDate()}`
  }

  // 월별 비교 데이터
  const lastMonth = stats.byMonth?.[stats.byMonth.length - 1]
  const prevMonth = stats.byMonth?.[stats.byMonth.length - 2]
  const monthDiff = (lastMonth?.count || 0) - (prevMonth?.count || 0)
  const isIncreasing = monthDiff > 0

  // 카드 공통 스타일
  const cardBaseStyles =
    'flex flex-col justify-between rounded-xl bg-white p-2 shadow-sm transition-all hover:shadow sm:p-4 md:p-3'
  const titleStyles = 'text-[10px] font-medium text-gray-700 sm:text-xs md:text-sm'
  const valueStyles = 'text-sm font-bold text-gray-900 sm:text-2xl md:text-3xl'
  const subTextStyles = 'text-[9px] text-gray-500 sm:text-xs'

  return (
    <div className="mb-8 grid grid-cols-4 gap-1 sm:gap-3 md:gap-4">
      {/* 총 민원 건수 */}
      <div className={cardBaseStyles}>
        <h3 className={titleStyles}>총 민원 건수</h3>
        <div className="space-y-0.5">
          <div className={valueStyles}>{stats.total || 0}</div>
          {dateRange && (
            <p className={subTextStyles}>
              {formatDate(dateRange.start)} ~ {formatDate(dateRange.end)}
            </p>
          )}
        </div>
      </div>

      {/* 민원 발생지 */}
      <div className={cardBaseStyles}>
        <h3 className={titleStyles}>민원 발생지</h3>
        <div className="space-y-0.5">
          <div className={valueStyles}>{stats.byRegion?.length || 0}</div>
          <p className={subTextStyles}>아산 및 인접 지역</p>
        </div>
      </div>

      {/* 최다 민원 지역 */}
      <div className={cardBaseStyles}>
        <h3 className={titleStyles}>최다 민원 지역</h3>
        <div className="space-y-0.5">
          <div className={valueStyles}>{stats.byRegion?.[0]?.count || 0}</div>
          {stats.byRegion?.[0]?.region && (
            <p className="text-[9px] text-gray-600 sm:text-xs">{stats.byRegion[0].region}</p>
          )}
        </div>
      </div>

      {/* 최근 민원 */}
      <div className={cardBaseStyles}>
        <h3 className={titleStyles}>최근 민원</h3>
        <div className="space-y-0.5">
          <div className={valueStyles}>
            {lastMonth?.count || 0}
            {lastMonth?.month && <span className="ml-1 text-[9px] text-gray-600 sm:text-xs">{lastMonth.month}월</span>}
          </div>
          {stats.byMonth.length >= 2 && prevMonth && (
            <div
              className={`flex items-center gap-0.5 text-[9px] font-medium sm:gap-1 sm:text-sm ${
                isIncreasing ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {isIncreasing ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="ml-1 text-[9px] text-emerald-600 sm:text-xs">
                {isIncreasing ? '+' : ''}
                {Math.abs(monthDiff)}건 vs {prevMonth.month}월
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

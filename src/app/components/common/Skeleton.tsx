'use client'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

export function Skeleton({ className = '', children, style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded border border-white/10 bg-gradient-to-r from-white/20 via-white/30 to-white/20 backdrop-blur-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

// 필터 패널 스켈레톤
export function FilterPanelSkeleton() {
  return (
    <div className="mb-8 rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* 날짜 범위 */}
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>

        {/* 지역 선택 */}
        <div>
          <Skeleton className="mb-2 h-4 w-12" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>

        {/* 시간대 선택 */}
        <div>
          <Skeleton className="mb-2 h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// 지도 스켈레톤
export function MapSkeleton() {
  return (
    <div className="rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="relative overflow-hidden rounded-lg">
        <Skeleton className="h-96 w-full" />
        {/* 지도 마커들을 시뮬레이션하는 작은 원들 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// 통계 패널 스켈레톤
export function StatsPanelSkeleton() {
  return (
    <div className="space-y-6">
      {/* 총계 카드 */}
      <div className="rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <Skeleton className="mb-2 h-6 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>

      {/* 지역별 차트 */}
      <div className="rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 월별 차트 */}
      <div className="rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="relative h-48">
          <Skeleton className="h-full w-full rounded-lg" />
          {/* 차트 바들을 시뮬레이션 */}
          <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between px-2 pb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className={`w-2 rounded-t`} style={{ height: `${Math.random() * 60 + 20}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 민원 리스트 스켈레톤
export function ComplaintListSkeleton() {
  return (
    <div className="mt-6 rounded-2xl border border-red-100/50 bg-gradient-to-br from-red-50/80 to-orange-50/80 p-6 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>

      {/* 정렬 버튼들 */}
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* Content */}
      <div className="max-h-96 space-y-4 overflow-y-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100/50 bg-white/80 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>

            {/* 민원 내용 */}
            <div className="mb-3">
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* 상세 정보 */}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-gray-200/50 pt-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// 날씨 패널 스켈레톤
interface WeatherPanelSkeletonProps {
  error?: string | null
}

export function WeatherPanelSkeleton({ error }: WeatherPanelSkeletonProps) {
  return (
    <div className="max-h-[80vh] w-full overflow-y-auto p-2">
      {/* 슬라이더 스켈레톤 */}
      <div className="space-y-1 p-1">
        <div className="text-center text-sm text-white">
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-full rounded-full" />
        <div className="mt-2 grid grid-cols-5 text-center text-xs text-white">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="mx-auto h-3 w-8" />
          ))}
        </div>
      </div>

      {/* 데이터 블록 스켈레톤 */}
      <div className="mb-4 flex flex-col items-center justify-center space-y-2">
        <Skeleton className="h-6 w-full rounded-full" />
        <div className="mb-4 w-full space-y-2">
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
        </div>
      </div>

      {/* 에러 메시지 또는 안내 문구 스켈레톤 */}
      {error ? (
        <div className="mb-4 flex flex-col items-center justify-center space-y-2">
          <div className="w-full rounded-full bg-red-500/20 p-2 text-center text-sm text-red-300">Error: {error}</div>
        </div>
      ) : (
        <Skeleton className="h-12 w-full rounded-lg" />
      )}
    </div>
  )
}

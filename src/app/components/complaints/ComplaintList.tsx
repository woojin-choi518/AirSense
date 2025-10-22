'use client'

import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'

interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

interface ComplaintListProps {
  complaints: Complaint[]
  totalCount: number
  onClose: () => void
  isVisible: boolean
}

type SortOption = 'newest' | 'oldest' | 'region'

export default function ComplaintList({ complaints, totalCount, onClose, isVisible }: ComplaintListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  if (!isVisible || complaints.length === 0) return null

  // 정렬 함수
  const getSortedComplaints = () => {
    const sorted = [...complaints]

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      case 'region':
        return sorted.sort((a, b) => a.region.localeCompare(b.region))
      default:
        return sorted
    }
  }

  const sortedComplaints = getSortedComplaints()

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest':
        return '최신순'
      case 'oldest':
        return '오래된순'
      case 'region':
        return '지역순'
      default:
        return '최신순'
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-red-100/50 bg-gradient-to-br from-red-50/80 to-orange-50/80 p-6 shadow-lg backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">민원 상세 정보</h3>
          <p className="text-gray-600">
            이 위치 주변에 총 <span className="font-bold text-red-600">{totalCount}건</span>의 민원이 있습니다.
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-red-100 hover:text-gray-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 정렬 버튼들 */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSortBy('newest')}
          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
            sortBy === 'newest'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 text-gray-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <ArrowDown className="h-4 w-4" />
          최신순
        </button>
        <button
          onClick={() => setSortBy('oldest')}
          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
            sortBy === 'oldest'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 text-gray-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <ArrowUp className="h-4 w-4" />
          오래된순
        </button>
        <button
          onClick={() => setSortBy('region')}
          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
            sortBy === 'region'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-white/80 text-gray-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <ArrowUpDown className="h-4 w-4" />
          지역순
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 space-y-4 overflow-y-auto">
        {sortedComplaints.map((complaint, index) => (
          <div
            key={complaint.id}
            className="rounded-xl border border-gray-100/50 bg-white/80 p-4 transition-all duration-200 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-600">민원 #{complaint.id}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {new Date(complaint.date).toLocaleDateString('ko-KR')}
              </div>
            </div>

            {/* 민원 내용 */}
            <div className="mb-3">
              <p className="leading-relaxed font-medium text-gray-800">
                민원 #{complaint.id} - {complaint.region}
              </p>
            </div>

            {/* 상세 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{complaint.region}</span>
              </div>
              {complaint.period && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{complaint.period}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-gray-200/50 pt-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>총 {totalCount}건의 민원</span>
          <span>{getSortLabel(sortBy)}으로 정렬</span>
        </div>
      </div>
    </div>
  )
}

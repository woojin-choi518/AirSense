'use client'

import { Calendar, MapPin, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'

interface Complaint {
  id: number
  receivedDate: string
  content: string
  region: string
  year: number
  timePeriod: string | null
  latitude: number | null
  longitude: number | null
  roadAddress: string | null
  landAddress: string | null
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
        return sorted.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime())
      case 'region':
        return sorted.sort((a, b) => a.region.localeCompare(b.region))
      default:
        return sorted
    }
  }

  const sortedComplaints = getSortedComplaints()

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'newest': return '최신순'
      case 'oldest': return '오래된순'
      case 'region': return '지역순'
      default: return '최신순'
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-red-50/80 to-orange-50/80 backdrop-blur-sm p-6 shadow-lg border border-red-100/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">민원 상세 정보</h3>
          <p className="text-gray-600">
            이 위치 주변에 총 <span className="font-bold text-red-600">{totalCount}건</span>의 민원이 있습니다.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-red-100 rounded-xl transition-colors text-gray-600 hover:text-gray-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 정렬 버튼들 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortBy('newest')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
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
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
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
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
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
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedComplaints.map((complaint, index) => (
          <div 
            key={complaint.id} 
            className="bg-white/80 rounded-xl p-4 border border-gray-100/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-600">민원 #{complaint.id}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                {new Date(complaint.receivedDate).toLocaleDateString('ko-KR')}
              </div>
            </div>

            {/* 민원 내용 */}
            <div className="mb-3">
              <p className="text-gray-800 font-medium leading-relaxed">
                {complaint.content}
              </p>
            </div>

            {/* 상세 정보 */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{complaint.region}</span>
              </div>
              
              {complaint.timePeriod && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{complaint.timePeriod}</span>
                </div>
              )}

              {complaint.roadAddress && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="truncate max-w-[200px]" title={complaint.roadAddress}>
                    {complaint.roadAddress}
                  </span>
                </div>
              )}
            </div>

            {/* 주소 정보 */}
            {complaint.landAddress && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50/50 rounded-lg p-2">
                <span className="font-medium">지번 주소:</span> {complaint.landAddress}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>총 {totalCount}건의 민원</span>
          <span>{getSortLabel(sortBy)}으로 정렬</span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, ChevronLeft, ChevronRight, Clock, List, MapPin } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { API_VERSION } from '@/app/constants'
import Panel from '@/components/common/Panel'

interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

interface ComplaintWithContent extends Complaint {
  content?: string
  roadAddress?: string | null
  landAddress?: string | null
}

interface ComplaintListProps {
  complaints: Complaint[]
  totalCount: number
  onClose: () => void
  isVisible: boolean
}

type SortOption = 'newest' | 'oldest' | 'region'

export default function ComplaintList({ complaints, totalCount, onClose, isVisible }: ComplaintListProps) {
  const [complaintsWithContent, setComplaintsWithContent] = useState<ComplaintWithContent[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const itemsPerPage = 20

  // 민원 content 로드 함수
  const loadComplaintsContent = useCallback(
    async (page: number) => {
      if (complaints.length === 0) return

      try {
        setLoading(true)
        // 로딩 시작 시 기존 데이터 초기화하여 스켈레톤 표시
        setComplaintsWithContent([])
        const complaintIds = complaints.map((c) => c.id)

        const response = await fetch(`/api/${API_VERSION}/complaints/content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: page,
            limit: itemsPerPage,
            ids: complaintIds,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setComplaintsWithContent(data.complaints || [])
        setTotalPages(Math.ceil(data.totalCount / itemsPerPage))
      } catch (error) {
        console.error('민원 content 로드 오류:', error)
        setComplaintsWithContent([])
      } finally {
        setLoading(false)
      }
    },
    [complaints, itemsPerPage]
  )

  // 컴포넌트가 표시될 때 첫 페이지 로드
  useEffect(() => {
    if (isVisible && complaints.length > 0) {
      setCurrentPage(1)
      loadComplaintsContent(1)
    }
  }, [isVisible, complaints, loadComplaintsContent])

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (isVisible && complaints.length > 0) {
      loadComplaintsContent(currentPage)
    }
  }, [currentPage, isVisible, complaints.length, loadComplaintsContent])

  if (!isVisible || complaints.length === 0) return null

  // 정렬 함수
  const getSortedComplaints = () => {
    const sorted = [...complaintsWithContent]

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      case 'region':
        return sorted.sort((a, b) => (a.region || '').localeCompare(b.region || ''))
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
    <div className="mt-6">
      <Panel title="민원 상세 정보" icon={List} variant="red">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            이 위치 주변에 총 <span className="font-bold text-red-600">{totalCount}건</span>의 민원이 있습니다.
          </p>
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
        <div className="max-h-64 space-y-4 overflow-y-auto">
          {loading
            ? // 로딩 시 스켈레톤 아이템들 표시
              Array.from({ length: 5 }, (_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="animate-pulse rounded-xl border border-gray-100/50 bg-white/80 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                      <div className="h-4 w-16 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </div>
                  <div className="mb-3">
                    <div className="mb-2 h-4 rounded bg-gray-200"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-4 w-20 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))
            : sortedComplaints.map((complaint, index) => (
                <div
                  key={complaint.id}
                  className="rounded-xl border border-gray-100/50 bg-white/80 p-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-xs font-bold text-white">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-600">연번 : {complaint.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(complaint.date).toLocaleDateString('ko-KR')}
                    </div>
                  </div>

                  {/* 민원 내용 */}
                  <div className="mb-3">
                    <p className="leading-relaxed text-gray-800">{complaint.content || '내용을 불러오는 중...'}</p>
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
                    {complaint.roadAddress && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="text-xs">{complaint.roadAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-red-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 border-t border-gray-200/50 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>총 {totalCount}건의 민원</span>
            <div className="flex items-center gap-4">
              <span>{getSortLabel(sortBy)}으로 정렬</span>
              <span>
                페이지 {currentPage} / {totalPages}
              </span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

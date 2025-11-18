'use client'

import { useState } from 'react'

import { FilterPanelSkeleton, MapSkeleton, StatsPanelSkeleton } from '@/components/common/Skeleton'
import ComplaintMapSection from '@/components/complaints/ComplaintMapSection'
import ComplaintStatsPanel from '@/components/complaints/ComplaintStatsPanel'
import FilterPanel from '@/components/complaints/FilterPanel'
import MetricCards from '@/components/complaints/MetricCards'
import { useComplaintData } from '@/hooks/useComplaintData'

interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

export default function ComplaintsPage() {
  const { filteredComplaints, stats, allRegions, loading, filters, updateFilters } = useComplaintData()
  const [, setSelectedComplaint] = useState<Complaint | null>(null)
  const [selectedClusterComplaints, setSelectedClusterComplaints] = useState<Complaint[]>([])
  const [showComplaintList, setShowComplaintList] = useState(false)

  const handleMarkerClick = (cluster: { complaints: Complaint[]; count: number }) => {
    // 클러스터의 모든 민원을 설정하고 리스트 모달 표시
    setSelectedClusterComplaints(cluster.complaints)
    setShowComplaintList(true)

    // 가장 최근 민원을 선택된 민원으로 설정 (기존 기능 유지)
    const latestComplaint = cluster.complaints.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
    setSelectedComplaint(latestComplaint)
  }

  const handleCloseComplaintList = () => {
    setShowComplaintList(false)
    setSelectedClusterComplaints([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page Header */}
        <div className="center mb-8 rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">민원 관리 시스템</h1>
          <p className="text-gray-600">아산시 민원 발생 현황을 확인하고 분석하세요</p>
        </div>

        {/* Key Metrics Cards */}
        {!loading && <MetricCards stats={stats} dateRange={filters.dateRange} />}

        {/* Filter Panel */}
        {loading ? (
          <FilterPanelSkeleton />
        ) : (
          <div className="mb-8">
            <FilterPanel
              dateRange={filters.dateRange}
              setDateRange={(newRange) => updateFilters({ dateRange: newRange })}
              selectedRegion={filters.selectedRegion}
              setSelectedRegion={(region) => updateFilters({ selectedRegion: region })}
              selectedTimePeriod={filters.selectedTimePeriod}
              setSelectedTimePeriod={(period) => updateFilters({ selectedTimePeriod: period })}
              allRegions={allRegions}
              stats={stats}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:h-[70vh] lg:grid-cols-3 lg:items-stretch">
          {/* Map Section */}
          <div className="lg:col-span-2 lg:h-full">
            {loading ? (
              <MapSkeleton />
            ) : (
              <ComplaintMapSection
                complaints={filteredComplaints}
                selectedClusterComplaints={selectedClusterComplaints}
                showComplaintList={showComplaintList}
                onMarkerClick={handleMarkerClick}
                onCloseComplaintList={handleCloseComplaintList}
              />
            )}
          </div>

          {/* Statistics Section */}
          <div className="flex flex-col lg:h-full">
            {loading ? (
              <StatsPanelSkeleton />
            ) : (
              <ComplaintStatsPanel
                stats={stats}
                config={{
                  regionChart: {
                    defaultView: 'chart',
                    showTrend: true,
                    height: 400,
                    maxItems: 5,
                  },
                  monthChart: {
                    defaultView: 'chart',
                    showTrend: true,
                    height: 400,
                  },
                  showTotal: true,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

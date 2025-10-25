'use client'

import { GoogleMap, Marker } from '@react-google-maps/api'
import { Calendar, Clock, Filter, MapPin } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { FilterPanelSkeleton, MapSkeleton, StatsPanelSkeleton } from '@/components/common/Skeleton'
import ComplaintList from '@/components/complaints/ComplaintList'
import ComplaintStatsPanel from '@/components/complaints/ComplaintStatsPanel'
import { ASAN_CENTER } from '@/constants'

const mapContainerStyle = {
  width: '100%',
  height: '500px',
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
}

interface Complaint {
  id: number
  date: string
  region: string
  lat: number | null
  lng: number | null
  period: string | null
}

interface ComplaintStats {
  total: number
  byRegion: { region: string; count: number }[]
  byMonth: { month: string; count: number }[]
  byTimePeriod: { timePeriod: string; count: number }[]
}

export default function ComplaintsPage() {
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [allRegions, setAllRegions] = useState<{ region: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [, setSelectedComplaint] = useState<Complaint | null>(null)
  const [selectedClusterComplaints, setSelectedClusterComplaints] = useState<Complaint[]>([])
  const [showComplaintList, setShowComplaintList] = useState(false)

  // 필터 상태
  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: '2025-12-31',
  })
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all')

  // 모든 데이터를 한 번만 로드 (필터 없이)
  const loadComplaintsData = useCallback(async () => {
    try {
      setLoading(true)
      setAllComplaints([])

      console.log('민원 데이터 로딩 시작...')

      // 모든 데이터를 한 번에 로드 (필터 없이)
      const params = new URLSearchParams({
        page: '1',
        limit: '5000', // 한 번에 최대 5000개
      })

      const response = await fetch(`/api/complaints?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAllComplaints(data.complaints || [])

      // 전체 지역 통계 계산 (필터링과 관계없이)
      const allRegionStats = getRegionStats(data.complaints || [])
      setAllRegions(allRegionStats)

      console.log(`모든 데이터 로딩 완료: ${data.complaints?.length || 0}건`)
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      setAllComplaints([])
    } finally {
      setLoading(false)
    }
  }, []) // 의존성 배열을 비워서 한 번만 로드

  // 클라이언트 사이드 필터링
  const applyFilters = useCallback(() => {
    if (allComplaints.length === 0) return

    const filtered = allComplaints.filter((complaint) => {
      // 날짜 필터
      const complaintDate = new Date(complaint.date)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)

      if (complaintDate < startDate || complaintDate > endDate) {
        return false
      }

      // 지역 필터
      if (selectedRegion !== 'all' && complaint.region !== selectedRegion) {
        return false
      }

      // 시간대 필터
      if (selectedTimePeriod !== 'all' && complaint.period !== selectedTimePeriod) {
        return false
      }

      return true
    })

    setFilteredComplaints(filtered)

    // 통계 계산
    const stats: ComplaintStats = {
      total: filtered.length,
      byRegion: getRegionStats(filtered),
      byMonth: getMonthStats(filtered),
      byTimePeriod: getTimePeriodStats(filtered),
    }

    setStats(stats)
    console.log(`필터링 완료: ${filtered.length}건`)
  }, [allComplaints, dateRange, selectedRegion, selectedTimePeriod])

  // 통계 계산 함수들
  const getRegionStats = (complaints: Complaint[]) => {
    const regionCounts: { [key: string]: number } = {}
    complaints.forEach((complaint) => {
      const region = complaint.region || '미분류'
      regionCounts[region] = (regionCounts[region] || 0) + 1
    })
    return Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
  }

  const getMonthStats = (complaints: Complaint[]) => {
    const monthCounts: { [key: string]: number } = {}
    complaints.forEach((complaint) => {
      const month = (new Date(complaint.date).getMonth() + 1).toString()
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => parseInt(a.month) - parseInt(b.month))
  }

  const getTimePeriodStats = (complaints: Complaint[]) => {
    const timePeriodCounts: { [key: string]: number } = {}
    complaints.forEach((complaint) => {
      const timePeriod = complaint.period || '미분류'
      timePeriodCounts[timePeriod] = (timePeriodCounts[timePeriod] || 0) + 1
    })
    return Object.entries(timePeriodCounts)
      .map(([timePeriod, count]) => ({ timePeriod, count }))
      .sort((a, b) => b.count - a.count)
  }

  // 초기 데이터 로드 (한 번만)
  useEffect(() => {
    loadComplaintsData()
  }, [loadComplaintsData])

  // 필터 변경 시 클라이언트 사이드 필터링 적용
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

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

  // 두 지점 간의 거리 계산 (미터 단위)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000 // 지구 반지름 (미터)
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // 효율적인 클러스터링 알고리즘 (공간 해시 사용)
  const createClusteredMarkers = (complaints: Complaint[]) => {
    const clusteredMarkers: Array<{
      position: { lat: number; lng: number }
      count: number
      complaints: Complaint[]
      region: string
    }> = []

    // 유효한 좌표가 있는 민원만 필터링
    const validComplaints = complaints.filter((c) => c.lat && c.lng)

    if (validComplaints.length === 0) return clusteredMarkers

    // 공간 해시 맵 생성 (100m 격자)
    const gridSize = 0.001 // 약 100m에 해당하는 위도/경도 차이
    const spatialHash = new Map<string, Complaint[]>()

    // 각 민원을 격자에 배치
    validComplaints.forEach((complaint) => {
      const gridKey = `${Math.floor(complaint.lat! / gridSize)},${Math.floor(complaint.lng! / gridSize)}`

      if (!spatialHash.has(gridKey)) {
        spatialHash.set(gridKey, [])
      }
      spatialHash.get(gridKey)!.push(complaint)
    })

    const processed = new Set<number>()

    // 각 격자에서 클러스터링 수행
    spatialHash.forEach((gridComplaints) => {
      gridComplaints.forEach((complaint) => {
        if (processed.has(complaint.id)) return

        const cluster: Complaint[] = [complaint]
        processed.add(complaint.id)

        // 인접 격자들도 확인 (3x3 격자)
        const baseGridX = Math.floor(complaint.lat! / gridSize)
        const baseGridY = Math.floor(complaint.lng! / gridSize)

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${baseGridX + dx},${baseGridY + dy}`
            const neighborComplaints = spatialHash.get(neighborKey) || []

            neighborComplaints.forEach((otherComplaint) => {
              if (processed.has(otherComplaint.id) || otherComplaint.id === complaint.id) {
                return
              }

              const distance = calculateDistance(
                complaint.lat!,
                complaint.lng!,
                otherComplaint.lat!,
                otherComplaint.lng!
              )

              if (distance <= 100) {
                cluster.push(otherComplaint)
                processed.add(otherComplaint.id)
              }
            })
          }
        }

        // 클러스터의 중심점 계산
        const avgLat = cluster.reduce((sum, c) => sum + c.lat!, 0) / cluster.length
        const avgLng = cluster.reduce((sum, c) => sum + c.lng!, 0) / cluster.length

        clusteredMarkers.push({
          position: { lat: avgLat, lng: avgLng },
          count: cluster.length,
          complaints: cluster,
          region: complaint.region,
        })
      })
    })

    return clusteredMarkers
  }

  // 마커 크기 계산 (민원 수에 비례)
  const getMarkerScale = (count: number): number => {
    if (count === 1) return 8
    if (count <= 5) return 12
    if (count <= 10) return 16
    if (count <= 20) return 20
    if (count <= 50) return 24
    return 28
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/30 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">민원 관리 시스템</h1>
          <p className="text-gray-600">아산시 민원 발생 현황을 확인하고 분석하세요</p>
        </div>

        {/* Filter Panel */}
        {loading ? (
          <FilterPanelSkeleton />
        ) : (
          <div className="mb-8 rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
              <Filter className="h-5 w-5 text-emerald-600" />
              범위 설정
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="flex-1 rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="flex-1 rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                  className="w-full rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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
                  className="w-full rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Map Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <MapSkeleton />
            ) : (
              <div className="rounded-xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  민원 발생 위치
                </h2>
                <div className="overflow-hidden rounded-lg shadow-lg">
                  <GoogleMap mapContainerStyle={mapContainerStyle} center={ASAN_CENTER} zoom={12} options={mapOptions}>
                    {createClusteredMarkers(
                      filteredComplaints.filter((complaint) => complaint.lat && complaint.lng)
                    ).map((cluster, index) => (
                      <Marker
                        key={`cluster-${index}`}
                        position={cluster.position}
                        title={`${cluster.count}건의 민원`}
                        onClick={() => handleMarkerClick(cluster)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: getMarkerScale(cluster.count),
                          fillColor: '#e34343',
                          fillOpacity: 0.8,
                          strokeWeight: 0,
                        }}
                        label={cluster.count > 1 ? cluster.count.toString() : ''}
                      />
                    ))}
                  </GoogleMap>
                </div>

                {/* 민원 리스트 인라인 표시 */}
                <ComplaintList
                  complaints={selectedClusterComplaints}
                  totalCount={selectedClusterComplaints.length}
                  onClose={handleCloseComplaintList}
                  isVisible={showComplaintList}
                />
              </div>
            )}
          </div>

          {/* Statistics Section */}
          <div className="space-y-6">
            {loading ? (
              <StatsPanelSkeleton />
            ) : (
              <ComplaintStatsPanel
                stats={stats}
                config={{
                  regionChart: {
                    defaultView: 'chart',
                    showTrend: true,
                    height: 256,
                    maxItems: 5,
                  },
                  monthChart: {
                    defaultView: 'chart',
                    showTrend: true,
                    height: 256,
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

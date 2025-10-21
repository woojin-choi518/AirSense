'use client'

import { GoogleMap, Marker } from '@react-google-maps/api'
import { Calendar, Clock, Filter, MapPin } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import ComplaintList from '@/app/components/complaints/ComplaintList'
import ComplaintStatsPanel from '@/app/components/complaints/ComplaintStatsPanel'

const mapContainerStyle = {
  width: '100%',
  height: '500px',
}

const center = {
  lat: 36.7848, // 아산시 중심 좌표
  lng: 127.0039,
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

interface ComplaintStats {
  total: number
  byRegion: { region: string; count: number }[]
  byMonth: { month: string; count: number }[]
  byTimePeriod: { timePeriod: string; count: number }[]
}

interface ApiResponse {
  complaints: Complaint[]
  stats: ComplaintStats
  meta: {
    totalCount: number
    dateRange: {
      start: string
      end: string
    }
    filters: {
      region: string
      timePeriod: string
    }
  }
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setSelectedComplaint] = useState<Complaint | null>(null)
  const [selectedClusterComplaints, setSelectedClusterComplaints] = useState<Complaint[]>([])
  const [showComplaintList, setShowComplaintList] = useState(false)

  // 필터 상태 - 기본값을 최근 한 달로 설정
  const getDefaultDateRange = () => {
    const today = new Date()
    const oneMonthAgo = new Date(today)
    oneMonthAgo.setMonth(today.getMonth() - 1)

    return {
      start: oneMonthAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    }
  }

  const [dateRange, setDateRange] = useState(getDefaultDateRange())
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all')

  const loadComplaintsData = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        region: selectedRegion,
        timePeriod: selectedTimePeriod,
      })

      console.log(`민원 데이터 로딩 중: ${dateRange.start} ~ ${dateRange.end}`)

      const response = await fetch(`/api/complaints?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      setComplaints(data.complaints || [])
      setStats(data.stats || null)

      console.log(`민원 데이터 로딩 완료: ${data.complaints?.length || 0}건`, {
        dateRange: data.meta?.dateRange,
        filters: data.meta?.filters,
      })
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      // 에러 발생 시 빈 데이터로 설정
      setComplaints([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [dateRange.start, dateRange.end, selectedRegion, selectedTimePeriod])

  // 데이터 로드
  useEffect(() => {
    loadComplaintsData()
  }, [loadComplaintsData])

  const handleMarkerClick = (cluster: { complaints: Complaint[]; count: number }) => {
    // 클러스터의 모든 민원을 설정하고 리스트 모달 표시
    setSelectedClusterComplaints(cluster.complaints)
    setShowComplaintList(true)

    // 가장 최근 민원을 선택된 민원으로 설정 (기존 기능 유지)
    const latestComplaint = cluster.complaints.sort(
      (a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime()
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

  // 클러스터링된 마커 데이터 생성
  const createClusteredMarkers = (complaints: Complaint[]) => {
    const clusteredMarkers: Array<{
      position: { lat: number; lng: number }
      count: number
      complaints: Complaint[]
      region: string
    }> = []

    const processed = new Set<number>()

    complaints.forEach((complaint) => {
      if (processed.has(complaint.id) || !complaint.latitude || !complaint.longitude) {
        return
      }

      const cluster: Complaint[] = [complaint]
      processed.add(complaint.id)

      // 반경 100m 내의 다른 민원들 찾기
      complaints.forEach((otherComplaint) => {
        if (
          processed.has(otherComplaint.id) ||
          !otherComplaint.latitude ||
          !otherComplaint.longitude ||
          otherComplaint.id === complaint.id
        ) {
          return
        }

        const distance = calculateDistance(
          complaint.latitude!,
          complaint.longitude!,
          otherComplaint.latitude!,
          otherComplaint.longitude!
        )

        if (distance <= 100) {
          cluster.push(otherComplaint)
          processed.add(otherComplaint.id)
        }
      })

      // 클러스터의 중심점 계산
      const avgLat = cluster.reduce((sum, c) => sum + c.latitude!, 0) / cluster.length
      const avgLng = cluster.reduce((sum, c) => sum + c.longitude!, 0) / cluster.length

      clusteredMarkers.push({
        position: { lat: avgLat, lng: avgLng },
        count: cluster.length,
        complaints: cluster,
        region: complaint.region,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Filter Panel */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
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
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">전체 지역</option>
                {stats?.byRegion?.map((item) => (
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
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
                <MapPin className="h-5 w-5 text-emerald-600" />
                민원 발생 위치
              </h2>

              {loading ? (
                <div className="flex h-96 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-gray-500">데이터를 불러오는 중...</div>
                    <div className="text-sm text-gray-400">
                      {dateRange.start} ~ {dateRange.end}
                    </div>
                  </div>
                </div>
              ) : (
                <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12} options={mapOptions}>
                  {createClusteredMarkers(
                    complaints.filter((complaint) => complaint.latitude && complaint.longitude)
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
              )}

              {/* 민원 리스트 인라인 표시 */}
              <ComplaintList
                complaints={selectedClusterComplaints}
                totalCount={selectedClusterComplaints.length}
                onClose={handleCloseComplaintList}
                isVisible={showComplaintList}
              />
            </div>
          </div>

          {/* Statistics Section */}
          <div className="space-y-6">
            {/* 데이터 범위 정보 */}
            <div className="rounded-lg bg-white p-4 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">현재 데이터 범위</h3>
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  <span className="font-medium">기간:</span> {dateRange.start} ~ {dateRange.end}
                </div>
                <div className="mb-1">
                  <span className="font-medium">지역:</span> {selectedRegion === 'all' ? '전체 지역' : selectedRegion}
                </div>
                <div>
                  <span className="font-medium">시간대:</span>{' '}
                  {selectedTimePeriod === 'all' ? '전체 시간대' : selectedTimePeriod}
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  )
}

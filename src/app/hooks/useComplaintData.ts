'use client'

import { useCallback, useEffect, useState } from 'react'

import { API_VERSION } from '@/app/constants'
import { getMonthStats, getRegionStats, getTimePeriodStats } from '@/utils/complaints'

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

interface FilterState {
  dateRange: {
    start: string
    end: string
  }
  selectedRegion: string
  selectedTimePeriod: string
}

export const useComplaintData = () => {
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<ComplaintStats | null>(null)
  const [allRegions, setAllRegions] = useState<{ region: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: '2025-01-01',
      end: '2025-12-31',
    },
    selectedRegion: 'all',
    selectedTimePeriod: 'all',
  })

  // 모든 데이터를 한 번만 로드 (필터 없이)
  const loadComplaintsData = useCallback(async () => {
    try {
      setLoading(true)
      setAllComplaints([])

      console.log('민원 데이터 로딩 시작...')

      // 모든 데이터를 한 번에 로드 (필터 없이)
      const params = new URLSearchParams({
        page: '1',
        limit: '3000', // 한 번에 최대 5000개
      })

      const response = await fetch(`/api/${API_VERSION}/complaints?${params}`)
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
  }, [])

  // 클라이언트 사이드 필터링
  const applyFilters = useCallback(() => {
    if (allComplaints.length === 0) return

    const filtered = allComplaints.filter((complaint) => {
      // 날짜 필터
      const complaintDate = new Date(complaint.date)
      const startDate = new Date(filters.dateRange.start)
      const endDate = new Date(filters.dateRange.end)

      if (complaintDate < startDate || complaintDate > endDate) {
        return false
      }

      // 지역 필터
      if (filters.selectedRegion !== 'all' && complaint.region !== filters.selectedRegion) {
        return false
      }

      // 시간대 필터
      if (filters.selectedTimePeriod !== 'all' && complaint.period !== filters.selectedTimePeriod) {
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
  }, [allComplaints, filters])

  // 초기 데이터 로드 (한 번만)
  useEffect(() => {
    loadComplaintsData()
  }, [loadComplaintsData])

  // 필터 변경 시 클라이언트 사이드 필터링 적용
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  return {
    allComplaints,
    filteredComplaints,
    stats,
    allRegions,
    loading,
    filters,
    updateFilters,
  }
}

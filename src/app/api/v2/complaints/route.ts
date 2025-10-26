import { NextResponse } from 'next/server'

import { CONVERTED_COMPLAINTS } from '@/data/complaints'

// 간단한 메모리 캐시 (프로덕션에서는 Redis 사용 권장)
interface CacheData {
  complaints: Array<{
    id: number
    date: string
    region: string | null
    lat: number | null
    lng: number | null
    period: string | null
  }>
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
}

const cache = new Map<string, { data: CacheData; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5분

function getCacheKey(params: URLSearchParams): string {
  return Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

function getCachedData(key: string): CacheData | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedData(key: string, data: CacheData) {
  cache.set(key, { data, timestamp: Date.now() })

  // 캐시 크기 제한 (최대 100개 항목)
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }
}

export async function GET(request: Request) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)

    // 캐시 키 생성
    const cacheKey = getCacheKey(searchParams)

    // 캐시에서 데이터 확인
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      console.log(`민원 API 캐시 히트 - 소요시간: ${Date.now() - startTime}ms`)
      return NextResponse.json(cachedData)
    }

    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5000') // 한 번에 최대 5000개까지
    const region = searchParams.get('region')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const timePeriod = searchParams.get('timePeriod')

    console.log(`민원 API 호출 시작 - 페이지: ${page}, 제한: ${limit}`)

    // 필터링 조건 적용
    let filteredComplaints = CONVERTED_COMPLAINTS.filter((complaint) => {
      // 좌표 필수
      if (!complaint.latitude || !complaint.longitude) return false

      // region 필터
      if (region && region !== 'all' && complaint.region !== region) return false

      // timePeriod 필터
      if (timePeriod && timePeriod !== 'all' && complaint.time_period !== timePeriod) return false

      // 날짜 필터
      if (startDate && endDate) {
        const receivedDate = new Date(complaint.received_date).toISOString().split('T')[0]
        if (receivedDate < startDate || receivedDate > endDate) return false
      }

      return true
    })

    // 날짜순 정렬 (최신순)
    filteredComplaints.sort((a, b) => {
      const dateA = new Date(a.received_date).getTime()
      const dateB = new Date(b.received_date).getTime()
      return dateB - dateA
    })

    const totalCount = filteredComplaints.length

    // 페이지네이션을 위한 skip 계산
    const skip = (page - 1) * limit
    const paginatedComplaints = filteredComplaints.slice(skip, skip + limit)

    // 데이터 크기 최적화를 위해 최소 필드만 반환
    const optimizedComplaints = paginatedComplaints.map((complaint) => ({
      id: complaint.id,
      date: complaint.received_date.split('T')[0], // 날짜만 (시간 제거)
      region: complaint.region,
      lat: complaint.latitude,
      lng: complaint.longitude,
      period: complaint.time_period,
    }))

    const endTime = Date.now()
    console.log(
      `민원 데이터 조회 완료: ${optimizedComplaints.length}개/${totalCount}개, 소요시간: ${endTime - startTime}ms`
    )

    const responseData = {
      complaints: optimizedComplaints,
      totalCount,
      page,
      limit,
      hasMore: skip + optimizedComplaints.length < totalCount,
    }

    // 캐시에 저장
    setCachedData(cacheKey, responseData)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('민원 API 오류:', error)
    return NextResponse.json(
      { error: '민원 데이터를 불러오는 중 오류가 발생했습니다.', detail: (error as Error)?.message || String(error) },
      { status: 500 }
    )
  }
}

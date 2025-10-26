import { NextResponse } from 'next/server'

import { CONVERTED_COMPLAINTS } from '@/data/complaints'

// 간단한 메모리 캐시 (프로덕션에서는 Redis 사용 권장)
interface CacheData {
  complaints: Array<{
    id: number
    date: string
    region: string | null
    content: string
    lat: number | null
    lng: number | null
    period: string | null
    roadAddress: string | null
    landAddress: string | null
  }>
  totalCount: number
  page: number
  limit: number
  hasMore: boolean
}

const cache = new Map<string, { data: CacheData; timestamp: number }>()
const CACHE_TTL = 2 * 60 * 1000 // 2분 (content는 더 자주 변경될 수 있음)

function getCacheKey(body: { page: number; limit: number; ids: number[] }): string {
  const { page, limit, ids } = body
  const sortedIds = [...ids].sort((a, b) => a - b)
  return `page:${page},limit:${limit},ids:${sortedIds.join(',')}`
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

  // 캐시 크기 제한 (최대 50개 항목)
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now()
    const body = await request.json()

    // 요청 본문에서 데이터 추출
    const { page = 1, limit = 20, ids = [] } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '민원 ID 배열이 필요합니다.' }, { status: 400 })
    }

    // ID 유효성 검사
    const validIds = ids.filter((id) => typeof id === 'number' && !isNaN(id))

    if (validIds.length === 0) {
      return NextResponse.json({ error: '유효한 민원 ID가 없습니다.' }, { status: 400 })
    }

    // 캐시 키 생성 (요청 본문 기반)
    const cacheKey = getCacheKey({ page, limit, ids: validIds })

    // 캐시에서 데이터 확인
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      console.log(`민원 Content API 캐시 히트 - 소요시간: ${Date.now() - startTime}ms`)
      return NextResponse.json(cachedData)
    }

    console.log(`민원 Content API 호출 시작 - 페이지: ${page}, 제한: ${limit}, ID 개수: ${validIds.length}`)

    // 해당 ID들의 민원 content 조회
    const filteredComplaints = CONVERTED_COMPLAINTS.filter((complaint) => validIds.includes(complaint.id))

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

    // 데이터 변환
    const optimizedComplaints = paginatedComplaints.map((complaint) => ({
      id: complaint.id,
      date: complaint.received_date.split('T')[0],
      region: complaint.region,
      content: complaint.content,
      lat: complaint.latitude,
      lng: complaint.longitude,
      period: complaint.time_period,
      roadAddress: complaint.road_address,
      landAddress: complaint.land_address,
    }))

    const endTime = Date.now()
    console.log(
      `민원 Content 데이터 조회 완료: ${optimizedComplaints.length}개/${totalCount}개, 소요시간: ${endTime - startTime}ms`
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
    console.error('민원 Content API 오류:', error)
    return NextResponse.json(
      { error: '민원 내용을 불러오는 중 오류가 발생했습니다.', detail: (error as Error)?.message || String(error) },
      { status: 500 }
    )
  }
}

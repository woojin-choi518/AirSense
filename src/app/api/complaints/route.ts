import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 쿼리 파라미터 추출
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const region = searchParams.get('region')
    const timePeriod = searchParams.get('timePeriod')

    console.log('민원 API 호출 시작:', {
      startDate,
      endDate,
      region,
      timePeriod,
    })

    // 필터 조건 구성
    const where: any = {
      latitude: { not: null },
      longitude: { not: null },
    }

    // 날짜 범위 필터 - 기본값을 최근 한 달로 설정
    if (startDate && endDate) {
      where.receivedDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else {
      // 날짜 범위가 지정되지 않은 경우 최근 한 달 데이터만 반환
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      where.receivedDate = {
        gte: oneMonthAgo,
        lte: new Date(),
      }
    }

    // 지역 필터
    if (region && region !== 'all') {
      where.region = region
    }

    // 시간대 필터
    if (timePeriod && timePeriod !== 'all') {
      where.timePeriod = timePeriod
    }

    // 민원 데이터 조회
    const complaints = await prisma.complaint.findMany({
      where,
      select: {
        id: true,
        receivedDate: true,
        content: true,
        region: true,
        latitude: true,
        longitude: true,
        roadAddress: true,
        landAddress: true,
        timePeriod: true,
      },
      orderBy: {
        receivedDate: 'desc',
      },
      take: 1000, // 성능을 위해 최대 1000개로 제한
    })

    console.log(`민원 데이터 조회 완료: ${complaints.length}개`)

    // 통계 데이터 계산
    const total = await prisma.complaint.count({ where })

    // 지역별 통계
    const byRegion = await prisma.complaint.groupBy({
      by: ['region'],
      where,
      _count: {
        region: true,
      },
      orderBy: {
        _count: {
          region: 'desc',
        },
      },
    })

    // 월별 통계 (Prisma groupBy 사용)
    const byMonth = await prisma.complaint.groupBy({
      by: ['receivedDate'],
      where,
      _count: {
        receivedDate: true,
      },
    })

    // 월별로 그룹화
    const monthlyStats = byMonth.reduce((acc: any, item) => {
      const month = new Date(item.receivedDate).getMonth() + 1
      acc[month] = (acc[month] || 0) + item._count.receivedDate
      return acc
    }, {})

    const byMonthFormatted = Object.entries(monthlyStats).map(([month, count]) => ({
      month,
      count,
    }))

    // 시간대별 통계
    const byTimePeriod = await prisma.complaint.groupBy({
      by: ['timePeriod'],
      where,
      _count: {
        timePeriod: true,
      },
      orderBy: {
        _count: {
          timePeriod: 'desc',
        },
      },
    })

    const stats = {
      total,
      byRegion: byRegion.map((item) => ({
        region: item.region,
        count: item._count.region,
      })),
      byMonth: byMonthFormatted,
      byTimePeriod: byTimePeriod.map((item) => ({
        timePeriod: item.timePeriod,
        count: item._count.timePeriod,
      })),
    }

    const response = {
      complaints,
      stats,
      meta: {
        totalCount: complaints.length,
        dateRange: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: endDate || new Date().toISOString().split('T')[0],
        },
        filters: {
          region: region || 'all',
          timePeriod: timePeriod || 'all',
        },
      },
    }

    console.log(`민원 데이터 조회 완료: ${complaints.length}건, 총 ${total}건 중`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('민원 API 오류:', error)
    return NextResponse.json(
      { error: '민원 데이터를 불러오는 중 오류가 발생했습니다.', detail: (error as Error)?.message || String(error) },
      { status: 500 }
    )
  }
}

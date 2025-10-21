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

    const startTime = Date.now()
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

    // 모든 쿼리를 병렬로 실행하여 성능 최적화
    const parallelStartTime = Date.now()
    const [complaints, total, byRegion, byTimePeriod] = await Promise.all([
      // 민원 데이터 조회
      prisma.complaint.findMany({
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
      }),

      // 전체 개수 조회
      prisma.complaint.count({ where }),

      // 지역별 통계
      prisma.complaint.groupBy({
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
      }),

      // 시간대별 통계
      prisma.complaint.groupBy({
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
      }),
    ])
    const parallelEndTime = Date.now()
    console.log(`병렬 쿼리 완료: ${parallelEndTime - parallelStartTime}ms, 민원 데이터: ${complaints.length}개`)

    // 월별 통계를 DB 레벨에서 최적화된 쿼리로 처리
    const monthlyStatsStartTime = Date.now()
    let byMonthRaw: Array<{ month: number; count: bigint }>

    if (region && region !== 'all' && timePeriod && timePeriod !== 'all') {
      byMonthRaw = await prisma.$queryRaw`
        SELECT EXTRACT(MONTH FROM received_date) as month, COUNT(*) as count
        FROM "airsense"."Complaint" 
        WHERE received_date >= ${where.receivedDate.gte} AND received_date <= ${where.receivedDate.lte}
          AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND region = ${region} AND time_period = ${timePeriod}
        GROUP BY EXTRACT(MONTH FROM received_date)
        ORDER BY month
      `
    } else if (region && region !== 'all') {
      byMonthRaw = await prisma.$queryRaw`
        SELECT EXTRACT(MONTH FROM received_date) as month, COUNT(*) as count
        FROM "airsense"."Complaint" 
        WHERE received_date >= ${where.receivedDate.gte} AND received_date <= ${where.receivedDate.lte}
          AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND region = ${region}
        GROUP BY EXTRACT(MONTH FROM received_date)
        ORDER BY month
      `
    } else if (timePeriod && timePeriod !== 'all') {
      byMonthRaw = await prisma.$queryRaw`
        SELECT EXTRACT(MONTH FROM received_date) as month, COUNT(*) as count
        FROM "airsense"."Complaint" 
        WHERE received_date >= ${where.receivedDate.gte} AND received_date <= ${where.receivedDate.lte}
          AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND time_period = ${timePeriod}
        GROUP BY EXTRACT(MONTH FROM received_date)
        ORDER BY month
      `
    } else {
      byMonthRaw = await prisma.$queryRaw`
        SELECT EXTRACT(MONTH FROM received_date) as month, COUNT(*) as count
        FROM "airsense"."Complaint" 
        WHERE received_date >= ${where.receivedDate.gte} AND received_date <= ${where.receivedDate.lte}
          AND latitude IS NOT NULL AND longitude IS NOT NULL
        GROUP BY EXTRACT(MONTH FROM received_date)
        ORDER BY month
      `
    }

    // 월별 통계 포맷팅
    const byMonthFormatted = byMonthRaw.map((item) => ({
      month: item.month.toString(),
      count: Number(item.count),
    }))
    const monthlyStatsEndTime = Date.now()
    console.log(`월별 통계 쿼리 완료: ${monthlyStatsEndTime - monthlyStatsStartTime}ms`)

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
    const totalTime = Date.now() - startTime
    console.log(`전체 API 응답 시간: ${totalTime}ms`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('민원 API 오류:', error)
    return NextResponse.json(
      { error: '민원 데이터를 불러오는 중 오류가 발생했습니다.', detail: (error as Error)?.message || String(error) },
      { status: 500 }
    )
  }
}

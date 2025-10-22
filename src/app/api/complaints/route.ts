import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('민원 API 호출 시작 - 전체 데이터 로딩')

    // 전체 데이터를 한 번에 불러오기 (필터링 없이)
    const where: any = {
      latitude: { not: null },
      longitude: { not: null },
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
      take: 3000, // 성능을 위해 최대 1000개로 제한
    })

    console.log(`전체 민원 데이터 조회 완료: ${complaints.length}개`)

    return NextResponse.json({
      complaints,
      totalCount: complaints.length,
    })
  } catch (error) {
    console.error('민원 API 오류:', error)
    return NextResponse.json(
      { error: '민원 데이터를 불러오는 중 오류가 발생했습니다.', detail: (error as Error)?.message || String(error) },
      { status: 500 }
    )
  }
}

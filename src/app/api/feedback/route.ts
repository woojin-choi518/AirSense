import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { contact, coordinates, address, intensity, content, categories } = await request.json()

    // intensity를 정수로 변환
    const intensityNumber = parseInt(intensity, 10)

    // 밸리데이션
    if (!coordinates || !address || !intensity || !content || !categories || categories.length === 0) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 })
    }

    if (isNaN(intensityNumber) || intensityNumber < 1 || intensityNumber > 5) {
      return NextResponse.json({ error: '강도는 1-5 사이의 값이어야 합니다.' }, { status: 400 })
    }

    // 민원 데이터 생성
    const complaint = await prisma.feedbackComplaint.create({
      data: {
        contact: contact || null,
        coordinates,
        address,
        intensity: intensityNumber,
        content,
        categories: {
          create: categories.map((categoryName: string) => ({
            category: {
              connectOrCreate: {
                where: { name: categoryName },
                create: { name: categoryName },
              },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: complaint,
      message: '민원이 성공적으로 제출되었습니다.',
    })
  } catch (error) {
    console.error('민원 제출 오류:', error)
    return NextResponse.json({ error: '민원 제출 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const complaints = await prisma.feedbackComplaint.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: complaints,
    })
  } catch (error) {
    console.error('민원 조회 오류:', error)
    return NextResponse.json({ error: '민원 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

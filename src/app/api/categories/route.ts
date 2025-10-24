import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.feedbackCategory.findMany({
      orderBy: [
        { isDefault: 'desc' }, // 기본 카테고리를 먼저 표시
        { name: 'asc' }, // 그 다음 이름순으로 정렬
      ],
    })

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('카테고리 조회 오류:', error)
    return NextResponse.json({ error: '카테고리 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, isDefault = false } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: '카테고리명을 입력해주세요.' }, { status: 400 })
    }

    const category = await prisma.feedbackCategory.create({
      data: {
        name: name.trim(),
        isDefault,
      },
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: '카테고리가 성공적으로 생성되었습니다.',
    })
  } catch (error) {
    console.error('카테고리 생성 오류:', error)

    // 중복 카테고리명 오류 처리
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: '이미 존재하는 카테고리명입니다.' }, { status: 409 })
    }

    return NextResponse.json({ error: '카테고리 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

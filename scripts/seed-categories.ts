import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  '가축·분뇨 냄새',
  '음식물 쓰레기 냄새',
  '하수·정화조 냄새',
  '화학물질·공장 냄새',
  '담배·생활 냄새',
  '기타',
]

async function seedCategories() {
  try {
    console.log('카테고리 초기 데이터를 생성 중...')

    for (const categoryName of categories) {
      await prisma.feedbackCategory.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      })
      console.log(`✓ 카테고리 생성: ${categoryName}`)
    }

    console.log('모든 카테고리가 성공적으로 생성되었습니다!')
  } catch (error) {
    console.error('카테고리 생성 중 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()

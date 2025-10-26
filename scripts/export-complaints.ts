import { PrismaClient } from '@prisma/client'
import { createObjectCsvWriter } from 'csv-writer'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

interface ExportOptions {
  format: 'csv' | 'json'
  output?: string
  limit?: number
  offset?: number
}

interface ComplaintData {
  id: number
  receivedDate: Date
  content: string
  region: string | null
  year: number | null
  timePeriod: string | null
  latitude: number | null
  longitude: number | null
  roadAddress: string | null
  landAddress: string | null
  createdAt: Date
  updatedAt: Date
}

async function exportComplaints(options: ExportOptions) {
  try {
    console.log('📝 Complaint 데이터 내보내기를 시작합니다...')

    // 데이터베이스에서 데이터를 가져오기
    const complaints = await prisma.complaint.findMany({
      take: options.limit,
      skip: options.offset,
      orderBy: { id: 'asc' },
    })

    console.log(`📊 ${complaints.length}개의 데이터를 가져왔습니다`)

    if (complaints.length === 0) {
      console.log('⚠️  내보낼 데이터가 없습니다')
      return
    }

    // 출력 파일명 결정
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const defaultFileName = `complaints-${timestamp}`
    const defaultOutputDir = 'public/data'
    const outputFile = options.output || `${defaultOutputDir}/${defaultFileName}.${options.format}`

    // 출력 디렉토리 생성
    const outputDir = path.dirname(outputFile)
    await fs.mkdir(outputDir, { recursive: true })

    if (options.format === 'csv') {
      await exportToCSV(complaints, outputFile)
    } else if (options.format === 'json') {
      await exportToJSON(complaints, outputFile)
    }

    console.log(`✅ 내보내기 완료: ${outputFile}`)
    console.log(`📁 파일 크기: ${(await fs.stat(outputFile)).size} bytes`)
  } catch (error) {
    console.error('❌ 내보내기 중 오류가 발생했습니다:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function exportToCSV(complaints: ComplaintData[], outputFile: string) {
  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'receivedDate', title: '접수일시' },
      { id: 'content', title: '민원내용' },
      { id: 'region', title: '지역' },
      { id: 'year', title: '연도' },
      { id: 'timePeriod', title: '시간대' },
      { id: 'latitude', title: '위도' },
      { id: 'longitude', title: '경도' },
      { id: 'roadAddress', title: '도로명주소' },
      { id: 'landAddress', title: '지번주소' },
      { id: 'createdAt', title: '생성일시' },
      { id: 'updatedAt', title: '수정일시' },
    ],
    encoding: 'utf8',
  })

  await csvWriter.writeRecords(complaints)
  console.log('📄 CSV 형식으로 내보냈습니다')
}

async function exportToJSON(complaints: ComplaintData[], outputFile: string) {
  const jsonData = {
    exportDate: new Date().toISOString(),
    totalCount: complaints.length,
    data: complaints,
  }

  await fs.writeFile(outputFile, JSON.stringify(jsonData, null, 2), 'utf8')
  console.log('📄 JSON 형식으로 내보냈습니다')
}

// 명령줄 인수 파싱
function parseArguments(): ExportOptions {
  const args = process.argv.slice(2)
  const options: ExportOptions = {
    format: 'csv', // 기본값은 CSV
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith('--format=')) {
      const format = arg.split('=')[1]?.toLowerCase()
      if (format === 'csv' || format === 'json') {
        options.format = format
      } else {
        console.error('❌ 잘못된 형식입니다. csv 또는 json을 지정해주세요')
        process.exit(1)
      }
    } else if (arg === '--format' && i + 1 < args.length) {
      const format = args[i + 1].toLowerCase()
      if (format === 'csv' || format === 'json') {
        options.format = format
        i++ // 다음 인수 건너뛰기
      } else {
        console.error('❌ 잘못된 형식입니다. csv 또는 json을 지정해주세요')
        process.exit(1)
      }
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1]
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[i + 1]
      i++ // 다음 인수 건너뛰기
    } else if (arg.startsWith('--limit=')) {
      const limit = parseInt(arg.split('=')[1])
      if (!isNaN(limit) && limit > 0) {
        options.limit = limit
      } else {
        console.error('❌ 잘못된 limit 값입니다. 양의 정수를 지정해주세요')
        process.exit(1)
      }
    } else if (arg === '--limit' && i + 1 < args.length) {
      const limit = parseInt(args[i + 1])
      if (!isNaN(limit) && limit > 0) {
        options.limit = limit
        i++ // 다음 인수 건너뛰기
      } else {
        console.error('❌ 잘못된 limit 값입니다. 양의 정수를 지정해주세요')
        process.exit(1)
      }
    } else if (arg.startsWith('--offset=')) {
      const offset = parseInt(arg.split('=')[1])
      if (!isNaN(offset) && offset >= 0) {
        options.offset = offset
      } else {
        console.error('❌ 잘못된 offset 값입니다. 0 이상의 정수를 지정해주세요')
        process.exit(1)
      }
    } else if (arg === '--offset' && i + 1 < args.length) {
      const offset = parseInt(args[i + 1])
      if (!isNaN(offset) && offset >= 0) {
        options.offset = offset
        i++ // 다음 인수 건너뛰기
      } else {
        console.error('❌ 잘못된 offset 값입니다. 0 이상의 정수를 지정해주세요')
        process.exit(1)
      }
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
📝 Complaint 데이터 내보내기 스크립트

사용법:
  npm run export:complaints [옵션]

옵션:
  --format <csv|json>    출력 형식 (기본값: csv)
  --output <파일명>       출력 파일명 (기본값: public/data/complaints-YYYY-MM-DDTHH-MM-SS.{format})
  --limit <숫자>          가져올 레코드 수
  --offset <숫자>         건너뛸 레코드 수
  --help, -h             이 도움말 표시

예시:
  npm run export:complaints -- --format=csv --output=complaints.csv
  npm run export:complaints -- --format=json --limit=100
  npm run export:complaints -- --format=csv --limit=50 --offset=100
      `)
      process.exit(0)
    }
  }

  return options
}

// 메인 실행
async function main() {
  const options = parseArguments()

  console.log('🚀 Complaint 데이터 내보내기 스크립트')
  console.log(`📋 설정: ${JSON.stringify(options, null, 2)}`)

  await exportComplaints(options)
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 예상치 못한 오류가 발생했습니다:', error)
    process.exit(1)
  })
}

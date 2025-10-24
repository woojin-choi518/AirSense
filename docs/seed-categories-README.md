# 피드백 카테고리 시드 스크립트 🌱

이 스크립트는 피드백 시스템에 필요한 기본 카테고리들을 데이터베이스에 생성하는 도구입니다.

## 📋 개요

- **파일**: `scripts/seed-categories.ts`
- **목적**: FeedbackCategory 테이블에 기본 카테고리 데이터 생성
- **언어**: TypeScript
- **실행 방식**: 일회성 시드 스크립트

## 🚀 사용법

### 기본 명령어
```bash
npm run seed:categories
```

### 수동 실행
```bash
npx tsx scripts/seed-categories.ts
```

## 📊 생성되는 카테고리

스크립트는 다음 6개의 기본 카테고리를 생성합니다:

| 순서 | 카테고리명 | 설명 |
|------|------------|------|
| 1 | 가축·분뇨 냄새 | 축산업 관련 악취 |
| 2 | 음식물 쓰레기 냄새 | 음식물 폐기물 관련 악취 |
| 3 | 하수·정화조 냄새 | 하수처리 관련 악취 |
| 4 | 화학물질·공장 냄새 | 산업시설 관련 악취 |
| 5 | 담배·생활 냄새 | 일상생활 관련 악취 |
| 6 | 기타 | 기타 악취 유형 |

## 🔧 설정 요구사항

### 환경 변수
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database"
```

### 패키지 의존성
- `@prisma/client` - 데이터베이스 클라이언트
- `tsx` - TypeScript 실행

### 데이터베이스 스키마
다음 Prisma 모델이 정의되어 있어야 합니다:
```prisma
model FeedbackCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  complaints  FeedbackComplaintCategory[]
  
  @@map("FeedbackCategory")
  @@schema("airsense")
}
```

## 📝 실행 과정

### 1. 스크립트 시작
```
카테고리 초기 데이터를 생성 중...
```

### 2. 각 카테고리 생성
```
✓ 카테고리 생성: 가축·분뇨 냄새 (기본 표시)
✓ 카테고리 생성: 음식물 쓰레기 냄새 (기본 표시)
✓ 카테고리 생성: 하수·정화조 냄새 (기본 표시)
✓ 카테고리 생성: 화학물질·공장 냄새 (기본 표시)
✓ 카테고리 생성: 담배·생활 냄새 (기본 표시)
✓ 카테고리 생성: 기타 (기본 표시)
```

### 3. 완료 메시지
```
모든 카테고리가 성공적으로 생성되었습니다!
```

## 🔄 동작 방식

### Upsert 작업
- `prisma.feedbackCategory.upsert()` 사용
- 이미 존재하는 카테고리는 업데이트하지 않음
- 존재하지 않는 카테고리만 새로 생성

### 기본 설정
- 모든 카테고리는 `isDefault: true`로 설정
- 피드백 폼에서 기본적으로 표시됨

## ⚠️ 주의사항

### 중복 실행
- 스크립트는 여러 번 실행해도 안전합니다
- 이미 존재하는 카테고리는 건너뛰고 새 카테고리만 생성합니다

### 데이터 무결성
- `name` 필드에 `@unique` 제약조건이 있어 중복 생성 방지
- 데이터베이스 레벨에서 중복 방지

### 프로덕션 환경
- 프로덕션 환경에서 실행하기 전에 개발 환경에서 테스트 권장
- 데이터베이스 백업 후 실행 권장

## 🐛 문제 해결

### 일반적인 오류

#### 1. 데이터베이스 연결 오류
```
카테고리 생성 중 오류 발생: Error: connect ECONNREFUSED
```
**해결방법**: `DATABASE_URL` 환경 변수 확인

#### 2. 스키마 오류
```
카테고리 생성 중 오류 발생: Error: Table 'FeedbackCategory' doesn't exist
```
**해결방법**: Prisma 마이그레이션 실행
```bash
npm run db:migrate
```

#### 3. 권한 오류
```
카테고리 생성 중 오류 발생: Error: permission denied for table FeedbackCategory
```
**해결방법**: 데이터베이스 사용자 권한 확인

### 로그 분석
정상 실행 시 다음과 같은 로그가 출력됩니다:
```
카테고리 초기 데이터를 생성 중...
✓ 카테고리 생성: 가축·분뇨 냄새 (기본 표시)
✓ 카테고리 생성: 음식물 쓰레기 냄새 (기본 표시)
✓ 카테고리 생성: 하수·정화조 냄새 (기본 표시)
✓ 카테고리 생성: 화학물질·공장 냄새 (기본 표시)
✓ 카테고리 생성: 담배·생활 냄새 (기본 표시)
✓ 카테고리 생성: 기타 (기본 표시)
모든 카테고리가 성공적으로 생성되었습니다!
```

## 🔄 업데이트 이력

- **v1.0.0** (2025-10-24): 초기 버전 릴리스
  - 기본 6개 카테고리 생성
  - Upsert 방식으로 안전한 중복 실행 지원
  - 에러 핸들링 및 로깅

## 📞 지원

문제가 발생하거나 새로운 카테고리 추가 요청이 있으시면 프로젝트 관리자에게 문의하세요.

## 🔗 관련 파일

- `prisma/schema.prisma` - 데이터베이스 스키마 정의
- `src/app/api/categories/route.ts` - 카테고리 API 엔드포인트
- `src/app/(pages)/feedback/page.tsx` - 피드백 폼 (카테고리 사용)

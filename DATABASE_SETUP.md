# 환경별 데이터베이스 설정 가이드

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 개발 환경 데이터베이스 URL
DATABASE_URL_DEV="postgresql://username:password@localhost:5432/airsense_dev"

# 프로덕션 환경 데이터베이스 URL  
DATABASE_URL_PROD="postgresql://username:password@prod-server:5432/airsense_prod"

# 기본 DATABASE_URL (기존 방식과 호환)
DATABASE_URL="postgresql://username:password@localhost:5432/airsense_dev"
```

## 사용 가능한 스크립트

### 개발 환경
- `npm run db:dev` - 개발 DB로 Prisma 클라이언트 생성
- `npm run db:migrate:dev` - 개발 DB로 마이그레이션 실행
- `npm run db:sync:dev` - 개발 DB로 스키마 동기화
- `npm run db:studio:dev` - 개발 DB로 Prisma Studio 실행
- `npm run dev:with-db` - 개발 DB와 함께 개발 서버 실행

### 프로덕션 환경
- `npm run db:prod` - 프로덕션 DB로 Prisma 클라이언트 생성
- `npm run db:migrate:prod` - 프로덕션 DB로 마이그레이션 배포
- `npm run db:sync:prod` - 프로덕션 DB로 스키마 동기화
- `npm run db:studio:prod` - 프로덕션 DB로 Prisma Studio 실행
- `npm run build:with-db` - 프로덕션 DB와 함께 빌드

## 사용 예시

```bash
# 개발 환경에서 작업할 때
npm run db:migrate:dev
npm run dev:with-db

# 프로덕션 배포할 때
npm run db:migrate:prod
npm run build:with-db
```

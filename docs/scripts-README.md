# Scripts 📜

이 디렉토리는 AirSense 프로젝트의 데이터베이스 관리 및 유틸리티 스크립트들을 포함합니다.

## 📋 스크립트 목록

### 1. 데이터 내보내기
- **[export-livestock-farms.ts](./export-livestock-farms.ts)** - LivestockFarm 데이터를 CSV/JSON 형식으로 내보내기

### 2. 데이터 시드
- **[seed-categories.ts](./seed-categories.ts)** - 피드백 카테고리 초기 데이터 생성

## 🚀 사용법

### 전제 조건
- Node.js 및 npm이 설치되어 있어야 합니다
- 데이터베이스 연결이 설정되어 있어야 합니다
- 필요한 패키지들이 설치되어 있어야 합니다

### 스크립트 실행
```bash
# 데이터 내보내기
npm run export:farms [옵션]

# 카테고리 시드 데이터 생성
npm run seed:categories
```

## 📁 출력 파일

스크립트들이 생성하는 파일들은 프로젝트 루트 디렉토리에 저장됩니다:
- `livestock-farms-YYYY-MM-DDTHH-MM-SS.csv` - CSV 형식 내보내기
- `livestock-farms-YYYY-MM-DDTHH-MM-SS.json` - JSON 형식 내보내기

## 🔧 설정

### 환경 변수
다음 환경 변수들이 설정되어 있어야 합니다:
- `DATABASE_URL` - PostgreSQL 데이터베이스 연결 URL

### 패키지 의존성
- `@prisma/client` - 데이터베이스 클라이언트
- `csv-writer` - CSV 파일 생성
- `tsx` - TypeScript 실행

## 📖 상세 문서

각 스크립트의 자세한 사용법은 다음 문서를 참조하세요:
- [export-livestock-farms-README.md](./export-livestock-farms-README.md)
- [seed-categories-README.md](./seed-categories-README.md)

## ⚠️ 주의사항

- 스크립트 실행 전에 데이터베이스 백업을 권장합니다
- 대용량 데이터 내보내기 시 충분한 디스크 공간을 확보하세요
- 프로덕션 환경에서 실행하기 전에 개발 환경에서 테스트하세요

## 🐛 문제 해결

### 일반적인 오류
1. **데이터베이스 연결 오류**: `DATABASE_URL` 환경 변수를 확인하세요
2. **권한 오류**: 파일 쓰기 권한을 확인하세요
3. **메모리 부족**: `--limit` 옵션을 사용하여 데이터를 분할 처리하세요

### 로그 확인
스크립트 실행 시 콘솔에 상세한 로그가 출력됩니다. 오류 발생 시 로그를 확인하여 문제를 진단하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 프로젝트 관리자에게 문의하세요.

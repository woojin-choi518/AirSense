# LivestockFarm 데이터 내보내기 스크립트 🐄

이 스크립트는 데이터베이스의 `LivestockFarm` 테이블 데이터를 CSV 또는 JSON 형식으로 내보내는 도구입니다.

## 📋 개요

- **파일**: `scripts/export-livestock-farms.ts`
- **목적**: LivestockFarm 데이터를 외부 파일로 내보내기
- **지원 형식**: CSV, JSON
- **언어**: TypeScript

## 🚀 사용법

### 기본 명령어
```bash
npm run export:farms [옵션]
```

### 옵션

| 옵션 | 설명 | 기본값 | 예시 |
|------|------|--------|------|
| `--format` | 출력 형식 (csv 또는 json) | csv | `--format=json` |
| `--output` | 출력 파일명 | 자동 생성 | `--output=farms.csv` |
| `--limit` | 가져올 레코드 수 | 전체 | `--limit=100` |
| `--offset` | 건너뛸 레코드 수 | 0 | `--offset=50` |
| `--help` | 도움말 표시 | - | `--help` |

## 📝 사용 예시

### 1. 기본 사용 (CSV 형식으로 전체 데이터 내보내기)
```bash
npm run export:farms
```

### 2. JSON 형식으로 내보내기
```bash
npm run export:farms -- --format=json
```

### 3. 특정 파일명으로 내보내기
```bash
npm run export:farms -- --format=csv --output=my-farms.csv
```

### 4. 제한된 수의 데이터만 내보내기
```bash
npm run export:farms -- --format=json --limit=50
```

### 5. 페이징 처리 (50개 건너뛰고 100개 가져오기)
```bash
npm run export:farms -- --format=csv --limit=100 --offset=50
```

### 6. 도움말 보기
```bash
npm run export:farms -- --help
```

## 📊 출력 형식

### CSV 형식
```csv
ID,농장명,축종,지번주소,도로명주소,축수,축사수,면적(㎡),위도,경도
1,음봉양계장,종계/산란계,충청남도 아산시 음봉면 삼거리 183-5,,18000,1,951.6,36.84808824,127.0171208
```

### JSON 형식
```json
{
  "exportDate": "2025-10-24T09:09:36.426Z",
  "totalCount": 5,
  "data": [
    {
      "id": 1,
      "farmName": "음봉양계장",
      "livestockType": "종계/산란계",
      "landAddress": "충청남도 아산시 음봉면 삼거리 183-5",
      "roadAddress": "",
      "livestockCount": 18000,
      "barnCount": 1,
      "areaSqm": 951.6,
      "latitude": 36.84808824,
      "longitude": 127.0171208
    }
  ]
}
```

## 📁 출력 파일

### 파일명 규칙
- **기본 파일명**: `livestock-farms-YYYY-MM-DDTHH-MM-SS.{format}`
- **예시**: `livestock-farms-2025-10-24T09-09-19.csv`

### 파일 위치
- 프로젝트 루트 디렉토리에 저장됩니다
- `--output` 옵션으로 경로를 지정할 수 있습니다

## 🔧 설정 요구사항

### 환경 변수
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database"
```

### 패키지 의존성
- `@prisma/client` - 데이터베이스 클라이언트
- `csv-writer` - CSV 파일 생성
- `tsx` - TypeScript 실행

## 📈 성능 정보

### 데이터 처리량
- **전체 데이터**: 약 722개 레코드
- **처리 시간**: 데이터 크기에 따라 다름
- **메모리 사용량**: 효율적인 스트리밍 처리

### 최적화 팁
- 대용량 데이터는 `--limit` 옵션으로 분할 처리
- `--offset` 옵션으로 페이징 처리 가능
- CSV 형식이 JSON보다 파일 크기가 작음

## ⚠️ 주의사항

### 데이터 안전성
- 스크립트 실행 전 데이터베이스 백업 권장
- 프로덕션 환경에서 실행 시 주의

### 파일 시스템
- 충분한 디스크 공간 확보
- 파일 쓰기 권한 확인

### 네트워크
- 데이터베이스 연결 상태 확인
- 대용량 데이터 전송 시 네트워크 안정성 고려

## 🐛 문제 해결

### 일반적인 오류

#### 1. 데이터베이스 연결 오류
```
❌ 내보내기 중 오류가 발생했습니다: Error: connect ECONNREFUSED
```
**해결방법**: `DATABASE_URL` 환경 변수 확인

#### 2. 파일 쓰기 권한 오류
```
❌ 내보내기 중 오류가 발생했습니다: Error: EACCES: permission denied
```
**해결방법**: 출력 디렉토리의 쓰기 권한 확인

#### 3. 메모리 부족 오류
```
❌ 내보내기 중 오류가 발생했습니다: Error: JavaScript heap out of memory
```
**해결방법**: `--limit` 옵션으로 데이터 분할 처리

### 로그 분석
스크립트 실행 시 다음과 같은 로그가 출력됩니다:
```
🚀 LivestockFarm 데이터 내보내기 스크립트
📋 설정: {"format":"csv","limit":100}
🐄 LivestockFarm 데이터 내보내기를 시작합니다...
📊 100개의 데이터를 가져왔습니다
📄 CSV 형식으로 내보냈습니다
✅ 내보내기 완료: farms.csv
📁 파일 크기: 15432 bytes
```

## 🔄 업데이트 이력

- **v1.0.0** (2025-10-24): 초기 버전 릴리스
  - CSV/JSON 형식 지원
  - 명령줄 옵션 지원
  - 에러 핸들링 및 로깅

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 프로젝트 관리자에게 문의하세요.

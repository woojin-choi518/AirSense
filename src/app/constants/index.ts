export const containerStyle = { width: '100%', height: '100%' }
export const ASAN_CENTER = { lat: 36.79, lng: 127.0 }
export const DEFAULT_ZOOM = 13

export const typeToGroup: Record<string, string> = {
  한우: '소',
  육우: '소',
  젖소: '소',
  돼지: '돼지',
  '종계/산란계': '닭',
  육계: '닭',
  오리: '오리',
}
export const typeToLivestockType: { name: string; initialSelected: boolean }[] = [
  { name: '종계/산란계', initialSelected: false },
  { name: '메추리', initialSelected: false },
  { name: '육계', initialSelected: false },
  { name: '오리', initialSelected: false },
  { name: '돼지', initialSelected: true },
  { name: '한우', initialSelected: true },
  { name: '염소', initialSelected: false },
  { name: '사슴', initialSelected: false },
  { name: '육우', initialSelected: true },
  { name: '산양', initialSelected: false },
  { name: '젖소', initialSelected: true },
]

export const odorColorMap: Record<string, { stroke: string }> = {
  닭: { stroke: '#FFA500' },
  소: { stroke: '#1E90FF' },
  돼지: { stroke: '#FF69B4' },
  사슴: { stroke: '#32CD32' },
  기타: { stroke: '#8884FF' },
}

export const MARKER_SIZE = {
  desktop: { default: 30, selected: 36 },
  mobile: { default: 24, selected: 30 },
}

export const MAX_MARKERS = 700

export const API_VERSION = 'v2'

export const COMPLAINT_CATEGORIES = [
  '가축·분뇨 냄새',
  '음식물 쓰레기 냄새',
  '하수·정화조 냄새',
  '화학물질·공장 냄새',
  '담배·생활 냄새',
  '기타',
]

export const INTENSITY_LABELS = [
  '전혀 불편하지 않음',
  '조금 불편함',
  '보통 불편함',
  '매우 불편함',
  '매우 불편함 (짜증 및 두통 유발)',
]

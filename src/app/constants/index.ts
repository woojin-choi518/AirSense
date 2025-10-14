export const containerStyle = { width: '100vw', height: '100dvh' }
export const ASAN_CENTER = { lat: 36.7855, lng: 127.102 }
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

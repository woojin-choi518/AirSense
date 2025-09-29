//app/lib/livestockScaleRanges.ts

export interface ScaleRange {
    label: string;
    min: number;               // 포함
    max: number | null;        // 미포함, null이면 상한 없음
  }
  
  export const scaleRanges: Record<string, ScaleRange[]> = {
    소: [
      { label: '소', min: 0, max: 1000 },
      { label: '중', min: 1000, max: 5000 },
      { label: '대', min: 5000, max: 10000 },
      { label: '특대', min: 10000, max: null },
    ],
    돼지: [
      { label: '소', min: 0, max: 2000 },
      { label: '중', min: 2000, max: 5000 },
      { label: '대', min: 5000, max: 10000 },
      { label: '특대', min: 10000, max: null },
    ],
    닭: [
      { label: '소', min: 0, max: 10000 },
      { label: '중', min: 10000, max: 30000 },
      { label: '대', min: 30000, max: 50000 },
      { label: '특대', min: 50000, max: null },
    ],
    오리: [
      { label: '소', min: 0, max: 5000 },
      { label: '중소', min: 5000, max: 10000 },
      { label: '중', min: 10000, max: 30000 },
      { label: '대', min: 30000, max: 50000 },
      { label: '특대', min: 50000, max: null },
    ],
  };
  
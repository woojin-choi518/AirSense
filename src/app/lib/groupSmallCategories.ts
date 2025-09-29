// lib/groupSmallCategories.ts
export function groupSmallCategories(
    data: { name: string; value: number }[],
    threshold: number = 0.03 // 3% 미만이면 기타 처리
  ): { name: string; value: number }[] {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const major = data.filter((d) => d.value / total >= threshold);
    const minor = data.filter((d) => d.value / total < threshold);
    const etcValue = minor.reduce((sum, d) => sum + d.value, 0);
  
    return etcValue > 0
      ? [...major, { name: '기타', value: etcValue }]
      : major;
  }
  
'use client'

import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

import { cn } from '@/app/lib/cn'
import { LivestockFarm } from '@/app/lib/types'
import { useHighContrast } from '@/components/providers/HighContrastProvider'

// Recharts PieChart 동적 import
const PieChart = dynamic(() => import('./LivestockPieChart'), {
  ssr: false,
  loading: () => <div className="h-20 w-full animate-pulse" />,
})

interface Props {
  farms: LivestockFarm[]
}

export default function LivestockPieChartPanel({ farms }: Props) {
  //내부에 정의된 그룹핑 함수
  const chartData = useMemo(() => {
    const groupedCount: Record<string, number> = {}

    for (const farm of farms) {
      let group: string
      if (['육우', '젖소', '한우'].includes(farm.livestock_type)) {
        group = '소'
      } else if (['종계/산란계', '육계'].includes(farm.livestock_type)) {
        group = '닭'
      } else {
        group = farm.livestock_type
      }
      groupedCount[group] = (groupedCount[group] || 0) + 1
    }

    return Object.entries(groupedCount).map(([name, value]) => ({ name, value }))
  }, [farms])

  const { isHighContrast } = useHighContrast()

  return (
    <div className="p-4">
      <span className={cn('font-sans text-sm font-bold', isHighContrast ? 'text-white' : 'text-white')}>
        데이터 수정일 : 2025-06-02
      </span>
      <PieChart data={chartData} isHighContrast={isHighContrast} />
    </div>
  )
}

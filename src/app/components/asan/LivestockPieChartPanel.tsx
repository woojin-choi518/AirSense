'use client';

import React, { useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { LivestockFarm } from '@/app/lib/types';

// Recharts PieChart 동적 import
const PieChart = dynamic(() => import('./LivestockPieChart'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse" />
});

interface Props {
  farms: LivestockFarm[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function LivestockPieChartPanel({ farms, isOpen, onToggle }: Props) {
  // ✅ 내부에 정의된 그룹핑 함수
  const chartData = useMemo(() => {
    const groupedCount: Record<string, number> = {};

    for (const farm of farms) {
      let group: string;
      if (['육우', '젖소', '한우'].includes(farm.livestock_type)) {
        group = '소';
      } else if (['종계/산란계', '육계'].includes(farm.livestock_type)) {
        group = '닭';
      } else {
        group = farm.livestock_type;
      }
      groupedCount[group] = (groupedCount[group] || 0) + 1;
    }

    return Object.entries(groupedCount).map(([name, value]) => ({ name, value }));
  }, [farms]);

  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  return (
    <div className="bottom-6 left-4 right-4 sm:right-auto z-30 ">
      {/* 🔘 토글 헤더 */}
      <div
        className="
        bg-gradient-to-r from-teal-800/20 to-blue-500/20
        backdrop-blur-md border-2 border-teal-300
        rounded-full px-5 py-3 flex items-center justify-between
        cursor-pointer select-none shadow-md
        "
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-2 ">
          <svg className="h-5 w-5 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <span className="text-white font-bold text-m tracking-wide font-sans">
            축종별 농가 통계
          </span>
        </div>
        <span className="text-white text-xl leading-none">
          {isOpen ? '▾' : '▸'}
        </span>
      </div>

      {/* 📊 패널 본문 */}
      {isOpen && (
        
        <div
          className="
            mt-2
            bg-gradient-to-br from-teal-800/20 to-blue-500/20
            backdrop-blur-md
            border-2 border-teal-300
            rounded-2xl
            shadow-lg
            px-4 py-4
            w-full sm:w-[440px]
            max-h-[60vh]
            overflow-y-auto
          "
        >
            <span className='text-white text-sm font-bold font-sans'>데이터 수정일 : 2025-06-02</span>
            <PieChart data={chartData} />
        </div>
      )}
    </div>
  );
}

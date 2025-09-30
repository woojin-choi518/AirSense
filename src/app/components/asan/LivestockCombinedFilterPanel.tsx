'use client';

import React, { useState, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { scaleRanges } from '@/app/lib/livestockScaleRanges';

interface Props {
  livestockTypes: string[];
  selectedTypes: string[];
  onToggleType: (type: string) => void;
  onToggleAllTypes: () => void;
  allTypesSelected: boolean;
  onScaleChange: (
    group: string,
    range: { min: number; max: number | null }
  ) => void;
  showOdor: boolean;
  onToggleOdor: () => void;
}

export default function LivestockCombinedFilterPanel({
  livestockTypes,
  selectedTypes,
  onToggleType,
  onToggleAllTypes,
  allTypesSelected,
  onScaleChange,
  showOdor,
  onToggleOdor,
}: Props) {
  const groups = Object.keys(scaleRanges);
  const [activeGroup, setActiveGroup] = useState(groups[0] || '');
  const [rangeMap, setRangeMap] = useState<Record<string, [number, number]>>(
    () =>
      groups.reduce((acc, g) => {
        const len = scaleRanges[g].length;
        acc[g] = [0, len - 1];
        return acc;
      }, {} as Record<string, [number, number]>)
  );

  // mount 시 초기 onScaleChange 호출
  useEffect(() => {
    groups.forEach((g) => {
      const [minIdx, maxIdx] = rangeMap[g];
      const rs = scaleRanges[g];
      onScaleChange(g, { min: rs[minIdx].min, max: rs[maxIdx].max });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (group: string, vals: [number, number]) => {
    setRangeMap((prev) => {
      const next = { ...prev, [group]: vals };
      const rs = scaleRanges[group];
      onScaleChange(group, {
        min: rs[vals[0]].min,
        max: rs[vals[1]].max,
      });
      return next;
    });
  };

  // 전체 슬라이더 초기화
  const resetAll = () => {
    const initialMap = groups.reduce((acc, g) => {
      const len = scaleRanges[g].length;
      acc[g] = [0, len - 1];
      return acc;
    }, {} as Record<string, [number, number]>);
    setRangeMap(initialMap);
    groups.forEach((g) => {
      const [minIdx, maxIdx] = initialMap[g];
      const rs = scaleRanges[g];
      onScaleChange(g, { min: rs[minIdx].min, max: rs[maxIdx].max });
    });
  };

  const currentRange =
    rangeMap[activeGroup] ||
    [0, scaleRanges[activeGroup]?.length - 1 || 0];
  const rs = scaleRanges[activeGroup] || [];

  return (
    <div className="p-4 space-y-6">
      {/* 1) 🐷 가축 종 필터 */}
      <div>
        <h3 className="text-white text-m font-bold font-sans mb-2">가축 선택</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <label className="flex items-center space-x-2 text-white font-sans hover:bg-teal-800/20 rounded-full px-2 py-0.5 text-xs">
            <input
              type="checkbox"
              checked={allTypesSelected}
              onChange={onToggleAllTypes}
              className="accent-teal-400 focus:ring-2 focus:ring-teal-300 h-4 w-4"
            />
            <span>전체</span>
          </label>
          {livestockTypes.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 text-white font-sans hover:bg-teal-800/20 rounded-full px-2 py-0.5 text-xs"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => onToggleType(type)}
                className="accent-teal-400 focus:ring-2 focus:ring-teal-300 h-4 w-4"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2) 📏 규모 필터 + 초기화 버튼 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white text-m font-bold font-sans">축사 규모</h3>
          <button
            onClick={resetAll}
            className="text-xs text-white font-semibold hover:text-white border-2 border-teal-300 rounded-full p-1.5 hover:bg-teal-500/20"
          >
            초기화
          </button>
        </div>
        {/* 그룹 선택 탭 */}
        <div className="flex space-x-2 mb-2 overflow-x-auto pb-1">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                activeGroup === group
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                  : 'bg-teal-900/20 text-teal-200 hover:bg-teal-900/30'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
        {/* 슬라이더 */}
        <div className="space-y-4">
          <Slider.Root
            className="relative flex items-center w-full h-8 select-none touch-none"
            min={0}
            max={rs.length - 1}
            step={1}
            value={currentRange}
            onValueChange={(v) => handleChange(activeGroup, v as [number, number])}
          >
            <Slider.Track className="bg-gray-200 relative flex-1 h-2 rounded-full">
              <Slider.Range className="absolute bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-full transition-all duration-300" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-4 h-4 bg-teal-500 rounded-full shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200"
              aria-label="Minimum value"
            />
            <Slider.Thumb
              className="block w-4 h-4 bg-teal-500 rounded-full shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200"
              aria-label="Maximum value"
            />
          </Slider.Root>
          <div className="flex justify-between text-sm text-white font-semibold px-1">
            {rs.map((r) => (
              <span
                key={r.label}
                className="font-sans bg-gradient-to-r from-teal-900/20 to-blue-900/20 px-2 py-1 rounded-full"
              >
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3) 악취 범위 토글 스위치 */}
      <div className="pt-4 border-t border-white">
        <label className="flex items-center justify-between">
          <span className="text-white text-m font-bold font-sans">악취 범위</span>
          <button
            role="switch"
            aria-checked={showOdor}
            onClick={onToggleOdor}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showOdor ? 'bg-teal-500' : 'bg-gray-400'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                showOdor ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}

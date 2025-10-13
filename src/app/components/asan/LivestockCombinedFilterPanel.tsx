'use client'

import * as Slider from '@radix-ui/react-slider'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { scaleRanges } from '@/app/lib/livestockScaleRanges'

interface Props {
  livestockTypes: string[]
  selectedTypes: string[]
  onToggleType: (type: string) => void
  onToggleAllTypes: () => void
  allTypesSelected: boolean
  onScaleChange: (group: string, range: { min: number; max: number | null }) => void
  showOdor: boolean
  onToggleOdor: () => void
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
  // 그룹 목록
  const groups = useMemo(() => Object.keys(scaleRanges), [])

  // 초기 rangeMap 생성
  const initialRangeMap = useMemo(() => {
    return groups.reduce(
      (acc, g) => {
        const len = scaleRanges[g].length
        acc[g] = [0, len - 1] as [number, number]
        return acc
      },
      {} as Record<string, [number, number]>
    )
  }, [groups])

  const [activeGroup, setActiveGroup] = useState(groups[0] || '')
  const [rangeMap, setRangeMap] = useState<Record<string, [number, number]>>(initialRangeMap)

  // ✅ onScaleChange는 렌더 중이 아니라 커밋 이후에만 호출
  // 이전 rangeMap을 기억해 변경된 그룹만 통지
  const prevRangeRef = useRef<Record<string, [number, number]>>({})
  useEffect(() => {
    const prev = prevRangeRef.current
    groups.forEach((g) => {
      const prevVal = prev[g]
      const currVal = rangeMap[g]
      const changed = !prevVal || prevVal[0] !== currVal[0] || prevVal[1] !== currVal[1]

      if (changed) {
        const rs = scaleRanges[g]
        const [minIdx, maxIdx] = currVal
        onScaleChange(g, { min: rs[minIdx].min, max: rs[maxIdx].max })
      }
    })
    prevRangeRef.current = rangeMap
  }, [rangeMap, groups, onScaleChange])

  // 슬라이더 변경 → 로컬 상태만 갱신 (부모 통지는 위 useEffect가 담당)
  const handleChange = useCallback((group: string, vals: [number, number]) => {
    setRangeMap((prev) => ({ ...prev, [group]: vals }))
  }, [])

  // 전체 초기화 → 로컬 상태만 갱신 (부모 통지는 위 useEffect가 담당)
  const resetAll = useCallback(() => {
    setRangeMap(initialRangeMap)
  }, [initialRangeMap])

  // 현재 탭 그룹의 데이터
  const currentRange = rangeMap[activeGroup] || [0, Math.max(0, (scaleRanges[activeGroup]?.length ?? 1) - 1)]
  const rs = scaleRanges[activeGroup] || []

  return (
    <div className="space-y-6 p-4">
      {/* 1) 🐷 가축 종 필터 */}
      <div>
        <h3 className="text-m mb-2 font-sans font-bold text-white">가축 선택</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <label className="flex items-center space-x-2 rounded-full px-2 py-0.5 font-sans text-xs text-white hover:bg-teal-800/20">
            <input
              type="checkbox"
              checked={allTypesSelected}
              onChange={onToggleAllTypes}
              className="h-4 w-4 accent-teal-400 focus:ring-2 focus:ring-teal-300"
            />
            <span>전체</span>
          </label>
          {livestockTypes.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 rounded-full px-2 py-0.5 font-sans text-xs text-white hover:bg-teal-800/20"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => onToggleType(type)}
                className="h-4 w-4 accent-teal-400 focus:ring-2 focus:ring-teal-300"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2) 📏 규모 필터 + 초기화 버튼 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-m font-sans font-bold text-white">축사 규모</h3>
          <button
            onClick={resetAll}
            className="rounded-full border-2 border-teal-300 p-1.5 text-xs font-semibold text-white hover:bg-teal-500/20 hover:text-white"
          >
            초기화
          </button>
        </div>

        {/* 그룹 선택 탭 */}
        <div className="mb-2 flex space-x-2 overflow-x-auto pb-1">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`rounded-full px-2 py-1 text-xs font-medium ${
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
            className="relative flex h-8 w-full touch-none items-center select-none"
            min={0}
            max={rs.length - 1}
            step={1}
            value={currentRange}
            onValueChange={(v) => handleChange(activeGroup, v as [number, number])}
          >
            <Slider.Track className="relative h-2 flex-1 rounded-full bg-gray-200">
              <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300" />
            </Slider.Track>
            <Slider.Thumb
              className="block h-4 w-4 rounded-full bg-teal-500 shadow-md transition-all duration-200 hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 focus:outline-none"
              aria-label="Minimum value"
            />
            <Slider.Thumb
              className="block h-4 w-4 rounded-full bg-teal-500 shadow-md transition-all duration-200 hover:bg-teal-600 focus:ring-2 focus:ring-teal-300 focus:outline-none"
              aria-label="Maximum value"
            />
          </Slider.Root>

          <div className="flex justify-between px-1 text-sm font-semibold text-white">
            {rs.map((r) => (
              <span
                key={r.label}
                className="rounded-full bg-gradient-to-r from-teal-900/20 to-blue-900/20 px-2 py-1 font-sans"
              >
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3) 악취 범위 토글 */}
      <div className="border-t border-white pt-4">
        <label className="flex items-center justify-between">
          <span className="text-m font-sans font-bold text-white">악취 범위</span>
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
  )
}

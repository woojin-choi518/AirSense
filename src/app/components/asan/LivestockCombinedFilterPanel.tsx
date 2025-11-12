'use client'

import * as Slider from '@radix-ui/react-slider'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/app/lib/cn'
import { scaleRanges } from '@/app/lib/livestockScaleRanges'
import HighContrastToggle from '@/components/common/HighContrastToggle'
import { useHighContrast } from '@/components/providers/HighContrastProvider'

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
  const [isLivestockExpanded, setIsLivestockExpanded] = useState(true)

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
  const { isHighContrast } = useHighContrast()

  return (
    <div className="space-y-6 p-4">
      {/* 1) 가축 종 필터 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className={cn('text-m font-sans font-bold', isHighContrast ? 'text-white' : 'text-white')}>가축 선택</h3>
          <button
            onClick={() => setIsLivestockExpanded(!isLivestockExpanded)}
            className={cn(
              'transition-colors',
              isHighContrast ? 'text-white hover:text-gray-300' : 'text-white hover:text-blue-300'
            )}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isLivestockExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isLivestockExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-wrap gap-x-3 gap-y-1 sm:grid sm:grid-cols-2">
            <label
              className={cn(
                'flex flex-shrink-0 items-center space-x-2 rounded-full px-2 py-0.5 font-sans text-xs',
                isHighContrast ? 'text-white hover:bg-white/20' : 'text-white hover:bg-teal-800/20'
              )}
            >
              <div className="relative h-4 w-4 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={allTypesSelected}
                  onChange={onToggleAllTypes}
                  className={cn(
                    'peer h-full w-full appearance-none rounded transition-all',
                    isHighContrast
                      ? 'border border-white checked:border-white checked:bg-white focus:ring-2 focus:ring-white'
                      : 'border-2 border-gray-400 checked:border-blue-300 checked:bg-blue-300 focus:ring-2 focus:ring-sky-300'
                  )}
                />
                <svg
                  className={cn(
                    'pointer-events-none absolute top-0 left-0 h-full w-full fill-none stroke-[3] opacity-0 transition-opacity peer-checked:opacity-100',
                    isHighContrast ? 'stroke-gray-800' : 'stroke-white'
                  )}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12l5 5l10 -10" />
                </svg>
              </div>
              <span className="whitespace-nowrap">전체</span>
            </label>
            {livestockTypes.map((type) => (
              <label
                key={type}
                className={cn(
                  'flex flex-shrink-0 items-center space-x-2 rounded-full px-2 py-0.5 font-sans text-xs',
                  isHighContrast ? 'text-white hover:bg-white/20' : 'text-white hover:bg-teal-800/20'
                )}
              >
                <div className="relative h-4 w-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => onToggleType(type)}
                    className={cn(
                      'peer h-full w-full appearance-none rounded transition-all',
                      isHighContrast
                        ? 'border border-white checked:border-white checked:bg-white focus:ring-2 focus:ring-white'
                        : 'border-2 border-gray-400 checked:border-blue-300 checked:bg-blue-300 focus:ring-2 focus:ring-sky-300'
                    )}
                  />

                  <svg
                    className={cn(
                      'pointer-events-none absolute top-0 left-0 h-full w-full fill-none stroke-[3] opacity-0 transition-opacity peer-checked:opacity-100',
                      isHighContrast ? 'stroke-black' : 'stroke-white'
                    )}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12l5 5l10 -10" />
                  </svg>
                </div>
                <span className="whitespace-nowrap">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 2) 📏 규모 필터 + 초기화 버튼 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className={cn('text-md font-sans font-bold', isHighContrast ? 'text-white' : 'text-white')}>축사 규모</h3>
          <button
            onClick={resetAll}
            className={cn(
              'rounded-full p-1.5 text-[10px] font-semibold transition-all',
              isHighContrast
                ? 'border border-white bg-white text-gray-800 hover:bg-gray-200'
                : 'border-2 border-blue-400 bg-blue-400 text-white hover:border-blue-400/80 hover:bg-blue-400/80'
            )}
          >
            초기화
          </button>
        </div>

        {/* 그룹 선택 탭 */}
        <div className="mb-2 flex flex-wrap gap-2 pb-1">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={cn(
                'flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition-all',
                isHighContrast
                  ? activeGroup === group
                    ? 'border border-white bg-white text-gray-800'
                    : 'border border-white bg-gray-800 text-white hover:bg-white/20'
                  : activeGroup === group
                    ? 'bg-gradient-to-r from-blue-400 to-blue-400 text-white backdrop-blur-sm'
                    : 'bg-blue-300/20 text-white backdrop-blur-sm hover:bg-blue-300/30'
              )}
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
            <Slider.Track
              className={cn('relative h-2 flex-1 rounded-full', isHighContrast ? 'bg-gray-600' : 'bg-gray-200')}
            >
              <Slider.Range
                className={cn(
                  'absolute h-full rounded-full transition-all duration-300',
                  isHighContrast ? 'bg-white' : 'bg-gradient-to-r from-sky-300/90 to-blue-400/90'
                )}
              />
            </Slider.Track>
            <Slider.Thumb
              className={cn(
                'block h-4 w-4 rounded-full shadow-md transition-all duration-200 focus:outline-none',
                isHighContrast
                  ? 'border-2 border-gray-800 bg-white hover:bg-gray-200 focus:ring-2 focus:ring-white'
                  : 'bg-white hover:bg-white focus:ring-2 focus:ring-blue-200'
              )}
              aria-label="Minimum value"
            />
            <Slider.Thumb
              className={cn(
                'block h-4 w-4 rounded-full shadow-md transition-all duration-200 focus:outline-none',
                isHighContrast
                  ? 'border-2 border-gray-800 bg-white hover:bg-gray-200 focus:ring-2 focus:ring-white'
                  : 'bg-white hover:bg-white focus:ring-2 focus:ring-blue-200'
              )}
              aria-label="Maximum value"
            />
          </Slider.Root>

          <div
            className={cn(
              'flex flex-wrap gap-2 px-1 text-[10px] font-semibold sm:text-xs',
              isHighContrast ? 'text-white' : 'text-white'
            )}
          >
            {rs.map((r) => (
              <span
                key={r.label}
                className={cn(
                  'flex-shrink-0 rounded-full px-2 py-1 font-sans whitespace-nowrap',
                  !isHighContrast && 'backdrop-blur-sm'
                )}
              >
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3) 악취 범위 토글 */}
      <div className={cn('border-t pt-4', isHighContrast ? 'border-white' : 'border-white')}>
        <label className="flex items-center justify-between">
          <span className={cn('text-m font-sans font-bold', isHighContrast ? 'text-white' : 'text-white')}>
            악취 범위
          </span>
          <button
            role="switch"
            aria-checked={showOdor}
            onClick={onToggleOdor}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              isHighContrast
                ? showOdor
                  ? 'border border-white bg-white'
                  : 'border border-white bg-gray-600'
                : showOdor
                  ? 'bg-blue-400/50'
                  : 'bg-gray-400'
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full shadow transition-transform',
                isHighContrast
                  ? showOdor
                    ? 'translate-x-5 bg-gray-800'
                    : 'translate-x-1 bg-white'
                  : showOdor
                    ? 'translate-x-5 bg-white'
                    : 'translate-x-1 bg-white'
              )}
            />
          </button>
        </label>
      </div>

      {/* 4) 고대비 모드 토글 */}
      <div className={cn('border-t pt-4', isHighContrast ? 'border-white' : 'border-white')}>
        <HighContrastToggle />
      </div>
    </div>
  )
}

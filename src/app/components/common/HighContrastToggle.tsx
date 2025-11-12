'use client'

import { Contrast } from 'lucide-react'
import React from 'react'

import { cn } from '@/app/lib/cn'
import { useHighContrast } from '@/components/providers/HighContrastProvider'

export default function HighContrastToggle({ className }: { className?: string }) {
  const { isHighContrast, toggleHighContrast } = useHighContrast()

  return (
    <button
      onClick={toggleHighContrast}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all',
        isHighContrast ? 'bg-white text-gray-800 hover:bg-gray-200' : 'bg-white/90 text-gray-800 hover:bg-white',
        'border-2',
        isHighContrast ? 'border-gray-800' : 'border-gray-300',
        className
      )}
      aria-label={isHighContrast ? '고대비 모드 끄기' : '고대비 모드 켜기'}
      title={isHighContrast ? '고대비 모드 끄기' : '고대비 모드 켜기'}
    >
      <div className="flex items-center gap-2">
        <Contrast className="h-4 w-4" />
        <span className="text-xs font-semibold">고대비</span>
      </div>
      <span className={cn('text-xs font-semibold', isHighContrast ? 'text-gray-800' : 'text-gray-600')}>
        {isHighContrast ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

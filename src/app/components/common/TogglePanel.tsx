// TogglePanel.tsx
import * as Collapsible from '@radix-ui/react-collapsible'
import * as React from 'react'

import { cn } from '@/app/lib/cn'

export default function TogglePanel({
  title,
  children,
  horizontal,
  widthClass = 'min-w-[220px] max-w-[88vw] sm:min-w-[280px] sm:max-w-[24vw]',
  topOffset,
  bottomOffset,
  defaultOpen = false,
  icon,
}: {
  title: string
  children: React.ReactNode
  horizontal: string // 'left-4' | 'right-4'
  widthClass?: string
  topOffset?: number // px
  bottomOffset?: number // px
  defaultOpen?: boolean
  icon?: React.ReactNode // 모바일에서 접혀있을 때 표시할 아이콘
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 모바일에서 아이콘만 표시할 때 너비 조정
  const shouldUseCompactWidth = icon && !open && isMobile && isClient

  return (
    <div
      className={cn(
        'fixed', // 모두 fixed
        horizontal, // left-4 or right-4
        shouldUseCompactWidth ? 'max-w-[60px] min-w-[60px]' : widthClass,
        'z-[9999]',
        'max-h-[90vh]' // 모바일에서 패널 높이 제한
      )}
      // ✅ 두 패널 모두 동일한 top 계산
      style={
        topOffset !== undefined
          ? { top: `calc(env(safe-area-inset-top, 0px) + ${topOffset}px)` }
          : { bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset ?? 0}px)` }
      }
    >
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        {/* 헤더(칩) */}
        <Collapsible.Trigger
          className={cn(
            // 높이 고정 + 줄바꿈 방지 (두 패널 동일)
            'h-12 overflow-hidden px-5 text-ellipsis whitespace-nowrap',
            'w-full rounded-full shadow-md select-none',
            'bg-gradient-to-r from-teal-800/20 to-blue-500/20',
            'border-2 border-white/30 backdrop-blur-md',
            'flex items-center justify-between font-bold text-white',
            'transition-[transform,opacity,box-shadow] duration-300',
            // 모바일에서 아이콘만 표시할 때 패딩 조정
            shouldUseCompactWidth ? 'px-3' : ''
          )}
        >
          {/* 웹: 항상 title 표시, 모바일: 펼쳐져 있을 때만 title 표시 */}
          <span className={cn('leading-none', icon && !open && isMobile && isClient && 'hidden')}>{title}</span>

          {/* 모바일에서 접혀있을 때만 아이콘 표시 */}
          {icon && !open && isMobile && isClient && <div className="flex items-center justify-center">{icon}</div>}

          <span className={cn('text-lg leading-none transition-transform', open && 'rotate-90')}>▸</span>
        </Collapsible.Trigger>

        {/* 본문 */}
        <Collapsible.Content
          className={cn(
            'mt-2 rounded-2xl border-2 border-white/30',
            'bg-gradient-to-br from-teal-800/20 to-blue-500/20',
            'shadow-lg backdrop-blur-md',
            'animate-in slide-in-from-top-2 fade-in duration-200',
            'w-full overflow-hidden'
          )}
        >
          <div className="scrollbar-hide max-h-[calc(90vh-80px)] w-full overflow-y-auto p-1">{children}</div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  )
}

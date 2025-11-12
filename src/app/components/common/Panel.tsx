'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PanelProps {
  title: string
  icon: LucideIcon
  children: ReactNode
  className?: string
  variant?: 'default' | 'blue' | 'red' | 'green' | 'purple'
  textAlign?: 'left' | 'center' | 'right'
}

const variantStyles = {
  default: 'border-gray-200 bg-white',
  blue: 'border-blue-200 bg-blue-50',
  red: 'border-red-200 bg-red-50',
  green: 'border-green-200 bg-green-50',
  purple: 'border-purple-200 bg-purple-50',
}

export default function Panel({
  title,
  icon: Icon,
  children,
  className = '',
  variant = 'default',
  textAlign = 'left',
}: PanelProps) {
  const baseStyles = 'rounded-xl border p-6 shadow-sm'
  const variantStyle = variantStyles[variant]
  const textAlignStyle = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'

  const isFlexColumn = className.includes('flex') && className.includes('flex-col')
  const isFullHeight = className.includes('h-full') || className.includes('lg:h-full')

  return (
    <div className={`${baseStyles} ${variantStyle} ${className}`}>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <Icon className="h-5 w-5 text-gray-600" />
        {title}
      </h2>
      <div className={`${textAlignStyle} ${isFlexColumn && isFullHeight ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
        {children}
      </div>
    </div>
  )
}

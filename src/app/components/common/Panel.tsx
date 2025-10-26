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
  default: 'border-white/20 bg-white/80',
  blue: 'border-blue-100/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80',
  red: 'border-red-100/50 bg-gradient-to-br from-red-50/80 to-orange-50/80',
  green: 'border-green-100/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80',
  purple: 'border-purple-100/50 bg-gradient-to-br from-purple-50/80 to-violet-50/80',
}

export default function Panel({
  title,
  icon: Icon,
  children,
  className = '',
  variant = 'default',
  textAlign = 'left',
}: PanelProps) {
  const baseStyles = 'rounded-xl border p-6 shadow-lg backdrop-blur-sm'
  const variantStyle = variantStyles[variant]
  const textAlignStyle = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'

  return (
    <div className={`${baseStyles} ${variantStyle} ${className}`}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
        <Icon className="h-5 w-5 text-emerald-600" />
        {title}
      </h2>
      <div className={textAlignStyle}>{children}</div>
    </div>
  )
}

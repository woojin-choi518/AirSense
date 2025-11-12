'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface HighContrastContextType {
  isHighContrast: boolean
  toggleHighContrast: () => void
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined)

export function useHighContrast() {
  const context = useContext(HighContrastContext)
  if (context === undefined) {
    throw new Error('useHighContrast must be used within a HighContrastProvider')
  }
  return context
}

interface Props {
  children: React.ReactNode
}

export default function HighContrastProvider({ children }: Props) {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // 클라이언트 사이드에서만 localStorage 접근
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('highContrastMode')
    if (saved === 'true') {
      setIsHighContrast(true)
    }
  }, [])

  const toggleHighContrast = () => {
    setIsHighContrast((prev) => {
      const newValue = !prev
      if (isClient) {
        localStorage.setItem('highContrastMode', String(newValue))
      }
      return newValue
    })
  }

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  )
}

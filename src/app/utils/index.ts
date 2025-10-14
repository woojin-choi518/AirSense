'use client'

import { useCallback, useEffect, useRef } from 'react'

export const angleDiffDeg = (a: number, b: number): number => Math.abs(((a - b + 540) % 360) - 180)

export const hashFarmsLite = (arr: Array<{ id: number; livestock_type: string; livestock_count: number }>): string => {
  return arr.map((f) => `${f.id}:${f.livestock_type}:${f.livestock_count}`).join('|')
}

export function useThrottleCallback<T extends (...args: unknown[]) => void>(fn: T, wait = 250) {
  const fnRef = useRef(fn)
  const lastTsRef = useRef<number>(0)
  const tidRef = useRef<number | null>(null)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const remain = wait - (now - lastTsRef.current)
      const run = () => {
        lastTsRef.current = Date.now()
        fnRef.current(...args)
      }
      if (remain <= 0) {
        if (tidRef.current !== null) {
          clearTimeout(tidRef.current)
          tidRef.current = null
        }
        run()
        return
      }
      if (tidRef.current !== null) clearTimeout(tidRef.current)
      tidRef.current = window.setTimeout(() => {
        tidRef.current = null
        run()
      }, remain)
    },
    [wait]
  )
}

export const sameFans = (
  a: Array<{ farmId: number; type: string; radius: number; startA: number; endA: number }>,
  b: Array<{ farmId: number; type: string; radius: number; startA: number; endA: number }>
): boolean => {
  if (a.length !== b.length) return false
  return a.every((x, i) => {
    const y = b[i]
    return (
      x.farmId === y.farmId && x.type === y.type && x.radius === y.radius && x.startA === y.startA && x.endA === y.endA
    )
  })
}

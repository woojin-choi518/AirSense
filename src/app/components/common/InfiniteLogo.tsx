'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

type Logo = { name: string; logo: string; alt?: string }
type Props = {
  items: Logo[]
  speed?: number // px/s
  gap?: number // px
  itemWidth?: number // 각 칸 고정폭(px)
  maxLogoHeight?: number
}

export default function InfiniteLogo({ items, speed = 100, gap = 48, itemWidth = 160, maxLogoHeight = 60 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const halfRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  const [containerW, setContainerW] = useState(0)
  const [halfW, setHalfW] = useState(0)
  const [ready, setReady] = useState(false)

  // 1) 컨테이너 폭 측정 (리사이즈 대응)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth))
    ro.observe(el)
    setContainerW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 2) 화면폭을 덮을 때까지 블록 반복 수 계산
  const repeats = useMemo(() => {
    // 아이템 하나의 "칸" 폭 = itemWidth
    const blockWidthOnce = items.length * itemWidth + (items.length - 1) * gap
    // 한 블록(절반)이 최소 화면폭 + 여유를 넘도록 반복
    const need = Math.max(1, Math.ceil((containerW + itemWidth) / Math.max(1, blockWidthOnce)))
    return need
  }, [containerW, items.length, itemWidth, gap])

  // 3) 반복 적용된 블록 아이템
  const blockItems = useMemo(() => Array.from({ length: repeats }).flatMap(() => items), [repeats, items])

  // 4) 절반(블록) 실제 폭 측정 → RAF 애니 시작
  useEffect(() => {
    const el = halfRef.current
    if (!el) return
    const update = () => {
      const w = el.scrollWidth
      setHalfW(w)
      setReady(w > 0)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [blockItems, gap])

  // 5) 리셋 없는 무한 이동 (끊김 방지)
  useEffect(() => {
    if (!ready || !trackRef.current || halfW === 0) return
    const el = trackRef.current
    let x = 0

    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts

      x -= speed * dt
      // halfW보다 작아지면 halfW만큼만 되돌림(모듈러) → seam 없음
      while (x <= -halfW) x += halfW

      el.style.transform = `translate3d(${x}px,0,0)`
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [ready, halfW, speed])

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden py-3">
      {/* 좌우 페이드(overlay 방식: 비용 적음) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

      {/* 트랙: 블록(절반) 2개 */}
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{
          margin: 0,
          padding: 0,
          columnGap: gap,
          visibility: ready ? 'visible' : 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
      >
        {/* 절반 A */}
        <div ref={halfRef} className="flex w-max items-center" style={{ columnGap: gap }}>
          {blockItems.map((p, i) => (
            <div key={`a-${i}`} className="flex flex-none items-center justify-center" style={{ width: itemWidth }}>
              <Image
                src={p.logo}
                alt={p.alt ?? p.name}
                width={itemWidth}
                height={maxLogoHeight}
                className="h-auto w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                style={{ maxHeight: maxLogoHeight }}
                priority={i < 3} // 초반 몇 개는 eager
              />
            </div>
          ))}
        </div>

        {/* 절반 B (A와 완전 동일) */}
        <div className="flex w-max items-center" style={{ columnGap: gap }}>
          {blockItems.map((p, i) => (
            <div key={`b-${i}`} className="flex flex-none items-center justify-center" style={{ width: itemWidth }}>
              <Image
                src={p.logo}
                alt={p.alt ?? p.name}
                width={itemWidth}
                height={maxLogoHeight}
                className="h-auto w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                style={{ maxHeight: maxLogoHeight }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

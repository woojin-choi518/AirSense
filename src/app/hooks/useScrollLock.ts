// hooks/useScrollLock.ts
'use client';
import { useEffect } from 'react';

export default function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
      overscrollBehavior: (style as any).overscrollBehavior as string | undefined,
    };

    const scrollY = window.scrollY || 0;
    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    (style as any).overscrollBehavior = 'none'; // 모바일 바운스 방지

    return () => {
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      if (prev.overscrollBehavior !== undefined) {
        (style as any).overscrollBehavior = prev.overscrollBehavior;
      } else {
        (style as any).overscrollBehavior = '';
      }
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

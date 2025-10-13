'use client'

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ISourceOptions } from 'tsparticles-engine'

const Particles = dynamic(() => import('react-tsparticles'), { ssr: false })

type Props = {
  featureDark: boolean // 아이콘 상태 표시용
  onToggleFeatureDark: () => void // Feature 전용 다크 토글
}

export default function HeroSection({ featureDark, onToggleFeatureDark }: Props) {
  // Hero는 항상 라이트 톤(텍스트/색상 유지)
  const options: ISourceOptions = {
    background: { color: { value: '#f0f4f8' } },
    particles: {
      color: { value: '#10b981' },
      links: { enable: true, distance: 200, opacity: 0.3, width: 0.5 },
      move: { enable: true, speed: 0.5 },
      number: { value: 30, density: { enable: true, area: 1000 } },
      size: { value: { min: 1, max: 2 } },
    },
  }

  return (
    <section
      className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/images/asansi.webp')" }}
    >
      <Particles options={options} className="absolute inset-0 -z-10" />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative mx-4 max-w-full rounded-2xl bg-orange-950/25 p-6 text-center text-white shadow-2xl backdrop-blur-xl sm:mx-auto sm:max-w-lg md:max-w-4xl md:rounded-3xl md:p-12"
      >
        <h1 className="mb-4 text-2xl font-extrabold drop-shadow-lg sm:text-4xl md:text-6xl">AirSense Asan</h1>

        <p className="mb-6 text-base font-bold drop-shadow sm:text-lg md:text-2xl">
          아산시 악취 문제 해결을 위한 데이터 플랫폼
        </p>

        <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Feature 전용 다크 토글 */}
          <button
            onClick={onToggleFeatureDark}
            className="rounded-full bg-white/20 p-2 transition hover:bg-white/30 sm:p-3"
            aria-label="Toggle Feature dark mode"
          >
            {featureDark ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-white" size={20} />}
          </button>

          <Link
            href="/asan"
            className="flex items-center gap-2 rounded-lg bg-orange-100/20 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-orange-400/20 sm:px-6 sm:py-3 sm:text-base"
          >
            <span>🌍</span> 아산시 지도 바로가기
          </Link>
        </div>

        <div className="text-sm drop-shadow sm:text-base">↓ Scroll Down ↓</div>
      </motion.div>
    </section>
  )
}

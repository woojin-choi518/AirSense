'use client'

import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ISourceOptions } from 'tsparticles-engine'

import InfiniteLogo from '../common/InfiniteLogo'

const Particles = dynamic(() => import('react-tsparticles'), { ssr: false })

// 협력사 정보
const partners = [
  { name: '아산시', logo: '/images/header/asan_logo.webp', alt: 'Asan' },
  { name: 'Deep AI Bit', logo: '/images/header/DeepAIBit_logo.webp', alt: 'Deep AI Bit' },
  { name: 'GBICI', logo: '/images/header/GBICI.webp', alt: 'GBICI' },
]

export default function HeroSection() {
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
        <h1 className="mb-4 text-2xl font-bold drop-shadow-lg sm:text-4xl md:text-6xl">AI-Smart Air 아산시</h1>

        <p className="mb-6 text-base font-bold drop-shadow sm:text-lg md:text-2xl">
          아산시 악취 문제 해결을 위한 인공지능 기반 서비스
        </p>

        <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Feature 전용 다크 토글 */}
          {/* <button
            onClick={onToggleFeatureDark}
            className="rounded-full bg-white/20 p-2 transition hover:bg-white/30 sm:p-3"
            aria-label="Toggle Feature dark mode"
          >
            {featureDark ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-white" size={20} />}
          </button> */}

          <Link
            href="/asan"
            className="flex items-center gap-2 rounded-lg bg-orange-100/20 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-orange-400/20 sm:px-6 sm:py-3 sm:text-base"
          >
            <Map className="h-4 w-4" /> 악취 지도 바로가기
          </Link>
        </div>

        <div className="text-sm font-bold drop-shadow sm:text-base">↓ 더 알아보기 ↓</div>
      </motion.div>

      {/* 하단 협력사 캐러셀 */}
      <div className="absolute right-0 bottom-0 left-0 z-10 bg-white/80 backdrop-blur-md">
        <InfiniteLogo items={partners} speed={50} gap={32} itemWidth={100} maxLogoHeight={50} />
      </div>
    </section>
  )
}

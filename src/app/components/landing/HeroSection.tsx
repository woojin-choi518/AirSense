'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import type { ISourceOptions } from 'tsparticles-engine';

const Particles = dynamic(() => import('react-tsparticles'), { ssr: false });

type Props = {
  featureDark: boolean;            // 아이콘 상태 표시용
  onToggleFeatureDark: () => void; // Feature 전용 다크 토글
};

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
  };

  return (
    <section
      className="relative flex flex-col justify-center items-center w-screen h-screen overflow-hidden
                 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/asansi.webp')" }}
    >
      <Particles options={options} className="absolute inset-0 -z-10" />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="
          relative
          bg-orange-950/25 backdrop-blur-xl
          p-6 md:p-12
          rounded-2xl md:rounded-3xl
          shadow-2xl
          max-w-full sm:max-w-lg md:max-w-4xl
          mx-4 sm:mx-auto
          text-center text-white
        "
      >
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold drop-shadow-lg mb-4">
          AirSense Asan
        </h1>

        <p className="text-base sm:text-lg md:text-2xl font-bold drop-shadow mb-6">
          아산시 악취 문제 해결을 위한 데이터 플랫폼
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          {/* Feature 전용 다크 토글 */}
          <button
            onClick={onToggleFeatureDark}
            className="p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
            aria-label="Toggle Feature dark mode"
          >
            {featureDark ? (
              <Sun className="text-yellow-400" size={20} />
            ) : (
              <Moon className="text-white" size={20} />
            )}
          </button>

          <Link
            href="/asan"
            className="
              bg-orange-100/20 hover:bg-orange-400/20
              text-white font-semibold
              px-4 py-2 sm:px-6 sm:py-3
              rounded-lg shadow-md
              flex items-center gap-2
              text-sm sm:text-base
              transition
            "
          >
            <span>🌍</span> 아산시 지도 바로가기
          </Link>
        </div>

        <div className="text-sm sm:text-base drop-shadow">
          ↓ Scroll Down ↓
        </div>
      </motion.div>
    </section>
  );
}

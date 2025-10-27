'use client'

import { useState } from 'react'

import FeatureSection from '@/app/components/landing/FeatureSection'
import HeroSection from '@/app/components/landing/HeroSection'

export default function FeatureWrapper() {
  // 기본: 라이트 모드
  const [featureDark] = useState(false)

  const features = [
    {
      title: '아산시 악취 지도',
      subTitle: '집 주변 악취 범위, \n날씨 기반으로 계산해서 알려드려요. ',
      description:
        '아산시에 위치한 722개 농장과 날씨 데이터를 활용해서 악취 범위를 계산해요. 실시간 악취 범위와 5일 이후까지의 악취 예측 범위를 확인할 수 있어요.',
      image1: { src: '/images/farm1.webp', alt: '아산시 악취 지도 1' },
      image2: { src: '/images/farm2.webp', alt: '아산시 악취 지도 2' },
    },
    {
      title: '민원 지도',
      subTitle: '악취 민원 현황을\n지도에서 한눈에 확인하세요.',
      description:
        '지역별 악취 민원 발생 현황을 지도로 확인할 수 있어요. 민원 발생 지역의 패턴과 상세 정보를 확인하고, 실제 민원 데이터 기반으로 악취 문제를 분석해요.',
      image1: { src: '/images/farm1.webp', alt: '민원 지도 1' },
      image2: { src: '/images/farm2.webp', alt: '민원 지도 2' },
    },
    {
      title: '민원 접수',
      subTitle: '악취 문제 신고를\n간편하게 접수하세요.',
      description:
        '악취 문제가 발생한 지역을 선택하고 상세 정보를 입력하면 바로 민원이 접수돼요. 위치 정보와 함께 악취 강도, 악취 유형 등을 선택해서 정확한 민원 정보를 제공할 수 있어요.',
      image1: { src: '/images/farm1.webp', alt: '민원 접수 1' },
      image2: { src: '/images/farm2.webp', alt: '민원 접수 2' },
    },
  ]

  return (
    <>
      {/* Hero: 텍스트/스타일은 그대로, 토글 콜백만 전달 */}
      <section className="relative flex h-screen items-center justify-center overflow-x-hidden">
        <HeroSection />
      </section>

      {/* Feature 전용 다크모드 영역 */}
      <div className={`overflow-x-hidden ${featureDark ? 'dark' : ''}`}>
        {features.map((feature, index) => (
          <section key={index} className={`${featureDark ? 'bg-[#2d1300]' : 'bg-white'}`}>
            <FeatureSection {...feature} isDark={featureDark} />
          </section>
        ))}

        {/* Footer도 Feature 테마를 따르게 */}
        <footer
          className={`py-6 text-center text-xs ${featureDark ? 'bg-[#2d1300] text-[#fef5f0]' : 'bg-white text-gray-400'}`}
        >
          Collaborators: Asan City, DeepAIBit
        </footer>
      </div>
    </>
  )
}

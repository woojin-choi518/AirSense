'use client';

import { useState } from 'react';
import HeroSection from '@/app/components/landing/HeroSection';
import FeatureSection from '@/app/components/landing/FeatureSection';

export default function FeatureWrapper() {
  // 기본: 라이트 모드
  const [featureDark, setFeatureDark] = useState(false);

  const featureData = {
    title: 'Asan · 아산시 악취 지도',
    subTitle: '집 주변 악취 범위, \n날씨 기반으로 계산해서 알려드려요. ',
    description:
      '아산시에 위치한 722개 농장과 날씨 데이터를 활용해서 악취 범위를 계산해요. 실시간 악취 범위와 5일 이후까지의 악취 예측 범위를 확인할 수 있어요.',
    image1: { src: '/images/farm1.webp', alt: 'Search 화면 1' },
    image2: { src: '/images/farm2.webp', alt: 'Search 화면 2' },
  };

  return (
    <>
      {/* Hero: 텍스트/스타일은 그대로, 토글 콜백만 전달 */}
      <section className="relative flex justify-center items-center h-screen">
        <HeroSection
          featureDark={featureDark}
          onToggleFeatureDark={() => setFeatureDark(v => !v)}
        />
      </section>

      {/* Feature 전용 다크모드 영역 */}
      <div className={featureDark ? 'dark' : ''}>
        <section className={` ${featureDark ? 'bg-[#360901]' : 'bg-white'}`}>
          <FeatureSection {...featureData} isDark={featureDark} />
        </section>

        {/* Footer도 Feature 테마를 따르게 */}
        <footer
          className={`text-center py-6 text-xs 
          ${featureDark ? 'text-[#F5E6C8] bg-[#360901]' : 'text-gray-400 bg-white'}`}
        >
          Data Source: EMP | NCBI | PAMC | KOPRI | SMU
        </footer>
      </div>
    </>
  );
}

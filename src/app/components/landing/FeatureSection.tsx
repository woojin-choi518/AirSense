'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ViewToggleButton from './ViewToggleButton';
import ImageDisplay from './ImageDisplay';
import TextContent from './TextContent';

interface ImageData { src: string; alt: string }
interface FeatureSectionProps {
  title: string;
  subTitle: string;
  description: string;
  image1: ImageData;  // 큰 맵
  image2: ImageData;  // 작은 캡처
  isDark?: boolean;   // 다크모드 상태 추가
}

export default function FeatureSection({
  title, subTitle, description, image1, image2, isDark = false
}: FeatureSectionProps) {
  const [view, setView] = useState<'first' | 'second'>('first');

  return (
    <motion.section
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true, margin: '100px' }}
      className="py-16"
    >
      <div className="max-w-6xl mx-auto px-4">

        {/* 모바일 전용 */}
        <div className="md:hidden">
          <TextContent 
            title={title}
            subTitle={subTitle}
            description={description}
            isDark={isDark}
            isMobile={true}
          />
          
          <ViewToggleButton 
            view={view}
            onViewChange={setView}
            isDark={isDark}
          />

          <ImageDisplay 
            view={view}
            image1={image1}
            image2={image2}
            isMobile={true}
          />

          <p className={`text-center ${isDark ? 'text-[#F5E6C8]' : 'text-gray-900'}`}>
            {description}
          </p>
        </div>

        {/* 데스크탑 전용 그리드 */}
        <div
          className="hidden md:grid gap-4"
          style={{ gridTemplateColumns: '2fr 2.5fr', gridTemplateRows: 'auto 1fr' }}
        >
          {/* (1,1) 제목·부제목 */}
          <TextContent 
            title={title}
            subTitle={subTitle}
            description={description}
            isDark={isDark}
            isMobile={false}
          />

          {/* (1,2) 큰 맵 */}
          <div>
            <ImageDisplay 
              view="first"
              image1={image1}
              image2={image2}
              isMobile={false}
            />
          </div>

          {/* (2,1) 작은 캡처 */}
          <div>
            <ImageDisplay 
              view="second"
              image1={image1}
              image2={image2}
              isMobile={false}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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

  // Scroll-linked animation setup
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Start reacting a bit earlier and finish sooner so items are fully in-view
    offset: ['start 90%', 'end 30%'],
  });

  // 부드럽게
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  // Row 1: 왼쪽 → 중앙 (finish early)
  const row1X = useTransform(smooth, [0, 0.35], [-100, 0]);
  const row1Opacity = useTransform(smooth, [0, 0.18], [0, 1]);

  // Row 2: 오른쪽 → 중앙 (slight delay but still early)
  const row2X = useTransform(smooth, [0.1, 0.45], [80, 0]);
  const row2Opacity = useTransform(smooth, [0.12, 0.28], [0, 1]);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
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
          className="hidden md:grid gap-x-4 gap-y-70"
          style={{ gridTemplateColumns: '2fr 2.5fr', gridTemplateRows: 'auto 1fr auto' }}
        >
          {/* (1,1) 제목·부제목 - 왼쪽에서 등장 (row1) */}
          <motion.div style={{ x: row1X, opacity: row1Opacity }}>
            <TextContent 
              title={title}
              subTitle={subTitle}
              description={description}
              isDark={isDark}
              isMobile={false}
              showDescription={false}
            />
          </motion.div>

          {/* (1,2) 큰 맵 - 왼쪽에서 등장 (row1) */}
          <motion.div style={{ x: row1X, opacity: row1Opacity }}>
            <ImageDisplay 
              view="first"
              image1={image1}
              image2={image2}
              isMobile={false}
            />
          </motion.div>

          {/* (2,1) 작은 캡처 - 오른쪽에서 등장 (row2) */}
          <motion.div style={{ x: row2X, opacity: row2Opacity }}>
            <ImageDisplay 
              view="second"
              image1={image1}
              image2={image2}
              isMobile={false}
            />
          </motion.div>

          {/* (2,2) 설명 - 오른쪽에서 등장 (row2) */}
          <motion.div className="self-start text-left" style={{ x: row2X, opacity: row2Opacity }}>
            <p className={`text-base md:text-2xl ${isDark ? 'text-[#FFF6D1]' : 'text-gray-900'}`}>
              {description}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
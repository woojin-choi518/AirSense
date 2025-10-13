'use client'

import React from 'react'

interface TextContentProps {
  title: string
  subTitle: string
  description: string
  isDark: boolean
  isMobile?: boolean
  showDescription?: boolean // new: control rendering of description (desktop only)
}

export default function TextContent({
  title,
  subTitle,
  description,
  isDark,
  isMobile = false,
  showDescription = true,
}: TextContentProps) {
  const titleClass = isDark ? 'text-[#F5E6C8]' : 'text-green-600'
  const subTitleClass = isDark ? 'text-white' : 'text-black'

  if (isMobile) {
    return (
      <div className="mb-6 text-center">
        <h2 className={`mb-2 text-2xl font-extrabold ${titleClass}`}>{title}</h2>
        <p className={`text-xl font-extrabold whitespace-pre-line ${subTitleClass}`}>{subTitle}</p>
      </div>
    )
  }

  return (
    <>
      <div className="self-start text-left">
        {/* 아이콘과 함께하는 제목 */}
        <div className="mb-4 flex items-center gap-3">
          <h2 className={`text-2xl font-extrabold md:text-2xl ${isDark ? 'text-[#FFF6D1]' : 'text-green-600'}`}>
            {title}
          </h2>
        </div>

        <p className={`text-xl font-extrabold whitespace-pre-line md:text-4xl ${subTitleClass}`}>{subTitle}</p>

        {/* 장식적 구분선 */}
        <div className={`mt-6 h-1 w-16 rounded-full ${isDark ? 'bg-amber-400' : 'bg-green-500'}`} />
      </div>
      {showDescription && (
        <div className="self-start text-left">
          <p className={`text-base md:text-2xl ${isDark ? 'text-[#FFF6D1]' : 'text-gray-900'}`}>{description}</p>
        </div>
      )}
    </>
  )
}

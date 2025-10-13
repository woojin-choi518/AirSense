'use client'

import Image from 'next/image'

interface ImageData {
  src: string
  alt: string
}

interface ImageDisplayProps {
  view: 'first' | 'second'
  image1: ImageData
  image2: ImageData
  isMobile?: boolean
}

export default function ImageDisplay({ view, image1, image2, isMobile = false }: ImageDisplayProps) {
  const imageProps = isMobile ? { width: 800, height: 450 } : { width: 900, height: 600 }

  const currentImage = view === 'first' ? image1 : image2

  return (
    <div className={isMobile ? 'mb-6' : ''}>
      <Image
        src={currentImage.src}
        alt={currentImage.alt}
        {...imageProps}
        className="h-auto w-full rounded-2xl object-cover shadow-lg"
        loading={isMobile ? 'eager' : 'lazy'}
      />
    </div>
  )
}

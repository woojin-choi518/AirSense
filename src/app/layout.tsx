// src/app/layout.tsx
import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import React from 'react'

import MainWrapper from '@/app/components/common/MainWrapper'

import Header from './components/common/Header'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Microbiome Map',
  description: 'Explore the world of microorganisms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased`}
        suppressHydrationWarning={true}
      >
        <Header />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  )
}

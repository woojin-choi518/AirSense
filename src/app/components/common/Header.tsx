'use client'

import { AlertCircle, House, Map, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    ...(pathname !== '/' ? [{ label: 'Home', href: '/', icon: House }] : []),
    { label: '악취 지도', href: '/asan', icon: Map },
    { label: '민원 지도', href: '/complaints', icon: AlertCircle },
  ]
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 모바일 메뉴 스크롤 방지 (스크롤바 유지)
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[9999] transition-all duration-300 ${
          pathname === '/'
            ? scrolled
              ? 'bg-white text-black shadow-sm'
              : 'bg-transparent text-white'
            : 'bg-white text-black shadow-sm'
        } `}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1 sm:px-6 sm:py-2">
          {/* Logo Section */}
          <Link prefetch={false} href="/" className="flex items-center gap-3">
            <Image
              src="/images/header/airsense.webp"
              alt="AirSense 로고"
              width={45}
              height={45}
              className="object-contain"
            />
            <span
              className={`text-xl font-bold ${
                pathname === '/' ? (scrolled ? 'text-black' : 'text-white') : 'text-black'
              } hidden sm:block`}
            >
              AirSense
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden space-x-8 md:flex">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  prefetch={false}
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 ${
                    active
                      ? pathname === '/'
                        ? scrolled
                          ? 'bg-blue-50 font-medium text-blue-600'
                          : 'bg-white/20 font-medium text-white'
                        : 'bg-blue-50 font-medium text-blue-600'
                      : pathname === '/'
                        ? scrolled
                          ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          : 'text-white hover:bg-white/10 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 transition-all duration-200 hover:scale-110 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기/닫기"
          >
            {mobileMenuOpen ? (
              <X
                className={`h-6 w-6 ${
                  pathname === '/' ? (scrolled ? 'text-gray-600' : 'text-white') : 'text-gray-600'
                }`}
              />
            ) : (
              <Menu
                className={`h-6 w-6 ${
                  pathname === '/' ? (scrolled ? 'text-gray-600' : 'text-white') : 'text-gray-600'
                }`}
              />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed inset-0 z-[10000] transition-all duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/20 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`fixed top-0 right-0 left-0 max-h-screen transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex flex-col">
            {/* Header with Logo */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-2">
              <Link
                prefetch={false}
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/images/header/airsense.webp"
                  alt="AirSense 로고"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="text-lg font-bold text-black">AirSense</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100"
                aria-label="메뉴 닫기"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4">
              <div className="space-y-1">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + '/')
                  return (
                    <Link
                      prefetch={false}
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-200 ${
                        active ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-base">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}

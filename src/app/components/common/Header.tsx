'use client'

import { House, Map, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const navItems = pathname === '/' 
    ? [
        { label: '악취 지도', href: '/asan', icon: Map },
        { label: '민원 지도', href: '/complaints', icon: AlertCircle }
      ] 
    : [
        { label: 'Home', href: '/', icon: House },
        { label: '악취 지도', href: '/asan', icon: Map },
        { label: '민원 지도', href: '/complaints', icon: AlertCircle }
      ]
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
        scrolled ? 'bg-white text-black shadow-md' : 'bg-gradient-to-b from-gray-900/50 to-transparent text-white'
      } `}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* logo */}
        <Link prefetch={false} href="/" className="text-xl font-bold">
          <span className={scrolled ? 'text-black' : 'text-white'}>
            {/* Microbiome Map */}
            AirSense Asan
          </span>
        </Link>

        {/* navigation links */}
        <div className="flex space-x-6 text-sm">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                prefetch={false}
                key={href}
                href={href}
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  scrolled ? 'hover:text-gray-700' : 'hover:text-emerald-300'
                } ${
                  active
                    ? scrolled
                      ? 'font-semibold text-emerald-600'
                      : 'font-semibold text-emerald-300'
                    : scrolled
                      ? 'text-black'
                      : 'text-white'
                } `}
              >
                <span className="text-sm"><Icon /></span>
                <span className="text-sm">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}

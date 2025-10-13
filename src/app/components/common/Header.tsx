'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [{ label: 'Asan', href: '/asan' }]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
          scrolled ? 'bg-white text-black shadow-md' : 'bg-gradient-to-b from-gray-900/50 to-transparent text-white'
        } `}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
          {/* logo */}
          <Link href="/" className="text-xl font-bold">
            <span className={scrolled ? 'text-black' : 'text-white'}>
              {/* Microbiome Map */}
              AirSense Asan
            </span>
          </Link>

          {/* desktop links */}
          <div className="hidden space-x-6 text-sm md:flex">
            {navItems.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition-colors duration-200 ${
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
                  {label}
                </Link>
              )
            })}
          </div>

          {/* mobile hamburger */}
          <button className="p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={24} className={scrolled ? 'text-black' : 'text-white'} />
          </button>
        </nav>
      </header>

      {/* mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-start bg-white p-6 md:hidden dark:bg-gray-900">
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)}>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">Microbiome Map</span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={28} className="text-gray-800 dark:text-white" />
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            {navItems.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`text-lg transition-colors duration-200 ${
                    active
                      ? 'font-semibold text-emerald-600'
                      : 'text-gray-800 hover:text-emerald-500 dark:text-gray-300'
                  } `}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}

'use client'
import { useEffect, useMemo, useState } from 'react'

const SECTIONS = [
  'profile',
  'interests',
  'publications',
  'experience',
  'education',
  'awards',
  'projects',
  'skills',
  'leadership'
]

export default function StickyNav() {
  const [active, setActive] = useState<string>('profile')

  const observer = useMemo(
    () =>
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id)
              })
            },
            { rootMargin: '-30% 0px -70% 0px' }
          )
        : null,
    []
  )

  useEffect(() => {
    if (!observer) return
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as Element[]
    els.forEach((el) => observer.observe(el))
    return () => els.forEach((el) => observer.unobserve(el))
  }, [observer])

  return (
    <nav id="nav-menu" className="hidden md:block mt-8">
      <ul className="space-y-2">
        {SECTIONS.map((id) => (
          <li key={id}>
            <a href={`#${id}`} className={`nav-link font-semibold ${active === id ? 'active' : ''}`}>
              {id === 'leadership' ? 'Leadership & Service' : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

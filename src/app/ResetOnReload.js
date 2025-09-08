"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function ResetOnReload() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isReload = performance && performance.getEntriesByType
      ? performance.getEntriesByType('navigation')?.[0]?.type === 'reload'
      : (window.performance?.navigation?.type === 1)

    if (!isReload) return

    try {
      // Clear Web Storage
      window.localStorage?.clear()
      window.sessionStorage?.clear()
    } catch (_) {}

    // Clear Cache Storage (Service Worker caches)
    if (window.caches && caches.keys) {
      caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(() => {})
    }

    // If not already on home, redirect there
    if (pathname !== '/') {
      router.replace('/')
    }
  }, [router, pathname])

  return null
}



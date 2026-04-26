'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'

const THRESHOLD = 68
const MAX_PULL = 120

export function PullToRefresh({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const spinnerRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const startYRef = useRef(0)
  const pullRef = useRef(0)
  const pullingRef = useRef(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    const indicator = indicatorRef.current
    if (!el || !indicator) return

    const applyIndicator = (pull: number) => {
      const clamped = Math.min(pull, MAX_PULL)
      // Indicator starts 40px above viewport top, slides in as you pull
      const y = clamped * 0.55 - 40
      const opacity = Math.min(clamped / THRESHOLD, 1)
      const arrowRotation = Math.min(clamped / THRESHOLD, 1) * 180
      indicator.style.transform = `translateY(${y}px)`
      indicator.style.opacity = String(opacity)
      if (arrowRef.current) arrowRef.current.style.transform = `rotate(${arrowRotation}deg)`
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (el.scrollTop > 0) return
      startYRef.current = e.touches[0].clientY
      pullingRef.current = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0 || el.scrollTop > 0) {
        pullingRef.current = false
        applyIndicator(0)
        return
      }
      e.preventDefault()
      pullRef.current = delta
      applyIndicator(delta)
    }

    const handleTouchEnd = () => {
      if (!pullingRef.current) return
      pullingRef.current = false
      const pull = pullRef.current
      pullRef.current = 0

      if (pull >= THRESHOLD) {
        setIsRefreshing(true)
        indicator.style.transition = 'transform 0.25s cubic-bezier(.2,.8,.2,1)'
        const restY = THRESHOLD * 0.55 - 40
        indicator.style.transform = `translateY(${restY}px)`
        indicator.style.opacity = '1'
        window.location.reload()
      } else {
        indicator.style.transition = 'transform 0.3s cubic-bezier(.2,.8,.2,1), opacity 0.3s'
        applyIndicator(0)
        setTimeout(() => { indicator.style.transition = '' }, 300)
      }
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      el.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [])

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Pull indicator */}
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', justifyContent: 'center',
          transform: 'translateY(-40px)', opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#2A221E',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        }}>
          {isRefreshing ? (
            <div ref={spinnerRef} style={{
              width: 15, height: 15, borderRadius: '50%',
              border: '2px solid rgba(253,248,241,0.25)',
              borderTopColor: '#FDF8F1',
              animation: 'spin 0.7s linear infinite',
            }}/>
          ) : (
            <svg ref={arrowRef} width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: 'none' }}>
              <path d="M7 2v10M3 8l4 4 4-4" stroke="#FDF8F1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>

      <div ref={scrollRef} style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

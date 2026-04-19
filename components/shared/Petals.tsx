'use client'
import { useState } from 'react'

const colors = [
  'rgb(215,128,96)', 'rgb(212,164,104)', 'rgb(196,140,170)',
  'rgb(168,146,196)', 'rgb(138,152,190)', 'rgb(122,168,170)',
]

interface Petal {
  id: number
  x: number
  delay: number
  dur: number
  size: number
  rot: number
  rotEnd: number
  color: string
}

function randomPetals(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    dur: 1.6 + Math.random() * 1.2,
    size: 10 + Math.random() * 10,
    rot: Math.random() * 360,
    rotEnd: Math.random() * 540 - 270,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
}

export function Petals({ active, count = 36 }: { active: boolean; count?: number }) {
  const [pieces] = useState(() => randomPetals(count))
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: -30,
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            borderRadius: '60% 40% 60% 40% / 70% 60% 40% 30%',
            opacity: 0.85,
            animation: `petalFall ${p.dur}s ${p.delay}s cubic-bezier(.4,.6,.7,1) forwards`,
            transform: `rotate(${p.rot}deg)`,
            ['--rot-end' as string]: `${p.rotEnd}deg`,
          }}
        />
      ))}
    </div>
  )
}

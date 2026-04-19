'use client'
import { useState } from 'react'
import { Heart } from './Icons'

interface HeartPiece {
  id: number
  x: number
  delay: number
  dur: number
  size: number
  drift: number
}

function randomHearts(): HeartPiece[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 40 + Math.random() * 20,
    delay: Math.random() * 0.4,
    dur: 1.6 + Math.random() * 0.8,
    size: 14 + Math.random() * 12,
    drift: (Math.random() - 0.5) * 80,
  }))
}

export function Hearts({ active, color = 'rgb(215, 128, 96)' }: { active: boolean; color?: string }) {
  const [pieces] = useState(() => randomHearts())
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: 100,
            left: `${p.x}%`,
            animation: `heartRise ${p.dur}s ${p.delay}s cubic-bezier(.4,.6,.7,1) forwards`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        >
          <Heart size={p.size} filled color={color} />
        </div>
      ))}
    </div>
  )
}

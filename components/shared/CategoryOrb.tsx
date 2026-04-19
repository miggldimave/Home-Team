import { getCatToken } from '@/lib/tokens'
import type { Category } from '@/lib/types'

export function CategoryOrb({ cat, size = 36, categories = [] }: { cat: string; size?: number; categories?: Category[] }) {
  const c = getCatToken(categories, cat)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${c.soft}, ${c.hue})`,
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    />
  )
}

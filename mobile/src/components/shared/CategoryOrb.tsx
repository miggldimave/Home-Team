import { LinearGradient } from 'expo-linear-gradient'
import { getCatToken } from '@/lib/tokens'
import type { Category } from '@/lib/types'

// Web uses radial-gradient(circle at 30% 30%, soft, hue); RN has no radial
// gradients, so we approximate with a diagonal linear gradient (soft → hue).
export function CategoryOrb({ cat, size = 36, categories = [] }: { cat: string; size?: number; categories?: Category[] }) {
  const c = getCatToken(categories, cat)
  return (
    <LinearGradient
      colors={[c.soft, c.hue]}
      start={{ x: 0.2, y: 0.2 }}
      end={{ x: 0.9, y: 0.9 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        flexShrink: 0,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
      }}
    />
  )
}

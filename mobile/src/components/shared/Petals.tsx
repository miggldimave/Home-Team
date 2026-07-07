import { useState } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated'

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

function PetalPiece({ p, width }: { p: Petal; width: number }) {
  const progress = useSharedValue(0)
  // Mirrors the web `petalFall` keyframe: translateY 0→900, rotate rot→rotEnd, opacity 0.85→0
  progress.value = withDelay(
    p.delay * 1000,
    withTiming(1, { duration: p.dur * 1000, easing: Easing.bezier(0.4, 0.6, 0.7, 1) })
  )
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, 900]) },
      { rotate: `${interpolate(progress.value, [0, 1], [p.rot, p.rot + p.rotEnd])}deg` },
    ],
    opacity: interpolate(progress.value, [0, 1], [0.85, 0]),
  }))
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -30,
          left: (p.x / 100) * width,
          width: p.size,
          height: p.size * 1.4,
          backgroundColor: p.color,
          // Approximation of the web's organic elliptical border-radius petal shape
          borderTopLeftRadius: p.size * 0.6,
          borderTopRightRadius: p.size * 0.4,
          borderBottomRightRadius: p.size * 0.6,
          borderBottomLeftRadius: p.size * 0.4,
        },
        style,
      ]}
    />
  )
}

export function Petals({ active, count = 36 }: { active: boolean; count?: number }) {
  const [pieces] = useState(() => randomPetals(count))
  const { width } = useWindowDimensions()
  if (!active) return null
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', zIndex: 200 }]} pointerEvents="none">
      {pieces.map((p) => (
        <PetalPiece key={p.id} p={p} width={width} />
      ))}
    </View>
  )
}

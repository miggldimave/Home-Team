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

function HeartRise({ p, color, width }: { p: HeartPiece; color: string; width: number }) {
  const progress = useSharedValue(0)
  // Mirrors the web `heartRise` keyframe: translate(drift, -340), scale 1→0.6, opacity 1→0
  progress.value = withDelay(
    p.delay * 1000,
    withTiming(1, { duration: p.dur * 1000, easing: Easing.bezier(0.4, 0.6, 0.7, 1) })
  )
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, p.drift]) },
      { translateY: interpolate(progress.value, [0, 1], [0, -340]) },
      { scale: interpolate(progress.value, [0, 1], [1, 0.6]) },
    ],
    opacity: interpolate(progress.value, [0, 1], [1, 0]),
  }))
  return (
    <Animated.View style={[{ position: 'absolute', bottom: 100, left: (p.x / 100) * width }, style]}>
      <Heart size={p.size} filled color={color} />
    </Animated.View>
  )
}

export function Hearts({ active, color = 'rgb(215, 128, 96)' }: { active: boolean; color?: string }) {
  const [pieces] = useState(() => randomHearts())
  const { width } = useWindowDimensions()
  if (!active) return null
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', zIndex: 200 }]} pointerEvents="none">
      {pieces.map((p) => (
        <HeartRise key={p.id} p={p} color={color} width={width} />
      ))}
    </View>
  )
}

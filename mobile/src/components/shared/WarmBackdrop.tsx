import type { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'

// Web version blurs three colored circles with CSS filter: blur(55-60px).
// RN has no CSS blur, so we approximate the soft glow with larger,
// semi-transparent circles (fidelity deviation, same palette/positions).
export function WarmBackdrop({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const bg = dark ? 'rgb(28, 22, 26)' : 'rgb(253, 248, 241)'
  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View
        pointerEvents="none"
        style={[
          styles.circle,
          {
            top: -40,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: dark ? 'rgba(215, 128, 96, 0.25)' : 'rgba(249, 223, 210, 0.95)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.circle,
          {
            top: 180,
            left: -80,
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: dark ? 'rgba(168, 146, 196, 0.18)' : 'rgba(238, 230, 246, 0.9)',
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.circle,
          {
            bottom: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: dark ? 'rgba(138, 152, 190, 0.15)' : 'rgba(224, 230, 244, 0.7)',
            opacity: 0.8,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { position: 'relative', height: '100%', width: '100%', overflow: 'hidden' },
  circle: { position: 'absolute' },
  content: { position: 'relative', height: '100%', width: '100%' },
})

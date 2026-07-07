import type { ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icons } from './Icons'

type Tab = 'home' | 'list' | 'appreciate' | 'analytics'

interface TabBarProps {
  activeTab: Tab
  onNavigate: (tab: Tab) => void
  dark: boolean
}

const tabs: { k: Tab; l: string; icon: (s: number, c: string) => ReactNode }[] = [
  { k: 'home', l: 'Heute', icon: Icons.home },
  { k: 'list', l: 'Aufgaben', icon: Icons.list },
  { k: 'appreciate', l: 'Wertsch.', icon: Icons.heart },
  { k: 'analytics', l: 'Balance', icon: Icons.chart },
]

export function TabBar({ activeTab, onNavigate, dark }: TabBarProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <LinearGradient
        colors={dark ? ['rgba(28,22,26,0)', 'rgb(28,22,26)'] : ['rgba(253,248,241,0)', 'rgb(253,248,241)']}
        locations={[0, 0.4]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={{ paddingTop: 24, paddingHorizontal: 12, paddingBottom: 12 + insets.bottom }}>
        <View
          style={[
            styles.bar,
            {
              // Web uses backdrop-filter blur; RN fallback: near-opaque background.
              backgroundColor: dark ? 'rgba(40,32,36,0.94)' : 'rgba(253,248,241,0.94)',
              borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              shadowColor: '#000',
              shadowOpacity: dark ? 0.4 : 0.05,
              shadowRadius: dark ? 14 : 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            },
          ]}
        >
          {tabs.map((t) => {
            const active = activeTab === t.k
            const c = active ? 'rgb(215, 128, 96)' : dark ? 'rgba(242,236,228,0.5)' : 'rgba(42,34,30,0.45)'
            return (
              <Pressable key={t.k} onPress={() => onNavigate(t.k)} style={styles.tab}>
                {t.icon(22, c)}
                <Text style={{ fontSize: 10, fontWeight: active ? '600' : '500', color: c, letterSpacing: -0.1 }}>
                  {t.l}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50 },
  bar: {
    borderWidth: 1,
    borderRadius: 26,
    paddingTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: { alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10 },
})

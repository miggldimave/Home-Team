// 1:1 port of components/screens/AnalyticsScreen.tsx (web).
import { useMemo, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { CategoryOrb } from '@/components/shared/CategoryOrb'
import { useAppRefresh } from '@/components/AppShell'
import { serifFont, serifItalicFont } from '@/lib/fonts'
import { metricByMember, formatMetric, metricOfLog } from '@/lib/helpers'
import type { AppState } from '@/lib/types'

type Period = 'week' | 'month' | 'year' | 'all'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Woche' },
  { key: 'month', label: 'Monat' },
  { key: 'year', label: 'Dieses Jahr' },
  { key: 'all', label: 'Gesamt' },
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

function getSince(period: Period): number {
  if (period === 'week') return Date.now() - 7 * 86400000
  if (period === 'month') return Date.now() - 30 * 86400000
  if (period === 'year') {
    const d = new Date(); d.setMonth(0, 1); d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  return 0
}

export function AnalyticsScreen({ state }: { state: AppState }) {
  const [period, setPeriod] = useState<Period>('month')
  const { logs, profiles, categories, dark } = state
  const mode = state.household.scoring_mode
  const since = getSince(period)
  const onRefresh = useAppRefresh()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const memberTimes = profiles.map((p) => ({
    profile: p,
    time: metricByMember(logs, p.id, since, mode),
  }))
  const total = memberTimes.reduce((s, m) => s + m.time, 0) || 1

  const byCat: Record<string, Record<string, number>> = {}
  categories.forEach((c) => {
    byCat[c.name] = {}
    profiles.forEach((p) => { byCat[c.name][p.id] = 0 })
  })
  logs.filter((l) => l.ts >= since).forEach((l) => {
    if (byCat[l.cat]) byCat[l.cat][l.memberId] = (byCat[l.cat][l.memberId] || 0) + metricOfLog(l, mode)
  })

  const chartBars = useMemo(() => {
    if (period === 'week' || period === 'month') {
      const count = period === 'week' ? 7 : 14
      return Array.from({ length: count }, (_, i) => {
        const d = count - 1 - i
        const s = new Date(Date.now() - d * 86400000); s.setHours(0, 0, 0, 0)
        const ds = s.getTime(); const de = ds + 86400000
        const byMember: Record<string, number> = {}
        profiles.forEach((p) => {
          byMember[p.id] = logs
            .filter((l) => l.memberId === p.id && l.ts >= ds && l.ts < de)
            .reduce((a, l) => a + metricOfLog(l, mode), 0)
        })
        return { label: '', byMember }
      })
    }
    const now = new Date()
    const barCount = period === 'year' ? now.getMonth() + 1 : 12
    return Array.from({ length: barCount }, (_, i) => {
      let year: number, month: number
      if (period === 'year') {
        year = now.getFullYear(); month = i
      } else {
        const d = new Date(now.getFullYear(), now.getMonth() - (barCount - 1 - i), 1)
        year = d.getFullYear(); month = d.getMonth()
      }
      const start = new Date(year, month, 1).getTime()
      const end = new Date(year, month + 1, 1).getTime()
      const byMember: Record<string, number> = {}
      profiles.forEach((p) => {
        byMember[p.id] = logs
          .filter((l) => l.memberId === p.id && l.ts >= start && l.ts < end)
          .reduce((a, l) => a + metricOfLog(l, mode), 0)
      })
      return { label: MONTH_NAMES[month], byMember }
    })
  }, [period, logs, profiles, mode])

  const maxBar = Math.max(...chartBars.map((b) => Object.values(b.byMember).reduce((a, v) => a + v, 0)), 1)
  const isMonthly = period === 'year' || period === 'all'

  const periodHeaderLabel = period === 'week' ? '7 Tage'
    : period === 'month' ? '30 Tage'
    : period === 'year' ? String(new Date().getFullYear())
    : 'Gesamt'

  const chartTitle = period === 'week' ? 'Letzte 7 Tage · gemeinsam'
    : period === 'month' ? 'Letzte 14 Tage · gemeinsam'
    : period === 'year' ? `${new Date().getFullYear()} · monatlich`
    : 'Letzte 12 Monate · monatlich'

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)'
  const cardBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const toggleBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(0,0,0,0.05)'
  const activeBg = dark ? 'rgba(80,60,55,0.95)' : 'rgba(255,255,255,0.95)'
  const trackBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} /> : undefined}
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 60 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Transparenz · {periodHeaderLabel}
        </Text>
        <Text style={{ fontFamily: serifFont, fontSize: 40, lineHeight: 42, letterSpacing: -0.5, color: txt, marginTop: 4 }}>
          Balance
        </Text>
      </View>

      {/* Period toggle */}
      <View style={{ marginTop: 20, marginHorizontal: 16, flexDirection: 'row', backgroundColor: toggleBg, borderRadius: 14, padding: 3, gap: 2 }}>
        {PERIODS.map(({ key, label }) => {
          const active = period === key
          return (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: active ? activeBg : 'transparent',
                  shadowOpacity: active ? 0.08 : 0,
                },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: active ? '600' : '500', color: active ? txt : muted }}>
                {label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Balance bar */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 22 }]}>
        <Text style={[styles.cardLabel, { color: muted }]}>Mental Load</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {memberTimes.map((mt, i) => (
            <View key={mt.profile.id} style={{ flex: 1, alignItems: i === 0 ? 'flex-end' : 'flex-start' }}>
              <Text style={{ fontFamily: serifFont, fontSize: 28, color: txt, letterSpacing: -0.3, lineHeight: 30 }}>
                {formatMetric(mt.time, mode)}
              </Text>
              <Text style={{ fontSize: 12, color: muted, marginTop: 4 }}>{mt.profile.display_name}</Text>
            </View>
          ))}
        </View>
        {profiles.length >= 2 && (
          <>
            <View style={{ marginTop: 18 }}>
              <View style={{ height: 14, borderRadius: 7, flexDirection: 'row', overflow: 'hidden', backgroundColor: trackBg }}>
                {memberTimes.map((mt) => (
                  <View key={mt.profile.id} style={{ width: `${(mt.time / total) * 100}%`, backgroundColor: mt.profile.color }} />
                ))}
              </View>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute', top: -2, left: '50%', marginLeft: -1,
                  width: 2, height: 18, backgroundColor: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                }}
              />
            </View>
            <Text style={{ marginTop: 10, fontFamily: serifItalicFont, fontSize: 16, color: muted, letterSpacing: -0.1, textAlign: 'center' }}>
              {(() => {
                const p1t = memberTimes[0].time / total
                const diff = Math.abs(p1t - 0.5)
                if (diff < 0.08) return 'ziemlich ausgeglichen.'
                const leader = p1t > 0.5 ? memberTimes[0] : memberTimes[1]
                return `${leader.profile.display_name} trägt gerade mehr.`
              })()}
            </Text>
          </>
        )}
      </View>

      {/* Category breakdown */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.cardLabel, { color: muted, marginBottom: 12 }]}>{mode === 'punkte' ? 'Punkte nach Bereich' : 'Zeit nach Bereich'}</Text>
        {Object.entries(byCat).map(([c, v]) => {
          const t = Object.values(v).reduce((a, b) => a + b, 0)
          if (t === 0) return null
          return (
            <View key={c} style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CategoryOrb cat={c} size={18} categories={categories} />
                  <Text style={{ fontSize: 13, color: txt, fontWeight: '500' }}>{c}</Text>
                </View>
                <Text style={{ fontSize: 12, color: muted }}>{formatMetric(t, mode)}</Text>
              </View>
              <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', backgroundColor: trackBg }}>
                {profiles.map((p) => (
                  <View key={p.id} style={{ width: `${((v[p.id] || 0) / t) * 100}%`, backgroundColor: p.color }} />
                ))}
              </View>
            </View>
          )
        })}
      </View>

      {/* Trend chart */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[styles.cardLabel, { color: muted, marginBottom: 12 }]}>{chartTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: isMonthly ? 4 : 3, height: 90 }}>
          {chartBars.map((bar, i) => (
            <View key={i} style={{ flex: 1, flexDirection: 'column-reverse', gap: 1 }}>
              {[...profiles].reverse().map((p) => {
                const raw = ((bar.byMember[p.id] || 0) / maxBar) * 90
                const h = raw > 0 ? Math.max(2, Math.round(raw)) : 0
                return (
                  <View key={p.id} style={{ height: h, backgroundColor: p.color, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                )
              })}
            </View>
          ))}
        </View>
        {isMonthly ? (
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            {chartBars.map((bar, i) => (
              <Text key={i} numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: muted }}>
                {bar.label}
              </Text>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={{ fontSize: 10, color: muted }}>{period === 'week' ? 'vor 7T' : 'vor 14T'}</Text>
            <Text style={{ fontSize: 10, color: muted }}>heute</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 11,
    alignItems: 'center',
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  card: {
    marginTop: 22,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
})

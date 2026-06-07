'use client'
import { useState, useMemo } from 'react'
import { CategoryOrb } from '@/components/shared/CategoryOrb'
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
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'
  const toggleBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(0,0,0,0.05)'
  const activeBg = dark ? 'rgba(80,60,55,0.95)' : 'rgba(255,255,255,0.95)'

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>Transparenz · {periodHeaderLabel}</div>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: txt, marginTop: 4 }}>Balance</div>
      </div>

      {/* Period toggle */}
      <div style={{ margin: '20px 16px 0', display: 'flex', background: toggleBg, borderRadius: 14, padding: 3, gap: 2 }}>
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: 11,
              border: 'none',
              background: period === key ? activeBg : 'transparent',
              color: period === key ? txt : muted,
              fontSize: 12,
              fontWeight: period === key ? 600 : 500,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
              boxShadow: period === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Balance bar */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Mental Load</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {memberTimes.map((mt, i) => (
            <div key={mt.profile.id} style={{ flex: 1, textAlign: i === 0 ? 'right' : 'left' }}>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: txt, letterSpacing: -0.3, lineHeight: 1 }}>{formatMetric(mt.time, mode)}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{mt.profile.display_name}</div>
            </div>
          ))}
        </div>
        {profiles.length >= 2 && (
          <>
            <div style={{ marginTop: 18, position: 'relative' }}>
              <div style={{ height: 14, borderRadius: 7, display: 'flex', overflow: 'hidden', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                {memberTimes.map((mt) => (
                  <div key={mt.profile.id} style={{ width: `${(mt.time / total) * 100}%`, background: mt.profile.color, transition: 'width 0.8s' }}/>
                ))}
              </div>
              <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 2, height: 18, background: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}/>
            </div>
            <div style={{ marginTop: 10, fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16, color: muted, letterSpacing: -0.1, textAlign: 'center', fontStyle: 'italic' }}>
              {(() => {
                const p1t = memberTimes[0].time / total
                const diff = Math.abs(p1t - 0.5)
                if (diff < 0.08) return 'ziemlich ausgeglichen.'
                const leader = p1t > 0.5 ? memberTimes[0] : memberTimes[1]
                return `${leader.profile.display_name} trägt gerade mehr.`
              })()}
            </div>
          </>
        )}
      </div>

      {/* Category breakdown */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{mode === 'punkte' ? 'Punkte nach Bereich' : 'Zeit nach Bereich'}</div>
        {Object.entries(byCat).map(([c, v]) => {
          const t = Object.values(v).reduce((a, b) => a + b, 0)
          if (t === 0) return null
          return (
            <div key={c} style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CategoryOrb cat={c} size={18} categories={categories}/>
                  <span style={{ fontSize: 13, color: txt, fontWeight: 500 }}>{c}</span>
                </div>
                <span style={{ fontSize: 12, color: muted }}>{formatMetric(t, mode)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                {profiles.map((p) => (
                  <div key={p.id} style={{ width: `${((v[p.id] || 0) / t) * 100}%`, background: p.color }}/>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trend chart */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{chartTitle}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMonthly ? 4 : 3, height: 90 }}>
          {chartBars.map((bar, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'flex-end' }}>
              {[...profiles].reverse().map((p) => {
                const raw = ((bar.byMember[p.id] || 0) / maxBar) * 90
                const h = raw > 0 ? Math.max(2, Math.round(raw)) : 0
                return (
                  <div key={p.id} style={{ height: h, background: p.color, borderRadius: '3px 3px 0 0', flexShrink: 0 }}/>
                )
              })}
            </div>
          ))}
        </div>
        {isMonthly ? (
          <div style={{ display: 'flex', marginTop: 8 }}>
            {chartBars.map((bar, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: muted, overflow: 'hidden' }}>{bar.label}</div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: muted }}>
            <span>{period === 'week' ? 'vor 7T' : 'vor 14T'}</span><span>heute</span>
          </div>
        )}
      </div>
    </div>
  )
}

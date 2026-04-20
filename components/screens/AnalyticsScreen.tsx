'use client'
import { CategoryOrb } from '@/components/shared/CategoryOrb'
import { timeByMember, formatMinutes } from '@/lib/helpers'
import type { AppState } from '@/lib/types'

export function AnalyticsScreen({ state }: { state: AppState }) {
  const { logs, profiles, categories, dark } = state
  const monthAgo = Date.now() - 30 * 86400000

  const memberTimes = profiles.map((p) => ({
    profile: p,
    time: timeByMember(logs, p.id, monthAgo),
  }))
  const total = memberTimes.reduce((s, m) => s + m.time, 0) || 1

  const byCat: Record<string, Record<string, number>> = {}
  categories.forEach((c) => {
    byCat[c.name] = {}
    profiles.forEach((p) => { byCat[c.name][p.id] = 0 })
  })
  logs.filter((l) => l.ts >= monthAgo).forEach((l) => {
    if (byCat[l.cat]) byCat[l.cat][l.memberId] = (byCat[l.cat][l.memberId] || 0) + l.time
  })

  const days: { ds: number; byMember: Record<string, number> }[] = []
  for (let d = 13; d >= 0; d--) {
    const start = Date.now() - d * 86400000
    const s = new Date(start); s.setHours(0, 0, 0, 0)
    const ds = s.getTime(); const de = ds + 86400000
    const byMember: Record<string, number> = {}
    profiles.forEach((p) => {
      byMember[p.id] = logs.filter((l) => l.memberId === p.id && l.ts >= ds && l.ts < de).reduce((a, l) => a + l.time, 0)
    })
    days.push({ ds, byMember })
  }
  const maxDay = Math.max(...days.map((d) => Object.values(d.byMember).reduce((a, v) => a + v, 0)), 1)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)'
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'

  const [p1, p2] = profiles

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>Transparenz · 30 Tage</div>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: txt, marginTop: 4 }}>Balance</div>
      </div>

      {/* Balance bar */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Mental Load</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {memberTimes.map((mt, i) => (
            <div key={mt.profile.id} style={{ flex: 1, textAlign: i === 0 ? 'right' : 'left' }}>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: txt, letterSpacing: -0.3, lineHeight: 1 }}>{formatMinutes(mt.time)}</div>
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
        <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Zeit nach Bereich</div>
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
                <span style={{ fontSize: 12, color: muted }}>{formatMinutes(t)}</span>
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

      {/* 14-day trend */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Letzte 14 Tage · gemeinsam</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 90 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'flex-end' }}>
              {[...profiles].reverse().map((p) => {
                const raw = ((d.byMember[p.id] || 0) / maxDay) * 90
                const h = raw > 0 ? Math.max(2, Math.round(raw)) : 0
                return (
                  <div key={p.id} style={{ height: h, background: p.color, borderRadius: '3px 3px 0 0', flexShrink: 0 }}/>
                )
              })}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: muted }}>
          <span>vor 14T</span><span>heute</span>
        </div>
      </div>
    </div>
  )
}

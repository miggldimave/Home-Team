'use client'
import { useState, useTransition } from 'react'
import { MEMBER_COLOR_OPTIONS, TASK_SUGGESTIONS, SUGGESTION_CATEGORY_COLORS } from '@/lib/tokens'
import { formatPoints } from '@/lib/helpers'
import { createHouseholdWithTasks, joinHousehold } from './actions'

type Mode = 'choose' | 'create' | 'join' | 'tasks'

const catColor = (cat: string) =>
  SUGGESTION_CATEGORY_COLORS[cat]?.hue ?? 'rgb(168,146,196)'

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>('choose')
  const [displayName, setDisplayName] = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [householdName, setHouseholdName] = useState('')
  const [scoringMode, setScoringMode] = useState<'punkte' | 'zeit'>('zeit')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [createFormData, setCreateFormData] = useState<FormData | null>(null)

  const selectedColor = MEMBER_COLOR_OPTIONS[colorIdx]
  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'

  const handleCreateNext = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.set('householdName', householdName)
    fd.set('scoringMode', scoringMode)
    fd.set('displayName', displayName)
    fd.set('color', selectedColor.color)
    fd.set('bgColor', selectedColor.bg)
    setCreateFormData(fd)
    setMode('tasks')
  }

  const handleFinish = () => {
    if (!createFormData) return
    startTransition(async () => {
      const result = await createHouseholdWithTasks(createFormData, Array.from(selectedTasks))
      if (result?.error) setError(result.error)
    })
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    fd.set('inviteCode', inviteCode)
    fd.set('displayName', displayName)
    fd.set('color', selectedColor.color)
    fd.set('bgColor', selectedColor.bg)
    startTransition(async () => {
      const result = await joinHousehold(fd)
      if (result?.error) setError(result.error)
    })
  }

  const toggleTask = (name: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: txt, outline: 'none' } as React.CSSProperties
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 } as React.CSSProperties

  const backBtn = (onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: muted, fontSize: 14, fontWeight: 500, padding: '0 0 4px', marginBottom: 28 }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Zurück
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(253, 248, 241)', padding: 24 }}>
      <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 60 }}>

        {mode === 'choose' && (
          <>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, color: txt, letterSpacing: -0.5, lineHeight: 1.05 }}>Willkommen.</div>
            <div style={{ marginTop: 8, fontSize: 15, color: muted }}>Richte deinen Haushalt ein.</div>
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => setMode('create')} style={{ padding: '18px 20px', borderRadius: 20, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                <div>Neuen Haushalt gründen</div>
                <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.6, marginTop: 3 }}>Einladungslink für Partner*in generieren</div>
              </button>
              <button onClick={() => setMode('join')} style={{ padding: '18px 20px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', color: txt, fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                <div>Bestehendem Haushalt beitreten</div>
                <div style={{ fontSize: 13, fontWeight: 400, color: muted, marginTop: 3 }}>Einladungscode eingeben</div>
              </button>
            </div>
          </>
        )}

        {mode === 'create' && (
          <>
            {backBtn(() => { setMode('choose'); setError('') })}
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, color: txt, letterSpacing: -0.5, lineHeight: 1.05 }}>Willkommen.</div>
            <div style={{ marginTop: 8, fontSize: 15, color: muted }}>Richte deinen Haushalt ein.</div>
            <form onSubmit={handleCreateNext} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Dein Name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="z.B. Lotta" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Deine Farbe</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {MEMBER_COLOR_OPTIONS.map((opt, i) => (
                    <button key={i} type="button" onClick={() => setColorIdx(i)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: opt.color, boxShadow: colorIdx === i ? `0 0 0 3px white, 0 0 0 5px ${opt.color}` : 'none', transform: colorIdx === i ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s' }}/>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Name des Haushalts</label>
                <input value={householdName} onChange={(e) => setHouseholdName(e.target.value)} required placeholder="z.B. Unsere WG" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Bewertungsmodus</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['zeit', 'punkte'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setScoringMode(m)} style={{ flex: 1, padding: '12px', borderRadius: 14, cursor: 'pointer', background: scoringMode === m ? '#2A221E' : 'rgba(255,255,255,0.8)', color: scoringMode === m ? '#FDF8F1' : txt, fontSize: 14, fontWeight: 600, border: scoringMode === m ? 'none' : '1px solid rgba(0,0,0,0.08)' } as React.CSSProperties}>
                      {m === 'zeit' ? '⏱ Zeit (Minuten)' : '⭐ Punkte (1–5)'}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" style={{ marginTop: 8, padding: '14px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Weiter
              </button>
            </form>
          </>
        )}

        {mode === 'join' && (
          <>
            {backBtn(() => { setMode('choose'); setError('') })}
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, color: txt, letterSpacing: -0.5, lineHeight: 1.05 }}>Willkommen.</div>
            <div style={{ marginTop: 8, fontSize: 15, color: muted }}>Richte deinen Haushalt ein.</div>
            <form onSubmit={handleJoin} style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Dein Name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="z.B. Lotta" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Deine Farbe</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {MEMBER_COLOR_OPTIONS.map((opt, i) => (
                    <button key={i} type="button" onClick={() => setColorIdx(i)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: opt.color, boxShadow: colorIdx === i ? `0 0 0 3px white, 0 0 0 5px ${opt.color}` : 'none', transform: colorIdx === i ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s' }}/>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Einladungscode</label>
                <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required placeholder="8-stelliger Code" style={{ ...inputStyle, letterSpacing: 2 }}/>
              </div>
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(215,100,80,0.1)', color: 'rgb(180,60,40)', fontSize: 13 }}>{error}</div>
              )}
              <button type="submit" disabled={isPending} style={{ marginTop: 8, padding: '14px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.7 : 1 }}>
                {isPending ? 'Bitte warten…' : 'Beitreten'}
              </button>
            </form>
          </>
        )}

        {mode === 'tasks' && (
          <>
            {backBtn(() => { setMode('create'); setError('') })}
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 36, color: txt, letterSpacing: -0.5, lineHeight: 1.1 }}>Welche Aufgaben habt ihr?</div>
            <div style={{ marginTop: 8, fontSize: 15, color: muted }}>Wähle aus, womit ihr starten möchtet. Weitere kannst du jederzeit hinzufügen.</div>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TASK_SUGGESTIONS.map((task) => {
                const selected = selectedTasks.has(task.name)
                const color = catColor(task.category)
                return (
                  <button
                    key={task.name}
                    type="button"
                    onClick={() => toggleTask(task.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 18, cursor: 'pointer',
                      border: selected ? `1.5px solid ${color}` : '1.5px solid rgba(0,0,0,0.07)',
                      background: selected ? `${color.replace('rgb', 'rgba').replace(')', ', 0.08)')}` : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.15s', textAlign: 'left',
                    }}
                  >
                    <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{task.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: txt, letterSpacing: -0.1 }}>{task.name}</div>
                      <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: muted }}>{task.category} · {scoringMode === 'punkte' ? formatPoints(task.pts) : `${task.time_minutes} min`}</span>
                      </div>
                    </div>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: selected ? 'none' : '1.5px solid rgba(0,0,0,0.15)',
                      background: selected ? color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {selected && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(215,100,80,0.1)', color: 'rgb(180,60,40)', fontSize: 13 }}>{error}</div>
            )}

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isPending || selectedTasks.size === 0}
                style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: isPending || selectedTasks.size === 0 ? 'default' : 'pointer', opacity: isPending || selectedTasks.size === 0 ? 0.5 : 1, transition: 'opacity 0.15s' }}
              >
                {isPending ? 'Wird erstellt…' : `${selectedTasks.size} Aufgabe${selectedTasks.size !== 1 ? 'n' : ''} hinzufügen`}
              </button>
              <button
                type="button"
                onClick={() => { startTransition(async () => { const r = await createHouseholdWithTasks(createFormData!, []); if (r?.error) setError(r.error) }) }}
                disabled={isPending}
                style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', color: muted, fontSize: 15, fontWeight: 500, cursor: isPending ? 'default' : 'pointer' }}
              >
                Überspringen
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

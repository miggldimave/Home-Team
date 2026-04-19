'use client'
import { useState, useTransition } from 'react'
import { MEMBER_COLOR_OPTIONS } from '@/lib/tokens'
import { createHousehold, joinHousehold } from './actions'

type Mode = 'choose' | 'create' | 'join'

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>('choose')
  const [displayName, setDisplayName] = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [householdName, setHouseholdName] = useState('')
  const [scoringMode, setScoringMode] = useState<'punkte' | 'zeit'>('zeit')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedColor = MEMBER_COLOR_OPTIONS[colorIdx]
  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const fd = new FormData()
    fd.set('householdName', householdName)
    fd.set('scoringMode', scoringMode)
    fd.set('displayName', displayName)
    fd.set('color', selectedColor.color)
    fd.set('bgColor', selectedColor.bg)
    startTransition(async () => {
      const result = await createHousehold(fd)
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

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(253, 248, 241)', padding: 24 }}>
      <div style={{ maxWidth: 420, margin: '0 auto', paddingTop: 60 }}>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, color: txt, letterSpacing: -0.5, lineHeight: 1.05 }}>
          Willkommen.
        </div>
        <div style={{ marginTop: 8, fontSize: 15, color: muted }}>Richte deinen Haushalt ein.</div>

        {mode === 'choose' && (
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
        )}

        {(mode === 'create' || mode === 'join') && (
          <form onSubmit={mode === 'create' ? handleCreate : handleJoin} style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Dein Name</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="z.B. Lotta"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: txt, outline: 'none' }}/>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Deine Farbe</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {MEMBER_COLOR_OPTIONS.map((opt, i) => (
                  <button key={i} type="button" onClick={() => setColorIdx(i)} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: opt.color, boxShadow: colorIdx === i ? `0 0 0 3px white, 0 0 0 5px ${opt.color}` : 'none', transform: colorIdx === i ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s' }}/>
                ))}
              </div>
            </div>

            {mode === 'create' && (
              <>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Name des Haushalts</label>
                  <input value={householdName} onChange={(e) => setHouseholdName(e.target.value)} required placeholder="z.B. Unsere WG"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: txt, outline: 'none' }}/>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Bewertungsmodus</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['zeit', 'punkte'] as const).map((m) => (
                      <button key={m} type="button" onClick={() => setScoringMode(m)} style={{ flex: 1, padding: '12px', borderRadius: 14, cursor: 'pointer', background: scoringMode === m ? '#2A221E' : 'rgba(255,255,255,0.8)', color: scoringMode === m ? '#FDF8F1' : txt, fontSize: 14, fontWeight: 600, border: scoringMode === m ? 'none' : '1px solid rgba(0,0,0,0.08)' } as React.CSSProperties}>
                        {m === 'zeit' ? '⏱ Zeit (Minuten)' : '⭐ Punkte (1–5)'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {mode === 'join' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Einladungscode</label>
                <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required placeholder="8-stelliger Code"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: txt, outline: 'none', letterSpacing: 2 }}/>
              </div>
            )}

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(215,100,80,0.1)', color: 'rgb(180,60,40)', fontSize: 13 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="button" onClick={() => setMode('choose')} style={{ padding: '14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', color: muted, fontSize: 15, fontWeight: 500, cursor: 'pointer', flex: 1 }}>
                Zurück
              </button>
              <button type="submit" disabled={isPending} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: isPending ? 'default' : 'pointer', opacity: isPending ? 0.7 : 1 }}>
                {isPending ? 'Bitte warten…' : (mode === 'create' ? 'Haushalt erstellen' : 'Beitreten')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

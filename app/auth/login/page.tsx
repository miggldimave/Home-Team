'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/app')
      router.refresh()
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: '#2A221E', outline: 'none' }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 }

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(253, 248, 241)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 48, color: '#2A221E', letterSpacing: -1, lineHeight: 1 }}>
            Kudo
          </div>
          <div style={{ marginTop: 10, fontSize: 15, color: 'rgba(42,34,30,0.55)' }}>
            {mode === 'login' ? 'Hausarbeit sichtbar machen' : 'Passwort zurücksetzen'}
          </div>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>E-Mail</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="name@beispiel.de"
              />
            </div>
            <div>
              <label style={labelStyle}>Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(215,100,80,0.1)', color: 'rgb(180,60,40)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 8, padding: '14px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Einloggen…' : 'Einloggen'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/auth/signup')}
              style={{ padding: '14px', borderRadius: 14, border: 'none', background: 'rgb(215,128,96)', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              Noch kein Konto? Registrieren
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); setError('') }}
              style={{ padding: '14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: '#2A221E', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              Passwort vergessen
            </button>
          </form>
        ) : resetSent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: '#2A221E', letterSpacing: -0.3, lineHeight: 1.3 }}>
              E-Mail verschickt
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: 'rgba(42,34,30,0.55)', lineHeight: 1.5 }}>
              Schau in deinem Postfach nach einem Link zum Zurücksetzen deines Passworts.
            </div>
            <button
              onClick={() => { setMode('login'); setResetSent(false) }}
              style={{ marginTop: 24, padding: '12px 24px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Zurück zum Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>E-Mail</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="name@beispiel.de"
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(215,100,80,0.1)', color: 'rgb(180,60,40)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 8, padding: '14px', borderRadius: 14, border: 'none', background: '#2A221E', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Senden…' : 'Link senden'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              style={{ padding: '12px', borderRadius: 14, border: 'none', background: 'transparent', color: 'rgba(42,34,30,0.55)', fontSize: 14, cursor: 'pointer' }}
            >
              Zurück zum Login
            </button>
          </form>
        )}

      </div>
    </div>
  )
}

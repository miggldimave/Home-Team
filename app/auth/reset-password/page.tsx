'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when it detects #access_token&type=recovery in the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also handle the case where the session is already set (e.g. code-based PKCE flow)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/app')
      router.refresh()
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
            Neues Passwort festlegen
          </div>
        </div>

        {!ready ? (
          <div style={{ textAlign: 'center', color: 'rgba(42,34,30,0.45)', fontSize: 14 }}>
            Link wird überprüft…
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Neues Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                style={inputStyle}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            <div>
              <label style={labelStyle}>Passwort bestätigen</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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
              {loading ? 'Speichern…' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

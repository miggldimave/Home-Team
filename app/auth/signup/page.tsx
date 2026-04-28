'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(253, 248, 241)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 48, color: '#2A221E', letterSpacing: -1, lineHeight: 1 }}>
            Kudo
          </div>
          <div style={{ marginTop: 10, fontSize: 15, color: 'rgba(42,34,30,0.55)' }}>
            Konto erstellen
          </div>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>E-Mail</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: '#2A221E', outline: 'none' }}
              placeholder="name@beispiel.de"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(42,34,30,0.6)', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', fontSize: 15, color: '#2A221E', outline: 'none' }}
              placeholder="Mindestens 6 Zeichen"
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
            {loading ? 'Erstellen…' : 'Konto erstellen'}
          </button>
        </form>

        <button
          onClick={() => router.push('/auth/login')}
          style={{ marginTop: 12, width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'rgb(215,128,96)', color: '#FDF8F1', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Schon ein Konto? Einloggen
        </button>
      </div>
    </div>
  )
}

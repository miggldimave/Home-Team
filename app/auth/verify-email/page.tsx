'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const supabase = createClient()

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResend = async () => {
    setResendState('sending')
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResendState(error ? 'error' : 'sent')
  }

  const muted = 'rgba(42,34,30,0.55)'

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(253, 248, 241)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

        <div style={{ fontSize: 56, marginBottom: 24 }}>✉️</div>

        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 36, color: '#2A221E', letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 12 }}>
          Bestätigungs&shy;mail gesendet
        </div>

        <div style={{ fontSize: 15, color: muted, lineHeight: 1.55, marginBottom: 8 }}>
          Wir haben eine E-Mail an
        </div>
        {email && (
          <div style={{ fontSize: 15, fontWeight: 600, color: '#2A221E', marginBottom: 8 }}>
            {email}
          </div>
        )}
        <div style={{ fontSize: 15, color: muted, lineHeight: 1.55, marginBottom: 36 }}>
          geschickt. Bitte klicke auf den Link in der Mail, um dein Konto zu aktivieren.
        </div>

        <div style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.06)', marginBottom: 24, fontSize: 13, color: muted, lineHeight: 1.5 }}>
          Keine Mail erhalten? Schau auch im Spam-Ordner nach.
        </div>

        <button
          onClick={handleResend}
          disabled={resendState === 'sending' || resendState === 'sent'}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: resendState === 'sent' ? 'rgb(138, 170, 138)' : '#2A221E',
            color: '#FDF8F1', fontSize: 15, fontWeight: 600,
            cursor: resendState === 'sending' || resendState === 'sent' ? 'default' : 'pointer',
            opacity: resendState === 'sending' ? 0.7 : 1,
            transition: 'background 0.3s',
            marginBottom: 10,
          }}
        >
          {resendState === 'sending' ? 'Wird gesendet…' : resendState === 'sent' ? 'Mail erneut gesendet ✓' : 'Erneut senden'}
        </button>

        {resendState === 'error' && (
          <div style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(215,100,80,0.1)', color: 'rgb(180,60,40)', fontSize: 13 }}>
            Fehler beim Senden. Bitte versuche es später erneut.
          </div>
        )}

        <button
          onClick={() => router.push('/auth/login')}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: 'transparent', color: muted, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          Zurück zum Login
        </button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}

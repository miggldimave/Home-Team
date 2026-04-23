'use client'
import { useState } from 'react'

interface InvitePromptProps {
  inviteCode: string
  dark: boolean
}

export function InvitePrompt({ inviteCode, dark }: InvitePromptProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)'
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'

  return (
    <div style={{ margin: '22px 16px 0', padding: '18px 18px 16px', borderRadius: 24, background: cardBg, border: cardBorder }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(42,34,30,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          🏠
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: txt, letterSpacing: -0.2, lineHeight: 1.2 }}>Lade jemanden ein</div>
          <div style={{ marginTop: 4, fontSize: 13, color: muted, lineHeight: 1.45 }}>
            Teile diesen Code mit deiner Mitbewohner*in, damit sie dem Haushalt beitreten kann.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', fontSize: 18, fontWeight: 600, color: txt, letterSpacing: 2, textAlign: 'center' as const }}>
          {inviteCode}
        </div>
        <button
          onClick={handleCopy}
          style={{ padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: txt, color: dark ? '#2A221E' : '#FDF8F1', fontSize: 13, fontWeight: 600, flexShrink: 0, minHeight: 44 }}
        >
          {copied ? 'Kopiert!' : 'Code kopieren'}
        </button>
      </div>
    </div>
  )
}

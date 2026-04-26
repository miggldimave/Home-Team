'use client'
import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/shared/Avatar'
import { Icons } from '@/components/shared/Icons'
import { MEMBER_COLOR_OPTIONS } from '@/lib/tokens'
import { updateProfile, updateHousehold, changePassword, uploadAvatar, signOut } from './actions'
import type { Profile, Household, ScoringMode } from '@/lib/types'

export function SettingsShell({ profile, household }: { profile: Profile; household: Household }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(profile.display_name)
  const [selectedColor, setSelectedColor] = useState(
    MEMBER_COLOR_OPTIONS.find((o) => o.color === profile.color) ?? MEMBER_COLOR_OPTIONS[0]
  )
  const [householdName, setHouseholdName] = useState(household.name)
  const [scoringMode, setScoringMode] = useState<ScoringMode>(household.scoring_mode)
  const [copied, setCopied] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [householdMsg, setHouseholdMsg] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)
  const [avatarMsg, setAvatarMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dark = false
  const txt = '#2A221E'
  const muted = 'rgba(42,34,30,0.55)'
  const cardBg = 'rgba(255,255,255,0.78)'
  const cardBorder = '1px solid rgba(0,0,0,0.04)'
  const bg = 'rgb(253,248,241)'

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    startTransition(async () => {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await uploadAvatar(fd)
      if (res?.error) { setAvatarMsg('Fehler: ' + res.error) }
      else {
        setAvatarUrl(res.avatarUrl ?? null)
        setAvatarMsg('Foto gespeichert.')
        setTimeout(() => setAvatarMsg(''), 2000)
        router.refresh()
      }
    })
  }

  const previewProfile: Profile = {
    ...profile,
    display_name: displayName || profile.display_name,
    initial: (displayName[0] || profile.display_name[0]).toUpperCase(),
    color: selectedColor.color,
    bg_color: selectedColor.bg,
    avatar_url: avatarUrl,
  }

  const handleProfileSave = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('displayName', displayName || profile.display_name)
      fd.append('color', selectedColor.color)
      fd.append('bgColor', selectedColor.bg)
      const res = await updateProfile(fd)
      if (res?.error) { setProfileMsg('Fehler: ' + res.error) }
      else { setProfileMsg('Gespeichert.'); setTimeout(() => setProfileMsg(''), 2000); router.refresh() }
    })
  }

  const handleHouseholdSave = () => {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('name', householdName || household.name)
      fd.append('householdId', household.id)
      fd.append('scoring_mode', scoringMode)
      const res = await updateHousehold(fd)
      if (res?.error) { setHouseholdMsg('Fehler: ' + res.error) }
      else { setHouseholdMsg('Gespeichert.'); setTimeout(() => setHouseholdMsg(''), 2000); router.refresh() }
    })
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwörter stimmen nicht überein.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Passwort muss mindestens 6 Zeichen lang sein.')
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.append('currentPassword', currentPassword)
      fd.append('newPassword', newPassword)
      const res = await changePassword(fd)
      if (res?.error) { setPasswordMsg('Fehler: ' + res.error) }
      else {
        setPasswordMsg('Passwort geändert.')
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
        setTimeout(() => setPasswordMsg(''), 3000)
      }
    })
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(household.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '0 0 60px' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: txt, flexShrink: 0 }}>
          {Icons.back(18, txt)}
        </button>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 1.05 }}>Einstellungen</div>
      </div>

      {/* Profile section */}
      <div style={{ margin: '24px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Mein Profil</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar member={previewProfile} size={52}/>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: 'none', cursor: 'pointer', background: avatarUrl ? 'transparent' : 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: isPending ? 0.5 : 1 }}
            >
              {!avatarUrl && '📷'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }}/>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: txt, letterSpacing: -0.2 }}>{previewProfile.display_name}</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{avatarMsg || 'Foto tippen zum Ändern'}</div>
          </div>
        </div>

        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 6 }}>Name</div>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 15, color: txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 8 }}>Farbe</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {MEMBER_COLOR_OPTIONS.map((o) => (
              <button
                key={o.color}
                onClick={() => setSelectedColor(o)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: o.color,
                  boxShadow: selectedColor.color === o.color ? `0 0 0 3px ${bg}, 0 0 0 5px ${o.color}` : 'none',
                  transition: 'box-shadow 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleProfileSave}
          disabled={isPending}
          style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 14, fontWeight: 600 }}
        >
          {isPending ? 'Speichern…' : 'Profil speichern'}
        </button>
        {profileMsg && <div style={{ marginTop: 8, fontSize: 12, color: muted, textAlign: 'center' }}>{profileMsg}</div>}
      </div>

      {/* Household section */}
      <div style={{ margin: '14px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Haushalt</div>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 6 }}>Name des Haushalts</div>
          <input
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 8 }}>Bewertungsmodus</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['zeit', 'punkte'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setScoringMode(mode)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
                  background: scoringMode === mode ? txt : 'rgba(0,0,0,0.04)',
                  color: scoringMode === mode ? '#FDF8F1' : muted,
                }}
              >
                {mode === 'zeit' ? '⏱ Zeit' : '⭐ Punkte'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: muted, marginTop: 6 }}>Achtung: betrifft den gesamten Haushalt.</div>
        </div>

        <button
          onClick={handleHouseholdSave}
          disabled={isPending}
          style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 14, fontWeight: 600 }}
        >
          {isPending ? 'Speichern…' : 'Haushalt speichern'}
        </button>
        {householdMsg && <div style={{ marginTop: 8, fontSize: 12, color: muted, textAlign: 'center' }}>{householdMsg}</div>}
      </div>

      {/* Password section */}
      <div style={{ margin: '14px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Passwort ändern</div>

        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 6 }}>Aktuelles Passwort</div>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 6 }}>Neues Passwort</div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 6 }}>Neues Passwort bestätigen</div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 16, color: txt, outline: 'none', boxSizing: 'border-box' }}
          />
        </label>

        <button
          onClick={handlePasswordChange}
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
          style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 14, fontWeight: 600, opacity: (!currentPassword || !newPassword || !confirmPassword) ? 0.4 : 1 }}
        >
          {isPending ? 'Speichern…' : 'Passwort ändern'}
        </button>
        {passwordMsg && (
          <div style={{ marginTop: 8, fontSize: 12, color: passwordMsg.startsWith('Fehler') ? 'rgb(200,60,60)' : muted, textAlign: 'center' }}>{passwordMsg}</div>
        )}
      </div>

      {/* Invite section */}
      <div style={{ margin: '14px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Mitglieder einladen</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: muted, marginBottom: 8 }}>Einladungscode</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.02)', fontSize: 18, fontWeight: 600, color: txt, letterSpacing: 2, textAlign: 'center' }}>
              {household.invite_code}
            </div>
            <button onClick={handleCopyCode} style={{ padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', background: txt, color: '#FDF8F1', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {copied ? 'Kopiert!' : 'Code kopieren'}
            </button>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ margin: '14px 16px 0' }}>
        <form action={signOut}>
          <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', background: 'transparent', color: 'rgba(200,60,60,0.8)', fontSize: 14, fontWeight: 500 }}>
            Abmelden
          </button>
        </form>
      </div>
    </div>
  )
}

// 1:1 port of app/settings/SettingsShell.tsx (web), with data loaded/mutated
// directly via the authenticated supabase client instead of server actions:
//  - profiles update: own row (RLS allows self-update)
//  - households update: name / quota_period / quota_goal only
//    (scoring_mode / invite_code are blocked by RLS — no UI for scoring_mode
//    is rendered as an editable control that would silently fail; see below)
//  - avatar upload: supabase.storage 'avatars' bucket via expo-image-picker
//  - logout: supabase.auth.signOut() then router.replace('/auth/login')
import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '@/components/shared/Avatar'
import { Icons } from '@/components/shared/Icons'
import { supabase } from '@/lib/supabase'
import { MEMBER_COLOR_OPTIONS } from '@/lib/tokens'
import { serifFont } from '@/lib/fonts'
import type { Profile, Household, ScoringMode, QuotaPeriod } from '@/lib/types'

interface SettingsScreenProps {
  profile: Profile
  household: Household
  onBack: () => void
  onSignedOut: () => void
}

const txt = '#2A221E'
const muted = 'rgba(42,34,30,0.55)'
const cardBg = 'rgba(255,255,255,0.78)'
const cardBorder = 'rgba(0,0,0,0.04)'
const bg = 'rgb(253,248,241)'

export function SettingsScreen({ profile, household, onBack, onSignedOut }: SettingsScreenProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [isPending, setIsPending] = useState(false)

  const [displayName, setDisplayName] = useState(profile.display_name)
  const [selectedColor, setSelectedColor] = useState(
    MEMBER_COLOR_OPTIONS.find((o) => o.color === profile.color) ?? MEMBER_COLOR_OPTIONS[0]
  )
  const [householdName, setHouseholdName] = useState(household.name)
  const [scoringMode] = useState<ScoringMode>(household.scoring_mode)
  const [quotaPeriod, setQuotaPeriod] = useState<QuotaPeriod>(household.quota_period ?? 'monthly')
  const [quotaGoal, setQuotaGoal] = useState<number>(household.quota_goal ?? 100)
  const [copied, setCopied] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [householdMsg, setHouseholdMsg] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url ?? null)
  const [avatarMsg, setAvatarMsg] = useState('')

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      setAvatarMsg('Fehler: Zugriff auf Fotos verweigert.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    })
    if (result.canceled || !result.assets?.[0]) return
    const asset = result.assets[0]
    setIsPending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht angemeldet.')
      const ext = asset.uri.split('.').pop()?.split('?')[0] || 'jpg'
      const path = `${user.id}/avatar-${Date.now()}.${ext}`
      const contentType = asset.mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`

      if (!asset.base64) throw new Error('Bild konnte nicht gelesen werden.')
      const arrayBuffer = decodeBase64(asset.base64)

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arrayBuffer, { contentType })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setAvatarMsg('Foto gespeichert.')
      setTimeout(() => setAvatarMsg(''), 2000)
    } catch (e) {
      setAvatarMsg('Fehler: ' + (e instanceof Error ? e.message : 'Unbekannter Fehler'))
    } finally {
      setIsPending(false)
    }
  }

  const previewProfile: Profile = {
    ...profile,
    display_name: displayName || profile.display_name,
    initial: (displayName[0] || profile.display_name[0]).toUpperCase(),
    color: selectedColor.color,
    bg_color: selectedColor.bg,
    avatar_url: avatarUrl,
  }

  const handleProfileSave = async () => {
    setIsPending(true)
    const name = displayName || profile.display_name
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: name,
        initial: name[0].toUpperCase(),
        color: selectedColor.color,
        bg_color: selectedColor.bg,
      })
      .eq('id', profile.id)
    setIsPending(false)
    if (error) { setProfileMsg('Fehler: ' + error.message) }
    else { setProfileMsg('Gespeichert.'); setTimeout(() => setProfileMsg(''), 2000) }
  }

  const handleHouseholdSave = async () => {
    setIsPending(true)
    // Note: scoring_mode / invite_code are blocked by RLS on mobile — only
    // name / quota_period / quota_goal are sent.
    const { error } = await supabase
      .from('households')
      .update({
        name: householdName || household.name,
        quota_period: quotaPeriod,
        quota_goal: quotaGoal,
      })
      .eq('id', household.id)
    setIsPending(false)
    if (error) { setHouseholdMsg('Fehler: ' + error.message) }
    else { setHouseholdMsg('Gespeichert.'); setTimeout(() => setHouseholdMsg(''), 2000) }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwörter stimmen nicht überein.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Passwort muss mindestens 6 Zeichen lang sein.')
      return
    }
    setIsPending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setIsPending(false)
      setPasswordMsg('Fehler: Nicht angemeldet.')
      return
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) {
      setIsPending(false)
      setPasswordMsg('Fehler: Aktuelles Passwort ist falsch.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setIsPending(false)
    if (error) { setPasswordMsg('Fehler: ' + error.message) }
    else {
      setPasswordMsg('Passwort geändert.')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setTimeout(() => setPasswordMsg(''), 3000)
    }
  }

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(household.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onSignedOut()
    router.replace('/auth/login')
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingBottom: 60 + insets.bottom }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          {Icons.back(18, txt)}
        </Pressable>
        <Text style={{ fontFamily: serifFont, fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 36 }}>
          Einstellungen
        </Text>
      </View>

      {/* Profile section */}
      <View style={[styles.card, { marginTop: 24 }]}>
        <Text style={styles.sectionLabel}>Mein Profil</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <View style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar member={previewProfile} size={52} />
            <Pressable
              onPress={handlePickAvatar}
              disabled={isPending}
              style={[
                styles.avatarOverlay,
                { backgroundColor: avatarUrl ? 'transparent' : 'rgba(0,0,0,0.35)', opacity: isPending ? 0.5 : 1 },
              ]}
            >
              {!avatarUrl && <Text style={{ fontSize: 18 }}>📷</Text>}
            </Pressable>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: txt, letterSpacing: -0.2 }}>
              {previewProfile.display_name}
            </Text>
            <Text style={{ fontSize: 12, color: muted, marginTop: 2 }}>
              {avatarMsg || 'Foto tippen zum Ändern'}
            </Text>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={[styles.input, { marginBottom: 14 }]}
          placeholderTextColor="rgba(42,34,30,0.35)"
        />

        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Farbe</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {MEMBER_COLOR_OPTIONS.map((o) => (
            <Pressable
              key={o.color}
              onPress={() => setSelectedColor(o)}
              style={[
                styles.colorDot,
                { backgroundColor: o.color },
                selectedColor.color === o.color
                  ? { borderWidth: 3, borderColor: bg, shadowColor: o.color, shadowOpacity: 1, shadowRadius: 0 }
                  : null,
              ]}
            />
          ))}
        </View>

        <Pressable onPress={handleProfileSave} disabled={isPending} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{isPending ? 'Speichern…' : 'Profil speichern'}</Text>
        </Pressable>
        {!!profileMsg && <Text style={styles.msgText}>{profileMsg}</Text>}
      </View>

      {/* Household section */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Haushalt</Text>

        <Text style={styles.fieldLabel}>Name des Haushalts</Text>
        <TextInput
          value={householdName}
          onChangeText={setHouseholdName}
          style={[styles.input, { fontSize: 16, marginBottom: 14 }]}
          placeholderTextColor="rgba(42,34,30,0.35)"
        />

        <View style={{ marginBottom: 14 }}>
          <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Bewertungsmodus</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['zeit', 'punkte'] as const).map((mode) => {
              const active = scoringMode === mode
              return (
                <View
                  key={mode}
                  style={[
                    styles.modeBtn,
                    { backgroundColor: active ? txt : 'rgba(0,0,0,0.04)', opacity: 0.6 },
                  ]}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: active ? '#FDF8F1' : muted }}>
                    {mode === 'zeit' ? '⏱ Zeit' : '⭐ Punkte'}
                  </Text>
                </View>
              )
            })}
          </View>
          <Text style={{ fontSize: 11, color: muted, marginTop: 6 }}>
            Betrifft den gesamten Haushalt — nur im Web änderbar.
          </Text>
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Zeitraum Team-Fortschritt</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {([
              { value: 'weekly', label: 'Wöchentlich' },
              { value: 'biweekly', label: '2-Wöchentlich' },
              { value: 'monthly', label: 'Monatlich' },
            ] as { value: QuotaPeriod; label: string }[]).map(({ value, label }) => {
              const active = quotaPeriod === value
              return (
                <Pressable
                  key={value}
                  onPress={() => setQuotaPeriod(value)}
                  style={[styles.periodBtn, { backgroundColor: active ? txt : 'rgba(0,0,0,0.04)' }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', lineHeight: 15.6, color: active ? '#FDF8F1' : muted, textAlign: 'center' }}>
                    {label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.fieldLabel}>Haushaltsziel</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: txt, letterSpacing: -0.5 }}>{quotaGoal}%</Text>
          </View>
          {/* RN has no built-in range slider without an extra native dependency
              (not pre-approved for this port); the step buttons below fully
              replace the web <input type="range"> interaction (same min/max/step),
              and this track visualizes the current value. */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${((quotaGoal - 50) / 50) * 100}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {[50, 60, 70, 80, 90, 100].map((v) => (
              <Pressable key={v} onPress={() => setQuotaGoal(v)} style={{ paddingVertical: 4, minWidth: 28, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: quotaGoal === v ? '700' : '400', color: quotaGoal === v ? txt : muted }}>
                  {v}%
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ fontSize: 11, color: muted, marginTop: 2 }}>
            Wenn {quotaGoal}% der Aufgabenzeit erledigt sind, zeigt der Balken 100%.
          </Text>
        </View>

        <Pressable onPress={handleHouseholdSave} disabled={isPending} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{isPending ? 'Speichern…' : 'Haushalt speichern'}</Text>
        </Pressable>
        {!!householdMsg && <Text style={styles.msgText}>{householdMsg}</Text>}
      </View>

      {/* Password section */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Passwort ändern</Text>

        <Text style={styles.fieldLabel}>Aktuelles Passwort</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoComplete="current-password"
          style={[styles.input, { fontSize: 16, marginBottom: 10 }]}
        />

        <Text style={styles.fieldLabel}>Neues Passwort</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoComplete="new-password"
          style={[styles.input, { fontSize: 16, marginBottom: 10 }]}
        />

        <Text style={styles.fieldLabel}>Neues Passwort bestätigen</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
          style={[styles.input, { fontSize: 16, marginBottom: 14 }]}
        />

        <Pressable
          onPress={handlePasswordChange}
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
          style={[
            styles.primaryBtn,
            { opacity: (!currentPassword || !newPassword || !confirmPassword) ? 0.4 : 1 },
          ]}
        >
          <Text style={styles.primaryBtnText}>{isPending ? 'Speichern…' : 'Passwort ändern'}</Text>
        </Pressable>
        {!!passwordMsg && (
          <Text style={[styles.msgText, passwordMsg.startsWith('Fehler') ? { color: 'rgb(200,60,60)' } : null]}>
            {passwordMsg}
          </Text>
        )}
      </View>

      {/* Invite section */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Mitglieder einladen</Text>
        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Einladungscode</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.inviteCodeBox}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: txt, letterSpacing: 2, textAlign: 'center' }}>
              {household.invite_code}
            </Text>
          </View>
          <Pressable onPress={handleCopyCode} style={styles.copyBtn}>
            <Text style={{ color: '#FDF8F1', fontSize: 13, fontWeight: '600' }}>
              {copied ? 'Kopiert!' : 'Code kopieren'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Sign out */}
      <View style={{ marginTop: 14, marginHorizontal: 16 }}>
        <Pressable onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={{ color: 'rgba(200,60,60,0.8)', fontSize: 14, fontWeight: '500' }}>Abmelden</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = globalThis.atob ? globalThis.atob(base64) : atobPolyfill(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i)
  return bytes
}

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function atobPolyfill(input: string): string {
  let str = input.replace(/=+$/, '')
  let output = ''
  for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++)); ) {
    buffer = B64_CHARS.indexOf(buffer)
    if (buffer === -1) continue
    bs = bc % 4 ? bs * 64 + buffer : buffer
    if (bc++ % 4) output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))
  }
  return output
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  card: {
    marginTop: 14,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: muted,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)',
    fontSize: 15,
    color: txt,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 32, height: 32, borderRadius: 16,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: txt,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FDF8F1',
    fontSize: 14,
    fontWeight: '600',
  },
  msgText: {
    marginTop: 8,
    fontSize: 12,
    color: muted,
    textAlign: 'center',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  inviteCodeBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  copyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: txt,
    flexShrink: 0,
  },
  signOutBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: txt,
  },
})

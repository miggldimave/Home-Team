// 1:1 port of app/onboarding/page.tsx (web).
// Backend: instead of the createHouseholdWithTasks/joinHousehold server actions,
// mobile calls the security-definer RPCs from migration 20260706214754:
//   create_household_and_join(p_name, p_scoring_mode, p_display_name, p_color,
//                             p_bg_color, p_categories jsonb, p_tasks jsonb) -> uuid
//   join_household_by_invite(p_invite_code, p_display_name, p_color, p_bg_color) -> uuid
import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { serifFont } from '@/lib/fonts'
import { MEMBER_COLOR_OPTIONS, TASK_SUGGESTIONS, SUGGESTION_CATEGORY_COLORS } from '@/lib/tokens'

type Mode = 'choose' | 'create' | 'join' | 'tasks'

const txt = '#2A221E'
const muted = 'rgba(42,34,30,0.55)'

const catColor = (cat: string) => SUGGESTION_CATEGORY_COLORS[cat]?.hue ?? 'rgb(168,146,196)'

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode>('choose')
  const [displayName, setDisplayName] = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [householdName, setHouseholdName] = useState('')
  const [scoringMode, setScoringMode] = useState<'punkte' | 'zeit'>('zeit')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const selectedColor = MEMBER_COLOR_OPTIONS[colorIdx]

  const finishCreate = async (taskNames: string[]) => {
    setIsPending(true)
    setError('')
    const selected = TASK_SUGGESTIONS.filter((t) => taskNames.includes(t.name))
    const uniqueCategories = [...new Set(selected.map((t) => t.category))]
    const categoriesPayload = uniqueCategories.map((name) => ({
      name,
      ...(SUGGESTION_CATEGORY_COLORS[name] ?? { hue: 'rgb(168,146,196)', soft: 'rgb(238,230,246)', deep: 'rgb(78,58,106)' }),
    }))
    const { error } = await supabase.rpc('create_household_and_join', {
      p_name: householdName,
      p_scoring_mode: scoringMode,
      p_display_name: displayName,
      p_color: selectedColor.color,
      p_bg_color: selectedColor.bg,
      p_categories: categoriesPayload,
      p_tasks: selected,
    })
    if (error) {
      setError(error.message)
      setIsPending(false)
      return
    }
    router.replace('/')
  }

  const handleJoin = async () => {
    setIsPending(true)
    setError('')
    const { error } = await supabase.rpc('join_household_by_invite', {
      p_invite_code: inviteCode.trim().toLowerCase(),
      p_display_name: displayName,
      p_color: selectedColor.color,
      p_bg_color: selectedColor.bg,
    })
    if (error) {
      setError(error.message)
      setIsPending(false)
      return
    }
    router.replace('/')
  }

  const toggleTask = (name: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const backBtn = (onPress: () => void) => (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 4, marginBottom: 28, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 18, lineHeight: 18, color: muted }}>‹</Text>
      <Text style={{ color: muted, fontSize: 14, fontWeight: '500' }}>Zurück</Text>
    </Pressable>
  )

  const colorPicker = (
    <View>
      <Text style={styles.label}>Deine Farbe</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {MEMBER_COLOR_OPTIONS.map((opt, i) => (
          <Pressable
            key={i}
            onPress={() => setColorIdx(i)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: opt.color,
              transform: [{ scale: colorIdx === i ? 1.1 : 1 }],
              borderWidth: colorIdx === i ? 3 : 0,
              borderColor: 'white',
            }}
          />
        ))}
      </View>
    </View>
  )

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingTop: 60 + insets.top, paddingBottom: 48 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>

          {mode === 'choose' && (
            <>
              <Text style={styles.headline}>Willkommen.</Text>
              <Text style={styles.sub}>Richte deinen Haushalt ein.</Text>
              <View style={{ marginTop: 40, gap: 12 }}>
                <Pressable onPress={() => setMode('create')} style={{ paddingVertical: 18, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#2A221E' }}>
                  <Text style={{ color: '#FDF8F1', fontSize: 15, fontWeight: '600' }}>Neuen Haushalt gründen</Text>
                  <Text style={{ color: '#FDF8F1', fontSize: 13, opacity: 0.6, marginTop: 3 }}>Einladungslink für Partner*in generieren</Text>
                </Pressable>
                <Pressable onPress={() => setMode('join')} style={{ paddingVertical: 18, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                  <Text style={{ color: txt, fontSize: 15, fontWeight: '600' }}>Bestehendem Haushalt beitreten</Text>
                  <Text style={{ color: muted, fontSize: 13, marginTop: 3 }}>Einladungscode eingeben</Text>
                </Pressable>
              </View>
            </>
          )}

          {mode === 'create' && (
            <>
              {backBtn(() => { setMode('choose'); setError('') })}
              <Text style={styles.headline}>Willkommen.</Text>
              <Text style={styles.sub}>Richte deinen Haushalt ein.</Text>
              <View style={{ marginTop: 32, gap: 16 }}>
                <View>
                  <Text style={styles.label}>Dein Name</Text>
                  <TextInput value={displayName} onChangeText={setDisplayName} placeholder="z.B. Lotta" placeholderTextColor="rgba(42,34,30,0.35)" style={styles.input} />
                </View>
                {colorPicker}
                <View>
                  <Text style={styles.label}>Name des Haushalts</Text>
                  <TextInput value={householdName} onChangeText={setHouseholdName} placeholder="z.B. Unsere WG" placeholderTextColor="rgba(42,34,30,0.35)" style={styles.input} />
                </View>
                <View>
                  <Text style={styles.label}>Bewertungsmodus</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['zeit', 'punkte'] as const).map((m) => (
                      <Pressable
                        key={m}
                        onPress={() => setScoringMode(m)}
                        style={{
                          flex: 1,
                          padding: 12,
                          borderRadius: 14,
                          backgroundColor: scoringMode === m ? '#2A221E' : 'rgba(255,255,255,0.8)',
                          borderWidth: scoringMode === m ? 0 : 1,
                          borderColor: 'rgba(0,0,0,0.08)',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: scoringMode === m ? '#FDF8F1' : txt, fontSize: 14, fontWeight: '600' }}>
                          {m === 'zeit' ? '⏱ Zeit (Minuten)' : '⭐ Punkte (1–5)'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    if (!displayName.trim() || !householdName.trim()) return
                    setMode('tasks')
                  }}
                  style={[styles.primaryBtn, { marginTop: 8 }]}
                >
                  <Text style={styles.primaryBtnText}>Weiter</Text>
                </Pressable>
              </View>
            </>
          )}

          {mode === 'join' && (
            <>
              {backBtn(() => { setMode('choose'); setError('') })}
              <Text style={styles.headline}>Willkommen.</Text>
              <Text style={styles.sub}>Richte deinen Haushalt ein.</Text>
              <View style={{ marginTop: 32, gap: 16 }}>
                <View>
                  <Text style={styles.label}>Dein Name</Text>
                  <TextInput value={displayName} onChangeText={setDisplayName} placeholder="z.B. Lotta" placeholderTextColor="rgba(42,34,30,0.35)" style={styles.input} />
                </View>
                {colorPicker}
                <View>
                  <Text style={styles.label}>Einladungscode</Text>
                  <TextInput
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    autoCapitalize="none"
                    placeholder="8-stelliger Code"
                    placeholderTextColor="rgba(42,34,30,0.35)"
                    style={[styles.input, { letterSpacing: 2 }]}
                  />
                </View>
                {!!error && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
                <Pressable
                  onPress={handleJoin}
                  disabled={isPending || !displayName.trim() || !inviteCode.trim()}
                  style={[styles.primaryBtn, { marginTop: 8, opacity: isPending ? 0.7 : 1 }]}
                >
                  <Text style={styles.primaryBtnText}>{isPending ? 'Bitte warten…' : 'Beitreten'}</Text>
                </Pressable>
              </View>
            </>
          )}

          {mode === 'tasks' && (
            <>
              {backBtn(() => { setMode('create'); setError('') })}
              <Text style={[styles.headline, { fontSize: 36, lineHeight: 39.6 }]}>Welche Aufgaben habt ihr?</Text>
              <Text style={styles.sub}>Wähle aus, womit ihr starten möchtet. Weitere kannst du jederzeit hinzufügen.</Text>

              <View style={{ marginTop: 24, gap: 8 }}>
                {TASK_SUGGESTIONS.map((task) => {
                  const selected = selectedTasks.has(task.name)
                  const color = catColor(task.category)
                  return (
                    <Pressable
                      key={task.name}
                      onPress={() => toggleTask(task.name)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 18,
                        borderWidth: 1.5,
                        borderColor: selected ? color : 'rgba(0,0,0,0.07)',
                        backgroundColor: selected ? color.replace('rgb', 'rgba').replace(')', ', 0.08)') : 'rgba(255,255,255,0.8)',
                      }}
                    >
                      <Text style={{ fontSize: 26, lineHeight: 30 }}>{task.icon}</Text>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: txt, letterSpacing: -0.1 }}>{task.name}</Text>
                        <View style={{ marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
                          <Text style={{ fontSize: 12, color: muted }}>{task.category} · {task.time_minutes} min</Text>
                        </View>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: selected ? 0 : 1.5,
                          borderColor: 'rgba(0,0,0,0.15)',
                          backgroundColor: selected ? color : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {selected && <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 15 }}>✓</Text>}
                      </View>
                    </Pressable>
                  )
                })}
              </View>

              {!!error && (
                <View style={[styles.errorBox, { marginTop: 12 }]}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
                <Pressable
                  onPress={() => finishCreate(Array.from(selectedTasks))}
                  disabled={isPending || selectedTasks.size === 0}
                  style={[styles.primaryBtn, { flex: 2, opacity: isPending || selectedTasks.size === 0 ? 0.5 : 1 }]}
                >
                  <Text style={styles.primaryBtnText}>
                    {isPending ? 'Wird erstellt…' : `${selectedTasks.size} Aufgabe${selectedTasks.size !== 1 ? 'n' : ''} hinzufügen`}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => finishCreate([])}
                  disabled={isPending}
                  style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: muted, fontSize: 15, fontWeight: '500' }}>Überspringen</Text>
                </Pressable>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgb(253, 248, 241)' },
  headline: { fontFamily: serifFont, fontSize: 40, color: txt, letterSpacing: -0.5, lineHeight: 42 },
  sub: { marginTop: 8, fontSize: 15, color: muted },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(42,34,30,0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    color: txt,
  },
  errorBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(215,100,80,0.1)',
  },
  errorText: { color: 'rgb(180,60,40)', fontSize: 13 },
  primaryBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#2A221E',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FDF8F1', fontSize: 15, fontWeight: '600' },
})

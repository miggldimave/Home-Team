import { useState } from 'react'
import { View, Text, Pressable, ScrollView, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Flame, Heart, Pill, Icons } from '@/components/shared/Icons'
import { getCatToken } from '@/lib/tokens'
import { taskStreak, timeAgo, formatMetric, metricOfLog, metricOfTask, freqLabel } from '@/lib/helpers'
import { serifFont, serifItalicFont } from '@/lib/fonts'
import type { AppState, Task } from '@/lib/types'

const DESCRIPTIONS: Record<string, string> = {
  'Altglas wegbringen': 'Die Glasflaschen und Gläser in den Container.',
  'Blumen gießen': 'Zimmerpflanzen mit Wasser versorgen — alle Töpfe checken.',
  'Abwaschen': 'Dreckiges Geschirr spülen. Küche bleibt so angenehm.',
  'Kochen': 'Essen für uns beide zubereiten.',
  'Bettwäsche wechseln': 'Bezug vom Bett abziehen und frisch beziehen.',
  'Wäsche waschen': 'Schmutzwäsche sortieren und in die Maschine.',
}

interface TaskDetailScreenProps {
  state: AppState
  task: Task
  onComplete: (task: Task) => void
  onUndo?: (task: Task) => void
  onDeleteLog?: (logId: string) => void
  onBack: () => void
  onKudos: (toMemberId: string, task: Task, reason?: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskDetailScreen({ state, task, onComplete, onDeleteLog, onBack, onKudos, onEdit, onDelete }: TaskDetailScreenProps) {
  const { logs, profiles, currentProfile, categories, dark } = state
  const mode = state.household.scoring_mode
  const me = currentProfile
  const cat = getCatToken(categories, task.category)
  const streak = taskStreak(logs, task.id)
  const streakMember = streak.member ? profiles.find((m) => m.id === streak.member) : null
  const history = logs.filter((l) => l.taskId === task.id).slice(0, 10)
  const insets = useSafeAreaInsets()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDeleteLog, setConfirmDeleteLog] = useState<string | null>(null)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)'
  const cardBorderColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const bg = dark ? 'rgb(28,22,26)' : 'rgb(253,248,241)'

  const desc = DESCRIPTIONS[task.name] || `Regelmäßige ${cat.label ?? task.category}-Aufgabe. Jede*r im Haushalt kann sie übernehmen.`

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 + insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[cat.soft, 'transparent']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={onBack}
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
            >
              {Icons.back(18, txt)}
            </Pressable>
            {(onEdit || onDelete) && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {onEdit && (
                  <Pressable
                    onPress={() => onEdit(task)}
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {Icons.pencil(16, txt)}
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable
                    onPress={() => setConfirmDelete(true)}
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {Icons.trash(16, 'rgb(190,60,60)')}
                  </Pressable>
                )}
              </View>
            )}
          </View>
          <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
            <TaskIconTile task={task} size={64} categories={categories} />
            <View style={{ flex: 1, paddingTop: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: cat.deep, textTransform: 'uppercase', letterSpacing: 0.5 }}>{task.category}</Text>
              <Text style={{ fontFamily: serifFont, fontSize: 32, color: txt, letterSpacing: -0.4, lineHeight: 35, marginTop: 2 }}>{task.name}</Text>
            </View>
          </View>
          <Text style={{ marginTop: 14, fontSize: 14, color: muted, lineHeight: 21 }}>{desc}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Pill bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'} fg={txt} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                {mode === 'punkte' ? Icons.star(12, txt) : Icons.clock(12, txt)}
                <Text style={{ color: txt, fontSize: 12, fontWeight: '500', letterSpacing: -0.1 }}>{formatMetric(metricOfTask(task, mode), mode)}</Text>
              </View>
            </Pill>
            <Pill bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'} fg={txt} style={{ paddingVertical: 6, paddingHorizontal: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                {Icons.repeat(12, txt)}
                <Text style={{ color: txt, fontSize: 12, fontWeight: '500', letterSpacing: -0.1 }}>{freqLabel(task.cycle_days)}</Text>
              </View>
            </Pill>
          </View>
        </LinearGradient>

        {/* Streak highlight */}
        {streak.count >= 2 && streakMember && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <View style={{ padding: 16, paddingHorizontal: 18, borderRadius: 22, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ position: 'relative' }}>
                <Avatar member={streakMember} size={44} />
                <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: dark ? 'rgb(28,22,26)' : 'rgb(253,248,241)', borderRadius: 11, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                  <Flame size={13} color={streakMember.color} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: serifFont, fontSize: 18, color: txt, letterSpacing: -0.2, lineHeight: 23 }}>
                  <Text style={{ fontFamily: serifItalicFont }}>{streakMember.display_name}</Text> hat das die letzten <Text style={{ fontFamily: serifItalicFont }}>{streak.count}×</Text> gemacht
                </Text>
                <Text style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                  {streakMember.id !== me.id ? 'Zeit, ihm/ihr den Rücken frei zu halten?' : 'Weiter so – oder lass den anderen ran.'}
                </Text>
              </View>
              {streakMember.id !== me.id && (
                <Pressable
                  onPress={() => onKudos(streakMember.id, task)}
                  style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: me.bg_color, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Heart size={18} filled color={me.color} />
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* History */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ paddingHorizontal: 24, paddingBottom: 10, fontFamily: serifFont, fontSize: 22, color: txt, letterSpacing: -0.2 }}>Verlauf</Text>
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor, borderRadius: 20, overflow: 'hidden' }}>
              {history.length === 0 && (
                <Text style={{ padding: 20, textAlign: 'center', fontFamily: serifItalicFont, fontSize: 16, color: muted }}>noch keine Einträge</Text>
              )}
              {history.map((l, i) => {
                const m = profiles.find((mm) => mm.id === l.memberId)
                if (!m) return null
                const canDelete = onDeleteLog && l.memberId === me.id
                return (
                  <View
                    key={i}
                    style={{
                      padding: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
                      borderTopWidth: i > 0 ? 1 : 0,
                      borderTopColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <Avatar member={m} size={32} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: txt, letterSpacing: -0.1 }}>{m.display_name}</Text>
                      <Text style={{ fontSize: 11, color: muted, marginTop: 2 }}>{timeAgo(l.ts)}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: muted }}>{formatMetric(metricOfLog(l, mode), mode)}</Text>
                    {canDelete && (
                      <Pressable
                        onPress={() => setConfirmDeleteLog(l.id)}
                        style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        {Icons.trash(13, 'rgb(190,80,60)')}
                      </Pressable>
                    )}
                  </View>
                )
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Delete log entry confirmation */}
      <Modal visible={!!confirmDeleteLog} transparent animationType="fade" onRequestClose={() => setConfirmDeleteLog(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ width: '100%', backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 28, paddingBottom: 40 + insets.bottom }}>
            <Text style={{ fontFamily: serifFont, fontSize: 24, color: txt, marginBottom: 8 }}>Eintrag löschen?</Text>
            <Text style={{ fontSize: 14, color: muted, marginBottom: 24 }}>Dieser Eintrag wird dauerhaft aus dem Verlauf entfernt.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setConfirmDeleteLog(null)} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center' }}>
                <Text style={{ color: muted, fontSize: 14, fontWeight: '500' }}>Abbrechen</Text>
              </Pressable>
              <Pressable
                onPress={() => { if (confirmDeleteLog) onDeleteLog?.(confirmDeleteLog); setConfirmDeleteLog(null) }}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgb(190,60,60)', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Löschen</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ width: '100%', backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingTop: 28, paddingBottom: 40 + insets.bottom }}>
            <Text style={{ fontFamily: serifFont, fontSize: 24, color: txt, marginBottom: 8 }}>Aufgabe löschen?</Text>
            <Text style={{ fontSize: 14, color: muted, marginBottom: 24 }}>„{task.name}“ wird dauerhaft entfernt.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setConfirmDelete(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', alignItems: 'center' }}>
                <Text style={{ color: muted, fontSize: 14, fontWeight: '500' }}>Abbrechen</Text>
              </Pressable>
              <Pressable
                onPress={() => { onDelete?.(task.id); setConfirmDelete(false); onBack() }}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgb(190,60,60)', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Löschen</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} pointerEvents="box-none">
        <LinearGradient
          colors={dark ? ['rgba(28,22,26,0)', 'rgba(28,22,26,1)'] : ['rgba(253,248,241,0)', 'rgba(253,248,241,1)']}
          locations={[0, 0.4]}
          style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 20 + insets.bottom }}
        >
          <Pressable
            onPress={() => onComplete(task)}
            style={{
              width: '100%', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20,
              backgroundColor: cat.hue,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              shadowColor: cat.hue, shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 6,
            }}
          >
            {Icons.check(20, '#fff', 2.6)}
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: -0.1 }}>
              {`Erledigt · ${formatMetric(metricOfTask(task, mode), mode)}`}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  )
}

import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Flame, Heart, Icons } from '@/components/shared/Icons'
import { getCatToken } from '@/lib/tokens'
import {
  periodQuota,
  metricByMember,
  formatMetric,
  metricOfTask,
  timeAgo,
  lastDoneByTask,
  taskStreak,
  entlastungCandidates,
} from '@/lib/helpers'
import { InvitePrompt } from '@/components/shared/InvitePrompt'
import { serifFont, serifItalicFont } from '@/lib/fonts'
import { useAppRefresh } from '@/components/AppShell'
import type { AppState, ComputedTaskLog, Task } from '@/lib/types'

interface HomeScreenProps {
  state: AppState
  onComplete: (task: Task) => void
  onUndo: (task: Task) => void
  onNavigate: (screen: string) => void
  onKudos: (toMemberId: string, task: Task, reason?: string) => void
  onOpenTask: (task: Task) => void
  onAddTask: () => void
  kudosDismissedAt: number
  onDismissKudos: () => void
}

export function HomeScreen({ state, onComplete, onUndo, onNavigate, onKudos, onOpenTask, onAddTask, kudosDismissedAt, onDismissKudos }: HomeScreenProps) {
  const { logs, tasks, profiles, currentProfile, categories, kudos, dark } = state
  const me = currentProfile
  const other = profiles.find((p) => p.id !== me.id)

  const mode = state.household.scoring_mode
  const investVerb = mode === 'punkte' ? 'gesammelt' : 'investiert'
  const qPeriod = state.household.quota_period ?? 'monthly'
  const qGoal = state.household.quota_goal ?? 100
  const quota = periodQuota(logs, tasks, qPeriod, qGoal, mode)
  const myTime = metricByMember(logs, me.id, quota.since, mode)
  const otherTime = other ? metricByMember(logs, other.id, quota.since, mode) : 0
  const totalTime = myTime + otherTime || 1

  const lastDone = lastDoneByTask(logs)
  const now = Date.now()
  const due = tasks
    .map((t) => {
      const last = lastDone[t.id]
      const lastTs = last?.ts
      const createdTs = new Date(t.created_at).getTime()
      const refTs = lastTs ?? createdTs
      const dueIn = (refTs + t.cycle_days * 86400000 - now) / 86400000
      return { ...t, last, dueIn, overdueDays: Math.max(0, -dueIn) }
    })
    .filter((t) => t.dueIn <= 1)
    .sort((a, b) => a.dueIn - b.dueIn)
    .slice(0, 5)

  const entlastung = other ? entlastungCandidates(logs, tasks, me.id)[0] : null
  const weekAgo = Date.now() - 7 * 86400000
  const recentByOther = other
    ? logs.filter((l) => l.memberId === other.id && l.ts >= weekAgo).slice(0, 5)
    : []

  // Incoming kudos: sent to me in the last 7 days, newer than last dismiss
  const incomingKudos = kudos.filter(
    (k) => k.to_profile_id === me.id &&
           new Date(k.created_at).getTime() >= weekAgo &&
           new Date(k.created_at).getTime() > kudosDismissedAt
  )

  // Which tasks the current user has already kudos'd (for filled hearts)
  const myKudosTaskIds = new Set(
    kudos
      .filter((k) => k.from_profile_id === me.id && k.task_id && new Date(k.created_at).getTime() >= weekAgo)
      .map((k) => k.task_id!)
  )

  const [dismissedFeedIds, setDismissedFeedIds] = useState<Set<string>>(new Set())
  const [entlastungDismissed, setEntlastungDismissed] = useState<{ taskId: string; atCount: number } | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const onAppRefresh = useAppRefresh()

  useEffect(() => {
    AsyncStorage.getItem('dismissedFeedIds').then((v) => {
      const stored = JSON.parse(v ?? '[]') as string[]
      if (stored.length) setDismissedFeedIds(new Set(stored))
    })
    AsyncStorage.getItem('entlastungDismissed').then((ed) => {
      if (ed) setEntlastungDismissed(JSON.parse(ed))
    })
  }, [])

  const dismissFeedItem = (id: string) => {
    setDismissedFeedIds((prev) => {
      const next = new Set([...prev, id])
      AsyncStorage.setItem('dismissedFeedIds', JSON.stringify([...next]))
      return next
    })
  }
  const dismissEntlastung = (taskId: string, atCount: number) => {
    const val = { taskId, atCount }
    setEntlastungDismissed(val)
    AsyncStorage.setItem('entlastungDismissed', JSON.stringify(val))
  }
  const visibleFeed = recentByOther.filter((l) => !dismissedFeedIds.has(l.id))

  // Group incoming kudos by sender with reason-based labels
  const kudosBySender: Record<string, { name: string; color: string; entries: string[] }> = {}
  incomingKudos.forEach((k) => {
    const sender = profiles.find((p) => p.id === k.from_profile_id)
    if (!sender) return
    if (!kudosBySender[k.from_profile_id]) {
      kudosBySender[k.from_profile_id] = { name: sender.display_name, color: sender.color, entries: [] }
    }
    const task = tasks.find((t) => t.id === k.task_id)
    let label = ''
    if (k.reason === 'streak' && task) {
      label = `den Streak bei ${task.name}`
    } else if (k.reason === 'category' && task) {
      label = `das Rocken von ${task.category}`
    } else if (task) {
      label = task.name
    }
    if (label && !kudosBySender[k.from_profile_id].entries.includes(label)) {
      kudosBySender[k.from_profile_id].entries.push(label)
    }
  })
  const kudosSenders = Object.values(kudosBySender)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.72)'
  const cardBorderColor = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'

  const handleRefresh = async () => {
    if (!onAppRefresh) return
    setRefreshing(true)
    await onAppRefresh()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        onAppRefresh ? <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} /> : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '500', color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={{ fontFamily: serifFont, fontSize: 40, lineHeight: 42, marginTop: 4, letterSpacing: -0.5, color: txt }}>
              Hallo, <Text style={{ fontFamily: serifItalicFont }}>{me.display_name}</Text>.
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            style={{ borderRadius: 999, position: 'relative', borderWidth: 2.5, borderColor: me.color, padding: 0 }}
          >
            <Avatar member={me} size={44} />
            <View style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}>
              {Icons.settings(10, 'rgba(42,34,30,0.65)')}
            </View>
          </Pressable>
        </View>
      </View>

      {profiles.length < 2 && (
        <InvitePrompt inviteCode={state.household.invite_code} dark={dark} />
      )}

      {/* Team quota card */}
      {tasks.length > 0 && (
        <View style={{ marginTop: 22, marginHorizontal: 16, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {qPeriod === 'weekly' ? 'Team diese Woche' : qPeriod === 'biweekly' ? 'Team diese 2 Wochen' : 'Team diesen Monat'}
            </Text>
            <Text style={{ fontSize: 12, color: muted, fontWeight: '500' }}>{Math.round(quota.pct * 100)}%</Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row', backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
            <View style={{ width: `${(myTime / totalTime) * quota.pct * 100}%`, backgroundColor: me.color }} />
            {other && <View style={{ width: `${(otherTime / totalTime) * quota.pct * 100}%`, backgroundColor: other.color }} />}
          </View>
          <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: me.color }} />
              <Text style={{ fontSize: 12, color: muted }}>{me.display_name} · {formatMetric(myTime, mode)}</Text>
            </View>
            {other && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 12, color: muted }}>{other.display_name} · {formatMetric(otherTime, mode)}</Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: other.color }} />
              </View>
            )}
          </View>
          <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
            <Text style={{ fontFamily: serifFont, fontSize: 18, lineHeight: 23, color: txt, letterSpacing: -0.2 }}>
              {qPeriod === 'weekly'
                ? <>Diese Woche schon <Text style={{ fontFamily: serifItalicFont }}>{formatMetric(quota.done, mode)}</Text> {investVerb}.</>
                : qPeriod === 'biweekly'
                ? <>In 2 Wochen zusammen <Text style={{ fontFamily: serifItalicFont }}>{formatMetric(quota.done, mode)}</Text> {investVerb}.</>
                : <>Diesen Monat schon <Text style={{ fontFamily: serifItalicFont }}>{formatMetric(quota.done, mode)}</Text> {investVerb}.</>}
            </Text>
          </View>
        </View>
      )}

      {/* Entlastungs-Karte */}
      {entlastung && other && (!entlastungDismissed || entlastungDismissed.taskId !== entlastung.id || entlastung.streak.count > entlastungDismissed.atCount) && (
        <Pressable
          onPress={() => onOpenTask(entlastung)}
          style={{
            marginTop: 14, marginHorizontal: 16, padding: 16, paddingHorizontal: 18, borderRadius: 22,
            backgroundColor: dark ? 'rgba(215,128,96,0.12)' : 'rgba(249,223,210,0.55)',
            borderWidth: 1, borderColor: cardBorderColor, position: 'relative', overflow: 'hidden',
          }}
        >
          <Pressable
            onPress={(e) => { e.stopPropagation(); dismissEntlastung(entlastung.id, entlastung.streak.count) }}
            style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
          >
            {Icons.close(12, muted)}
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ position: 'relative' }}>
              <Avatar member={other} size={40} />
              <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: 'rgb(253,248,241)', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                <Flame size={12} />
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: serifFont, fontSize: 18, color: txt, letterSpacing: -0.2, lineHeight: 23 }}>
                {other.display_name} hat <Text style={{ fontFamily: serifItalicFont }}>{entlastung.name}</Text> die letzten {entlastung.streak.count} Mal gemacht.
              </Text>
              <Text style={{ marginTop: 6, fontSize: 13, color: muted }}>Magst du als nächstes?</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            <Pressable
              onPress={(e) => { e.stopPropagation(); onComplete(entlastung) }}
              style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: txt, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Text style={{ color: dark ? '#2A221E' : '#FDF8F1', fontSize: 13, fontWeight: '600' }}>
                Ich mach&apos;s · {formatMetric(metricOfTask(entlastung, mode), mode)}
              </Text>
            </Pressable>
            <Pressable
              onPress={(e) => { e.stopPropagation(); onKudos(other.id, entlastung) }}
              style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Heart size={14} filled={myKudosTaskIds.has(entlastung.id)} color={me.color} />
              <Text style={{ color: txt, fontSize: 13, fontWeight: '500' }}>Danke</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* Incoming kudos notification (grouped) */}
      {kudosSenders.length > 0 && (
        <View style={{ marginTop: 14, marginHorizontal: 16, paddingVertical: 14, paddingRight: 14, paddingLeft: 18, borderRadius: 22, backgroundColor: dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,248,235,0.95)', borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(215,128,96,0.18)', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 20, flexShrink: 0 }}>🩷</Text>
          <View style={{ flex: 1 }}>
            {kudosSenders.map((s, i) => (
              <Text key={i} style={{ fontFamily: serifFont, fontSize: 17, color: txt, letterSpacing: -0.2, lineHeight: 23 }}>
                <Text style={{ fontFamily: serifItalicFont, color: s.color }}>{s.name}</Text>
                {' hat dir gedankt'}
                {s.entries.length > 0 && (
                  <Text style={{ color: muted, fontSize: 14, fontFamily: serifFont }}>
                    {' für '}
                    <Text style={{ fontFamily: serifItalicFont }}>{s.entries.slice(0, 2).join(', ')}{s.entries.length > 2 ? ` +${s.entries.length - 2}` : ''}</Text>
                  </Text>
                )}
              </Text>
            ))}
          </View>
          <Pressable
            onPress={onDismissKudos}
            style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {Icons.close(14, muted)}
          </Pressable>
        </View>
      )}

      {tasks.length === 0 ? (
        <View style={{ marginTop: 22, marginHorizontal: 16, borderRadius: 24, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 18, paddingBottom: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(42,34,30,0.06)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: 24 }}>🧹</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: txt, letterSpacing: -0.2, lineHeight: 18 }}>Noch keine Aufgaben</Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: muted, lineHeight: 18.85 }}>Legt eure ersten Haushaltsaufgaben an und behaltet den Überblick.</Text>
            </View>
          </View>
          <View style={{ padding: 18, paddingTop: 0 }}>
            <Pressable
              onPress={onAddTask}
              style={{ width: '100%', paddingVertical: 13, borderRadius: 14, backgroundColor: txt, alignItems: 'center' }}
            >
              <Text style={{ color: dark ? '#2A221E' : '#FDF8F1', fontSize: 14, fontWeight: '600' }}>Aufgabe erstellen</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {/* Heute dran */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 }}>
            <Text style={{ fontFamily: serifFont, fontSize: 22, lineHeight: 24, color: txt, letterSpacing: -0.2 }}>Heute dran</Text>
            <Pressable onPress={() => onNavigate('list')}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: muted }}>alle ansehen</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 16, gap: 8 }}>
            {due.map((t) => (
              <TaskRow key={t.id} task={t} dark={dark} onComplete={onComplete} onUndo={onUndo} onOpen={onOpenTask} state={state} />
            ))}
            {due.length === 0 && (
              <Text style={{ paddingVertical: 32, paddingHorizontal: 20, textAlign: 'center', fontFamily: serifItalicFont, fontSize: 20, color: muted }}>
                alles erledigt — Zeit für Kaffee.
              </Text>
            )}
          </View>
        </>
      )}

      {/* Was Person gemacht hat (dismissable) */}
      {visibleFeed.length > 0 && other && (
        <View style={{ marginTop: 24 }}>
          <View style={{ paddingHorizontal: 24, paddingBottom: 10, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: serifFont, fontSize: 22, color: txt, letterSpacing: -0.2, lineHeight: 24 }}>
              Was <Text style={{ fontFamily: serifItalicFont }}>{other.display_name}</Text> gemacht hat
            </Text>
            <Pressable onPress={() => onNavigate('appreciate')}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: muted }}>mehr</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 16, gap: 6 }}>
            {visibleFeed.map((l, i) => {
              const task = tasks.find((t) => t.id === l.taskId)
              if (!task) return null
              const alreadyKudosd = myKudosTaskIds.has(task.id)
              return (
                <Pressable
                  key={i}
                  onPress={() => onOpenTask(task)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorderColor }}
                >
                  <TaskIconTile task={task} size={36} categories={categories} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: txt, letterSpacing: -0.1 }}>{l.taskName}</Text>
                    <Text style={{ fontSize: 11, color: muted, marginTop: 2 }}>{timeAgo(l.ts)} · {formatMetric(mode === 'punkte' ? l.pts : l.time, mode)}</Text>
                  </View>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); onKudos(other.id, task) }}
                    style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: alreadyKudosd ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <Heart size={16} filled={alreadyKudosd} color={me.color} />
                  </Pressable>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); dismissFeedItem(l.id) }}
                    style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    {Icons.close(12, muted)}
                  </Pressable>
                </Pressable>
              )
            })}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export function TaskRow({ task, dark, onComplete, onUndo, onOpen, state, hideFlame = false }: {
  task: Task & { last?: ComputedTaskLog }
  dark: boolean
  onComplete: (task: Task) => void
  onUndo?: (task: Task) => void
  onOpen?: (task: Task) => void
  state: AppState
  hideFlame?: boolean
}) {
  const streak = taskStreak(state.logs, task.id)
  const lastDoneBy = streak.member ? state.profiles.find((m) => m.id === streak.member) : null
  const cat = getCatToken(state.categories, task.category)
  const mode = state.household.scoring_mode
  const [pressed, setPressed] = useState(false)

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const done = state.logs.some(
    (l) => l.taskId === task.id && l.memberId === state.currentProfile.id && l.ts >= todayStart.getTime()
  )

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const lastTxt = task.last ? timeAgo(task.last.ts) : 'noch nie'

  const handle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (done) {
      onUndo?.(task)
      return
    }
    setTimeout(() => onComplete(task), 280)
  }

  return (
    <Pressable
      onPress={() => onOpen?.(task)}
      style={{
        backgroundColor: dark ? 'rgba(50,40,44,0.6)' : 'rgba(255,255,255,0.75)',
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        opacity: done ? 0.45 : 1,
        transform: [{ scale: done ? 0.98 : 1 }],
      }}
    >
      <TaskIconTile task={task} size={42} categories={state.categories} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: txt, letterSpacing: -0.15, textDecorationLine: done ? 'line-through' : 'none' }}>
          {task.name}
        </Text>
        <View style={{ marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            {mode === 'punkte' ? Icons.star(11, muted) : Icons.clock(11, muted)}
            <Text style={{ fontSize: 11.5, color: muted }}>{formatMetric(metricOfTask(task, mode), mode)}</Text>
          </View>
          <Text style={{ fontSize: 11.5, color: muted }}>·</Text>
          <Text style={{ fontSize: 11.5, color: muted }}>zuletzt {lastTxt}</Text>
          {!hideFlame && lastDoneBy && streak.count >= 2 && (
            <>
              <Text style={{ fontSize: 11.5, color: muted }}>·</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Flame size={10} color={lastDoneBy.color} />
                <Text style={{ fontSize: 11.5, color: lastDoneBy.color, fontWeight: '600' }}>
                  {lastDoneBy.display_name} ×{streak.count}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={handle}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: done ? 'rgb(138, 170, 138)' : cat.hue,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.92 : 1 }],
          flexShrink: 0,
        }}
      >
        {done ? Icons.undo(16, 'white') : Icons.check(18, 'white', 2.6)}
      </Pressable>
    </Pressable>
  )
}

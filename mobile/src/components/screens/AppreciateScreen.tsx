// 1:1 port of components/screens/AppreciateScreen.tsx (web).
import { useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Heart } from '@/components/shared/Icons'
import { categoryStreak, taskStreak, timeAgo, formatMetric, metricOfLog } from '@/lib/helpers'
import { serifFont, serifItalicFont } from '@/lib/fonts'
import { HistoryScreen } from './HistoryScreen'
import { InvitePrompt } from '@/components/shared/InvitePrompt'
import { useAppRefresh } from '@/components/AppShell'
import type { AppState, Task } from '@/lib/types'

interface AppreciateScreenProps {
  state: AppState
  onKudos: (toMemberId: string, task: Task, reason?: string) => void
  onOpenTask: (task: Task) => void
  showHistory: boolean
  onShowHistory: () => void
  onHideHistory: () => void
}

function alpha(rgb: string, a: number): string {
  // rgb(r, g, b) -> rgba(r, g, b, a)
  const m = rgb.match(/rgb\(([^)]+)\)/)
  if (!m) return rgb
  return `rgba(${m[1]}, ${a})`
}

export function AppreciateScreen({ state, onKudos, onOpenTask, showHistory, onShowHistory, onHideHistory }: AppreciateScreenProps) {
  const { logs, tasks, profiles, currentProfile, categories, kudos, dark } = state
  const mode = state.household.scoring_mode
  const me = currentProfile
  const other = profiles.find((p) => p.id !== me.id)
  const onRefresh = useAppRefresh()
  const [refreshing, setRefreshing] = useState(false)

  if (showHistory) {
    return <HistoryScreen state={state} onBack={onHideHistory} onOpenTask={onOpenTask} />
  }

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  const weekAgo = Date.now() - 7 * 86400000

  // Tasks the current user has already kudos'd this week
  const myKudosTaskIds = new Set(
    kudos
      .filter((k) => k.from_profile_id === me.id && k.task_id && new Date(k.created_at).getTime() >= weekAgo)
      .map((k) => k.task_id!)
  )

  // Track category kudos already sent this week: key = `${to_profile_id}:${category}`
  const myKudosCategoryKeys = new Set(
    kudos
      .filter((k) => k.from_profile_id === me.id && k.reason === 'category' && new Date(k.created_at).getTime() >= weekAgo)
      .map((k) => {
        const t = tasks.find((t) => t.id === k.task_id)
        return t ? `${k.to_profile_id}:${t.category}` : null
      })
      .filter((x): x is string => x !== null)
  )

  const catHighlights = categories
    .map((c) => {
      const cs = categoryStreak(logs, c.name)
      return { cat: c.name, ...cs }
    })
    .filter((h) => h.coverage >= 0.6 && h.member)
    .sort((a, b) => b.coverage - a.coverage)

  const allStreaks = tasks
    .map((t) => ({ task: t, streak: taskStreak(logs, t.id) }))
    .filter((x) => x.streak.count >= 3)

  const heroByMember: Record<string, typeof allStreaks[0]> = {}
  allStreaks.forEach((x) => {
    const uid = x.streak.member!
    if (!heroByMember[uid] || x.streak.count > heroByMember[uid].streak.count) {
      heroByMember[uid] = x
    }
  })

  const hero = other ? heroByMember[other.id] : null
  const recentAll = logs.filter((l) => l.ts >= weekAgo).slice(0, 6)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.75)'
  const cardBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const heartTrackBg = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} /> : undefined}
    >
      <View style={{ paddingHorizontal: 24, paddingTop: 60 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          diesen Monat
        </Text>
        <Text style={{ fontFamily: serifFont, fontSize: 40, lineHeight: 42, letterSpacing: -0.5, color: txt, marginTop: 4 }}>
          Wertschätzung
        </Text>
      </View>

      {profiles.length < 2 && (
        <InvitePrompt inviteCode={state.household.invite_code} dark={dark} />
      )}

      {/* Unsung hero card */}
      {hero && other && (
        <View style={[styles.heroCard, { backgroundColor: dark ? 'rgba(50,40,44,0.85)' : 'rgba(255,255,255,0.9)', borderColor: cardBorder }]}>
          <View
            pointerEvents="none"
            style={[
              styles.heroGlow,
              { backgroundColor: alpha(other.color, 0.22) },
            ]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar member={other} size={54} ring ringColor={other.color} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: other.color, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                Stille*r Held*in
              </Text>
              <Text style={{ fontFamily: serifFont, fontSize: 28, color: txt, letterSpacing: -0.3, lineHeight: 30.8, marginTop: 2 }}>
                {other.display_name}
              </Text>
            </View>
          </View>
          <Text style={{ marginTop: 16, fontFamily: serifFont, fontSize: 20, color: txt, lineHeight: 27, letterSpacing: -0.2 }}>
            Hat <Text style={{ fontStyle: 'italic' }}>{hero.task.name}</Text> die letzten{' '}
            <Text style={{ fontStyle: 'italic' }}>{hero.streak.count}×</Text> erledigt.
          </Text>
          <Pressable
            onPress={() => onKudos(other.id, hero.task, 'streak')}
            style={[
              styles.thankBtn,
              {
                backgroundColor: myKudosTaskIds.has(hero.task.id)
                  ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')
                  : txt,
              },
            ]}
          >
            <Heart
              size={14}
              filled={myKudosTaskIds.has(hero.task.id)}
              color={myKudosTaskIds.has(hero.task.id) ? me.color : (dark ? '#2A221E' : '#FDF8F1')}
            />
            <Text style={{
              fontSize: 13, fontWeight: '600',
              color: myKudosTaskIds.has(hero.task.id) ? txt : (dark ? '#2A221E' : '#FDF8F1'),
            }}>
              {myKudosTaskIds.has(hero.task.id) ? 'Gedankt' : 'Danke sagen'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Category leaderboard */}
      <View style={{ marginTop: 26 }}>
        <Text style={{ paddingHorizontal: 24, paddingBottom: 10, fontFamily: serifFont, fontSize: 22, color: txt, letterSpacing: -0.2 }}>
          Wer rockt was
        </Text>
        <View style={{ paddingHorizontal: 16, gap: 6 }}>
          {catHighlights.map((h) => {
            const m = profiles.find((mm) => mm.id === h.member)
            if (!m) return null
            const isOther = m.id !== me.id
            const representativeTask = (() => {
              const log = logs.filter((l) => l.cat === h.cat && l.memberId === h.member).sort((a, b) => b.ts - a.ts)[0]
              return tasks.find((t) => t.id === log?.taskId)
            })()
            const alreadyKudosd = myKudosCategoryKeys.has(`${m.id}:${h.cat}`)
            return (
              <View key={h.cat} style={[styles.leaderRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                <Avatar member={m} size={36} ring ringColor={m.color} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: txt, letterSpacing: -0.1 }}>{h.cat}</Text>
                  <Text style={{ marginTop: 3, fontFamily: serifFont, fontSize: 16, color: muted, letterSpacing: -0.1, lineHeight: 19.2 }}>
                    <Text style={{ fontStyle: 'italic' }}>{m.display_name}</Text> hat{' '}
                    <Text style={{ fontStyle: 'italic' }}>{Math.round(h.coverage * 100)}%</Text> gemacht
                  </Text>
                </View>
                {isOther && representativeTask && (
                  <Pressable
                    onPress={() => onKudos(m.id, representativeTask, 'category')}
                    style={[
                      styles.heartBtn,
                      {
                        backgroundColor: alreadyKudosd
                          ? (dark ? 'rgba(255,255,255,0.06)' : alpha(me.color, 0.12))
                          : heartTrackBg,
                      },
                    ]}
                  >
                    <Heart size={16} filled={alreadyKudosd} color={me.color} />
                  </Pressable>
                )}
              </View>
            )
          })}
          {catHighlights.length === 0 && (
            <Text style={{ padding: 20, textAlign: 'center', fontFamily: serifFont, fontSize: 18, color: muted, fontStyle: 'italic' }}>
              alles schön geteilt diesen Monat.
            </Text>
          )}
        </View>
      </View>

      {/* Diese Woche */}
      {recentAll.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <View style={{ paddingHorizontal: 24, paddingBottom: 10, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: serifFont, fontSize: 22, color: txt, letterSpacing: -0.2 }}>Diese Woche</Text>
            <Pressable onPress={onShowHistory}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: muted }}>mehr</Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 16, gap: 6 }}>
            {recentAll.map((l, i) => {
              const task = tasks.find((t) => t.id === l.taskId)
              const member = profiles.find((p) => p.id === l.memberId)
              if (!task || !member) return null
              const isOther = l.memberId !== me.id
              const alreadyKudosd = myKudosTaskIds.has(task.id)
              return (
                <Pressable key={i} onPress={() => onOpenTask(task)} style={[styles.recentRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                  <TaskIconTile task={task} size={36} categories={categories} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: txt, letterSpacing: -0.1 }}>
                      {l.taskName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Avatar member={member} size={16} />
                      <Text style={{ fontSize: 11, color: muted }}>
                        {member.display_name} · {timeAgo(l.ts)} · {formatMetric(metricOfLog(l, mode), mode)}
                      </Text>
                    </View>
                  </View>
                  {isOther && (
                    <Pressable
                      onPress={() => onKudos(member.id, task)}
                      style={[
                        styles.heartBtn,
                        {
                          backgroundColor: alreadyKudosd
                            ? (dark ? 'rgba(255,255,255,0.06)' : alpha(me.color, 0.12))
                            : heartTrackBg,
                        },
                      ]}
                    >
                      <Heart size={16} filled={alreadyKudosd} color={me.color} />
                    </Pressable>
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 22,
    marginHorizontal: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  thankBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heartBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
})

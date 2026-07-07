// 1:1 port of components/screens/HistoryScreen.tsx (web).
import { useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Icons } from '@/components/shared/Icons'
import { serifFont } from '@/lib/fonts'
import { formatMetric, metricOfLog } from '@/lib/helpers'
import type { AppState, Task } from '@/lib/types'

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

interface HistoryScreenProps {
  state: AppState
  onBack: () => void
  onOpenTask: (task: Task) => void
}

export function HistoryScreen({ state, onBack, onOpenTask }: HistoryScreenProps) {
  const { logs, tasks, profiles, currentProfile, categories, dark } = state
  const mode = state.household.scoring_mode
  const me = currentProfile
  const other = profiles.find((p) => p.id !== me.id)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const monthStart = new Date(year, month, 1).getTime()
  const monthEnd = new Date(year, month + 1, 1).getTime()
  const monthLogs = logs.filter((l) => l.ts >= monthStart && l.ts < monthEnd)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const canGoForward = !isCurrentMonth
  const canGoBack = logs.some((l) => l.ts < monthStart)

  const goBack = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const goForward = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const myTime = monthLogs.filter((l) => l.memberId === me.id).reduce((s, l) => s + metricOfLog(l, mode), 0)
  const otherTime = other ? monthLogs.filter((l) => l.memberId === other.id).reduce((s, l) => s + metricOfLog(l, mode), 0) : 0
  const totalTime = myTime + otherTime

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.75)'
  const cardBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const bg = 'rgb(253,248,241)'
  const trackBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const rowBorder = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          {Icons.back(18, txt)}
        </Pressable>
        <Text style={{ fontFamily: serifFont, fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 36 }}>
          Verlauf
        </Text>
      </View>

      {/* Month switcher */}
      <View style={[styles.switcher, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Pressable onPress={goBack} disabled={!canGoBack} style={[styles.roundBtn, { opacity: canGoBack ? 1 : 0.2 }]}>
          {Icons.back(18, txt)}
        </Pressable>
        <Text style={{ fontFamily: serifFont, fontSize: 22, color: txt, letterSpacing: -0.3 }}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={goForward} disabled={!canGoForward} style={[styles.roundBtn, { opacity: canGoForward ? 1 : 0.2 }]}>
          <View style={{ transform: [{ scaleX: -1 }] }}>{Icons.back(18, txt)}</View>
        </Pressable>
      </View>

      {/* Summary card */}
      <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {MONTHS[month]} · {monthLogs.length} Aufgaben
          </Text>
          <Text style={{ fontSize: 12, color: muted, fontWeight: '500' }}>{formatMetric(totalTime, mode)}</Text>
        </View>
        {totalTime > 0 ? (
          <>
            <View style={{ height: 10, borderRadius: 5, overflow: 'hidden', flexDirection: 'row', backgroundColor: trackBg }}>
              <View style={{ width: `${(myTime / totalTime) * 100}%`, backgroundColor: me.color }} />
              {other && <View style={{ width: `${(otherTime / totalTime) * 100}%`, backgroundColor: other.color }} />}
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
              <Text style={{ fontFamily: serifFont, fontSize: 18, lineHeight: 23.4, color: txt, letterSpacing: -0.2 }}>
                Ihr habt zusammen <Text style={{ fontStyle: 'italic' }}>{formatMetric(totalTime, mode)}</Text> {mode === 'punkte' ? 'gesammelt' : 'investiert'}.
              </Text>
            </View>
          </>
        ) : (
          <Text style={{ fontFamily: serifFont, fontSize: 16, color: muted, fontStyle: 'italic' }}>
            Keine Aufgaben in diesem Monat.
          </Text>
        )}
      </View>

      {/* Log list */}
      {monthLogs.length > 0 && (
        <View style={[styles.logList, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {monthLogs.map((l, i) => {
            const task = tasks.find((t) => t.id === l.taskId)
            const member = profiles.find((p) => p.id === l.memberId)
            if (!task || !member) return null
            const dateStr = new Date(l.ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
            return (
              <Pressable
                key={i}
                onPress={() => onOpenTask(task)}
                style={[
                  styles.logRow,
                  i > 0 ? { borderTopWidth: 1, borderTopColor: rowBorder } : null,
                ]}
              >
                <TaskIconTile task={task} size={36} categories={categories} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: txt, letterSpacing: -0.1 }}>
                    {l.taskName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Avatar member={member} size={14} />
                    <Text style={{ fontSize: 11, color: muted }}>{member.display_name} · {formatMetric(metricOfLog(l, mode), mode)}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: muted, flexShrink: 0 }}>{dateStr}</Text>
              </Pressable>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  switcher: {
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  roundBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryCard: {
    marginTop: 10,
    marginHorizontal: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  logList: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  logRow: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
})

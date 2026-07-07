import { useState } from 'react'
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native'
import { CategoryOrb } from '@/components/shared/CategoryOrb'
import { Flame, Icons } from '@/components/shared/Icons'
import { TaskRow } from './HomeScreen'
import { getCatToken } from '@/lib/tokens'
import { lastDoneByTask, categoryStreak } from '@/lib/helpers'
import { serifFont } from '@/lib/fonts'
import { useAppRefresh } from '@/components/AppShell'
import type { AppState, Task } from '@/lib/types'

interface TaskListScreenProps {
  state: AppState
  onComplete: (task: Task) => void
  onUndo: (task: Task) => void
  onOpenTask: (task: Task) => void
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskListScreen({ state, onComplete, onUndo, onOpenTask, onAddTask }: TaskListScreenProps) {
  const { tasks, logs, profiles, categories, dark } = state
  const [filter, setFilter] = useState('Alle')
  const catNames = categories.map((c) => c.name)
  const cats = ['Alle', ...catNames]
  const [refreshing, setRefreshing] = useState(false)
  const onAppRefresh = useAppRefresh()

  const lastDone = lastDoneByTask(logs)
  const grouped: Record<string, (Task & { last?: ReturnType<typeof lastDoneByTask>[string] })[]> = {}
  tasks.forEach((t) => {
    if (filter !== 'Alle' && t.category !== filter) return
    const last = lastDone[t.id]
    ;(grouped[t.category] = grouped[t.category] || []).push({ ...t, last })
  })

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'

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
      <View style={{ paddingTop: 60, paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 12, fontWeight: '500', color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {tasks.length} Aufgaben · {categories.length} Kategorien
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <Text style={{ fontFamily: serifFont, fontSize: 40, lineHeight: 42, letterSpacing: -0.5, color: txt }}>
            Aufgaben
          </Text>
          <Pressable
            onPress={onAddTask}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: txt, alignItems: 'center', justifyContent: 'center' }}
          >
            {Icons.plus(20, dark ? '#2A221E' : '#FDF8F1')}
          </Pressable>
        </View>
      </View>

      {tasks.length === 0 ? (
        <View style={{ marginTop: 22, marginHorizontal: 16, borderRadius: 24, backgroundColor: dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
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
          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 16 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4, gap: 6 }}
          >
            {cats.map((c) => {
              const active = filter === c
              const cat = c !== 'Alle' ? getCatToken(categories, c) : null
              return (
                <Pressable
                  key={c}
                  onPress={() => setFilter(c)}
                  style={{
                    flexShrink: 0,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: active ? (cat ? cat.hue : txt) : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {cat && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: active ? 'rgba(255,255,255,0.85)' : cat.hue }} />}
                  <Text style={{ fontSize: 13, fontWeight: '500', color: active ? '#fff' : (dark ? txt : 'rgba(0,0,0,0.65)'), letterSpacing: -0.1 }}>{c}</Text>
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Grouped tasks */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {Object.entries(grouped).map(([catName, catTasks]) => {
              const cat = getCatToken(categories, catName)
              const cs = categoryStreak(logs, catName)
              const streakMember = cs.member ? profiles.find((m) => m.id === cs.member) : null
              return (
                <View key={catName} style={{ marginBottom: 26 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4, paddingBottom: 10 }}>
                    <CategoryOrb cat={catName} size={22} categories={categories} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: txt, letterSpacing: -0.1 }}>{catName}</Text>
                    <Text style={{ fontSize: 12, color: muted }}>{catTasks.length}</Text>
                    {streakMember && cs.coverage > 0.6 && (
                      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Flame size={10} color={streakMember.color} />
                        <Text style={{ fontSize: 11, color: streakMember.color, fontWeight: '600' }}>{streakMember.display_name} · {Math.round(cs.coverage * 100)}%</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ gap: 6 }}>
                    {catTasks.map((t) => (
                      <TaskRow key={t.id} task={t} dark={dark} onComplete={onComplete} onUndo={onUndo} onOpen={onOpenTask} state={state} />
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        </>
      )}
    </ScrollView>
  )
}

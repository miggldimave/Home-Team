// 1:1 port of app/app/AppShell.tsx (web).
// Screens should implement pull-to-refresh with ScrollView's refreshControl
// (RefreshControl) + the useAppRefresh() context below — there is no
// PullToRefresh wrapper component on mobile (the web one reloads the page).
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, AppState as RNAppState } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { WarmBackdrop } from '@/components/shared/WarmBackdrop'
import { TabBar } from '@/components/shared/TabBar'
import { Petals } from '@/components/shared/Petals'
import { Hearts } from '@/components/shared/Hearts'
import { Heart } from '@/components/shared/Icons'
import { HomeScreen } from '@/components/screens/HomeScreen'
import { TaskListScreen } from '@/components/screens/TaskListScreen'
import { AppreciateScreen } from '@/components/screens/AppreciateScreen'
import { AnalyticsScreen } from '@/components/screens/AnalyticsScreen'
import { TaskDetailScreen } from '@/components/screens/TaskDetailScreen'
import { TaskFormScreen } from '@/components/screens/TaskFormScreen'
import { supabase } from '@/lib/supabase'
import { toComputedLog } from '@/lib/helpers'
import { serifFont, serifItalicFont } from '@/lib/fonts'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AppState, Category, ComputedTaskLog, Household, Kudos, Profile, Task } from '@/lib/types'

type TabKey = 'home' | 'list' | 'appreciate' | 'analytics'

interface Toast {
  kind: 'done' | 'kudos'
  taskName?: string
  time?: number
  name?: string
  color: string
}

interface AppShellProps {
  initialLogs: ComputedTaskLog[]
  tasks: Task[]
  profiles: Profile[]
  household: Household
  currentProfile: Profile
  categories: Category[]
  initialKudos: Kudos[]
  householdId: string
  /** Mobile-only: full data refetch, exposed to screens via useAppRefresh(). */
  onRefresh?: () => Promise<void>
}

const RefreshContext = createContext<(() => Promise<void>) | null>(null)
export function useAppRefresh() {
  return useContext(RefreshContext)
}

export function AppShell({ initialLogs, tasks: initialTasks, profiles, household, currentProfile, categories, initialKudos, householdId, onRefresh }: AppShellProps) {
  const [screen, setScreen] = useState<TabKey>('home')
  const [openTask, setOpenTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTask, setAddingTask] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [logs, setLogs] = useState<ComputedTaskLog[]>(initialLogs)
  const [kudos, setKudos] = useState<Kudos[]>(initialKudos)
  const [kudosDismissedAt, setKudosDismissedAt] = useState(0)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem('kudosDismissedAt').then((v) => {
      const stored = parseInt(v ?? '0', 10)
      if (stored) setKudosDismissedAt(stored)
    })
  }, [])
  const [showPetals, setShowPetals] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [dark] = useState(false)
  const pendingDeletions = useRef<Set<string>>(new Set())

  // Aktuelle Aufgaben-Map ohne Neu-Subscription bei jeder Änderung bereithalten
  const taskMapRef = useRef<Record<string, Task>>({})
  useEffect(() => {
    taskMapRef.current = Object.fromEntries(tasks.map((t) => [t.id, t]))
  }, [tasks])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const connect = () => {
      if (channel) return
      channel = supabase
        .channel('realtime_all')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_logs', filter: `household_id=eq.${householdId}` }, (payload) => {
          const log = payload.new as { id: string; task_id: string; profile_id: string; household_id: string; completed_at: string }
          if (log.profile_id === currentProfile.id) return
          const task = taskMapRef.current[log.task_id]
          if (!task) return
          setLogs((prev) => [toComputedLog(log, task), ...prev])
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kudos', filter: `household_id=eq.${householdId}` }, (payload) => {
          const k = payload.new as Kudos
          if (k.from_profile_id === currentProfile.id) return // already optimistic
          setKudos((prev) => [k, ...prev])
        })
        .subscribe()
    }

    const disconnect = () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }

    // WebSocket im Hintergrund trennen — spart Akku (Heartbeats/Reconnects) auf iOS
    const subscription = RNAppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') disconnect()
      else if (nextState === 'active') connect()
    })

    if (RNAppState.currentState === 'active') connect()

    return () => {
      subscription.remove()
      disconnect()
    }
  }, [householdId, currentProfile.id])

  const handleComplete = async (task: Task) => {
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticLog: ComputedTaskLog = {
      id: optimisticId,
      taskId: task.id, taskName: task.name, cat: task.category,
      pts: task.pts, time: task.time_minutes, memberId: currentProfile.id, ts: Date.now(),
    }
    setLogs((prev) => [optimisticLog, ...prev])
    setShowPetals(true)
    setTimeout(() => setShowPetals(false), 2500)
    setToast({ kind: 'done', taskName: task.name, time: task.time_minutes, color: '#888' })
    setTimeout(() => setToast(null), 2600)
    const { data } = await supabase
      .from('task_logs')
      .insert({ task_id: task.id, profile_id: currentProfile.id, household_id: householdId })
      .select('id')
      .single()
    if (data?.id) {
      if (pendingDeletions.current.has(optimisticId)) {
        // User undid before the insert resolved — delete the newly created row
        pendingDeletions.current.delete(optimisticId)
        await supabase.from('task_logs').delete().eq('id', data.id)
      } else {
        // Replace the optimistic ID with the real DB ID so future deletes work
        setLogs((prev) => prev.map((l) => l.id === optimisticId ? { ...l, id: data.id } : l))
      }
    }
  }

  const handleDeleteLog = async (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId))
    if (logId.startsWith('optimistic-')) {
      // Insert still in flight — mark for deletion when it resolves
      pendingDeletions.current.add(logId)
    } else {
      await supabase.from('task_logs').delete().eq('id', logId)
    }
  }

  const handleUndo = async (task: Task) => {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const logToRemove = logs.find(
      (l) => l.taskId === task.id && l.memberId === currentProfile.id && l.ts >= todayStart.getTime()
    )
    if (!logToRemove) return
    handleDeleteLog(logToRemove.id)
  }

  const handleKudos = async (toMemberId: string, task: Task, reason?: string) => {
    const toMember = profiles.find((p) => p.id === toMemberId)
    const optimisticKudos: Kudos = {
      id: `optimistic-${Date.now()}`,
      from_profile_id: currentProfile.id,
      to_profile_id: toMemberId,
      task_id: task.id,
      household_id: householdId,
      created_at: new Date().toISOString(),
      reason: reason ?? null,
    }
    setKudos((prev) => [optimisticKudos, ...prev])
    setShowHearts(true)
    setTimeout(() => setShowHearts(false), 2200)
    setToast({ kind: 'kudos', name: toMember?.display_name, color: toMember?.color ?? 'rgb(215,128,96)' })
    setTimeout(() => setToast(null), 2600)
    await supabase.from('kudos').insert({ from_profile_id: currentProfile.id, to_profile_id: toMemberId, task_id: task.id, household_id: householdId, reason: reason ?? null })
  }

  const handleTaskSaved = (task: Task) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => t.id === task.id ? task : t))
      if (openTask?.id === task.id) setOpenTask(task)
    } else {
      setTasks((prev) => [...prev, task])
    }
    setEditingTask(null)
    setAddingTask(false)
    setScreen('list')
  }

  const handleDeleteTask = async (taskId: string) => {
    // Web uses the deleteTask server action; mobile deletes directly (RLS
    // DELETE policy on tasks exists — migration 20260706214754).
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) return
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    if (openTask?.id === taskId) setOpenTask(null)
  }

  const handleDismissKudos = () => {
    const now = Date.now()
    setKudosDismissedAt(now)
    AsyncStorage.setItem('kudosDismissedAt', String(now))
  }

  const state: AppState = { logs, tasks, profiles, household, currentProfile, categories, kudos, dark }

  const isFormOpen = addingTask || editingTask !== null
  const showTabBar = !openTask && !isFormOpen && !showHistory

  const renderScreen = () => {
    if (isFormOpen) {
      return (
        <TaskFormScreen
          categories={categories}
          scoringMode={household.scoring_mode}
          editTask={editingTask ?? undefined}
          onBack={() => { setAddingTask(false); setEditingTask(null) }}
          onSaved={handleTaskSaved}
        />
      )
    }
    if (openTask) {
      return (
        <TaskDetailScreen
          state={state}
          task={openTask}
          onComplete={handleComplete}
          onUndo={handleUndo}
          onDeleteLog={handleDeleteLog}
          onBack={() => setOpenTask(null)}
          onKudos={handleKudos}
          onEdit={(task) => setEditingTask(task)}
          onDelete={handleDeleteTask}
        />
      )
    }
    if (screen === 'home') return <HomeScreen state={state} onComplete={handleComplete} onUndo={handleUndo} onNavigate={(s) => setScreen(s as TabKey)} onKudos={handleKudos} onOpenTask={setOpenTask} onAddTask={() => setAddingTask(true)} kudosDismissedAt={kudosDismissedAt} onDismissKudos={handleDismissKudos} />
    if (screen === 'list') return <TaskListScreen state={state} onComplete={handleComplete} onUndo={handleUndo} onOpenTask={setOpenTask} onAddTask={() => setAddingTask(true)} onEditTask={(task) => setEditingTask(task)} onDeleteTask={handleDeleteTask} />
    if (screen === 'appreciate') return <AppreciateScreen state={state} onKudos={handleKudos} onOpenTask={setOpenTask} showHistory={showHistory} onShowHistory={() => setShowHistory(true)} onHideHistory={() => setShowHistory(false)} />
    if (screen === 'analytics') return <AnalyticsScreen state={state} />
    return null
  }

  return (
    <RefreshContext.Provider value={onRefresh ?? null}>
      <View style={styles.root}>
        <WarmBackdrop dark={dark}>
          <View style={styles.inner}>
            {renderScreen()}
            {showTabBar && (
              <TabBar activeTab={screen} onNavigate={(tab) => setScreen(tab)} dark={dark} />
            )}
            <Petals active={showPetals} />
            <Hearts active={showHearts} color={currentProfile.color} />

            {toast && (
              <Animated.View
                entering={FadeInDown.duration(350)}
                style={[
                  styles.toast,
                  {
                    backgroundColor: dark ? 'rgba(255,255,255,0.95)' : '#2A221E',
                  },
                ]}
              >
                {toast.kind === 'done' ? (
                  <>
                    <View style={styles.doneDot} />
                    <Text numberOfLines={1} style={[styles.toastText, { color: dark ? '#2A221E' : '#FDF8F1' }]}>
                      {toast.taskName} · erledigt
                    </Text>
                  </>
                ) : (
                  <>
                    <Heart size={14} filled color={toast.color} />
                    <Text numberOfLines={1} style={{ fontFamily: serifFont, fontSize: 15, color: dark ? '#2A221E' : '#FDF8F1' }}>
                      Danke an <Text style={{ fontFamily: serifItalicFont }}>{toast.name}</Text>
                    </Text>
                  </>
                )}
              </Animated.View>
            )}
          </View>
        </WarmBackdrop>
      </View>
    </RefreshContext.Provider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgb(248,240,230)',
  },
  inner: { flex: 1, position: 'relative', overflow: 'hidden' },
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 150,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastText: { fontSize: 13, fontWeight: '500' },
  doneDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgb(138, 170, 138)', flexShrink: 0 },
})

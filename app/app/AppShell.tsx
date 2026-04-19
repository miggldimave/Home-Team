'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase-client'
import { toComputedLog } from '@/lib/helpers'
import type { Household, Profile, Task, Category, ComputedTaskLog, AppState } from '@/lib/types'

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
  householdId: string
}

export function AppShell({ initialLogs, tasks, profiles, household, currentProfile, categories, householdId }: AppShellProps) {
  const router = useRouter()
  const [screen, setScreen] = useState<TabKey>('home')
  const [openTask, setOpenTask] = useState<Task | null>(null)
  const [logs, setLogs] = useState<ComputedTaskLog[]>(initialLogs)
  const [showPetals, setShowPetals] = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [dark] = useState(false)

  const supabase = createClient()

  // Realtime subscription for partner's task completions
  useEffect(() => {
    const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]))
    const channel = supabase
      .channel('task_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_logs',
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const log = payload.new as { id: string; task_id: string; profile_id: string; household_id: string; completed_at: string }
          if (log.profile_id === currentProfile.id) return // already added optimistically
          const task = taskMap[log.task_id]
          if (!task) return
          const computed = toComputedLog(log, task)
          setLogs((prev) => [computed, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [householdId, currentProfile.id, tasks])

  const handleComplete = async (task: Task) => {
    const optimisticLog: ComputedTaskLog = {
      id: `optimistic-${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      cat: task.category,
      pts: task.pts,
      time: task.time_minutes,
      memberId: currentProfile.id,
      ts: Date.now(),
    }
    setLogs((prev) => [optimisticLog, ...prev])
    setShowPetals(true)
    setTimeout(() => setShowPetals(false), 2500)
    setToast({ kind: 'done', taskName: task.name, time: task.time_minutes, color: '#888' })
    setTimeout(() => setToast(null), 2600)
    if (openTask?.id === task.id) setOpenTask(null)

    await supabase.from('task_logs').insert({
      task_id: task.id,
      profile_id: currentProfile.id,
      household_id: householdId,
    })
  }

  const handleKudos = async (toMemberId: string, task: Task) => {
    const toMember = profiles.find((p) => p.id === toMemberId)
    setShowHearts(true)
    setTimeout(() => setShowHearts(false), 2200)
    setToast({ kind: 'kudos', name: toMember?.display_name, color: toMember?.color ?? 'rgb(215,128,96)' })
    setTimeout(() => setToast(null), 2600)

    await supabase.from('kudos').insert({
      from_profile_id: currentProfile.id,
      to_profile_id: toMemberId,
      task_id: task.id,
      household_id: householdId,
    })
  }

  const state: AppState = {
    logs,
    tasks,
    profiles,
    household,
    currentProfile,
    categories,
    dark,
  }

  const txt = dark ? '#F2ECE4' : '#2A221E'

  const renderScreen = () => {
    if (openTask) {
      return (
        <TaskDetailScreen
          state={state}
          task={openTask}
          onComplete={handleComplete}
          onBack={() => setOpenTask(null)}
          onKudos={handleKudos}
        />
      )
    }
    if (screen === 'home') return <HomeScreen state={state} onComplete={handleComplete} onNavigate={(s) => setScreen(s as TabKey)} onKudos={handleKudos} onOpenTask={setOpenTask}/>
    if (screen === 'list') return <TaskListScreen state={state} onComplete={handleComplete} onOpenTask={setOpenTask} onAddTask={() => router.push('/tasks/new')}/>
    if (screen === 'appreciate') return <AppreciateScreen state={state} onKudos={handleKudos}/>
    if (screen === 'analytics') return <AnalyticsScreen state={state}/>
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      background: dark
        ? 'radial-gradient(ellipse at top, rgb(34,26,30) 0%, rgb(14,12,16) 70%)'
        : 'radial-gradient(ellipse at top, rgb(248,240,230) 0%, rgb(232,222,210) 70%)',
    }}>
      {/* Mobile container */}
      <div style={{
        width: '100%',
        maxWidth: 430,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <WarmBackdrop dark={dark}>
          <div style={{ position: 'relative', height: '100vh', overflow: 'auto' }}>
            {renderScreen()}
            {!openTask && (
              <TabBar
                activeTab={screen}
                onNavigate={(tab) => setScreen(tab)}
                dark={dark}
              />
            )}
            <Petals active={showPetals}/>
            <Hearts active={showHearts} color={currentProfile.color}/>

            {toast && (
              <div style={{
                position: 'fixed',
                top: 60,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 150,
                background: dark ? 'rgba(255,255,255,0.95)' : '#2A221E',
                color: dark ? '#2A221E' : '#FDF8F1',
                padding: '10px 16px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                animation: 'toastIn 0.35s cubic-bezier(.2,.8,.2,1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                maxWidth: '85%',
              }}>
                {toast.kind === 'done' ? (
                  <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgb(138, 170, 138)', flexShrink: 0 }}/>
                    <span>{toast.taskName} · erledigt</span>
                  </>
                ) : (
                  <>
                    <Heart size={14} filled color={toast.color}/>
                    <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 15 }}>
                      Danke an <em>{toast.name}</em>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </WarmBackdrop>
      </div>
    </div>
  )
}

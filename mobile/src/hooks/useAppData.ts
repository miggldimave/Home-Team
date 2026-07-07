import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toComputedLog } from '@/lib/helpers'
import type { Category, ComputedTaskLog, Household, Kudos, Profile, Task } from '@/lib/types'

// Client-side port of the server-side data loading in app/app/page.tsx (web).
// The web app reads via a service-role client; mobile reads as the authenticated
// user through RLS (all required SELECT policies exist).
export interface AppData {
  loading: boolean
  error: string | null
  notAuthenticated: boolean
  needsOnboarding: boolean
  household: Household | null
  currentProfile: Profile | null
  profiles: Profile[]
  tasks: Task[]
  categories: Category[]
  logs: ComputedTaskLog[]
  kudos: Kudos[]
  householdId: string | null
  refetch: () => Promise<void>
}

export function useAppData(): AppData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notAuthenticated, setNotAuthenticated] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [household, setHousehold] = useState<Household | null>(null)
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [logs, setLogs] = useState<ComputedTaskLog[]>([])
  const [kudos, setKudos] = useState<Kudos[]>([])
  const [householdId, setHouseholdId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setNotAuthenticated(true)
        setLoading(false)
        return
      }
      setNotAuthenticated(false)

      const profileRes = await supabase.from('profiles').select().eq('id', user.id).single()
      const profile = profileRes.data as Profile | null
      if (!profile || !profile.household_id) {
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }
      setNeedsOnboarding(false)
      setCurrentProfile(profile)
      const hhId = profile.household_id
      setHouseholdId(hhId)

      const [householdRes, allProfilesRes, tasksRes, logsRes, categoriesRes, kudosRes] = await Promise.all([
        supabase.from('households').select().eq('id', hhId).single(),
        supabase.from('profiles').select().eq('household_id', hhId),
        supabase.from('tasks').select().eq('household_id', hhId).order('category').order('name'),
        supabase
          .from('task_logs')
          .select()
          .eq('household_id', hhId)
          .order('completed_at', { ascending: false })
          .limit(5000),
        supabase.from('categories').select().eq('household_id', hhId).order('name'),
        supabase
          .from('kudos')
          .select()
          .eq('household_id', hhId)
          .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
          .order('created_at', { ascending: false })
          .limit(200),
      ])

      const hh = householdRes.data as Household | null
      if (!hh) {
        setNeedsOnboarding(true)
        setLoading(false)
        return
      }
      setHousehold(hh)

      const loadedTasks = (tasksRes.data ?? []) as Task[]
      setTasks(loadedTasks)
      setProfiles((allProfilesRes.data ?? []) as Profile[])
      setCategories((categoriesRes.data ?? []) as Category[])
      setKudos((kudosRes.data ?? []) as Kudos[])

      const taskMap = Object.fromEntries(loadedTasks.map((t) => [t.id, t]))
      const computedLogs: ComputedTaskLog[] = ((logsRes.data ?? []) as {
        id: string; task_id: string; profile_id: string; household_id: string; completed_at: string
      }[])
        .map((log) => {
          const task = taskMap[log.task_id]
          if (!task) return null
          return toComputedLog(log, task)
        })
        .filter((l): l is ComputedTaskLog => l !== null)
      setLogs(computedLogs)

      setLoading(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden.')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return {
    loading,
    error,
    notAuthenticated,
    needsOnboarding,
    household,
    currentProfile,
    profiles,
    tasks,
    categories,
    logs,
    kudos,
    householdId,
    refetch: load,
  }
}

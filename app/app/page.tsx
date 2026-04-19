import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { AppShell } from './AppShell'
import { toComputedLog } from '@/lib/helpers'
import type { ComputedTaskLog } from '@/lib/types'

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()

  const profileRes = await admin.from('profiles').select().eq('id', user.id).single()
  const currentProfile = profileRes.data
  if (!currentProfile) redirect('/onboarding')
  if (!currentProfile.household_id) redirect('/onboarding')

  const householdId = currentProfile.household_id

  const [householdRes, allProfilesRes, tasksRes, logsRes, categoriesRes] = await Promise.all([
    admin.from('households').select().eq('id', householdId).single(),
    admin.from('profiles').select().eq('household_id', householdId),
    admin.from('tasks').select().eq('household_id', householdId).order('category').order('name'),
    admin
      .from('task_logs')
      .select()
      .eq('household_id', householdId)
      .gte('completed_at', new Date(Date.now() - 90 * 86400000).toISOString())
      .order('completed_at', { ascending: false })
      .limit(500),
    admin.from('categories').select().eq('household_id', householdId).order('name'),
  ])

  const household = householdRes.data
  if (!household) redirect('/onboarding')

  const tasks = tasksRes.data ?? []
  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t]))

  const computedLogs: ComputedTaskLog[] = (logsRes.data ?? [])
    .map((log) => {
      const task = taskMap[log.task_id]
      if (!task) return null
      return toComputedLog(log, task)
    })
    .filter((l): l is ComputedTaskLog => l !== null)

  return (
    <AppShell
      initialLogs={computedLogs}
      tasks={tasks}
      profiles={allProfilesRes.data ?? []}
      household={household}
      currentProfile={currentProfile}
      categories={categoriesRes.data ?? []}
      householdId={householdId}
    />
  )
}

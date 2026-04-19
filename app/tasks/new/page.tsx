import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { AddTaskForm } from './AddTaskForm'

export default async function NewTaskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const profileRes = await admin.from('profiles').select('household_id').eq('id', user.id).single()
  const householdId = profileRes.data?.household_id
  if (!householdId) redirect('/onboarding')

  const [categoriesRes, householdRes] = await Promise.all([
    admin.from('categories').select().eq('household_id', householdId).order('name'),
    admin.from('households').select('scoring_mode').eq('id', householdId).single(),
  ])

  return (
    <AddTaskForm
      categories={categoriesRes.data ?? []}
      scoringMode={householdRes.data?.scoring_mode ?? 'punkte'}
    />
  )
}

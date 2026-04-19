import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { SettingsShell } from './SettingsShell'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const profileRes = await admin.from('profiles').select().eq('id', user.id).single()
  const currentProfile = profileRes.data
  if (!currentProfile || !currentProfile.household_id) redirect('/onboarding')

  const householdRes = await admin.from('households').select().eq('id', currentProfile.household_id).single()
  const household = householdRes.data
  if (!household) redirect('/onboarding')

  return <SettingsShell profile={currentProfile} household={household} />
}

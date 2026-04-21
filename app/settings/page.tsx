import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { SettingsShell } from './SettingsShell'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('*, households(*)')
    .eq('id', user.id)
    .single()

  if (!data || !data.household_id) redirect('/onboarding')

  const { households, ...profileFields } = data as typeof data & { households: import('@/lib/types').Household | null }
  if (!households) redirect('/onboarding')

  return <SettingsShell profile={profileFields} household={households} />
}

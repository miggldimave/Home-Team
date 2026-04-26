'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { TASK_SUGGESTIONS, SUGGESTION_CATEGORY_COLORS } from '@/lib/tokens'

export async function createHouseholdWithTasks(formData: FormData, selectedTaskNames: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const householdName = formData.get('householdName') as string
  const scoringMode = formData.get('scoringMode') as 'punkte' | 'zeit'
  const displayName = formData.get('displayName') as string
  const color = formData.get('color') as string
  const bgColor = formData.get('bgColor') as string

  const { data: household, error: hhError } = await admin
    .from('households')
    .insert({ name: householdName, scoring_mode: scoringMode })
    .select()
    .single()

  if (hhError || !household) {
    return { error: hhError?.message ?? 'Fehler beim Erstellen.' }
  }

  if (selectedTaskNames.length > 0) {
    const selectedTasks = TASK_SUGGESTIONS.filter((t) => selectedTaskNames.includes(t.name))

    const uniqueCategories = [...new Set(selectedTasks.map((t) => t.category))]
    await admin.from('categories').insert(
      uniqueCategories.map((name) => ({
        name,
        household_id: household.id,
        ...(SUGGESTION_CATEGORY_COLORS[name] ?? { hue: 'rgb(168,146,196)', soft: 'rgb(238,230,246)', deep: 'rgb(78,58,106)' }),
      }))
    )

    await admin.from('tasks').insert(
      selectedTasks.map((t) => ({ ...t, household_id: household.id }))
    )
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: user.id,
    household_id: household.id,
    display_name: displayName,
    initial: displayName[0].toUpperCase(),
    color,
    bg_color: bgColor,
  })

  if (profileError) return { error: profileError.message }

  redirect('/app')
}

export async function joinHousehold(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const inviteCode = (formData.get('inviteCode') as string).trim().toLowerCase()
  const displayName = formData.get('displayName') as string
  const color = formData.get('color') as string
  const bgColor = formData.get('bgColor') as string

  const { data: household, error: hhError } = await admin
    .from('households')
    .select()
    .eq('invite_code', inviteCode)
    .single()

  if (hhError || !household) {
    return { error: 'Einladungscode nicht gefunden.' }
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: user.id,
    household_id: household.id,
    display_name: displayName,
    initial: displayName[0].toUpperCase(),
    color,
    bg_color: bgColor,
  })

  if (profileError) return { error: profileError.message }

  redirect('/app')
}

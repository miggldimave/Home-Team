'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const profileRes = await admin.from('profiles').select('household_id').eq('id', user.id).single()
  const householdId = profileRes.data?.household_id
  if (!householdId) return { error: 'Kein Haushalt gefunden.' }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const icon = formData.get('icon') as string
  const pts = parseInt(formData.get('pts') as string) || 5
  const time_minutes = parseInt(formData.get('time_minutes') as string) || 15
  const cycle_days = parseInt(formData.get('cycle_days') as string) || 7

  const { error } = await admin.from('tasks').insert({
    household_id: householdId,
    name,
    category,
    icon,
    pts,
    time_minutes,
    cycle_days,
  })

  if (error) return { error: error.message }
  redirect('/app')
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const profileRes = await admin.from('profiles').select('household_id').eq('id', user.id).single()
  const householdId = profileRes.data?.household_id
  if (!householdId) return { error: 'Kein Haushalt gefunden.' }

  const name = formData.get('name') as string
  const hue = formData.get('hue') as string
  const soft = formData.get('soft') as string
  const deep = formData.get('deep') as string

  const { data, error } = await admin.from('categories').insert({
    household_id: householdId,
    name,
    hue,
    soft,
    deep,
  }).select().single()

  if (error) return { error: error.message }
  return { success: true, category: data }
}

'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import type { Task } from '@/lib/types'

async function getHouseholdId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const res = await admin.from('profiles').select('household_id').eq('id', user.id).single()
  return { householdId: res.data?.household_id ?? null }
}

export async function createTask(formData: FormData): Promise<{ error?: string; task?: Task }> {
  const { householdId } = await getHouseholdId()
  if (!householdId) return { error: 'Kein Haushalt gefunden.' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('tasks').insert({
    household_id: householdId,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    icon: formData.get('icon') as string,
    pts: parseInt(formData.get('pts') as string) || 5,
    time_minutes: parseInt(formData.get('time_minutes') as string) || 15,
    cycle_days: parseInt(formData.get('cycle_days') as string) || 7,
  }).select().single()

  if (error) return { error: error.message }
  return { task: data as Task }
}

export async function updateTask(taskId: string, formData: FormData): Promise<{ error?: string; task?: Task }> {
  const { householdId } = await getHouseholdId()
  if (!householdId) return { error: 'Kein Haushalt gefunden.' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('tasks').update({
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    icon: formData.get('icon') as string,
    pts: parseInt(formData.get('pts') as string) || 5,
    time_minutes: parseInt(formData.get('time_minutes') as string) || 15,
    cycle_days: parseInt(formData.get('cycle_days') as string) || 7,
  }).eq('id', taskId).eq('household_id', householdId).select().single()

  if (error) return { error: error.message }
  return { task: data as Task }
}

export async function deleteTask(taskId: string): Promise<{ error?: string }> {
  const { householdId } = await getHouseholdId()
  if (!householdId) return { error: 'Kein Haushalt gefunden.' }

  const admin = createAdminClient()
  const { error } = await admin.from('tasks').delete().eq('id', taskId).eq('household_id', householdId)
  if (error) return { error: error.message }
  return {}
}

export async function createCategory(formData: FormData) {
  const { householdId } = await getHouseholdId()
  if (!householdId) return { error: 'Kein Haushalt gefunden.' }

  const admin = createAdminClient()
  const { data, error } = await admin.from('categories').insert({
    household_id: householdId,
    name: formData.get('name') as string,
    hue: formData.get('hue') as string,
    soft: formData.get('soft') as string,
    deep: formData.get('deep') as string,
  }).select().single()

  if (error) return { error: error.message }
  return { success: true, category: data }
}

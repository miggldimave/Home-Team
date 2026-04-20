'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const displayName = formData.get('displayName') as string
  const color = formData.get('color') as string
  const bgColor = formData.get('bgColor') as string

  const { error } = await admin.from('profiles').update({
    display_name: displayName,
    initial: displayName[0].toUpperCase(),
    color,
    bg_color: bgColor,
  }).eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateHousehold(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const name = formData.get('name') as string
  const householdId = formData.get('householdId') as string
  const scoringMode = formData.get('scoring_mode') as string

  const { error } = await admin.from('households').update({ name, scoring_mode: scoringMode }).eq('id', householdId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (signInError) return { error: 'Aktuelles Passwort ist falsch.' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'Keine Datei ausgewählt.' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const admin = createAdminClient()
  const { error: uploadError } = await admin.storage
    .from('avatars')
    .upload(path, bytes, { contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = admin.storage.from('avatars').getPublicUrl(path)

  const { error } = await admin.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
  if (error) return { error: error.message }

  return { success: true, avatarUrl: publicUrl }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

// 1:1 port of app/settings/page.tsx + SettingsShell.tsx (web).
// Web loads profile+household server-side via the admin client; mobile loads
// as the authenticated user through RLS (SELECT policies on profiles/households exist).
import { useCallback, useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { SettingsScreen } from '@/components/screens/SettingsScreen'
import type { Household, Profile } from '@/lib/types'

export default function SettingsRoute() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [household, setHousehold] = useState<Household | null>(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/auth/login')
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*, households(*)')
      .eq('id', user.id)
      .single()

    if (!data || !data.household_id || !data.households) {
      router.replace('/onboarding')
      return
    }
    const { households, ...profileFields } = data as typeof data & { households: Household | null }
    setProfile(profileFields as Profile)
    setHousehold(households as Household)
    setLoading(false)
  }, [router])

  useEffect(() => {
    load()
  }, [load])

  if (loading || !profile || !household) {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgb(253, 248, 241)', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#2A221E" />
      </View>
    )
  }

  return (
    <SettingsScreen
      profile={profile}
      household={household}
      onBack={() => router.back()}
      onSignedOut={() => { setProfile(null); setHousehold(null) }}
    />
  )
}

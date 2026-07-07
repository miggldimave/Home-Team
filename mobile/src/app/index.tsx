// Root route — client-side mirror of middleware.ts (web):
//   not authenticated            -> /auth/login
//   authenticated, no household  -> /onboarding
//   authenticated + household    -> AppShell
import { View, ActivityIndicator } from 'react-native'
import { Redirect } from 'expo-router'
import { AppShell } from '@/components/AppShell'
import { useAppData } from '@/hooks/useAppData'

export default function Index() {
  const data = useAppData()

  if (data.notAuthenticated) return <Redirect href="/auth/login" />
  if (data.needsOnboarding) return <Redirect href="/onboarding" />

  if (data.loading || !data.household || !data.currentProfile || !data.householdId) {
    return (
      <View style={{ flex: 1, backgroundColor: 'rgb(253, 248, 241)', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#2A221E" />
      </View>
    )
  }

  return (
    <AppShell
      initialLogs={data.logs}
      tasks={data.tasks}
      profiles={data.profiles}
      household={data.household}
      currentProfile={data.currentProfile}
      categories={data.categories}
      initialKudos={data.kudos}
      householdId={data.householdId}
      onRefresh={data.refetch}
    />
  )
}

// Mobile counterpart of app/auth/callback/route.ts (web).
// Supabase e-mail links open the app via the deep link kudo://auth/callback
// carrying either ?code=... (PKCE) or #access_token=...&refresh_token=...&type=...
// (implicit flow). Since detectSessionInUrl is disabled in the RN client, we
// parse the URL ourselves, establish the session and forward to `next`.
import { useEffect, useRef, useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'

function parseParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const collect = (str?: string) => {
    if (!str) return
    for (const pair of str.split('&')) {
      const [k, v] = pair.split('=')
      if (k && v !== undefined) params[decodeURIComponent(k)] = decodeURIComponent(v)
    }
  }
  const hashIndex = url.indexOf('#')
  const queryIndex = url.indexOf('?')
  if (queryIndex !== -1) collect(url.slice(queryIndex + 1, hashIndex === -1 ? undefined : hashIndex))
  if (hashIndex !== -1) collect(url.slice(hashIndex + 1))
  return params
}

export default function AuthCallback() {
  const router = useRouter()
  const url = Linking.useLinkingURL()
  const initialUrl = useRef<Promise<string | null>>(Linking.getInitialURL())
  const [failed, setFailed] = useState(false)
  const handled = useRef(false)

  useEffect(() => {
    const run = async () => {
      const raw = url ?? (await initialUrl.current)
      if (!raw || handled.current) return
      handled.current = true

      const params = parseParams(raw)
      const next = params['next'] ?? '/'

      try {
        if (params['code']) {
          const { error } = await supabase.auth.exchangeCodeForSession(params['code'])
          if (error) throw error
        } else if (params['access_token'] && params['refresh_token']) {
          const { error } = await supabase.auth.setSession({
            access_token: params['access_token'],
            refresh_token: params['refresh_token'],
          })
          if (error) throw error
        } else {
          throw new Error('Kein Auth-Code im Link gefunden.')
        }
        if (params['type'] === 'recovery' || next === '/auth/reset-password') {
          router.replace('/auth/reset-password')
        } else if (next === '/onboarding') {
          router.replace('/onboarding')
        } else {
          router.replace('/')
        }
      } catch {
        setFailed(true)
        setTimeout(() => router.replace('/auth/login'), 1500)
      }
    }
    run()
  }, [url, router])

  return (
    <View style={styles.screen}>
      {failed ? (
        <Text style={styles.text}>Link ungültig — weiter zum Login…</Text>
      ) : (
        <>
          <ActivityIndicator color="#2A221E" />
          <Text style={styles.text}>Link wird überprüft…</Text>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'rgb(253, 248, 241)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: { color: 'rgba(42,34,30,0.45)', fontSize: 14 },
})

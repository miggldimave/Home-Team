// 1:1 port of app/auth/reset-password/page.tsx (web)
import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { serifFont } from '@/lib/fonts'

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY after the recovery deep link session is set
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also handle the case where the session is already set (e.g. via the callback route)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/')
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logo}>Kudo</Text>
            <Text style={styles.subtitle}>Neues Passwort festlegen</Text>
          </View>

          {!ready ? (
            <Text style={{ textAlign: 'center', color: 'rgba(42,34,30,0.45)', fontSize: 14 }}>
              Link wird überprüft…
            </Text>
          ) : (
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Neues Passwort</Text>
                <TextInput
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="new-password"
                  style={styles.input}
                  placeholder="Mindestens 6 Zeichen"
                  placeholderTextColor="rgba(42,34,30,0.35)"
                />
              </View>
              <View>
                <Text style={styles.label}>Passwort bestätigen</Text>
                <TextInput
                  secureTextEntry
                  value={confirm}
                  onChangeText={setConfirm}
                  autoComplete="new-password"
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(42,34,30,0.35)"
                />
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                onPress={handleReset}
                disabled={loading}
                style={[styles.primaryBtn, { marginTop: 8, opacity: loading ? 0.7 : 1 }]}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'Speichern…' : 'Passwort speichern'}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgb(253, 248, 241)' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontFamily: serifFont, fontSize: 48, color: '#2A221E', letterSpacing: -1, lineHeight: 48 },
  subtitle: { marginTop: 10, fontSize: 15, color: 'rgba(42,34,30,0.55)' },
  form: { gap: 12 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(42,34,30,0.6)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    color: '#2A221E',
  },
  errorBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(215,100,80,0.1)',
  },
  errorText: { color: 'rgb(180,60,40)', fontSize: 13 },
  primaryBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#2A221E',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FDF8F1', fontSize: 15, fontWeight: '600' },
})

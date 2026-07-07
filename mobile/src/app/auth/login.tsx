// 1:1 port of app/auth/login/page.tsx (web)
import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { serifFont } from '@/lib/fonts'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.replace('/')
    }
  }

  const handleReset = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('/auth/callback', { queryParams: { next: '/auth/reset-password' } }),
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logo}>Kudo</Text>
            <Text style={styles.subtitle}>
              {mode === 'login' ? 'Hausarbeit sichtbar machen' : 'Passwort zurücksetzen'}
            </Text>
          </View>

          {mode === 'login' ? (
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>E-Mail</Text>
                <TextInput
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="name@beispiel.de"
                  placeholderTextColor="rgba(42,34,30,0.35)"
                />
              </View>
              <View>
                <Text style={styles.label}>Passwort</Text>
                <TextInput
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
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
                onPress={handleLogin}
                disabled={loading}
                style={[styles.primaryBtn, { marginTop: 8, opacity: loading ? 0.7 : 1 }]}
              >
                <Text style={styles.primaryBtnText}>{loading ? 'Einloggen…' : 'Einloggen'}</Text>
              </Pressable>

              <Pressable onPress={() => router.push('/auth/signup')} style={styles.accentBtn}>
                <Text style={styles.primaryBtnText}>Noch kein Konto? Registrieren</Text>
              </Pressable>

              <Pressable onPress={() => { setMode('forgot'); setError('') }} style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Passwort vergessen</Text>
              </Pressable>
            </View>
          ) : resetSent ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>📬</Text>
              <Text style={{ fontFamily: serifFont, fontSize: 22, color: '#2A221E', letterSpacing: -0.3, lineHeight: 28.6 }}>
                E-Mail verschickt
              </Text>
              <Text style={{ marginTop: 10, fontSize: 14, color: 'rgba(42,34,30,0.55)', lineHeight: 21, textAlign: 'center' }}>
                Schau in deinem Postfach nach einem Link zum Zurücksetzen deines Passworts.
              </Text>
              <Pressable
                onPress={() => { setMode('login'); setResetSent(false) }}
                style={[styles.primaryBtn, { marginTop: 24, paddingHorizontal: 24 }]}
              >
                <Text style={[styles.primaryBtnText, { fontSize: 14 }]}>Zurück zum Login</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>E-Mail</Text>
                <TextInput
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="name@beispiel.de"
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
                <Text style={styles.primaryBtnText}>{loading ? 'Senden…' : 'Link senden'}</Text>
              </Pressable>

              <Pressable onPress={() => { setMode('login'); setError('') }} style={{ padding: 12, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(42,34,30,0.55)', fontSize: 14 }}>Zurück zum Login</Text>
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
  accentBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgb(215,128,96)',
    alignItems: 'center',
  },
  outlineBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  outlineBtnText: { color: '#2A221E', fontSize: 15, fontWeight: '600' },
})

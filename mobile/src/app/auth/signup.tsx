// 1:1 port of app/auth/signup/page.tsx (web)
import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { serifFont } from '@/lib/fonts'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: Linking.createURL('/auth/callback', { queryParams: { next: '/onboarding' } }) },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push({ pathname: '/auth/verify-email', params: { email } })
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.logo}>Kudo</Text>
            <Text style={styles.subtitle}>Konto erstellen</Text>
          </View>

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
                placeholder="Mindestens 6 Zeichen"
                placeholderTextColor="rgba(42,34,30,0.35)"
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={[styles.primaryBtn, { marginTop: 8, opacity: loading ? 0.7 : 1 }]}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Erstellen…' : 'Konto erstellen'}</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/auth/login')} style={[styles.accentBtn, { marginTop: 12 }]}>
            <Text style={styles.primaryBtnText}>Schon ein Konto? Einloggen</Text>
          </Pressable>
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
})

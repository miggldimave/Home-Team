// 1:1 port of app/auth/verify-email/page.tsx (web)
import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { serifFont } from '@/lib/fonts'

export default function VerifyEmailPage() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const email = params.email ?? ''

  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleResend = async () => {
    setResendState('sending')
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResendState(error ? 'error' : 'sent')
  }

  const muted = 'rgba(42,34,30,0.55)'

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={{ fontSize: 56, marginBottom: 24, textAlign: 'center' }}>✉️</Text>

        <Text style={{ fontFamily: serifFont, fontSize: 36, color: '#2A221E', letterSpacing: -0.5, lineHeight: 39.6, marginBottom: 12, textAlign: 'center' }}>
          Bestätigungsmail gesendet
        </Text>

        <Text style={{ fontSize: 15, color: muted, lineHeight: 23.25, marginBottom: 8, textAlign: 'center' }}>
          Wir haben eine E-Mail an
        </Text>
        {!!email && (
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#2A221E', marginBottom: 8, textAlign: 'center' }}>
            {email}
          </Text>
        )}
        <Text style={{ fontSize: 15, color: muted, lineHeight: 23.25, marginBottom: 36, textAlign: 'center' }}>
          geschickt. Bitte klicke auf den Link in der Mail, um dein Konto zu aktivieren.
        </Text>

        <View style={styles.hintBox}>
          <Text style={{ fontSize: 13, color: muted, lineHeight: 19.5, textAlign: 'center' }}>
            Keine Mail erhalten? Schau auch im Spam-Ordner nach.
          </Text>
        </View>

        <Pressable
          onPress={handleResend}
          disabled={resendState === 'sending' || resendState === 'sent'}
          style={[
            styles.primaryBtn,
            {
              backgroundColor: resendState === 'sent' ? 'rgb(138, 170, 138)' : '#2A221E',
              opacity: resendState === 'sending' ? 0.7 : 1,
              marginBottom: 10,
            },
          ]}
        >
          <Text style={styles.primaryBtnText}>
            {resendState === 'sending' ? 'Wird gesendet…' : resendState === 'sent' ? 'Mail erneut gesendet ✓' : 'Erneut senden'}
          </Text>
        </Pressable>

        {resendState === 'error' && (
          <View style={[styles.errorBox, { marginBottom: 10 }]}>
            <Text style={styles.errorText}>Fehler beim Senden. Bitte versuche es später erneut.</Text>
          </View>
        )}

        <Pressable onPress={() => router.push('/auth/login')} style={{ width: '100%', padding: 14, alignItems: 'center' }}>
          <Text style={{ color: muted, fontSize: 14, fontWeight: '500' }}>Zurück zum Login</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'rgb(253, 248, 241)' },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380 },
  hintBox: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 24,
  },
  primaryBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FDF8F1', fontSize: 15, fontWeight: '600' },
  errorBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(215,100,80,0.1)',
  },
  errorText: { color: 'rgb(180,60,40)', fontSize: 13 },
})

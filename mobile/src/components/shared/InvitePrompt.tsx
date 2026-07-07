import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import * as Clipboard from 'expo-clipboard'

interface InvitePromptProps {
  inviteCode: string
  dark: boolean
}

export function InvitePrompt({ inviteCode, dark }: InvitePromptProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await Clipboard.setStringAsync(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)'
  const cardBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'

  return (
    <View
      style={{
        marginTop: 22,
        marginHorizontal: 16,
        paddingTop: 18,
        paddingHorizontal: 18,
        paddingBottom: 16,
        borderRadius: 24,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: cardBorder,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(42,34,30,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 24 }}>🏠</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: txt, letterSpacing: -0.2, lineHeight: 18 }}>
            Lade jemanden ein
          </Text>
          <Text style={{ marginTop: 4, fontSize: 13, color: muted, lineHeight: 18.85 }}>
            Teile diesen Code mit deiner Mitbewohner*in, damit sie dem Haushalt beitreten kann.
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: txt, letterSpacing: 2, textAlign: 'center' }}>
            {inviteCode}
          </Text>
        </View>
        <Pressable
          onPress={handleCopy}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: txt,
            flexShrink: 0,
            minHeight: 44,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: dark ? '#2A221E' : '#FDF8F1', fontSize: 13, fontWeight: '600' }}>
            {copied ? 'Kopiert!' : 'Code kopieren'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

import { View, Text, Image } from 'react-native'
import type { Profile } from '@/lib/types'

interface AvatarProps {
  member: Profile
  size?: number
  ring?: boolean
  ringColor?: string
}

export function Avatar({ member, size = 36, ring = false, ringColor }: AvatarProps) {
  const rc = ringColor || member.color
  // Web uses a double box-shadow ring (2px cream + 2px color); RN has no
  // box-shadow rings, so we recreate it with a colored border + cream gap border.
  const ringStyle = ring
    ? {
        borderWidth: 2,
        borderColor: rc,
        padding: 2,
        backgroundColor: 'rgb(253,249,243)',
      }
    : null

  const inner = member.avatar_url ? (
    <Image
      source={{ uri: member.avatar_url }}
      accessibilityLabel={member.display_name}
      style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
      resizeMode="cover"
    />
  ) : (
    <View
      style={{
        width: '100%',
        height: '100%',
        borderRadius: size / 2,
        backgroundColor: member.bg_color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: member.color,
          fontWeight: '600',
          fontSize: size * 0.42,
          letterSpacing: -0.3,
        }}
      >
        {member.initial}
      </Text>
    </View>
  )

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, flexShrink: 0, overflow: 'hidden' },
        ringStyle,
      ]}
    >
      {inner}
    </View>
  )
}

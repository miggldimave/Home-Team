import type { Profile } from '@/lib/types'

interface AvatarProps {
  member: Profile
  size?: number
  ring?: boolean
  ringColor?: string
}

export function Avatar({ member, size = 36, ring = false, ringColor }: AvatarProps) {
  const rc = ringColor || member.color
  const shadow = ring ? `0 0 0 2px rgb(253,249,243), 0 0 0 4px ${rc}` : 'none'

  if (member.avatar_url) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, boxShadow: shadow, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={member.avatar_url} alt={member.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
      </div>
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: member.bg_color,
        color: member.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.42,
        fontFamily: 'inherit',
        flexShrink: 0,
        letterSpacing: '-0.3px',
        boxShadow: shadow,
      }}
    >
      {member.initial}
    </div>
  )
}

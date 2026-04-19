import type { Profile } from '@/lib/types'

interface AvatarProps {
  member: Profile
  size?: number
  ring?: boolean
  ringColor?: string
}

export function Avatar({ member, size = 36, ring = false, ringColor }: AvatarProps) {
  const rc = ringColor || member.color
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
        boxShadow: ring ? `0 0 0 2px rgb(253,249,243), 0 0 0 4px ${rc}` : 'none',
      }}
    >
      {member.initial}
    </div>
  )
}

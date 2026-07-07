import type { ReactNode } from 'react'
import { View, Text, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg'

export const Icons = {
  home: (s = 22, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 10.5l9-7 9 7V20a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z" />
    </Svg>
  ),
  list: (s = 22, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="8" y1="6" x2="21" y2="6" /><Line x1="8" y1="12" x2="21" y2="12" /><Line x1="8" y1="18" x2="21" y2="18" />
      <Circle cx="3.5" cy="6" r="1.5" fill={c} /><Circle cx="3.5" cy="12" r="1.5" fill={c} /><Circle cx="3.5" cy="18" r="1.5" fill={c} />
    </Svg>
  ),
  heart: (s = 22, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 5.7 3.5 4 7.5C19 16.5 12 21 12 21z" />
    </Svg>
  ),
  chart: (s = 22, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="4" y1="20" x2="4" y2="10" /><Line x1="10" y1="20" x2="10" y2="4" />
      <Line x1="16" y1="20" x2="16" y2="14" /><Line x1="22" y1="20" x2="22" y2="8" />
    </Svg>
  ),
  check: (s = 20, c = 'currentColor', sw = 2.4) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="5 12 10 17 19 7" />
    </Svg>
  ),
  clock: (s = 14, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="9" /><Polyline points="12 7 12 12 15 14" />
    </Svg>
  ),
  back: (s = 22, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="15 6 9 12 15 18" />
    </Svg>
  ),
  plus: (s = 20, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round">
      <Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  ),
  repeat: (s = 14, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="17 2 21 6 17 10" /><Path d="M3 12V9a3 3 0 013-3h15" />
      <Polyline points="7 22 3 18 7 14" /><Path d="M21 12v3a3 3 0 01-3 3H3" />
    </Svg>
  ),
  close: (s = 18, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="6" y1="6" x2="18" y2="18" /><Line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  ),
  pencil: (s = 18, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </Svg>
  ),
  trash: (s = 18, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="3 6 5 6 21 6" /><Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <Path d="M10 11v6" /><Path d="M14 11v6" /><Path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </Svg>
  ),
  settings: (s = 14, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Svg>
  ),
  undo: (s = 18, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 14 4 9l5-5" />
      <Path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </Svg>
  ),
  more: (s = 18, c = 'currentColor') => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <Circle cx="5" cy="12" r="1.5" /><Circle cx="12" cy="12" r="1.5" /><Circle cx="19" cy="12" r="1.5" />
    </Svg>
  ),
}

export function Flame({ size = 14, color = 'rgb(215, 128, 96)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M13.5 1.5c-.3 3.5-3.2 4.7-4.5 7.5-1 2.2-.5 4.4 1 5.5-.5-1.5.3-2.8 1.5-3.5-.2 2 .8 3.5 2.5 3.5 1.8 0 3-1.4 3-3 0-1.2-.5-2.2-1-3 2 1 4 3 4 6.5a8 8 0 01-16 0c0-5 4.5-7 9.5-13.5z" />
    </Svg>
  )
}

export function Heart({ size = 16, filled = false, color = 'rgb(215, 128, 96)' }: { size?: number; filled?: boolean; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2}>
      <Path d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 5.7 3.5 4 7.5C19 16.5 12 21 12 21z" />
    </Svg>
  )
}

// Text children must be wrapped in <Text> by the caller when mixing with icons;
// plain strings are wrapped automatically.
export function Pill({
  children,
  bg = 'rgba(0,0,0,0.05)',
  fg = 'rgba(0,0,0,0.7)',
  style,
}: {
  children: ReactNode
  bg?: string
  fg?: string
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={{ color: fg, fontSize: 12, fontWeight: '500', letterSpacing: -0.1 }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}

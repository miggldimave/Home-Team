import { View, Text } from 'react-native'
import { getCatToken } from '@/lib/tokens'
import type { Category, Task } from '@/lib/types'

export function TaskIconTile({ task, size = 44, categories = [] }: { task: Task; size?: number; categories?: Category[] }) {
  const c = getCatToken(categories, task.category)
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: c.soft,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Text style={{ fontSize: size * 0.5, color: c.deep, lineHeight: size * 0.62 }}>{task.icon}</Text>
    </View>
  )
}

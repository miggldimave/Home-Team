import { getCatToken } from '@/lib/tokens'
import type { Category, Task } from '@/lib/types'

export function TaskIconTile({ task, size = 44, categories = [] }: { task: Task; size?: number; categories?: Category[] }) {
  const c = getCatToken(categories, task.category)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: c.soft,
        color: c.deep,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        flexShrink: 0,
      }}
    >
      {task.icon}
    </div>
  )
}

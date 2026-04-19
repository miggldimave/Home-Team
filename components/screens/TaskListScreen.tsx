'use client'
import { useState } from 'react'
import { CategoryOrb } from '@/components/shared/CategoryOrb'
import { Flame, Icons } from '@/components/shared/Icons'
import { TaskRow } from './HomeScreen'
import { getCatToken } from '@/lib/tokens'
import { lastDoneByTask, categoryStreak } from '@/lib/helpers'
import type { AppState, Task } from '@/lib/types'

interface TaskListScreenProps {
  state: AppState
  onComplete: (task: Task) => void
  onOpenTask: (task: Task) => void
  onAddTask: () => void
}

export function TaskListScreen({ state, onComplete, onOpenTask, onAddTask }: TaskListScreenProps) {
  const { tasks, logs, profiles, categories, dark } = state
  const [filter, setFilter] = useState('Alle')
  const catNames = categories.map((c) => c.name)
  const cats = ['Alle', ...catNames]

  const lastDone = lastDoneByTask(logs)
  const grouped: Record<string, (Task & { last?: ReturnType<typeof lastDoneByTask>[string] })[]> = {}
  tasks.forEach((t) => {
    if (filter !== 'Alle' && t.category !== filter) return
    const last = lastDone[t.id]
    ;(grouped[t.category] = grouped[t.category] || []).push({ ...t, last })
  })

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {tasks.length} Aufgaben · {categories.length} Kategorien
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: txt }}>
            Aufgaben
          </div>
          <button onClick={onAddTask} style={{ border: 'none', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', background: txt, color: dark ? '#2A221E' : '#FDF8F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.plus(20, 'currentColor')}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ marginTop: 16, padding: '0 16px 4px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {cats.map((c) => {
          const active = filter === c
          const cat = c !== 'Alle' ? getCatToken(categories, c) : null
          return (
            <button key={c} onClick={() => setFilter(c)} style={{
              flexShrink: 0, border: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 999,
              fontSize: 13, fontWeight: 500,
              background: active ? (cat ? cat.hue : txt) : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: active ? '#fff' : (dark ? txt : 'rgba(0,0,0,0.65)'),
              letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {cat && <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.85)' : cat.hue }}/>}
              {c}
            </button>
          )
        })}
      </div>

      {/* Grouped tasks */}
      <div style={{ padding: '16px 16px 0' }}>
        {Object.entries(grouped).map(([catName, catTasks]) => {
          const cat = getCatToken(categories, catName)
          const cs = categoryStreak(logs, catName)
          const streakMember = cs.member ? profiles.find((m) => m.id === cs.member) : null

          return (
            <div key={catName} style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px 10px' }}>
                <CategoryOrb cat={catName} size={22}/>
                <div style={{ fontSize: 14, fontWeight: 600, color: txt, letterSpacing: -0.1 }}>{catName}</div>
                <div style={{ fontSize: 12, color: muted }}>{catTasks.length}</div>
                {streakMember && cs.coverage > 0.6 && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: streakMember.color, fontWeight: 600 }}>
                    <Flame size={10} color={streakMember.color}/>
                    <span>{streakMember.display_name} · {Math.round(cs.coverage * 100)}%</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {catTasks.map((t) => (
                  <TaskRow key={t.id} task={t} dark={dark} onComplete={onComplete} onOpen={onOpenTask} state={state}/>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

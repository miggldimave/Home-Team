'use client'
import { useState } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Flame, Heart, Pill, Icons } from '@/components/shared/Icons'
import { getCatToken } from '@/lib/tokens'
import { taskStreak, timeAgo, formatMinutes, freqLabel } from '@/lib/helpers'
import type { AppState, Task } from '@/lib/types'

const DESCRIPTIONS: Record<string, string> = {
  'Altglas wegbringen': 'Die Glasflaschen und Gläser in den Container.',
  'Blumen gießen': 'Zimmerpflanzen mit Wasser versorgen — alle Töpfe checken.',
  'Abwaschen': 'Dreckiges Geschirr spülen. Küche bleibt so angenehm.',
  'Kochen': 'Essen für uns beide zubereiten.',
  'Bettwäsche wechseln': 'Bezug vom Bett abziehen und frisch beziehen.',
  'Wäsche waschen': 'Schmutzwäsche sortieren und in die Maschine.',
}

interface TaskDetailScreenProps {
  state: AppState
  task: Task
  onComplete: (task: Task) => void
  onBack: () => void
  onKudos: (toMemberId: string, task: Task) => void
}

export function TaskDetailScreen({ state, task, onComplete, onBack, onKudos }: TaskDetailScreenProps) {
  const { logs, profiles, currentProfile, categories, dark } = state
  const me = currentProfile
  const cat = getCatToken(categories, task.category)
  const streak = taskStreak(logs, task.id)
  const streakMember = streak.member ? profiles.find((m) => m.id === streak.member) : null
  const history = logs.filter((l) => l.taskId === task.id).slice(0, 10)

  const [done, setDone] = useState(false)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)'
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'

  const desc = DESCRIPTIONS[task.name] || `Regelmäßige ${cat.label ?? task.category}-Aufgabe. Jede*r im Haushalt kann sie übernehmen.`

  return (
    <div style={{ paddingBottom: 140 }}>
      {/* Hero */}
      <div style={{ padding: '60px 24px 24px', background: `linear-gradient(155deg, ${cat.soft} 0%, transparent 100%)`, position: 'relative' }}>
        <button onClick={onBack} style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: txt }}>
          {Icons.back(18, txt)}
        </button>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <TaskIconTile task={task} size={64} categories={categories}/>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: cat.deep, textTransform: 'uppercase', letterSpacing: 0.5 }}>{task.category}</div>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 32, color: txt, letterSpacing: -0.4, lineHeight: 1.1, marginTop: 2 }}>{task.name}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 14, color: muted, lineHeight: 1.5 }}>{desc}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <Pill bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'} fg={txt} style={{ padding: '6px 12px' }}>
            {Icons.clock(12, txt)} <span>{formatMinutes(task.time_minutes)}</span>
          </Pill>
          <Pill bg={dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)'} fg={txt} style={{ padding: '6px 12px' }}>
            {Icons.repeat(12, txt)} <span>{freqLabel(task.cycle_days)}</span>
          </Pill>
        </div>
      </div>

      {/* Streak highlight */}
      {streak.count >= 2 && streakMember && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ padding: '16px 18px', borderRadius: 22, background: cardBg, border: cardBorder, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <Avatar member={streakMember} size={44}/>
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: dark ? 'rgb(28,22,26)' : 'rgb(253,248,241)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                <Flame size={13} color={streakMember.color}/>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, color: txt, letterSpacing: -0.2, lineHeight: 1.3 }}>
                <em>{streakMember.display_name}</em> hat das die letzten <em>{streak.count}×</em> gemacht
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                {streakMember.id !== me.id ? 'Zeit, ihm/ihr den Rücken frei zu halten?' : 'Weiter so – oder lass den anderen ran.'}
              </div>
            </div>
            {streakMember.id !== me.id && (
              <button onClick={() => onKudos(streakMember.id, task)} style={{ border: 'none', cursor: 'pointer', width: 38, height: 38, borderRadius: '50%', background: me.bg_color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} filled color={me.color}/>
              </button>
            )}
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ marginTop: 20 }}>
        <div style={{ padding: '0 24px 10px', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: txt, letterSpacing: -0.2 }}>Verlauf</div>
        <div style={{ padding: '0 16px' }}>
          <div style={{ background: cardBg, border: cardBorder, borderRadius: 20, overflow: 'hidden' }}>
            {history.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16, color: muted, fontStyle: 'italic' }}>noch keine Einträge</div>
            )}
            {history.map((l, i) => {
              const m = profiles.find((mm) => mm.id === l.memberId)
              if (!m) return null
              return (
                <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i > 0 ? (dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none' }}>
                  <Avatar member={m} size={32}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: txt, letterSpacing: -0.1 }}>{m.display_name}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{timeAgo(l.ts)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: muted }}>{formatMinutes(l.time)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: 'sticky', bottom: 82, zIndex: 40, padding: '16px 16px 0' }}>
        <button
          onClick={() => { setDone(true); setTimeout(() => onComplete(task), 400) }}
          disabled={done}
          style={{
            width: '100%', border: 'none', cursor: done ? 'default' : 'pointer',
            padding: '16px 20px', borderRadius: 20,
            background: done ? 'rgb(138, 170, 138)' : cat.hue,
            color: '#fff', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: done ? 'none' : `0 6px 18px ${cat.hue.replace('rgb', 'rgba').replace(')', ', 0.32)')}`,
            letterSpacing: -0.1,
            transition: 'all 0.25s cubic-bezier(.2,.8,.2,1)',
            transform: done ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          {Icons.check(20, '#fff', 2.6)}
          {done ? 'Erledigt' : `Erledigt · ${formatMinutes(task.time_minutes)}`}
        </button>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Flame, Heart, Icons } from '@/components/shared/Icons'
import { getCatToken } from '@/lib/tokens'
import {
  monthlyQuota,
  timeByMember,
  formatMinutes,
  timeAgo,
  lastDoneByTask,
  taskStreak,
  entlastungCandidates,
} from '@/lib/helpers'
import type { AppState, ComputedTaskLog, Task } from '@/lib/types'

interface HomeScreenProps {
  state: AppState
  onComplete: (task: Task) => void
  onNavigate: (screen: string) => void
  onKudos: (toMemberId: string, task: Task) => void
  onOpenTask: (task: Task) => void
  kudosDismissedAt: number
  onDismissKudos: () => void
}

export function HomeScreen({ state, onComplete, onNavigate, onKudos, onOpenTask, kudosDismissedAt, onDismissKudos }: HomeScreenProps) {
  const router = useRouter()
  const { logs, tasks, profiles, currentProfile, categories, kudos, dark } = state
  const me = currentProfile
  const other = profiles.find((p) => p.id !== me.id)

  const quota = monthlyQuota(logs, tasks)
  const monthAgo = Date.now() - 30 * 86400000
  const myTime = timeByMember(logs, me.id, monthAgo)
  const otherTime = other ? timeByMember(logs, other.id, monthAgo) : 0
  const totalTime = myTime + otherTime || 1

  const lastDone = lastDoneByTask(logs)
  const now = Date.now()
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const doneTaskIds = new Set(logs.filter((l) => l.memberId === me.id && l.ts >= todayStart.getTime()).map((l) => l.taskId))
  const due = tasks
    .map((t) => {
      const last = lastDone[t.id]
      const lastTs = last?.ts
      const dueIn = lastTs ? (lastTs + t.cycle_days * 86400000 - now) / 86400000 : -t.cycle_days
      return { ...t, last, dueIn, overdueDays: Math.max(0, -dueIn) }
    })
    .filter((t) => t.dueIn <= 1)
    .sort((a, b) => a.dueIn - b.dueIn)
    .slice(0, 5)

  const entlastung = other ? entlastungCandidates(logs, tasks, me.id)[0] : null
  const weekAgo = Date.now() - 7 * 86400000
  const recentByOther = other
    ? logs.filter((l) => l.memberId === other.id && l.ts >= weekAgo).slice(0, 3)
    : []

  // Incoming kudos: sent to me in the last 7 days, newer than last dismiss
  const incomingKudos = kudos.filter(
    (k) => k.to_profile_id === me.id &&
           new Date(k.created_at).getTime() >= weekAgo &&
           new Date(k.created_at).getTime() > kudosDismissedAt
  )

  // Which tasks the current user has already kudos'd (for filled hearts)
  const myKudosTaskIds = new Set(
    kudos
      .filter((k) => k.from_profile_id === me.id && k.task_id && new Date(k.created_at).getTime() >= weekAgo)
      .map((k) => k.task_id!)
  )

  // Local dismiss state for feed items only
  const [dismissedFeedIds, setDismissedFeedIds] = useState<Set<string>>(new Set())

  const dismissFeedItem = (id: string) => setDismissedFeedIds((prev) => new Set([...prev, id]))
  const visibleFeed = recentByOther.filter((l) => !dismissedFeedIds.has(l.id))

  // Group incoming kudos by sender
  const kudosBySender: Record<string, { name: string; color: string; taskNames: string[] }> = {}
  incomingKudos.forEach((k) => {
      const sender = profiles.find((p) => p.id === k.from_profile_id)
      if (!sender) return
      if (!kudosBySender[k.from_profile_id]) {
        kudosBySender[k.from_profile_id] = { name: sender.display_name, color: sender.color, taskNames: [] }
      }
      const task = tasks.find((t) => t.id === k.task_id)
      if (task && !kudosBySender[k.from_profile_id].taskNames.includes(task.name)) {
        kudosBySender[k.from_profile_id].taskNames.push(task.name)
      }
  })
  const kudosSenders = Object.values(kudosBySender)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.72)'
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'

  return (
    <div style={{ paddingBottom: 140 }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, fontWeight: 400, lineHeight: 1.05, marginTop: 4, letterSpacing: -0.5, color: txt }}>
              Hallo, <em>{me.display_name}</em>.
            </div>
          </div>
          <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Avatar member={me} size={44} />
          </button>
        </div>
      </div>

      {/* Team quota card */}
      <div style={{ margin: '22px 16px 0', padding: '18px 20px', borderRadius: 24, background: cardBg, border: cardBorder, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Team diesen Monat</div>
          <div style={{ fontSize: 12, color: muted, fontWeight: 500 }}>{Math.round(quota.pct * 100)}%</div>
        </div>
        <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
          <div style={{ width: `${(myTime / totalTime) * quota.pct * 100}%`, background: me.color, transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }}/>
          {other && <div style={{ width: `${(otherTime / totalTime) * quota.pct * 100}%`, background: other.color, transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }}/>}
        </div>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: muted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: me.color }}/>
            <span>{me.display_name} · {formatMinutes(myTime)}</span>
          </div>
          {other && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{other.display_name} · {formatMinutes(otherTime)}</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: other.color }}/>
            </div>
          )}
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, lineHeight: 1.3, color: txt, letterSpacing: -0.2 }}>
          Ihr habt zusammen schon <em>{formatMinutes(quota.done)}</em> investiert.
        </div>
      </div>

      {/* Entlastungs-Karte */}
      {entlastung && other && (
        <div
          style={{
            margin: '14px 16px 0', padding: '16px 18px', borderRadius: 22,
            background: `linear-gradient(135deg, ${getCatToken(categories, entlastung.category).soft} 0%, ${dark ? 'rgba(215,128,96,0.12)' : 'rgba(249,223,210,0.55)'} 100%)`,
            border: cardBorder, position: 'relative', overflow: 'hidden', cursor: 'pointer',
          }}
          onClick={() => onOpenTask(entlastung)}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Avatar member={other} size={40} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'rgb(253,248,241)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                <Flame size={12} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, color: txt, letterSpacing: -0.2, lineHeight: 1.3 }}>
                {other.display_name} hat <em>{entlastung.name}</em> die letzten {entlastung.streak.count} Mal gemacht.
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: muted }}>Magst du heute dran?</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={(e) => { e.stopPropagation(); onComplete(entlastung) }} style={{ flex: 1, border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: 999, background: txt, color: dark ? '#2A221E' : '#FDF8F1', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Ich mach&apos;s · {formatMinutes(entlastung.time_minutes)}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onKudos(other.id, entlastung) }} style={{ border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: 999, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)', color: txt, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={14} filled color={me.color}/>
              Danke
            </button>
          </div>
        </div>
      )}

      {/* Incoming kudos notification (grouped) */}
      {kudosSenders.length > 0 && (
        <div style={{ margin: '14px 16px 0', padding: '14px 14px 14px 18px', borderRadius: 22, background: dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,248,235,0.95)', border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(215,128,96,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 20, flexShrink: 0 }}>🩷</div>
          <div style={{ flex: 1 }}>
            {kudosSenders.map((s, i) => (
              <div key={i} style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 17, color: txt, letterSpacing: -0.2, lineHeight: 1.35 }}>
                <em style={{ color: s.color }}>{s.name}</em>
                {' hat dir gedankt'}
                {s.taskNames.length > 0 && (
                  <span style={{ color: muted, fontSize: 14, fontFamily: 'inherit' }}>
                    {' für '}
                    <em>{s.taskNames.slice(0, 2).join(', ')}{s.taskNames.length > 2 ? ` +${s.taskNames.length - 2}` : ''}</em>
                  </span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onDismissKudos}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {Icons.close(14, muted)}
          </button>
        </div>
      )}

      {/* Heute dran */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '24px 24px 12px' }}>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, lineHeight: 1.1, color: txt, letterSpacing: -0.2 }}>Heute dran</div>
        <button onClick={() => onNavigate('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: muted }}>alle ansehen</button>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {due.map((t) => (
          <TaskRow key={t.id} task={t} dark={dark} onComplete={onComplete} onOpen={onOpenTask} state={state} doneToday={doneTaskIds.has(t.id)}/>
        ))}
        {due.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 20, color: muted, fontStyle: 'italic' }}>
            alles erledigt — Zeit für Kaffee.
          </div>
        )}
      </div>

      {/* Was Person gemacht hat (dismissable) */}
      {visibleFeed.length > 0 && other && (
        <div style={{ marginTop: 24 }}>
          <div style={{ padding: '0 24px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: txt, letterSpacing: -0.2, lineHeight: 1.1 }}>
              Was <em>{other.display_name}</em> gemacht hat
            </div>
            <button onClick={() => onNavigate('appreciate')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: muted }}>mehr</button>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleFeed.map((l, i) => {
              const task = tasks.find((t) => t.id === l.taskId)
              if (!task) return null
              const alreadyKudosd = myKudosTaskIds.has(task.id)
              return (
                <div key={i} onClick={() => onOpenTask(task)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 16, background: cardBg, border: cardBorder, position: 'relative', cursor: 'pointer' }}>
                  <TaskIconTile task={task} size={36}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: txt, letterSpacing: -0.1 }}>{l.taskName}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{timeAgo(l.ts)} · {formatMinutes(l.time)}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onKudos(other.id, task); dismissFeedItem(l.id) }}
                    style={{ border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: alreadyKudosd ? (dark ? 'rgba(255,255,255,0.06)' : `${me.color.replace('rgb', 'rgba').replace(')', ', 0.12)')}`) : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <Heart size={16} filled={alreadyKudosd} color={me.color}/>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissFeedItem(l.id) }}
                    style={{ border: 'none', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    {Icons.close(12, muted)}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function TaskRow({ task, dark, onComplete, onOpen, state, hideFlame = false, doneToday = false }: {
  task: Task & { last?: ComputedTaskLog }
  dark: boolean
  onComplete: (task: Task) => void
  onOpen?: (task: Task) => void
  state: AppState
  hideFlame?: boolean
  doneToday?: boolean
}) {
  const streak = taskStreak(state.logs, task.id)
  const lastDoneBy = streak.member ? state.profiles.find((m) => m.id === streak.member) : null
  const cat = getCatToken(state.categories, task.category)
  const [done, setDone] = useState(doneToday)
  const [pressed, setPressed] = useState(false)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const lastTxt = task.last ? timeAgo(task.last.ts) : 'noch nie'

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (done) return
    setDone(true)
    setTimeout(() => onComplete(task), 280)
  }

  return (
    <div
      onClick={() => onOpen?.(task)}
      style={{
        background: dark ? 'rgba(50,40,44,0.6)' : 'rgba(255,255,255,0.75)',
        borderRadius: 20,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
        backdropFilter: 'blur(12px)',
        opacity: done ? 0.45 : 1,
        cursor: 'pointer',
        transform: done ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <TaskIconTile task={task} size={42}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: txt, letterSpacing: -0.15, textDecoration: done ? 'line-through' : 'none' }}>
          {task.name}
        </div>
        <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: muted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {Icons.clock(11, muted)} {formatMinutes(task.time_minutes)}
          </span>
          <span>·</span>
          <span>zuletzt {lastTxt}</span>
          {!hideFlame && lastDoneBy && streak.count >= 2 && (
            <>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: lastDoneBy.color, fontWeight: 600 }}>
                <Flame size={10} color={lastDoneBy.color}/>
                {lastDoneBy.display_name} ×{streak.count}
              </span>
            </>
          )}
        </div>
      </div>
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onClick={handle}
        style={{
          border: 'none',
          cursor: 'pointer',
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: done ? 'rgb(138, 170, 138)' : cat.hue,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: pressed ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.15s, background 0.3s',
          flexShrink: 0,
        }}
      >
        {Icons.check(18, 'white', 2.6)}
      </button>
    </div>
  )
}

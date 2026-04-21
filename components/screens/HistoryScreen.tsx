'use client'
import { useState } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Icons } from '@/components/shared/Icons'
import { formatMinutes } from '@/lib/helpers'
import type { AppState, Task } from '@/lib/types'

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

interface HistoryScreenProps {
  state: AppState
  onBack: () => void
  onOpenTask: (task: Task) => void
}

export function HistoryScreen({ state, onBack, onOpenTask }: HistoryScreenProps) {
  const { logs, tasks, profiles, currentProfile, categories, dark } = state
  const me = currentProfile
  const other = profiles.find((p) => p.id !== me.id)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const monthStart = new Date(year, month, 1).getTime()
  const monthEnd = new Date(year, month + 1, 1).getTime()
  const monthLogs = logs.filter((l) => l.ts >= monthStart && l.ts < monthEnd)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const canGoForward = !isCurrentMonth
  const canGoBack = logs.some((l) => l.ts < monthStart)

  const goBack = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const goForward = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const myTime = monthLogs.filter((l) => l.memberId === me.id).reduce((s, l) => s + l.time, 0)
  const otherTime = other ? monthLogs.filter((l) => l.memberId === other.id).reduce((s, l) => s + l.time, 0) : 0
  const totalTime = myTime + otherTime

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.75)'
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'
  const bg = 'rgb(253,248,241)'

  return (
    <div style={{ minHeight: '100%', background: bg, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.75)', border: 'none', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icons.back(18, txt)}
        </button>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 34, color: txt, letterSpacing: -0.4, lineHeight: 1.05 }}>
          Verlauf
        </div>
      </div>

      {/* Month switcher */}
      <div style={{ margin: '20px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderRadius: 18, background: cardBg, border: cardBorder }}>
        <button
          onClick={goBack}
          disabled={!canGoBack}
          style={{ background: 'none', border: 'none', cursor: canGoBack ? 'pointer' : 'default', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canGoBack ? 1 : 0.2 }}
        >
          {Icons.back(18, txt)}
        </button>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: txt, letterSpacing: -0.3 }}>
          {MONTHS[month]} {year}
        </div>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          style={{ background: 'none', border: 'none', cursor: canGoForward ? 'pointer' : 'default', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canGoForward ? 1 : 0.2, transform: 'scaleX(-1)' }}
        >
          {Icons.back(18, txt)}
        </button>
      </div>

      {/* Summary card */}
      <div style={{ margin: '10px 16px 0', padding: '18px 20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {MONTHS[month]} · {monthLogs.length} Aufgaben
          </div>
          <div style={{ fontSize: 12, color: muted, fontWeight: 500 }}>{formatMinutes(totalTime)}</div>
        </div>
        {totalTime > 0 ? (
          <>
            <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              <div style={{ width: `${(myTime / totalTime) * 100}%`, background: me.color, transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }}/>
              {other && <div style={{ width: `${(otherTime / totalTime) * 100}%`, background: other.color, transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }}/>}
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
              Ihr habt zusammen <em>{formatMinutes(totalTime)}</em> investiert.
            </div>
          </>
        ) : (
          <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16, color: muted, fontStyle: 'italic' }}>
            Keine Aufgaben in diesem Monat.
          </div>
        )}
      </div>

      {/* Log list */}
      {monthLogs.length > 0 && (
        <div style={{ margin: '10px 16px 0', borderRadius: 20, background: cardBg, border: cardBorder, overflow: 'hidden' }}>
          {monthLogs.map((l, i) => {
            const task = tasks.find((t) => t.id === l.taskId)
            const member = profiles.find((p) => p.id === l.memberId)
            if (!task || !member) return null
            const dateStr = new Date(l.ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
            return (
              <div
                key={i}
                onClick={() => onOpenTask(task)}
                style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, borderTop: i > 0 ? (dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none', cursor: 'pointer' }}
              >
                <TaskIconTile task={task} size={36} categories={categories}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: txt, letterSpacing: -0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.taskName}</div>
                  <div style={{ fontSize: 11, color: muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Avatar member={member} size={14}/>
                    <span>{member.display_name} · {formatMinutes(l.time)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: muted, flexShrink: 0 }}>{dateStr}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

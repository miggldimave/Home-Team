'use client'
import { Avatar } from '@/components/shared/Avatar'
import { TaskIconTile } from '@/components/shared/TaskIconTile'
import { Heart } from '@/components/shared/Icons'
import { getCatToken } from '@/lib/tokens'
import { categoryStreak, taskStreak, timeAgo, formatMetric, metricOfLog } from '@/lib/helpers'
import { HistoryScreen } from './HistoryScreen'
import { InvitePrompt } from '@/components/shared/InvitePrompt'
import type { AppState, Task } from '@/lib/types'

interface AppreciateScreenProps {
  state: AppState
  onKudos: (toMemberId: string, task: Task, reason?: string) => void
  onOpenTask: (task: Task) => void
  showHistory: boolean
  onShowHistory: () => void
  onHideHistory: () => void
}

export function AppreciateScreen({ state, onKudos, onOpenTask, showHistory, onShowHistory, onHideHistory }: AppreciateScreenProps) {
  const { logs, tasks, profiles, currentProfile, categories, kudos, dark } = state
  const mode = state.household.scoring_mode
  const me = currentProfile
  const other = profiles.find((p) => p.id !== me.id)

  if (showHistory) {
    return <HistoryScreen state={state} onBack={onHideHistory} onOpenTask={onOpenTask}/>
  }

  const weekAgo = Date.now() - 7 * 86400000

  // Tasks the current user has already kudos'd this week
  const myKudosTaskIds = new Set(
    kudos
      .filter((k) => k.from_profile_id === me.id && k.task_id && new Date(k.created_at).getTime() >= weekAgo)
      .map((k) => k.task_id!)
  )

  // Track category kudos already sent this week: key = `${to_profile_id}:${category}`
  const myKudosCategoryKeys = new Set(
    kudos
      .filter((k) => k.from_profile_id === me.id && k.reason === 'category' && new Date(k.created_at).getTime() >= weekAgo)
      .map((k) => {
        const t = tasks.find((t) => t.id === k.task_id)
        return t ? `${k.to_profile_id}:${t.category}` : null
      })
      .filter((x): x is string => x !== null)
  )

  const catHighlights = categories
    .map((c) => {
      const cs = categoryStreak(logs, c.name)
      return { cat: c.name, ...cs }
    })
    .filter((h) => h.coverage >= 0.6 && h.member)
    .sort((a, b) => b.coverage - a.coverage)

  const allStreaks = tasks
    .map((t) => ({ task: t, streak: taskStreak(logs, t.id) }))
    .filter((x) => x.streak.count >= 3)

  const heroByMember: Record<string, typeof allStreaks[0]> = {}
  allStreaks.forEach((x) => {
    const uid = x.streak.member!
    if (!heroByMember[uid] || x.streak.count > heroByMember[uid].streak.count) {
      heroByMember[uid] = x
    }
  })

  const hero = other ? heroByMember[other.id] : null
  const recentAll = logs.filter((l) => l.ts >= weekAgo).slice(0, 6)

  const txt = dark ? '#F2ECE4' : '#2A221E'
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)'
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.75)'
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)'

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: muted, letterSpacing: 0.5, textTransform: 'uppercase' }}>diesen Monat</div>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: txt, marginTop: 4 }}>
          Wertschätzung
        </div>
      </div>

      {profiles.length < 2 && (
        <InvitePrompt inviteCode={state.household.invite_code} dark={dark}/>
      )}

      {/* Unsung hero card */}
      {hero && other && (
        <div style={{
          margin: '22px 16px 0', padding: '22px 20px', borderRadius: 26,
          background: `linear-gradient(140deg, ${other.bg_color} 0%, ${dark ? 'rgba(50,40,44,0.85)' : 'rgba(255,255,255,0.9)'} 75%)`,
          border: cardBorder, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', filter: 'blur(40px)', background: `${other.color.replace('rgb', 'rgba').replace(')', ', 0.22)')}`, pointerEvents: 'none' }}/>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar member={other} size={54} ring ringColor={other.color}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: other.color, letterSpacing: 0.8, textTransform: 'uppercase' }}>Stille*r Held*in</div>
              <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: txt, letterSpacing: -0.3, lineHeight: 1.1, marginTop: 2 }}>{other.display_name}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 20, color: txt, lineHeight: 1.35, letterSpacing: -0.2 }}>
            Hat <em>{hero.task.name}</em> die letzten <em>{hero.streak.count}×</em> erledigt.
          </div>
          <button
            onClick={() => onKudos(other.id, hero.task, 'streak')}
            style={{ marginTop: 14, border: 'none', cursor: 'pointer', padding: '10px 18px', borderRadius: 999, background: myKudosTaskIds.has(hero.task.id) ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : txt, color: myKudosTaskIds.has(hero.task.id) ? txt : (dark ? '#2A221E' : '#FDF8F1'), fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            <Heart size={14} filled={myKudosTaskIds.has(hero.task.id)} color={myKudosTaskIds.has(hero.task.id) ? me.color : (dark ? '#2A221E' : '#FDF8F1')}/>
            {myKudosTaskIds.has(hero.task.id) ? 'Gedankt' : 'Danke sagen'}
          </button>
        </div>
      )}

      {/* Category leaderboard */}
      <div style={{ marginTop: 26 }}>
        <div style={{ padding: '0 24px 10px', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: txt, letterSpacing: -0.2 }}>
          Wer rockt was
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {catHighlights.map((h) => {
            const m = profiles.find((mm) => mm.id === h.member)
            if (!m) return null
            const isOther = m.id !== me.id
            const representativeTask = (() => {
              const log = logs.filter((l) => l.cat === h.cat && l.memberId === h.member).sort((a, b) => b.ts - a.ts)[0]
              return tasks.find((t) => t.id === log?.taskId)
            })()
            const alreadyKudosd = myKudosCategoryKeys.has(`${m.id}:${h.cat}`)
            return (
              <div key={h.cat} style={{ padding: '14px 16px', borderRadius: 18, background: cardBg, border: cardBorder, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar member={m} size={36} ring ringColor={m.color}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: txt, letterSpacing: -0.1 }}>{h.cat}</div>
                  <div style={{ marginTop: 3, fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16, color: muted, letterSpacing: -0.1, lineHeight: 1.2 }}>
                    <em>{m.display_name}</em> hat <em>{Math.round(h.coverage * 100)}%</em> gemacht
                  </div>
                </div>
                {isOther && representativeTask && (
                  <button
                    onClick={() => onKudos(m.id, representativeTask, 'category')}
                    style={{ border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: alreadyKudosd ? (dark ? 'rgba(255,255,255,0.06)' : `${me.color.replace('rgb', 'rgba').replace(')', ', 0.12)')}`) : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <Heart size={16} filled={alreadyKudosd} color={me.color}/>
                  </button>
                )}
              </div>
            )
          })}
          {catHighlights.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, color: muted, fontStyle: 'italic' }}>
              alles schön geteilt diesen Monat.
            </div>
          )}
        </div>
      </div>

      {/* Diese Woche */}
      {recentAll.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ padding: '0 24px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: txt, letterSpacing: -0.2 }}>Diese Woche</div>
            <button onClick={onShowHistory} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: muted }}>mehr</button>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentAll.map((l, i) => {
              const task = tasks.find((t) => t.id === l.taskId)
              const member = profiles.find((p) => p.id === l.memberId)
              if (!task || !member) return null
              const isOther = l.memberId !== me.id
              const alreadyKudosd = myKudosTaskIds.has(task.id)
              return (
                <div key={i} onClick={() => onOpenTask(task)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 16, background: cardBg, border: cardBorder, cursor: 'pointer' }}>
                  <TaskIconTile task={task} size={36} categories={categories}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: txt, letterSpacing: -0.1 }}>{l.taskName}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Avatar member={member} size={16}/>
                      <span>{member.display_name} · {timeAgo(l.ts)} · {formatMetric(metricOfLog(l, mode), mode)}</span>
                    </div>
                  </div>
                  {isOther && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onKudos(member.id, task) }}
                      style={{ border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', background: alreadyKudosd ? (dark ? 'rgba(255,255,255,0.06)' : `${me.color.replace('rgb', 'rgba').replace(')', ', 0.12)')}`) : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <Heart size={16} filled={alreadyKudosd} color={me.color}/>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

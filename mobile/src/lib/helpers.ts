import type { ComputedTaskLog, Task, QuotaPeriod, ScoringMode } from './types'

export function lastDoneByTask(logs: ComputedTaskLog[]): Record<string, ComputedTaskLog> {
  const m: Record<string, ComputedTaskLog> = {}
  logs.forEach((l) => {
    if (!m[l.taskId] || l.ts > m[l.taskId].ts) m[l.taskId] = l
  })
  return m
}

export function taskStreak(logs: ComputedTaskLog[], taskId: string): { member: string | null; count: number } {
  const filtered = logs.filter((l) => l.taskId === taskId).sort((a, b) => b.ts - a.ts)
  if (filtered.length === 0) return { member: null, count: 0 }
  const who = filtered[0].memberId
  let c = 0
  for (const l of filtered) {
    if (l.memberId === who) c++
    else break
  }
  return { member: who, count: c }
}

export function categoryStreak(
  logs: ComputedTaskLog[],
  cat: string
): { member: string | null; count: number; coverage: number; days: number } {
  const filtered = logs.filter((l) => l.cat === cat).sort((a, b) => b.ts - a.ts)
  if (filtered.length === 0) return { member: null, count: 0, coverage: 0, days: 0 }
  const who = filtered[0].memberId
  let c = 0
  for (const l of filtered) {
    if (l.memberId === who) c++
    else break
  }
  const monthAgo = Date.now() - 30 * 86400000
  const thisMonth = filtered.filter((l) => l.ts >= monthAgo)
  const byWho = thisMonth.filter((l) => l.memberId === who).length
  const coverage = thisMonth.length > 0 ? byWho / thisMonth.length : 0
  const streakLogs = filtered.slice(0, c)
  const oldestStreak = streakLogs.length > 0 ? streakLogs[streakLogs.length - 1].ts : Date.now()
  const days = Math.floor((Date.now() - oldestStreak) / 86400000)
  return { member: who, count: c, coverage, days }
}

function periodStartTs(period: QuotaPeriod): number {
  const now = new Date()
  if (period === 'weekly') {
    const daysSinceMon = (now.getDay() + 6) % 7
    const mon = new Date(now)
    mon.setHours(0, 0, 0, 0)
    mon.setDate(mon.getDate() - daysSinceMon)
    return mon.getTime()
  }
  if (period === 'biweekly') {
    return Date.now() - 14 * 86400000
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}

function periodLengthDays(period: QuotaPeriod): number {
  if (period === 'weekly') return 7
  if (period === 'biweekly') return 14
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
}

export function periodQuota(
  logs: ComputedTaskLog[],
  tasks: Task[],
  period: QuotaPeriod = 'monthly',
  goal = 80,
  mode: ScoringMode = 'zeit',
): { done: number; expected: number; pct: number; since: number } {
  const days = periodLengthDays(period)
  const expected = tasks.reduce((s, t) => s + metricOfTask(t, mode) * (days / t.cycle_days), 0)
  const since = periodStartTs(period)
  const done = logs.filter((l) => l.ts >= since).reduce((s, l) => s + metricOfLog(l, mode), 0)
  const target = expected * (goal / 100)
  return { done, expected: Math.round(expected), pct: Math.min(1, target > 0 ? done / target : 0), since }
}

export function monthlyQuota(logs: ComputedTaskLog[], tasks: Task[], mode: ScoringMode = 'zeit'): { done: number; expected: number; pct: number } {
  const { done, expected, pct } = periodQuota(logs, tasks, 'monthly', 100, mode)
  return { done, expected, pct }
}

export function metricByMember(logs: ComputedTaskLog[], uid: string, since: number, mode: ScoringMode): number {
  return logs.filter((l) => l.memberId === uid && l.ts >= since).reduce((s, l) => s + metricOfLog(l, mode), 0)
}

// Liefert den für den Haushaltsmodus relevanten Messwert.
export function metricOfLog(log: ComputedTaskLog, mode: ScoringMode): number {
  return mode === 'punkte' ? log.pts : log.time
}

export function metricOfTask(task: Task, mode: ScoringMode): number {
  return mode === 'punkte' ? task.pts : task.time_minutes
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function formatPoints(pts: number): string {
  return `${pts} ${pts === 1 ? 'Punkt' : 'Punkte'}`
}

// Formatiert einen Messwert je nach Haushaltsmodus (Minuten oder Punkte).
export function formatMetric(value: number, mode: ScoringMode): string {
  return mode === 'punkte' ? formatPoints(value) : formatMinutes(value)
}

export function timeAgo(ts: number): string {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const day = new Date(ts); day.setHours(0, 0, 0, 0)
  const days = Math.round((today.getTime() - day.getTime()) / 86400000)
  if (days === 0) return 'heute'
  if (days === 1) return 'gestern'
  if (days < 7) return `vor ${days} Tagen`
  if (days < 14) return 'letzte Woche'
  if (days < 60) return `vor ${Math.floor(days / 7)} Wochen`
  return `vor ${Math.floor(days / 30)} Monaten`
}

export function freqLabel(cycle: number): string {
  if (cycle <= 1) return 'täglich'
  if (cycle <= 3) return 'alle paar Tage'
  if (cycle <= 7) return 'wöchentlich'
  if (cycle <= 14) return 'alle 2 Wochen'
  if (cycle <= 31) return 'monatlich'
  if (cycle <= 60) return 'alle 2 Monate'
  return 'quartalsweise'
}

export function entlastungCandidates(
  logs: ComputedTaskLog[],
  tasks: Task[],
  otherUserId: string
): (Task & { streak: { member: string | null; count: number } })[] {
  return tasks
    .map((t) => {
      const s = taskStreak(logs, t.id)
      return { ...t, streak: s }
    })
    .filter((t) => t.streak.count >= 3 && t.streak.member !== otherUserId)
    .sort((a, b) => b.streak.count - a.streak.count)
}

export function toComputedLog(
  log: { id: string; task_id: string; profile_id: string; household_id: string; completed_at: string },
  task: Task
): ComputedTaskLog {
  return {
    id: log.id,
    taskId: log.task_id,
    taskName: task.name,
    cat: task.category,
    pts: task.pts,
    time: task.time_minutes,
    memberId: log.profile_id,
    ts: new Date(log.completed_at).getTime(),
  }
}

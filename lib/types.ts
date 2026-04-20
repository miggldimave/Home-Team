export type ScoringMode = 'punkte' | 'zeit'

export interface Household {
  id: string
  name: string
  scoring_mode: ScoringMode
  invite_code: string
  created_at: string
}

export interface Profile {
  id: string
  household_id: string | null
  display_name: string
  initial: string
  color: string
  bg_color: string
  created_at: string
}

export interface Task {
  id: string
  household_id: string
  name: string
  category: string
  icon: string
  pts: number
  time_minutes: number
  cycle_days: number
  created_at: string
}

export interface TaskLog {
  id: string
  task_id: string
  profile_id: string
  household_id: string
  completed_at: string
}

export interface Kudos {
  id: string
  from_profile_id: string
  to_profile_id: string
  task_id: string | null
  household_id: string
  created_at: string
}

export interface CategoryToken {
  hue: string
  soft: string
  deep: string
  label: string
}

export interface Category {
  id: string
  household_id: string
  name: string
  hue: string
  soft: string
  deep: string
  created_at: string
}

export interface ComputedTaskLog {
  id: string
  taskId: string
  taskName: string
  cat: string
  pts: number
  time: number
  memberId: string
  ts: number
}

export interface ComputedTask extends Task {
  last?: ComputedTaskLog
  dueIn?: number
  overdueDays?: number
}

export interface AppState {
  logs: ComputedTaskLog[]
  tasks: Task[]
  profiles: Profile[]
  household: Household
  currentProfile: Profile
  categories: Category[]
  kudos: Kudos[]
  dark: boolean
}

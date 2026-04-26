import type { Category, CategoryToken } from './types'

export const CATEGORIES: Record<string, CategoryToken> = {
  Allgemein:    { hue: 'rgb(168, 146, 196)', soft: 'rgb(238, 230, 246)', deep: 'rgb(78, 58, 106)',   label: 'Allgemein' },
  Bad:          { hue: 'rgb(122, 168, 170)', soft: 'rgb(218, 236, 237)', deep: 'rgb(42, 80, 82)',    label: 'Bad' },
  Küche:        { hue: 'rgb(215, 128, 96)',  soft: 'rgb(249, 223, 210)', deep: 'rgb(118, 55, 30)',   label: 'Küche' },
  Schlafzimmer: { hue: 'rgb(138, 152, 190)', soft: 'rgb(224, 230, 244)', deep: 'rgb(50, 66, 104)',   label: 'Schlafzimmer' },
  Wohnzimmer:   { hue: 'rgb(212, 164, 104)', soft: 'rgb(248, 232, 210)', deep: 'rgb(108, 74, 30)',   label: 'Wohnzimmer' },
  Wäsche:       { hue: 'rgb(196, 140, 170)', soft: 'rgb(247, 226, 236)', deep: 'rgb(106, 48, 78)',   label: 'Wäsche' },
}

export function getCatToken(categories: Category[], name: string): CategoryToken {
  const cat = categories.find((c) => c.name === name)
  if (cat) return { hue: cat.hue, soft: cat.soft, deep: cat.deep, label: cat.name }
  return CATEGORIES[name] ?? { hue: 'rgb(168,168,168)', soft: 'rgb(230,230,230)', deep: 'rgb(80,80,80)', label: name }
}

export const MEMBER_COLOR_OPTIONS = [
  { color: 'rgb(215, 128, 96)',  bg: 'rgb(249, 223, 210)', label: 'Orange' },
  { color: 'rgb(138, 152, 190)', bg: 'rgb(224, 230, 244)', label: 'Blau' },
  { color: 'rgb(168, 146, 196)', bg: 'rgb(238, 230, 246)', label: 'Lila' },
  { color: 'rgb(122, 168, 170)', bg: 'rgb(218, 236, 237)', label: 'Türkis' },
  { color: 'rgb(212, 164, 104)', bg: 'rgb(248, 232, 210)', label: 'Amber' },
  { color: 'rgb(196, 140, 170)', bg: 'rgb(247, 226, 236)', label: 'Rosa' },
]

export const CATEGORY_COLOR_OPTIONS = [
  { hue: 'rgb(168, 146, 196)', soft: 'rgb(238, 230, 246)', deep: 'rgb(78, 58, 106)' },
  { hue: 'rgb(122, 168, 170)', soft: 'rgb(218, 236, 237)', deep: 'rgb(42, 80, 82)' },
  { hue: 'rgb(215, 128, 96)',  soft: 'rgb(249, 223, 210)', deep: 'rgb(118, 55, 30)' },
  { hue: 'rgb(138, 152, 190)', soft: 'rgb(224, 230, 244)', deep: 'rgb(50, 66, 104)' },
  { hue: 'rgb(212, 164, 104)', soft: 'rgb(248, 232, 210)', deep: 'rgb(108, 74, 30)' },
  { hue: 'rgb(196, 140, 170)', soft: 'rgb(247, 226, 236)', deep: 'rgb(106, 48, 78)' },
  { hue: 'rgb(138, 190, 152)', soft: 'rgb(218, 240, 225)', deep: 'rgb(40, 90, 55)' },
  { hue: 'rgb(190, 152, 138)', soft: 'rgb(240, 225, 218)', deep: 'rgb(90, 55, 40)' },
]

export const AVAILABLE_ICONS = [
  '🧹','🧺','🛒','🍽️','🥘','🧽','🪣','🚿','🛁','🪴',
  '🗑️','🧻','🧴','🧼','🛏️','🪟','💡','🔧','📦','🍳',
  '☕','♻️','🌿','🫧','🧷','✂️','📚','🎁','🐾','🪑',
]

export const SUGGESTION_CATEGORY_COLORS: Record<string, { hue: string; soft: string; deep: string }> = {
  Essen:  { hue: 'rgb(215, 128, 96)',  soft: 'rgb(249, 223, 210)', deep: 'rgb(118, 55, 30)' },
  Putzen: { hue: 'rgb(122, 168, 170)', soft: 'rgb(218, 236, 237)', deep: 'rgb(42, 80, 82)'  },
  Wäsche: { hue: 'rgb(196, 140, 170)', soft: 'rgb(247, 226, 236)', deep: 'rgb(106, 48, 78)' },
}

export const TASK_SUGGESTIONS: { name: string; category: string; icon: string; pts: number; time_minutes: number; cycle_days: number }[] = [
  { name: 'Kochen',               category: 'Essen',        icon: '🥘', pts: 8,  time_minutes: 40, cycle_days: 1  },
  { name: 'Abwaschen',            category: 'Essen',        icon: '🍽️', pts: 5,  time_minutes: 15, cycle_days: 1  },
  { name: 'Müll rausbringen',     category: 'Putzen',        icon: '🗑️', pts: 4,  time_minutes: 5,  cycle_days: 4  },
  { name: 'Staubsaugen',          category: 'Putzen',    icon: '🧹', pts: 8,  time_minutes: 20, cycle_days: 7  },
  { name: 'Oberflächen putzen',   category: 'Putzen',    icon: '🧽', pts: 6,  time_minutes: 15, cycle_days: 7  },
  { name: 'Wocheneinkauf',        category: 'Essen',    icon: '🛒', pts: 12, time_minutes: 60, cycle_days: 7  },
  { name: 'Bad putzen',           category: 'Putzen',          icon: '🚿', pts: 14, time_minutes: 35, cycle_days: 10 },
  { name: 'Wäsche waschen',       category: 'Wäsche',       icon: '🧺', pts: 5,  time_minutes: 10, cycle_days: 4  },
  { name: 'Wäsche aufhängen',     category: 'Wäsche',       icon: '🧺', pts: 4,  time_minutes: 10, cycle_days: 4  },
  { name: 'Bettwäsche wechseln',  category: 'Wäsche', icon: '🛏️', pts: 10, time_minutes: 20, cycle_days: 14 },
]


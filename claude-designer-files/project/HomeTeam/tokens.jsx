// Home-Team tokens — warm, soft, cooperative

// Soft, muted category palette (OKLCH-harmonized)
const CATEGORIES = {
  Allgemein:    { hue: 'rgb(168, 146, 196)', soft: 'rgb(238, 230, 246)', deep: 'rgb(78, 58, 106)', label: 'Allgemein' },
  Bad:          { hue: 'rgb(122, 168, 170)', soft: 'rgb(218, 236, 237)', deep: 'rgb(42, 80, 82)',  label: 'Bad' },
  Küche:        { hue: 'rgb(215, 128, 96)',  soft: 'rgb(249, 223, 210)', deep: 'rgb(118, 55, 30)', label: 'Küche' },
  Schlafzimmer: { hue: 'rgb(138, 152, 190)', soft: 'rgb(224, 230, 244)', deep: 'rgb(50, 66, 104)', label: 'Schlafzimmer' },
  Wohnzimmer:   { hue: 'rgb(212, 164, 104)', soft: 'rgb(248, 232, 210)', deep: 'rgb(108, 74, 30)', label: 'Wohnzimmer' },
  Wäsche:       { hue: 'rgb(196, 140, 170)', soft: 'rgb(247, 226, 236)', deep: 'rgb(106, 48, 78)', label: 'Wäsche' },
};

// Task master list with icon glyph, time (minutes), pts, cycle days
// Icons are simple unicode glyphs that render consistently across platforms
const TASK_ICONS = {
  't1': '♻', 't2': '❀', 't3': '✿', 't4': '◈', 't5': '✦',
  't6': '⦿', 't7': '≈', 't8': '✧', 't9': '◉', 't10': '◎',
  't11': '⌀', 't12': '◐',
  't13': '◇', 't14': '◆', 't15': '✿', 't16': '◉', 't17': '⌬', 't18': '≋', 't19': '◉', 't20': '◇',
  't21': '☾', 't22': '◈',
  't23': '◍',
  't24': '≈', 't25': '∥', 't26': '◊',
};

const TASKS = [
  { id: 't1',  name: 'Altglas wegbringen',   cat: 'Allgemein', pts: 8,  time: 12, cycle: 14 },
  { id: 't2',  name: 'Blumen gießen',        cat: 'Allgemein', pts: 3,  time: 5,  cycle: 4 },
  { id: 't3',  name: 'Blumen umtopfen',      cat: 'Allgemein', pts: 12, time: 30, cycle: 90 },
  { id: 't4',  name: 'Feudeln',              cat: 'Allgemein', pts: 10, time: 25, cycle: 14 },
  { id: 't5',  name: 'Oberflächen abstauben',cat: 'Allgemein', pts: 6,  time: 15, cycle: 14 },
  { id: 't6',  name: 'Pfand wegbringen',     cat: 'Allgemein', pts: 5,  time: 15, cycle: 10 },
  { id: 't7',  name: 'Staubsaugen',          cat: 'Allgemein', pts: 8,  time: 20, cycle: 7 },
  { id: 't8',  name: 'Timi reinigen',        cat: 'Allgemein', pts: 6,  time: 10, cycle: 7 },
  { id: 't9',  name: 'Wocheneinkauf',        cat: 'Allgemein', pts: 12, time: 60, cycle: 7 },
  { id: 't10', name: 'Zwischendurcheinkauf', cat: 'Allgemein', pts: 4,  time: 20, cycle: 3 },
  { id: 't11', name: 'Mülleimer leeren',     cat: 'Bad',       pts: 3,  time: 5,  cycle: 7 },
  { id: 't12', name: 'Bad putzen',           cat: 'Bad',       pts: 14, time: 35, cycle: 10 },
  { id: 't13', name: 'Abwaschen',            cat: 'Küche',     pts: 5,  time: 15, cycle: 1 },
  { id: 't14', name: 'Spüler ausräumen',     cat: 'Küche',     pts: 3,  time: 5,  cycle: 2 },
  { id: 't15', name: 'Kochen',               cat: 'Küche',     pts: 8,  time: 40, cycle: 1 },
  { id: 't16', name: 'Kühlschrank reinigen', cat: 'Küche',     pts: 10, time: 25, cycle: 30 },
  { id: 't17', name: 'Müll rausbringen',     cat: 'Küche',     pts: 4,  time: 5,  cycle: 4 },
  { id: 't18', name: 'Oberflächen reinigen', cat: 'Küche',     pts: 5,  time: 10, cycle: 3 },
  { id: 't19', name: 'Ofen reinigen',        cat: 'Küche',     pts: 12, time: 40, cycle: 60 },
  { id: 't20', name: 'Geschirr wegräumen',   cat: 'Küche',     pts: 2,  time: 5,  cycle: 1 },
  { id: 't21', name: 'Aufräumen',            cat: 'Schlafzimmer', pts: 5, time: 15, cycle: 7 },
  { id: 't22', name: 'Bettwäsche wechseln',  cat: 'Schlafzimmer', pts: 10, time: 20, cycle: 14 },
  { id: 't23', name: 'Aufräumen Wohnzimmer', cat: 'Wohnzimmer', pts: 5, time: 15, cycle: 5 },
  { id: 't24', name: 'Wäsche waschen',       cat: 'Wäsche',    pts: 5,  time: 10, cycle: 4 },
  { id: 't25', name: 'Wäsche aufhängen',     cat: 'Wäsche',    pts: 4,  time: 10, cycle: 4 },
  { id: 't26', name: 'Wäsche wegräumen',     cat: 'Wäsche',    pts: 4,  time: 10, cycle: 5 },
];

// Repetition frequency labels (weekly / bi-weekly etc.) for UX
function freqLabel(cycle) {
  if (cycle <= 1) return 'täglich';
  if (cycle <= 3) return 'alle paar Tage';
  if (cycle <= 7) return 'wöchentlich';
  if (cycle <= 14) return 'alle 2 Wochen';
  if (cycle <= 31) return 'monatlich';
  if (cycle <= 60) return 'alle 2 Monate';
  return 'quartalsweise';
}

// Members — softer palette to match warm vibe
const MEMBERS = [
  { id: 'lotta',  name: 'Lotta',  initial: 'L', color: 'rgb(215, 128, 96)',  bg: 'rgb(249, 223, 210)' },
  { id: 'marcos', name: 'Marcos', initial: 'M', color: 'rgb(138, 152, 190)', bg: 'rgb(224, 230, 244)' },
];

// Generate seeded, plausible logs (90 days). Each log carries memberId, ts, streak-able.
function generateLogs() {
  const logs = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let seed = 137;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  // Bias: Marcos dominates Küche (streak). Lotta dominates Bad + Wäsche.
  // Both share Allgemein roughly.
  for (let d = 90; d >= 0; d--) {
    const ts = now - d * day;
    const n = 2 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const task = TASKS[Math.floor(rand() * TASKS.length)];
      let member;
      if (task.cat === 'Küche') member = rand() < 0.82 ? 'marcos' : 'lotta';
      else if (task.cat === 'Bad' || task.cat === 'Wäsche') member = rand() < 0.78 ? 'lotta' : 'marcos';
      else if (task.cat === 'Wohnzimmer') member = rand() < 0.7 ? 'lotta' : 'marcos';
      else member = rand() < 0.52 ? 'lotta' : 'marcos';
      logs.push({
        taskId: task.id, taskName: task.name, cat: task.cat,
        pts: task.pts, time: task.time, memberId: member,
        ts: ts - Math.floor(rand() * day * 0.8),
      });
    }
  }
  return logs.sort((a, b) => b.ts - a.ts);
}

const LOGS = generateLogs();

function lastDoneByTask(logs) {
  const m = {};
  logs.forEach(l => { if (!m[l.taskId] || l.ts > m[l.taskId]) m[l.taskId] = l; });
  return m;
}

// Streak per task: consecutive times same person did it (most recent first)
function taskStreak(logs, taskId) {
  const filtered = logs.filter(l => l.taskId === taskId).sort((a, b) => b.ts - a.ts);
  if (filtered.length === 0) return { member: null, count: 0 };
  const who = filtered[0].memberId;
  let c = 0;
  for (const l of filtered) {
    if (l.memberId === who) c++;
    else break;
  }
  return { member: who, count: c };
}

// Category streak: how many consecutive task-logs in category by same member
function categoryStreak(logs, cat) {
  const filtered = logs.filter(l => l.cat === cat).sort((a, b) => b.ts - a.ts);
  if (filtered.length === 0) return { member: null, count: 0, coverage: 0, days: 0 };
  const who = filtered[0].memberId;
  let c = 0;
  for (const l of filtered) {
    if (l.memberId === who) c++;
    else break;
  }
  // coverage this month
  const monthAgo = Date.now() - 30 * 86400000;
  const thisMonth = filtered.filter(l => l.ts >= monthAgo);
  const byWho = thisMonth.filter(l => l.memberId === who).length;
  const coverage = thisMonth.length > 0 ? byWho / thisMonth.length : 0;
  // days since first in current streak
  const streakLogs = filtered.slice(0, c);
  const oldestStreak = streakLogs.length > 0 ? streakLogs[streakLogs.length - 1].ts : Date.now();
  const days = Math.floor((Date.now() - oldestStreak) / 86400000);
  return { member: who, count: c, coverage, days };
}

// Quota: how much of the household's monthly expected workload is done
function monthlyQuota(logs) {
  // Expected: sum of time across all tasks scaled by (30/cycle) for the month
  const expected = TASKS.reduce((s, t) => s + (t.time * (30 / t.cycle)), 0);
  const monthAgo = Date.now() - 30 * 86400000;
  const done = logs.filter(l => l.ts >= monthAgo).reduce((s, l) => s + l.time, 0);
  return { done, expected: Math.round(expected), pct: Math.min(1, done / expected) };
}

function timeByMember(logs, uid, since) {
  return logs.filter(l => l.memberId === uid && l.ts >= since).reduce((s, l) => s + l.time, 0);
}

function formatMinutes(min) {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'heute';
  if (days === 1) return 'gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 14) return 'letzte Woche';
  if (days < 60) return `vor ${Math.floor(days/7)} Wochen`;
  return `vor ${Math.floor(days/30)} Monaten`;
}

// Find tasks where Member A has been doing all the work (streak >= 3)
function entlastungCandidates(logs, otherUser) {
  return TASKS.map(t => {
    const s = taskStreak(logs, t.id);
    return { ...t, streak: s };
  }).filter(t => t.streak.count >= 3 && t.streak.member !== otherUser)
    .sort((a, b) => b.streak.count - a.streak.count);
}

Object.assign(window, {
  CATEGORIES, TASKS, TASK_ICONS, MEMBERS, LOGS,
  freqLabel, lastDoneByTask, taskStreak, categoryStreak, monthlyQuota,
  timeByMember, formatMinutes, timeAgo, entlastungCandidates,
});

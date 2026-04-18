// Design tokens for ChoreWars / Haushalts App

const CATEGORIES = {
  Allgemein:   { hue: 'rgb(124, 92, 255)', soft: 'rgb(238, 232, 255)', deep: 'rgb(60, 39, 152)', emoji: '✦', label: 'Allgemein' },
  Bad:         { hue: 'rgb(0, 168, 184)', soft: 'rgb(217, 244, 247)', deep: 'rgb(7, 79, 88)', emoji: '◐', label: 'Bad' },
  Küche:       { hue: 'rgb(232, 79, 50)', soft: 'rgb(255, 226, 219)', deep: 'rgb(110, 26, 8)', emoji: '◆', label: 'Küche' },
  Schlafzimmer:{ hue: 'rgb(78, 96, 196)', soft: 'rgb(225, 230, 251)', deep: 'rgb(28, 41, 110)', emoji: '☾', label: 'Schlafzimmer' },
  Wohnzimmer:  { hue: 'rgb(220, 138, 50)', soft: 'rgb(254, 235, 211)', deep: 'rgb(116, 64, 12)', emoji: '◍', label: 'Wohnzimmer' },
  Wäsche:      { hue: 'rgb(195, 86, 156)', soft: 'rgb(252, 224, 240)', deep: 'rgb(98, 27, 73)', emoji: '◊', label: 'Wäsche' },
};

// Master task list with default points and cycle days
const TASKS = [
  // Allgemein
  { id: 't1',  name: 'Altglas wegbringen',   cat: 'Allgemein', pts: 8,  cycle: 14 },
  { id: 't2',  name: 'Blumen gießen',        cat: 'Allgemein', pts: 3,  cycle: 4 },
  { id: 't3',  name: 'Blumen umtopfen',      cat: 'Allgemein', pts: 12, cycle: 90 },
  { id: 't4',  name: 'Feudeln',              cat: 'Allgemein', pts: 10, cycle: 14 },
  { id: 't5',  name: 'Oberflächen abstauben',cat: 'Allgemein', pts: 6,  cycle: 14 },
  { id: 't6',  name: 'Pfand wegbringen',     cat: 'Allgemein', pts: 5,  cycle: 10 },
  { id: 't7',  name: 'Staubsaugen',          cat: 'Allgemein', pts: 8,  cycle: 7 },
  { id: 't8',  name: 'Timi reinigen',        cat: 'Allgemein', pts: 6,  cycle: 7 },
  { id: 't9',  name: 'Wocheneinkauf',        cat: 'Allgemein', pts: 12, cycle: 7 },
  { id: 't10', name: 'Zwischendurcheinkauf', cat: 'Allgemein', pts: 4,  cycle: 3 },
  // Bad
  { id: 't11', name: 'Mülleimer leeren',     cat: 'Bad',       pts: 3,  cycle: 7 },
  { id: 't12', name: 'Bad putzen',           cat: 'Bad',       pts: 14, cycle: 10 },
  // Küche
  { id: 't13', name: 'Abwaschen',            cat: 'Küche',     pts: 5,  cycle: 1 },
  { id: 't14', name: 'Geschirrspüler ausräumen', cat: 'Küche', pts: 3,  cycle: 2 },
  { id: 't15', name: 'Kochen',               cat: 'Küche',     pts: 8,  cycle: 1 },
  { id: 't16', name: 'Kühlschrank reinigen', cat: 'Küche',     pts: 10, cycle: 30 },
  { id: 't17', name: 'Müll rausbringen',     cat: 'Küche',     pts: 4,  cycle: 4 },
  { id: 't18', name: 'Oberflächen reinigen', cat: 'Küche',     pts: 5,  cycle: 3 },
  { id: 't19', name: 'Ofen reinigen',        cat: 'Küche',     pts: 12, cycle: 60 },
  { id: 't20', name: 'Geschirr wegräumen',   cat: 'Küche',     pts: 2,  cycle: 1 },
  // Schlafzimmer
  { id: 't21', name: 'Aufräumen',            cat: 'Schlafzimmer', pts: 5, cycle: 7 },
  { id: 't22', name: 'Bettwäsche wechseln',  cat: 'Schlafzimmer', pts: 10, cycle: 14 },
  // Wohnzimmer
  { id: 't23', name: 'Aufräumen',            cat: 'Wohnzimmer', pts: 5, cycle: 5 },
  // Wäsche
  { id: 't24', name: 'Wäsche Waschen',       cat: 'Wäsche',    pts: 5,  cycle: 4 },
  { id: 't25', name: 'Wäsche Aufhängen',     cat: 'Wäsche',    pts: 4,  cycle: 4 },
  { id: 't26', name: 'Wäsche wegräumen',     cat: 'Wäsche',    pts: 4,  cycle: 5 },
];

// Members
const MEMBERS = [
  { id: 'lotta',  name: 'Lotta',  initial: 'L', color: 'rgb(232, 79, 50)',  bg: 'rgb(255, 226, 219)' },
  { id: 'marcos', name: 'Marcos', initial: 'M', color: 'rgb(78, 96, 196)',  bg: 'rgb(225, 230, 251)' },
];

// Generate plausible task log history (last 60 days)
function generateLogs() {
  const logs = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  // Seeded "random" for stability
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let d = 60; d >= 0; d--) {
    const ts = now - d * day;
    // Each day, ~2-5 tasks happen
    const n = 2 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const task = TASKS[Math.floor(rand() * TASKS.length)];
      // Lotta does 55%, Marcos 45%
      const member = rand() < 0.55 ? 'lotta' : 'marcos';
      logs.push({
        taskId: task.id,
        taskName: task.name,
        cat: task.cat,
        pts: task.pts,
        memberId: member,
        ts: ts - Math.floor(rand() * day),
      });
    }
  }
  return logs.sort((a,b) => b.ts - a.ts);
}

const LOGS = generateLogs();

// Compute "last done" per task (any user) and per task per user
function lastDoneByTask(logs) {
  const m = {};
  logs.forEach(l => { if (!m[l.taskId] || l.ts > m[l.taskId]) m[l.taskId] = l.ts; });
  return m;
}

function lastDoneByTaskUser(logs, uid) {
  const m = {};
  logs.filter(l => l.memberId === uid).forEach(l => {
    if (!m[l.taskId] || l.ts > m[l.taskId]) m[l.taskId] = l.ts;
  });
  return m;
}

// Season starts 21 days ago
const SEASON_START = Date.now() - 21 * 24 * 60 * 60 * 1000;
const SEASON_NUMBER = 7;

function pointsThisSeason(logs, uid) {
  return logs.filter(l => l.memberId === uid && l.ts >= SEASON_START)
    .reduce((s, l) => s + l.pts, 0);
}

function pointsAllTime(logs, uid) {
  return logs.filter(l => l.memberId === uid).reduce((s, l) => s + l.pts, 0);
}

function streakDays(logs, uid) {
  // count consecutive days with at least one log for this user, ending today
  const day = 86400000;
  const today = new Date();
  today.setHours(0,0,0,0);
  let streak = 0;
  for (let d = 0; d < 60; d++) {
    const dayStart = today.getTime() - d * day;
    const dayEnd = dayStart + day;
    const has = logs.some(l => l.memberId === uid && l.ts >= dayStart && l.ts < dayEnd);
    if (has) streak++;
    else if (d > 0) break; // allow today to be empty
  }
  return streak;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'heute';
  if (days === 1) return 'gestern';
  if (days < 7) return `vor ${days} T.`;
  if (days < 14) return 'letzte Woche';
  if (days < 60) return `vor ${Math.floor(days/7)} Wo.`;
  return `vor ${Math.floor(days/30)} Mon.`;
}

Object.assign(window, {
  CATEGORIES, TASKS, MEMBERS, LOGS, SEASON_START, SEASON_NUMBER,
  lastDoneByTask, lastDoneByTaskUser, pointsThisSeason, pointsAllTime,
  streakDays, timeAgo,
});

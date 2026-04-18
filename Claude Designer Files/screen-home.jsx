// Screen: Home / Fällige Aufgaben

function HomeScreen({ state, onComplete, onNavigate, currentUser }) {
  const lotta = window.MEMBERS[0];
  const marcos = window.MEMBERS[1];
  const lottaPts = window.pointsThisSeason(state.logs, 'lotta');
  const marcosPts = window.pointsThisSeason(state.logs, 'marcos');
  const total = lottaPts + marcosPts || 1;
  const me = window.MEMBERS.find(m => m.id === currentUser);

  // Compute fällige Aufgaben
  const lastDone = window.lastDoneByTask(state.logs);
  const now = Date.now();
  const due = window.TASKS.map(t => {
    const last = lastDone[t.id];
    const dueIn = last ? (last + t.cycle * 86400000 - now) / 86400000 : -t.cycle;
    return { ...t, last, dueIn, overdueDays: Math.max(0, -dueIn) };
  }).filter(t => t.dueIn <= 1).sort((a, b) => a.dueIn - b.dueIn).slice(0, 8);

  const streakL = window.streakDays(state.logs, 'lotta');
  const streakM = window.streakDays(state.logs, 'marcos');

  const seasonDay = Math.floor((now - window.SEASON_START) / 86400000);

  return (
    <div style={{ paddingBottom: 140 }}>
      {/* Header */}
      <div style={{ padding: '60px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
              color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
              letterSpacing: 0.4, textTransform: 'uppercase',
            }}>Saison {window.SEASON_NUMBER} · Tag {seasonDay}</div>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 36, fontWeight: 400, lineHeight: 1.1, marginTop: 6,
              letterSpacing: -0.5,
              color: state.dark ? '#fff' : '#111',
              maxWidth: 230,
            }}>Hallo, {me.name}.</div>
            <div style={{
              fontFamily: 'Geist, system-ui', fontSize: 15, marginTop: 4,
              color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
            }}>{due.length} Aufgaben warten auf dich</div>
          </div>
          <div onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}>
            <Avatar member={me} size={44} />
          </div>
        </div>
      </div>

      {/* Score arena card */}
      <div style={{
        margin: '24px 16px 0',
        padding: '20px 18px 16px',
        borderRadius: 28,
        background: state.dark
          ? 'linear-gradient(135deg, rgb(40,40,52) 0%, rgb(28,28,40) 100%)'
          : 'linear-gradient(135deg, rgb(255,250,243) 0%, rgb(255,238,225) 100%)',
        border: state.dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -30, width: 140, height: 140,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,79,50,0.18), transparent 70%)',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 600,
            color: state.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: 0.6,
          }}>Punktestand</div>
          <Pill bg={state.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
                fg={state.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)'}
                style={{ whiteSpace: 'nowrap' }}>
            {Icons.clock(11, 'currentColor')} <span>noch 9 Tage</span>
          </Pill>
        </div>

        {/* Two-member race */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { m: lotta, pts: lottaPts, streak: streakL },
            { m: marcos, pts: marcosPts, streak: streakM },
          ].map(({ m, pts, streak }, i) => {
            const winning = (i === 0 ? lottaPts : marcosPts) === Math.max(lottaPts, marcosPts);
            const pct = pts / total;
            return (
              <div key={m.id} style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Avatar member={m} size={32} />
                  <div>
                    <div style={{
                      fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
                      color: state.dark ? '#fff' : '#111',
                    }}>{m.name} {winning && pts > 0 && <span style={{ color: 'rgb(220,138,50)' }}>👑</span>}</div>
                    <div style={{
                      fontSize: 11, color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <span style={{ color: 'rgb(232,79,50)' }}>{Icons.flame(11)}</span>
                      <span>{streak}d Streak</span>
                    </div>
                  </div>
                </div>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif',
                  fontSize: 36, fontWeight: 400, lineHeight: 1,
                  color: m.color, letterSpacing: -1,
                }}>{pts}</div>
                {/* Progress vs leader */}
                <div style={{
                  marginTop: 8, height: 6, borderRadius: 3,
                  background: state.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct * 100}%`, height: '100%',
                    background: m.color, borderRadius: 3,
                    transition: 'width 0.6s cubic-bezier(.2,.8,.2,1)',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '28px 24px 12px', gap: 12,
      }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 24, lineHeight: 1.1,
          color: state.dark ? '#fff' : '#111', letterSpacing: -0.3, whiteSpace: 'nowrap',
        }}>Heute fällig</div>
        <div onClick={() => onNavigate('neglected')} style={{
          fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
          color: 'rgb(124,92,255)', cursor: 'pointer',
        }}>Für mich →</div>
      </div>

      {/* Task cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {due.map(t => (
          <TaskCard key={t.id} task={t} dark={state.dark} onComplete={onComplete} />
        ))}
        {due.length === 0 && (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
            fontFamily: 'Geist, system-ui', fontSize: 14,
          }}>Alles erledigt! 🌿</div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, dark, onComplete, showOwner = false }) {
  const cat = window.CATEGORIES[task.cat];
  const [done, setDone] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const handle = () => {
    if (done) return;
    setDone(true);
    setTimeout(() => onComplete(task), 300);
  };

  const overdue = task.overdueDays > 0;
  const lastTxt = task.last ? window.timeAgo(task.last) : 'noch nie';

  return (
    <div style={{
      background: dark ? 'rgb(28,28,36)' : '#fff',
      borderRadius: 20, padding: '14px 14px 14px 14px',
      display: 'flex', alignItems: 'center', gap: 14,
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
      boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.025)',
      opacity: done ? 0.5 : 1,
      transform: done ? 'scale(0.97)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(.2,.8,.2,1)',
    }}>
      <CategoryDot cat={task.cat} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 15, fontWeight: 600,
          color: dark ? '#fff' : '#111', letterSpacing: -0.2,
          textDecoration: done ? 'line-through' : 'none',
        }}>{task.name}</div>
        <div style={{
          marginTop: 3, display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          fontFamily: 'Geist, system-ui',
        }}>
          <span>{cat.label}</span>
          <span>·</span>
          <span style={{ color: overdue ? 'rgb(232,79,50)' : 'inherit', fontWeight: overdue ? 600 : 400 }}>
            {overdue ? `${Math.floor(task.overdueDays)}d überfällig` : `zuletzt ${lastTxt}`}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22,
          color: cat.hue, lineHeight: 1, letterSpacing: -0.5,
        }}>+{task.pts}</div>
        <button
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onClick={handle}
          style={{
            border: 'none', cursor: 'pointer',
            width: 36, height: 36, borderRadius: '50%',
            background: done ? 'rgb(46, 184, 92)' : cat.hue,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: pressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s, background 0.3s',
            boxShadow: `0 4px 14px ${cat.hue.replace('rgb', 'rgba').replace(')', ', 0.45)')}`,
          }}
        >
          {Icons.check(18, 'white', 3)}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, TaskCard });

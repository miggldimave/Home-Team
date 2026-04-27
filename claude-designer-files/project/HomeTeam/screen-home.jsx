// Home screen — today's focus, appreciation-first

function HomeScreen({ state, onComplete, onNavigate, onKudos, onOpenTask, currentUser }) {
  const me = window.MEMBERS.find(m => m.id === currentUser);
  const other = window.MEMBERS.find(m => m.id !== currentUser);
  const dark = state.dark;

  // Quota + time
  const quota = window.monthlyQuota(state.logs);
  const monthAgo = Date.now() - 30 * 86400000;
  const myTime = window.timeByMember(state.logs, me.id, monthAgo);
  const otherTime = window.timeByMember(state.logs, other.id, monthAgo);
  const totalTime = myTime + otherTime || 1;

  // Due tasks
  const lastDone = window.lastDoneByTask(state.logs);
  const now = Date.now();
  const due = window.TASKS.map(t => {
    const last = lastDone[t.id];
    const lastTs = last?.ts;
    const dueIn = lastTs ? (lastTs + t.cycle * 86400000 - now) / 86400000 : -t.cycle;
    return { ...t, last, dueIn, overdueDays: Math.max(0, -dueIn) };
  }).filter(t => t.dueIn <= 1).sort((a, b) => a.dueIn - b.dueIn).slice(0, 5);

  // Entlastung candidate — top streak by other user
  const entlastung = window.entlastungCandidates(state.logs, me.id)[0];

  // Recent activity by other user (last 7 days) — for kudos
  const weekAgo = Date.now() - 7 * 86400000;
  const recentByOther = state.logs
    .filter(l => l.memberId === other.id && l.ts >= weekAgo)
    .slice(0, 3);

  const txt = dark ? '#F2ECE4' : '#2A221E';
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)';
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.72)';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)';

  const myHours = Math.round(myTime / 60 * 10) / 10;

  return (
    <div style={{ paddingBottom: 140, position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
              color: muted, letterSpacing: 0.5, textTransform: 'uppercase',
            }}>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif',
              fontSize: 40, fontWeight: 400, lineHeight: 1.05, marginTop: 4,
              letterSpacing: -0.5, color: txt,
            }}>Hallo, <em style={{ fontStyle: 'italic' }}>{me.name}</em>.</div>
          </div>
          <div onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}>
            <Avatar member={me} size={44} />
          </div>
        </div>
      </div>

      {/* Team quota card */}
      <div style={{
        margin: '22px 16px 0', padding: '18px 20px 18px',
        borderRadius: 24, background: cardBg, border: cardBorder,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 600,
            color: muted, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>Team diesen Monat</div>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 12, color: muted, fontWeight: 500,
          }}>{Math.round(quota.pct * 100)}%</div>
        </div>
        {/* Shared bar — two-color stacked, no winner/loser */}
        <div style={{
          height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex',
          background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        }}>
          <div style={{ width: `${(myTime/totalTime) * quota.pct * 100}%`, background: me.color, transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }}/>
          <div style={{ width: `${(otherTime/totalTime) * quota.pct * 100}%`, background: other.color, transition: 'width 0.8s cubic-bezier(.2,.8,.2,1)' }}/>
        </div>
        <div style={{
          marginTop: 10, display: 'flex', justifyContent: 'space-between',
          fontFamily: 'Geist, system-ui', fontSize: 12, color: muted,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: me.color }}/>
            <span>{me.name} · {window.formatMinutes(myTime)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{other.name} · {window.formatMinutes(otherTime)}</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: other.color }}/>
          </div>
        </div>
        <div style={{
          marginTop: 14, paddingTop: 14,
          borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18, lineHeight: 1.3,
          color: txt, letterSpacing: -0.2,
        }}>
          Ihr habt zusammen schon <em>{window.formatMinutes(quota.done)}</em> investiert.
        </div>
      </div>

      {/* Entlastungs-Karte — dezent, warm */}
      {entlastung && (
        <div style={{
          margin: '14px 16px 0', padding: '16px 18px',
          borderRadius: 22,
          background: `linear-gradient(135deg, ${window.CATEGORIES[entlastung.cat].soft} 0%, ${dark ? 'rgba(215,128,96,0.12)' : 'rgba(249,223,210,0.55)'} 100%)`,
          border: cardBorder, position: 'relative', overflow: 'hidden',
          cursor: 'pointer',
        }} onClick={() => onOpenTask(entlastung)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Avatar member={other} size={40} />
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                background: 'rgb(253,248,241)', borderRadius: '50%',
                width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              }}>
                <Flame size={12} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18,
                color: txt, letterSpacing: -0.2, lineHeight: 1.3,
              }}>
                {other.name} hat <em>{entlastung.name}</em> die letzten {entlastung.streak.count} Mal gemacht.
              </div>
              <div style={{
                marginTop: 6, fontFamily: 'Geist, system-ui', fontSize: 13,
                color: muted,
              }}>Magst du als nächstes?</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={(e) => { e.stopPropagation(); onComplete(entlastung); }} style={{
              flex: 1, border: 'none', cursor: 'pointer',
              padding: '10px 14px', borderRadius: 999,
              background: txt, color: dark ? '#2A221E' : '#FDF8F1',
              fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              Ich mach's · {window.formatMinutes(entlastung.time)}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onKudos(other, entlastung); }} style={{
              border: 'none', cursor: 'pointer',
              padding: '10px 14px', borderRadius: 999,
              background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
              color: txt,
              fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Heart size={14} filled color={me.color}/>
              Danke
            </button>
          </div>
        </div>
      )}

      {/* Appreciation feed — "was {other} gemacht hat" */}
      {recentByOther.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ padding: '0 24px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22,
              color: txt, letterSpacing: -0.2, lineHeight: 1.1,
            }}>Was <em>{other.name}</em> gemacht hat</div>
            <div onClick={() => onNavigate('appreciate')} style={{
              fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
              color: muted, cursor: 'pointer',
            }}>mehr</div>
          </div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentByOther.map((l, i) => {
              const task = window.TASKS.find(t => t.id === l.taskId);
              if (!task) return null;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 16,
                  background: cardBg, border: cardBorder,
                }}>
                  <TaskIconTile task={task} size={36}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 500,
                      color: txt, letterSpacing: -0.1,
                    }}>{l.taskName}</div>
                    <div style={{
                      fontSize: 11, color: muted, fontFamily: 'Geist, system-ui',
                      marginTop: 2,
                    }}>{window.timeAgo(l.ts)} · {window.formatMinutes(l.time)}</div>
                  </div>
                  <button onClick={() => onKudos(other, task, l)} style={{
                    border: 'none', cursor: 'pointer', width: 34, height: 34,
                    borderRadius: '50%',
                    background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Heart size={16} color={me.color}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heute fällig */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '24px 24px 12px',
      }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, lineHeight: 1.1,
          color: txt, letterSpacing: -0.2,
        }}>Heute dran</div>
        <div onClick={() => onNavigate('list')} style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
          color: muted, cursor: 'pointer',
        }}>alle ansehen</div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {due.map(t => (
          <TaskRow key={t.id} task={t} dark={dark} onComplete={onComplete} onOpen={onOpenTask} state={state}/>
        ))}
        {due.length === 0 && (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 20,
            color: muted, fontStyle: 'italic',
          }}>alles erledigt — Zeit für Kaffee.</div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, dark, onComplete, onOpen, state, hideFlame = false }) {
  const streak = window.taskStreak(state.logs, task.id);
  const lastDoneBy = streak.member ? window.MEMBERS.find(m => m.id === streak.member) : null;
  const cat = window.CATEGORIES[task.cat];
  const [done, setDone] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const handle = (e) => {
    e.stopPropagation();
    if (done) return;
    setDone(true);
    setTimeout(() => onComplete(task), 280);
  };

  const txt = dark ? '#F2ECE4' : '#2A221E';
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)';
  const lastTxt = task.last ? window.timeAgo(task.last.ts) : 'noch nie';

  return (
    <div onClick={() => onOpen && onOpen(task)} style={{
      background: dark ? 'rgba(50,40,44,0.6)' : 'rgba(255,255,255,0.75)',
      borderRadius: 20, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      border: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      opacity: done ? 0.45 : 1, cursor: 'pointer',
      transform: done ? 'scale(0.98)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(.2,.8,.2,1)',
    }}>
      <TaskIconTile task={task} size={42}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 15, fontWeight: 500,
          color: txt, letterSpacing: -0.15,
          textDecoration: done ? 'line-through' : 'none',
        }}>{task.name}</div>
        <div style={{
          marginTop: 3, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, color: muted, fontFamily: 'Geist, system-ui',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {Icons.clock(11, muted)} {window.formatMinutes(task.time)}
          </span>
          <span>·</span>
          <span>zuletzt {lastTxt}</span>
          {!hideFlame && lastDoneBy && streak.count >= 2 && (
            <>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: lastDoneBy.color, fontWeight: 600 }}>
                <Flame size={10} color={lastDoneBy.color}/>
                {lastDoneBy.name} ×{streak.count}
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
          border: 'none', cursor: 'pointer',
          width: 38, height: 38, borderRadius: '50%',
          background: done ? 'rgb(138, 170, 138)' : cat.hue,
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: pressed ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.15s, background 0.3s',
          flexShrink: 0,
        }}
      >
        {Icons.check(18, 'white', 2.6)}
      </button>
    </div>
  );
}

Object.assign(window, { HomeScreen, TaskRow });

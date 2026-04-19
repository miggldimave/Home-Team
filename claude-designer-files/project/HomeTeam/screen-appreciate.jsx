// Wertschätzung — Appreciation dashboard with Unsung Hero + category streaks

function AppreciateScreen({ state, onNavigate, onKudos, currentUser }) {
  const dark = state.dark;
  const me = window.MEMBERS.find(m => m.id === currentUser);
  const other = window.MEMBERS.find(m => m.id !== currentUser);

  const monthAgo = Date.now() - 30 * 86400000;
  const weekAgo = Date.now() - 7 * 86400000;

  // Category highlights — who dominates each
  const catHighlights = Object.keys(window.CATEGORIES).map(c => {
    const cs = window.categoryStreak(state.logs, c);
    return { cat: c, ...cs };
  }).filter(h => h.coverage >= 0.6 && h.member)
    .sort((a, b) => b.coverage - a.coverage);

  // Unsung hero — biggest current task streak by each member
  const allStreaks = window.TASKS.map(t => ({ task: t, streak: window.taskStreak(state.logs, t.id) }))
    .filter(x => x.streak.count >= 3);
  const heroByMember = {};
  allStreaks.forEach(x => {
    const uid = x.streak.member;
    if (!heroByMember[uid] || x.streak.count > heroByMember[uid].streak.count) heroByMember[uid] = x;
  });

  // Recent other-user activity for kudos feed
  const recentByOther = state.logs
    .filter(l => l.memberId === other.id && l.ts >= weekAgo)
    .slice(0, 6);

  const txt = dark ? '#F2ECE4' : '#2A221E';
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)';
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.75)';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)';

  const hero = heroByMember[other.id];

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
          color: muted, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>diesen Monat</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: txt, marginTop: 4,
        }}>Wertschätzung</div>
      </div>

      {/* Unsung hero card */}
      {hero && (
        <div style={{
          margin: '22px 16px 0', padding: '22px 20px',
          borderRadius: 26,
          background: `linear-gradient(140deg, ${other.bg} 0%, ${dark ? 'rgba(50,40,44,0.85)' : 'rgba(255,255,255,0.9)'} 75%)`,
          border: cardBorder, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 180, height: 180,
            borderRadius: '50%', filter: 'blur(40px)',
            background: `${other.color.replace('rgb', 'rgba').replace(')', ', 0.22)')}`,
          }}/>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar member={other} size={54} ring ringColor={other.color}/>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
                color: other.color, letterSpacing: 0.8, textTransform: 'uppercase',
              }}>Stille*r Held*in</div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28,
                color: txt, letterSpacing: -0.3, lineHeight: 1.1, marginTop: 2,
              }}>{other.name}</div>
            </div>
          </div>
          <div style={{
            marginTop: 16, fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 20,
            color: txt, lineHeight: 1.35, letterSpacing: -0.2,
          }}>
            Hat <em>{hero.task.name}</em> die letzten <em>{hero.streak.count}×</em> erledigt.
          </div>
          <button onClick={() => onKudos(other, hero.task)} style={{
            marginTop: 14, border: 'none', cursor: 'pointer',
            padding: '10px 18px', borderRadius: 999,
            background: txt, color: dark ? '#2A221E' : '#FDF8F1',
            fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <Heart size={14} filled color={me.color}/>
            Danke sagen
          </button>
        </div>
      )}

      {/* Category leaderboard — cooperative framing */}
      <div style={{ marginTop: 26 }}>
        <div style={{
          padding: '0 24px 10px',
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22,
          color: txt, letterSpacing: -0.2,
        }}>Wer rockt was</div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {catHighlights.map(h => {
            const m = window.MEMBERS.find(mm => mm.id === h.member);
            const cat = window.CATEGORIES[h.cat];
            return (
              <div key={h.cat} style={{
                padding: '14px 16px', borderRadius: 18,
                background: cardBg, border: cardBorder,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <CategoryOrb cat={h.cat} size={36}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 600,
                    color: txt, letterSpacing: -0.1,
                  }}>{cat.label}</div>
                  <div style={{
                    marginTop: 3, fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16,
                    color: muted, letterSpacing: -0.1, lineHeight: 1.2,
                  }}><em>{m.name}</em> hat <em>{Math.round(h.coverage * 100)}%</em> gemacht</div>
                </div>
                <Avatar member={m} size={32}/>
              </div>
            );
          })}
          {catHighlights.length === 0 && (
            <div style={{
              padding: 20, textAlign: 'center',
              fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18,
              color: muted, fontStyle: 'italic',
            }}>alles schön geteilt diesen Monat.</div>
          )}
        </div>
      </div>

      {/* Kudos feed */}
      <div style={{ marginTop: 26 }}>
        <div style={{
          padding: '0 24px 10px',
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22,
          color: txt, letterSpacing: -0.2,
        }}>Diese Woche</div>

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
                    fontSize: 11, color: muted, fontFamily: 'Geist, system-ui', marginTop: 2,
                  }}>{other.name} · {window.timeAgo(l.ts)} · {window.formatMinutes(l.time)}</div>
                </div>
                <button onClick={() => onKudos(other, task, l)} style={{
                  border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%',
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
    </div>
  );
}

Object.assign(window, { AppreciateScreen });

// Screen: Task list grouped by category + Leaderboard

function TaskListScreen({ state, onComplete, onNavigate }) {
  const [filter, setFilter] = React.useState('Alle');
  const lastDone = window.lastDoneByTask(state.logs);
  const cats = ['Alle', ...Object.keys(window.CATEGORIES)];

  const grouped = {};
  window.TASKS.forEach(t => {
    if (filter !== 'Alle' && t.cat !== filter) return;
    (grouped[t.cat] = grouped[t.cat] || []).push({ ...t, last: lastDone[t.id] });
  });

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
          color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>26 Aufgaben · 6 Kategorien</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1.05, letterSpacing: -0.5,
          color: state.dark ? '#fff' : '#111', marginTop: 4,
        }}>Alle Aufgaben</div>
      </div>

      {/* Filter chips */}
      <div style={{
        marginTop: 18, padding: '0 16px',
        display: 'flex', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {cats.map(c => {
          const active = filter === c;
          const cat = window.CATEGORIES[c];
          return (
            <button key={c} onClick={() => setFilter(c)} style={{
              flexShrink: 0, border: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 999,
              fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
              background: active
                ? (cat ? cat.hue : (state.dark ? '#fff' : '#111'))
                : (state.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
              color: active
                ? (cat ? '#fff' : (state.dark ? '#000' : '#fff'))
                : (state.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'),
              letterSpacing: -0.1,
            }}>{c}</button>
          );
        })}
      </div>

      {/* Categories */}
      <div style={{ padding: '20px 16px 0' }}>
        {Object.entries(grouped).map(([catName, tasks]) => {
          const cat = window.CATEGORIES[catName];
          return (
            <div key={catName} style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0 8px 12px',
              }}>
                <CategoryDot cat={catName} size={24} />
                <div style={{
                  fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 600,
                  color: state.dark ? '#fff' : '#111',
                }}>{cat.label}</div>
                <div style={{
                  fontSize: 12, color: state.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                  fontFamily: 'Geist, system-ui',
                }}>{tasks.length}</div>
              </div>
              <div style={{
                background: state.dark ? 'rgb(28,28,36)' : '#fff',
                borderRadius: 22, overflow: 'hidden',
                border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              }}>
                {tasks.map((t, i) => (
                  <div key={t.id} style={{
                    padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderTop: i > 0 ? `1px solid ${state.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 500,
                        color: state.dark ? '#fff' : '#111',
                      }}>{t.name}</div>
                      <div style={{
                        fontSize: 11, marginTop: 2, fontFamily: 'Geist, system-ui',
                        color: state.dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                      }}>alle {t.cycle}T · {t.last ? window.timeAgo(t.last) : 'noch nie'}</div>
                    </div>
                    <div style={{
                      fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18,
                      color: cat.hue, lineHeight: 1, marginRight: 6,
                    }}>+{t.pts}</div>
                    <button onClick={() => onComplete(t)} style={{
                      border: 'none', cursor: 'pointer',
                      width: 32, height: 32, borderRadius: '50%',
                      background: state.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: cat.hue,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{Icons.check(16, cat.hue, 2.5)}</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Leaderboard with podium + season history

function LeaderboardScreen({ state, onNavigate, onResetSeason }) {
  const [scope, setScope] = React.useState('season'); // season | alltime
  const lottaPts = scope === 'season' ? window.pointsThisSeason(state.logs, 'lotta') : window.pointsAllTime(state.logs, 'lotta');
  const marcosPts = scope === 'season' ? window.pointsThisSeason(state.logs, 'marcos') : window.pointsAllTime(state.logs, 'marcos');
  const ranked = [
    { ...window.MEMBERS[0], pts: lottaPts },
    { ...window.MEMBERS[1], pts: marcosPts },
  ].sort((a,b) => b.pts - a.pts);
  const _wrapper = true;

  // fake season history
  const history = [
    { n: 6, winner: 'Marcos', winnerColor: window.MEMBERS[1].color, score: '184 - 162' },
    { n: 5, winner: 'Lotta',  winnerColor: window.MEMBERS[0].color, score: '210 - 176' },
    { n: 4, winner: 'Lotta',  winnerColor: window.MEMBERS[0].color, score: '195 - 188' },
    { n: 3, winner: 'Marcos', winnerColor: window.MEMBERS[1].color, score: '154 - 122' },
  ];

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
          color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>Saison {window.SEASON_NUMBER}</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1.05, letterSpacing: -0.5,
          color: state.dark ? '#fff' : '#111', marginTop: 4,
        }}>Wer führt?</div>
      </div>

      {/* Toggle */}
      <div style={{
        margin: '20px 16px 0', padding: 4, borderRadius: 999,
        background: state.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
        display: 'flex',
      }}>
        {[['season', 'Diese Saison'], ['alltime', 'All-Time']].map(([k, l]) => (
          <button key={k} onClick={() => setScope(k)} style={{
            flex: 1, border: 'none', cursor: 'pointer',
            padding: '10px', borderRadius: 999,
            background: scope === k ? (state.dark ? '#fff' : '#111') : 'transparent',
            color: scope === k ? (state.dark ? '#000' : '#fff') : (state.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'),
            fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: 13,
            transition: 'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      {/* Podium */}
      <div style={{
        margin: '24px 16px 0', padding: '24px 18px 24px',
        borderRadius: 28,
        background: state.dark
          ? 'linear-gradient(180deg, rgb(38,32,55) 0%, rgb(24,22,38) 100%)'
          : 'linear-gradient(180deg, rgb(248,242,255) 0%, rgb(255,250,243) 100%)',
        border: state.dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        gap: 16, marginBottom: 12,
      }}>
          {ranked.map((m, i) => {
            const heights = [120, 80];
            const h = heights[i];
            return (
              <div key={m.id} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                animation: `slideUp 0.5s ${i * 0.1}s cubic-bezier(.2,.8,.2,1) backwards`,
              }}>
                {i === 0 && (
                  <div style={{
                    fontSize: 28, marginBottom: 4, position: 'relative',
                    width: 28, height: 32,
                  }}>
                    <span style={{
                      position: 'absolute', left: '50%', transformOrigin: 'center',
                      animation: 'wiggle 2.5s ease-in-out infinite',
                    }}>👑</span>
                  </div>
                )}
                {i !== 0 && <div style={{ height: 36 }}/>}
                <Avatar member={m} size={56} ring={i === 0} />
                <div style={{
                  marginTop: 8,
                  fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 600,
                  color: state.dark ? '#fff' : '#111',
                }}>{m.name}</div>
                <div style={{
                  fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 32,
                  color: m.color, lineHeight: 1, marginTop: 2, letterSpacing: -1,
                }}>{m.pts}</div>
                <div style={{
                  width: '100%', height: h, marginTop: 12,
                  borderRadius: '14px 14px 0 0',
                  background: `linear-gradient(180deg, ${m.color} 0%, ${m.color.replace('rgb', 'rgba').replace(')', ', 0.6)')} 100%)`,
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: 14, color: 'white',
                  fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28,
                }}>{i + 1}</div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 13,
            color: state.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
          }}>
            Vorsprung: <span style={{ fontWeight: 700, color: ranked[0].color }}>
              +{ranked[0].pts - ranked[1].pts} Punkte
            </span>
          </div>
        </div>
      </div>

      {/* Season History */}
      {scope === 'alltime' && (
        <>
          <div style={{
            padding: '28px 24px 12px',
            fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22,
            color: state.dark ? '#fff' : '#111', letterSpacing: -0.3,
          }}>Trophäensammlung</div>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map(s => (
              <div key={s.n} style={{
                background: state.dark ? 'rgb(28,28,36)' : '#fff',
                borderRadius: 18, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: s.winnerColor, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 20,
                }}>S{s.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 600,
                    color: state.dark ? '#fff' : '#111',
                  }}>Saison {s.n} · {s.winner} 🏆</div>
                  <div style={{
                    fontSize: 12, color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                    fontFamily: 'Geist, system-ui',
                  }}>Endstand {s.score}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {scope === 'season' && (
        <div style={{ padding: '28px 16px 0' }}>
          <button onClick={onResetSeason} style={{
            width: '100%', padding: '14px',
            background: 'transparent',
            border: `1.5px dashed ${state.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
            color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
            borderRadius: 18, cursor: 'pointer',
            fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
          }}>
            🏁 Saison beenden & krönen
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TaskListScreen, LeaderboardScreen });

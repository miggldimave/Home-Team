// Screen: Long-neglected for current user

function NeglectedScreen({ state, onComplete, onNavigate, currentUser }) {
  const me = window.MEMBERS.find(m => m.id === currentUser);
  const other = window.MEMBERS.find(m => m.id !== currentUser);
  const lastByMe = window.lastDoneByTaskUser(state.logs, currentUser);
  const now = Date.now();

  const tasks = window.TASKS.map(t => {
    const last = lastByMe[t.id];
    const days = last ? (now - last) / 86400000 : 999;
    return { ...t, last, daysSinceMe: days };
  }).sort((a,b) => b.daysSinceMe - a.daysSinceMe).slice(0, 6);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <button onClick={() => onNavigate('home')} style={{
          background: 'none', border: 'none', padding: 0, marginBottom: 12,
          color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'Geist, system-ui', fontSize: 14,
        }}>{Icons.back(18)} Zurück</button>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1.05, letterSpacing: -0.5,
          color: state.dark ? '#fff' : '#111',
        }}>Drückeberger-<br/>Modus</div>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 15, marginTop: 8,
          color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
        }}>Diese Aufgaben hast <em>du</em> lange nicht mehr gemacht. {other.name} hat sie für dich übernommen.</div>
      </div>

      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => {
          const cat = window.CATEGORIES[t.cat];
          const intensity = Math.min(1, t.daysSinceMe / 30);
          return (
            <div key={t.id} style={{
              background: state.dark ? 'rgb(28,28,36)' : '#fff',
              borderRadius: 20, padding: 14,
              border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              boxShadow: state.dark ? 'none' : '0 1px 2px rgba(0,0,0,0.03)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 3, background: `rgba(232, 79, 50, ${intensity})`,
              }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CategoryDot cat={t.cat} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Geist, system-ui', fontSize: 15, fontWeight: 600,
                    color: state.dark ? '#fff' : '#111', letterSpacing: -0.2,
                  }}>{t.name}</div>
                  <div style={{
                    fontSize: 12, marginTop: 2, fontFamily: 'Geist, system-ui',
                    color: 'rgb(232, 79, 50)', fontWeight: 500,
                  }}>
                    {t.last
                      ? `Du: zuletzt vor ${Math.floor(t.daysSinceMe)} Tagen`
                      : 'Du hast das noch nie gemacht'}
                  </div>
                </div>
                <button onClick={() => onComplete(t)} style={{
                  border: 'none', background: cat.hue, color: 'white',
                  padding: '10px 16px', borderRadius: 999,
                  fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: `0 4px 12px ${cat.hue.replace('rgb', 'rgba').replace(')', ', 0.4)')}`,
                }}>
                  +{t.pts}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { NeglectedScreen });

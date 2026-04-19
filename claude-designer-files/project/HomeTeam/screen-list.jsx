// Aufgaben-Liste — grouped by category with streaks per task

function TaskListScreen({ state, onComplete, onOpenTask, onAddTask }) {
  const dark = state.dark;
  const [filter, setFilter] = React.useState('Alle');
  const cats = ['Alle', ...Object.keys(window.CATEGORIES)];

  const lastDone = window.lastDoneByTask(state.logs);
  const grouped = {};
  window.TASKS.forEach(t => {
    if (filter !== 'Alle' && t.cat !== filter) return;
    const last = lastDone[t.id];
    (grouped[t.cat] = grouped[t.cat] || []).push({ ...t, last });
  });

  const txt = dark ? '#F2ECE4' : '#2A221E';
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)';

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
          color: muted, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>26 Aufgaben · 6 Kategorien</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5, color: txt,
          }}>Aufgaben</div>
          <button onClick={onAddTask} style={{
            border: 'none', cursor: 'pointer',
            width: 40, height: 40, borderRadius: '50%',
            background: txt, color: dark ? '#2A221E' : '#FDF8F1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icons.plus(20, 'currentColor')}</button>
        </div>
      </div>

      {/* Filter chips — horizontal scroll */}
      <div style={{
        marginTop: 16, padding: '0 16px 4px',
        display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {cats.map(c => {
          const active = filter === c;
          const cat = window.CATEGORIES[c];
          return (
            <button key={c} onClick={() => setFilter(c)} style={{
              flexShrink: 0, border: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 999,
              fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
              background: active
                ? (cat ? cat.hue : txt)
                : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              color: active ? '#fff' : (dark ? txt : 'rgba(0,0,0,0.65)'),
              letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {cat && <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.85)' : cat.hue }}/>}
              {c}
            </button>
          );
        })}
      </div>

      {/* Grouped */}
      <div style={{ padding: '16px 16px 0' }}>
        {Object.entries(grouped).map(([catName, tasks]) => {
          const cat = window.CATEGORIES[catName];
          const catStreak = window.categoryStreak(state.logs, catName);
          const streakMember = catStreak.member ? window.MEMBERS.find(m => m.id === catStreak.member) : null;

          return (
            <div key={catName} style={{ marginBottom: 26 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px 10px',
              }}>
                <CategoryOrb cat={catName} size={22}/>
                <div style={{
                  fontFamily: 'Geist, system-ui', fontSize: 14, fontWeight: 600,
                  color: txt, letterSpacing: -0.1,
                }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: muted, fontFamily: 'Geist, system-ui' }}>{tasks.length}</div>
                {streakMember && catStreak.coverage > 0.6 && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: streakMember.color, fontFamily: 'Geist, system-ui', fontWeight: 600,
                  }}>
                    <Flame size={10} color={streakMember.color}/>
                    <span>{streakMember.name} · {Math.round(catStreak.coverage * 100)}%</span>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {tasks.map(t => (
                  <TaskRow key={t.id} task={t} dark={dark} onComplete={onComplete}
                    onOpen={onOpenTask} state={state}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { TaskListScreen });

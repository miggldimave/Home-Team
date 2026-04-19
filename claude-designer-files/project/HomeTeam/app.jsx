// Home-Team — Main app shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "darkMode": false,
  "currentUser": "lotta",
  "showDesktop": false
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = React.useState(false);
  const [screen, setScreen] = React.useState(() => localStorage.getItem('ht-screen') || 'home');
  const [openTask, setOpenTask] = React.useState(null);
  const [logs, setLogs] = React.useState(window.LOGS);
  const [showPetals, setShowPetals] = React.useState(false);
  const [showHearts, setShowHearts] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { localStorage.setItem('ht-screen', screen); }, [screen]);

  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      else if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  const state = { logs, dark: tweaks.darkMode };

  const handleComplete = (task) => {
    const me = window.MEMBERS.find(m => m.id === tweaks.currentUser);
    const newLog = {
      taskId: task.id, taskName: task.name, cat: task.cat,
      pts: task.pts, time: task.time, memberId: tweaks.currentUser, ts: Date.now(),
    };
    setLogs(prev => [newLog, ...prev]);
    setShowPetals(true);
    setTimeout(() => setShowPetals(false), 2500);
    setToast({ kind: 'done', task: task.name, time: task.time, color: window.CATEGORIES[task.cat].hue });
    setTimeout(() => setToast(null), 2600);
    if (openTask && openTask.id === task.id) setOpenTask(null);
  };

  const handleKudos = (toMember, task) => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 2200);
    setToast({ kind: 'kudos', name: toMember.name, task: task.name, color: toMember.color });
    setTimeout(() => setToast(null), 2600);
  };

  const renderScreen = () => {
    if (openTask) return (
      <TaskDetailScreen state={state} task={openTask}
        onComplete={handleComplete} onBack={() => setOpenTask(null)}
        onKudos={handleKudos} currentUser={tweaks.currentUser}/>
    );
    if (screen === 'home') return <HomeScreen state={state} onComplete={handleComplete}
      onNavigate={(s) => setScreen(s)} onKudos={handleKudos}
      onOpenTask={(t) => setOpenTask(t)} currentUser={tweaks.currentUser}/>;
    if (screen === 'list') return <TaskListScreen state={state} onComplete={handleComplete}
      onOpenTask={(t) => setOpenTask(t)} onAddTask={() => {}}/>;
    if (screen === 'appreciate') return <AppreciateScreen state={state}
      onNavigate={(s) => setScreen(s)} onKudos={handleKudos} currentUser={tweaks.currentUser}/>;
    if (screen === 'analytics') return <AnalyticsScreen state={state}/>;
    return null;
  };

  const dark = tweaks.darkMode;
  const txt = dark ? '#F2ECE4' : '#2A221E';

  const TabBar = () => {
    if (openTask) return null;
    const tabs = [
      { k: 'home',       l: 'Heute',        icon: Icons.home },
      { k: 'list',       l: 'Aufgaben',     icon: Icons.list },
      { k: 'appreciate', l: 'Wertsch.',     icon: Icons.heart },
      { k: 'analytics',  l: 'Balance',      icon: Icons.chart },
    ];
    return (
      <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 50 }}>
        <div style={{
          background: dark ? 'rgba(40,32,36,0.82)' : 'rgba(253,248,241,0.82)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
          borderRadius: 26, padding: '10px 8px 14px',
          display: 'flex', justifyContent: 'space-around',
          boxShadow: dark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {tabs.map(t => {
            const active = screen === t.k;
            const c = active ? 'rgb(215, 128, 96)' : (dark ? 'rgba(242,236,228,0.5)' : 'rgba(42,34,30,0.45)');
            return (
              <button key={t.k} onClick={() => setScreen(t.k)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '4px 10px',
              }}>
                {t.icon(22, c)}
                <span style={{
                  fontSize: 10, fontWeight: active ? 600 : 500,
                  color: c, fontFamily: 'Geist, system-ui', letterSpacing: -0.1,
                }}>{t.l}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes heartRise { to { transform: translate(var(--drift), -340px) scale(0.6); opacity: 0; } }
        @keyframes petalFall { to { transform: translateY(900px) rotate(var(--rotEnd)); opacity: 0; } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 32, minHeight: '100vh', padding: '40px 20px',
        background: dark
          ? 'radial-gradient(ellipse at top, rgb(34,26,30) 0%, rgb(14,12,16) 70%)'
          : 'radial-gradient(ellipse at top, rgb(248,240,230) 0%, rgb(232,222,210) 70%)',
        flexWrap: 'wrap', fontFamily: 'Geist, system-ui',
      }}>
        <IOSDevice dark={dark}>
          <WarmBackdrop dark={dark}>
            <div style={{ position: 'relative', height: '100%', overflow: 'auto' }}>
              {renderScreen()}
              <TabBar/>
              <Petals active={showPetals}/>
              <Hearts active={showHearts} color={window.MEMBERS.find(m => m.id === tweaks.currentUser).color}/>
              {toast && (
                <div style={{
                  position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
                  zIndex: 150, background: dark ? 'rgba(255,255,255,0.95)' : '#2A221E',
                  color: dark ? '#2A221E' : '#FDF8F1',
                  padding: '10px 16px', borderRadius: 999,
                  fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  animation: 'toastIn 0.35s cubic-bezier(.2,.8,.2,1)',
                  display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  maxWidth: '85%',
                }}>
                  {toast.kind === 'done' ? (
                    <><div style={{ width: 8, height: 8, borderRadius: '50%', background: toast.color }}/>
                    <span>{toast.task} · +{window.formatMinutes(toast.time)}</span></>
                  ) : (
                    <><Heart size={14} filled color={toast.color}/>
                    <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 15 }}>
                      Danke an <em>{toast.name}</em>
                    </span></>
                  )}
                </div>
              )}
            </div>
          </WarmBackdrop>
        </IOSDevice>

        {tweaks.showDesktop && <DesktopShell state={state} tweaks={tweaks}/>}
      </div>

      {editMode && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 999,
          background: 'rgba(20,18,22,0.95)', color: 'white',
          padding: 16, borderRadius: 18, width: 240,
          backdropFilter: 'blur(20px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          fontFamily: 'Geist, system-ui',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5,
            textTransform: 'uppercase', opacity: 0.7 }}>Tweaks</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Theme</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['Hell', false], ['Dunkel', true]].map(([l, v]) => (
                <button key={l} onClick={() => updateTweak('darkMode', v)} style={{
                  flex: 1, padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: tweaks.darkMode === v ? 'rgb(215, 128, 96)' : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 12, fontWeight: 600,
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Aktiver User</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {window.MEMBERS.map(m => (
                <button key={m.id} onClick={() => updateTweak('currentUser', m.id)} style={{
                  flex: 1, padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: tweaks.currentUser === m.id ? m.color : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 12, fontWeight: 600,
                }}>{m.name}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Springe zu</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[
                ['home', 'Heute'], ['list', 'Aufgaben'],
                ['appreciate', 'Wertsch.'], ['analytics', 'Balance'],
              ].map(([k, l]) => (
                <button key={k} onClick={() => { setScreen(k); setOpenTask(null); }} style={{
                  padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: screen === k && !openTask ? 'rgb(215,128,96)' : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 11, fontWeight: 500,
                }}>{l}</button>
              ))}
            </div>
            <button onClick={() => setOpenTask(window.TASKS[12])} style={{
              width: '100%', marginTop: 8, padding: 8, borderRadius: 8,
              border: 'none', cursor: 'pointer',
              background: 'rgba(215, 128, 96, 0.35)', color: 'white',
              fontSize: 12, fontWeight: 500,
            }}>Aufgaben-Detail öffnen</button>
          </div>
        </div>
      )}
    </>
  );
}

// Desktop companion
function DesktopShell({ state, tweaks }) {
  const dark = tweaks.darkMode;
  const monthAgo = Date.now() - 30 * 86400000;
  const lottaT = window.timeByMember(state.logs, 'lotta', monthAgo);
  const marcosT = window.timeByMember(state.logs, 'marcos', monthAgo);
  const txt = dark ? '#F2ECE4' : '#2A221E';
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)';
  return (
    <div style={{
      width: 720, height: 480, borderRadius: 18, overflow: 'hidden',
      background: dark ? 'rgb(14,12,16)' : 'rgb(253,248,241)',
      boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      display: 'flex', fontFamily: 'Geist, system-ui',
    }}>
      <div style={{
        width: 200, background: dark ? 'rgb(20,18,22)' : 'rgb(248,241,232)',
        padding: 18, borderRight: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, color: txt, marginBottom: 18 }}>Home-Team</div>
        {['Heute', 'Aufgaben', 'Wertschätzung', 'Balance'].map((l, i) => (
          <div key={l} style={{
            padding: '8px 10px', borderRadius: 10, marginBottom: 2,
            background: i === 0 ? 'rgba(215,128,96,0.14)' : 'transparent',
            color: i === 0 ? 'rgb(215,128,96)' : (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
            fontSize: 13, fontWeight: i === 0 ? 600 : 500,
          }}>{l}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 30, color: txt, letterSpacing: -0.4 }}>Hallo, Lotta.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          {window.MEMBERS.map((m, i) => (
            <div key={m.id} style={{
              padding: 14, borderRadius: 16, background: dark ? 'rgb(30,26,30)' : '#fff',
              border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar member={m} size={28}/>
                <span style={{ fontSize: 13, fontWeight: 600, color: txt }}>{m.name}</span>
              </div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, color: m.color,
                lineHeight: 1, marginTop: 6, letterSpacing: -0.4,
              }}>{window.formatMinutes(i === 0 ? lottaT : marcosT)}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>diesen Monat</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.App = App;

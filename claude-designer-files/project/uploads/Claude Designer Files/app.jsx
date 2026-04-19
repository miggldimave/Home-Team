// Main app shell — navigation, tweaks, confetti orchestration

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "darkMode": false,
  "currentUser": "lotta",
  "showDesktop": false
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = React.useState(false);
  const [screen, setScreen] = React.useState(() => {
    return localStorage.getItem('cw-screen') || 'onboarding';
  });
  const [logs, setLogs] = React.useState(window.LOGS);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [showCeremony, setShowCeremony] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('cw-screen', screen);
  }, [screen]);

  // Tweaks bridge
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
    const newLog = {
      taskId: task.id, taskName: task.name, cat: task.cat,
      pts: task.pts, memberId: tweaks.currentUser, ts: Date.now(),
    };
    setLogs(prev => [newLog, ...prev]);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
    const me = window.MEMBERS.find(m => m.id === tweaks.currentUser);
    setToast({ task: task.name, pts: task.pts, color: window.CATEGORIES[task.cat].hue, member: me });
    setTimeout(() => setToast(null), 2800);
  };

  const navigate = (s) => setScreen(s);

  const renderScreen = () => {
    if (screen === 'onboarding') return <Onboarding state={state} onEnter={(uid) => { updateTweak('currentUser', uid); setScreen('home'); }}/>;
    if (screen === 'home') return <HomeScreen state={state} onComplete={handleComplete} onNavigate={navigate} currentUser={tweaks.currentUser}/>;
    if (screen === 'neglected') return <NeglectedScreen state={state} onComplete={handleComplete} onNavigate={navigate} currentUser={tweaks.currentUser}/>;
    if (screen === 'list') return <TaskListScreen state={state} onComplete={handleComplete} onNavigate={navigate}/>;
    if (screen === 'leaderboard') return <LeaderboardScreen state={state} onNavigate={navigate} onResetSeason={() => setShowCeremony(true)}/>;
    if (screen === 'dashboard') return <DashboardScreen state={state} onNavigate={navigate}/>;
    return null;
  };

  const TabBar = () => {
    if (screen === 'onboarding') return null;
    const tabs = [
      { k: 'home',        l: 'Heute',    icon: Icons.home },
      { k: 'list',        l: 'Aufgaben', icon: Icons.list },
      { k: 'leaderboard', l: 'Rangliste',icon: Icons.trophy },
      { k: 'dashboard',   l: 'Statistik',icon: Icons.chart },
    ];
    return (
      <div style={{
        position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 50,
      }}>
        <div style={{
          background: tweaks.darkMode ? 'rgba(28,28,36,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: tweaks.darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
          borderRadius: 26, padding: '10px 8px 14px',
          display: 'flex', justifyContent: 'space-around',
          boxShadow: tweaks.darkMode ? '0 8px 28px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {tabs.map(t => {
            const active = screen === t.k;
            const c = active ? 'rgb(124, 92, 255)' : (tweaks.darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)');
            return (
              <button key={t.k} onClick={() => setScreen(t.k)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '4px 10px',
              }}>
                {t.icon(22, c)}
                <span style={{
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  color: c, fontFamily: 'Geist, system-ui',
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
      {/* Phone frame */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 32, minHeight: '100vh', padding: '40px 20px',
        background: tweaks.darkMode
          ? 'radial-gradient(ellipse at top, rgb(30,28,40) 0%, rgb(12,12,18) 70%)'
          : 'radial-gradient(ellipse at top, rgb(252,247,240) 0%, rgb(238,232,224) 70%)',
        flexWrap: 'wrap',
      }}>
        <IOSDevice dark={tweaks.darkMode}>
          <div style={{
            position: 'relative', height: '100%', overflow: 'auto',
            background: tweaks.darkMode ? 'rgb(12,12,20)' : 'rgb(252,250,247)',
          }}>
            {renderScreen()}
            <TabBar/>
            <Confetti active={showConfetti} count={70}/>
            {toast && (
              <div style={{
                position: 'absolute', top: 60, left: '50%',
                transform: 'translateX(-50%)', zIndex: 150,
                background: toast.color, color: 'white',
                padding: '10px 18px', borderRadius: 999,
                fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
                boxShadow: `0 8px 24px ${toast.color.replace('rgb', 'rgba').replace(')', ', 0.45)')}`,
                animation: 'toastIn 0.4s cubic-bezier(.2,.8,.2,1)',
                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
              }}>
                {Icons.check(16, 'white', 3)}
                <span>{toast.task} · +{toast.pts}</span>
              </div>
            )}
            {showCeremony && <SeasonCeremony state={state} onClose={() => setShowCeremony(false)}/>}
          </div>
        </IOSDevice>

        {tweaks.showDesktop && <DesktopShell state={state} tweaks={tweaks}/>}
      </div>

      {/* Tweaks panel */}
      {editMode && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 999,
          background: 'rgba(20,20,30,0.95)', color: 'white',
          padding: 16, borderRadius: 18, width: 240,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          fontFamily: 'Geist, system-ui',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase', opacity: 0.7 }}>Tweaks</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Theme</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['Light', false], ['Dark', true]].map(([l, v]) => (
                <button key={l} onClick={() => updateTweak('darkMode', v)} style={{
                  flex: 1, padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: tweaks.darkMode === v ? '#7C5CFF' : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 12, fontWeight: 600,
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
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

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Desktop-Ansicht</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['Aus', false], ['An', true]].map(([l, v]) => (
                <button key={l} onClick={() => updateTweak('showDesktop', v)} style={{
                  flex: 1, padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: tweaks.showDesktop === v ? '#7C5CFF' : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 12, fontWeight: 600,
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Springe zu Screen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[
                ['onboarding', 'Onboard'], ['home', 'Heute'],
                ['neglected', 'Drücke.'], ['list', 'Liste'],
                ['leaderboard', 'Rang'], ['dashboard', 'Stats'],
              ].map(([k, l]) => (
                <button key={k} onClick={() => setScreen(k)} style={{
                  padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: screen === k ? '#7C5CFF' : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 11, fontWeight: 500,
                }}>{l}</button>
              ))}
            </div>
            <button onClick={() => setShowCeremony(true)} style={{
              width: '100%', marginTop: 8, padding: 8, borderRadius: 8,
              border: 'none', cursor: 'pointer',
              background: 'rgba(232, 79, 50, 0.4)', color: 'white',
              fontSize: 12, fontWeight: 600,
            }}>🏁 Saison-Krönung zeigen</button>
          </div>
        </div>
      )}
    </>
  );
}

// Lightweight desktop preview
function DesktopShell({ state, tweaks }) {
  const lottaPts = window.pointsThisSeason(state.logs, 'lotta');
  const marcosPts = window.pointsThisSeason(state.logs, 'marcos');
  return (
    <div style={{
      width: 720, height: 480, borderRadius: 18, overflow: 'hidden',
      background: tweaks.darkMode ? 'rgb(12,12,20)' : 'rgb(252,250,247)',
      boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      display: 'flex',
    }}>
      {/* Sidebar */}
      <div style={{
        width: 200, background: tweaks.darkMode ? 'rgb(20,20,28)' : 'rgb(248,245,240)',
        padding: 18, display: 'flex', flexDirection: 'column', gap: 4,
        borderRight: tweaks.darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22,
          color: tweaks.darkMode ? '#fff' : '#111', letterSpacing: -0.3, marginBottom: 18,
        }}>ChoreWars</div>
        {[['Heute', true], ['Aufgaben', false], ['Rangliste', false], ['Statistik', false]].map(([l, a]) => (
          <div key={l} style={{
            padding: '8px 10px', borderRadius: 10,
            background: a ? 'rgba(124,92,255,0.12)' : 'transparent',
            color: a ? 'rgb(124,92,255)' : (tweaks.darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
            fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: a ? 600 : 500,
          }}>{l}</div>
        ))}
      </div>
      {/* Body */}
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
          color: tweaks.darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>Saison {window.SEASON_NUMBER}</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 32,
          color: tweaks.darkMode ? '#fff' : '#111', letterSpacing: -0.5, lineHeight: 1.05, marginTop: 4,
        }}>Hallo, Lotta.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
          {[
            { m: window.MEMBERS[0], pts: lottaPts },
            { m: window.MEMBERS[1], pts: marcosPts },
          ].map(({m, pts}) => (
            <div key={m.id} style={{
              padding: 14, borderRadius: 16,
              background: tweaks.darkMode ? 'rgb(28,28,36)' : '#fff',
              border: tweaks.darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar member={m} size={28}/>
                <span style={{ fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
                  color: tweaks.darkMode ? '#fff' : '#111' }}>{m.name}</span>
              </div>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 36,
                color: m.color, lineHeight: 1, marginTop: 6, letterSpacing: -1,
              }}>{pts}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, padding: 14, borderRadius: 16,
          background: tweaks.darkMode ? 'rgb(28,28,36)' : '#fff',
          border: tweaks.darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
            color: tweaks.darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>Heute fällig · 8</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {window.TASKS.slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CategoryDot cat={t.cat} size={24}/>
                <span style={{ flex: 1, fontFamily: 'Geist, system-ui', fontSize: 13,
                  color: tweaks.darkMode ? '#fff' : '#111' }}>{t.name}</span>
                <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16,
                  color: window.CATEGORIES[t.cat].hue }}>+{t.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.App = App;

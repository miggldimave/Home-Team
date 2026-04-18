// Dashboard screen + Season-winner ceremony + Onboarding

function DashboardScreen({ state, onNavigate }) {
  const [period, setPeriod] = React.useState('30');
  const days = parseInt(period);
  const now = Date.now();
  const cutoff = now - days * 86400000;
  const filtered = state.logs.filter(l => l.ts >= cutoff);

  const lottaPts = filtered.filter(l => l.memberId === 'lotta').reduce((s,l) => s+l.pts, 0);
  const marcosPts = filtered.filter(l => l.memberId === 'marcos').reduce((s,l) => s+l.pts, 0);
  const total = lottaPts + marcosPts || 1;

  // Build sparkline data — points per day per user
  const dayData = [];
  for (let d = days - 1; d >= 0; d--) {
    const start = now - (d+1) * 86400000;
    const end = now - d * 86400000;
    const l = state.logs.filter(x => x.memberId === 'lotta' && x.ts >= start && x.ts < end).reduce((s,x) => s+x.pts, 0);
    const m = state.logs.filter(x => x.memberId === 'marcos' && x.ts >= start && x.ts < end).reduce((s,x) => s+x.pts, 0);
    dayData.push({ l, m });
  }
  // cumulative
  let cl = 0, cm = 0;
  const cum = dayData.map(d => { cl += d.l; cm += d.m; return { l: cl, m: cm }; });
  const maxCum = Math.max(...cum.map(d => Math.max(d.l, d.m)), 1);

  // Category breakdown
  const catBreakdown = {};
  filtered.forEach(l => {
    catBreakdown[l.cat] = (catBreakdown[l.cat] || 0) + l.pts;
  });
  const catSorted = Object.entries(catBreakdown).sort((a,b) => b[1] - a[1]);
  const catTotal = catSorted.reduce((s, [_,v]) => s+v, 0) || 1;

  // Heatmap — last 28 days, intensity per day
  const heat = [];
  for (let d = 27; d >= 0; d--) {
    const start = now - (d+1) * 86400000;
    const end = now - d * 86400000;
    const cnt = state.logs.filter(x => x.ts >= start && x.ts < end).length;
    heat.push(cnt);
  }
  const maxHeat = Math.max(...heat, 1);

  const W = 330, H = 130;

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
          color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>Rückblick · letzte {days} Tage</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 38, lineHeight: 1.05, letterSpacing: -0.5,
          color: state.dark ? '#fff' : '#111', marginTop: 4,
        }}>Statistik</div>
      </div>

      {/* Period selector */}
      <div style={{ padding: '16px 16px 0', display: 'flex', gap: 6 }}>
        {[['7','7T'],['30','30T'],['90','Quartal'],['365','Jahr']].map(([k,l]) => (
          <button key={k} onClick={() => setPeriod(k)} style={{
            flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
            borderRadius: 12,
            background: period === k
              ? (state.dark ? '#fff' : '#111')
              : (state.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
            color: period === k
              ? (state.dark ? '#000' : '#fff')
              : (state.dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'),
            fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: 12,
          }}>{l}</button>
        ))}
      </div>

      {/* Verlauf chart */}
      <div style={{
        margin: '16px 16px 0', padding: '18px 16px',
        background: state.dark ? 'rgb(28,28,36)' : '#fff',
        borderRadius: 24,
        border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{
              fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 600,
              color: state.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>Verlauf</div>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28,
              color: state.dark ? '#fff' : '#111', lineHeight: 1, marginTop: 4,
              letterSpacing: -0.5,
            }}>{lottaPts + marcosPts} Punkte gesamt</div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            {window.MEMBERS.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }}/>
                <span style={{ fontSize: 11, fontFamily: 'Geist, system-ui',
                  color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
        <svg width={W} height={H} style={{ display: 'block', marginTop: 6, overflow: 'visible' }}>
          {/* grid */}
          {[0, 0.5, 1].map(y => (
            <line key={y} x1={0} x2={W} y1={H * y} y2={H * y}
              stroke={state.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} strokeWidth="1"/>
          ))}
          {/* lines */}
          {['l','m'].map(key => {
            const c = key === 'l' ? window.MEMBERS[0].color : window.MEMBERS[1].color;
            const pts = cum.map((d,i) => `${(i / (cum.length-1)) * W},${H - (d[key]/maxCum) * H}`).join(' ');
            const area = `M0,${H} L${pts.split(' ').join(' L')} L${W},${H} Z`;
            return (
              <g key={key}>
                <path d={area} fill={c} opacity="0.08"/>
                <polyline points={pts} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                <circle cx={W} cy={H - (cum[cum.length-1][key]/maxCum) * H} r="4" fill={c}/>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Two columns */}
      <div style={{ padding: '12px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Donut */}
        <div style={{
          padding: '16px',
          background: state.dark ? 'rgb(28,28,36)' : '#fff',
          borderRadius: 22,
          border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
            color: state.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
          }}>Verteilung</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Donut a={lottaPts} b={marcosPts}
                   ca={window.MEMBERS[0].color} cb={window.MEMBERS[1].color} size={100}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {window.MEMBERS.map((m, i) => {
              const pts = i === 0 ? lottaPts : marcosPts;
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 12, fontFamily: 'Geist, system-ui',
                  color: state.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color }}/>
                    <span>{m.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{Math.round(pts/total*100)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top categories */}
        <div style={{
          padding: '16px',
          background: state.dark ? 'rgb(28,28,36)' : '#fff',
          borderRadius: 22,
          border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
            color: state.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
          }}>Top Kategorien</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {catSorted.slice(0, 4).map(([cat, pts]) => {
              const c = window.CATEGORIES[cat];
              const pct = pts / catTotal;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    fontSize: 11, fontFamily: 'Geist, system-ui', marginBottom: 3,
                    color: state.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  }}>
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                    <span>{Math.round(pct*100)}%</span>
                  </div>
                  <div style={{
                    height: 5, borderRadius: 3,
                    background: state.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: `${pct*100}%`, height: '100%', background: c.hue, borderRadius: 3 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{
        margin: '8px 16px 0', padding: '16px',
        background: state.dark ? 'rgb(28,28,36)' : '#fff',
        borderRadius: 22,
        border: state.dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
            color: state.dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}>Aktivität · 4 Wochen</div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center',
            fontSize: 10, fontFamily: 'Geist, system-ui',
            color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          }}>
            <span>weniger</span>
            {[0.2, 0.4, 0.7, 1].map(o => (
              <div key={o} style={{ width: 9, height: 9, borderRadius: 2,
                background: `rgba(124, 92, 255, ${o})` }}/>
            ))}
            <span>mehr</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(28, 1fr)', gap: 3 }}>
          {heat.map((cnt, i) => {
            const intensity = cnt > 0 ? 0.2 + (cnt / maxHeat) * 0.8 : 0.05;
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 3,
                background: cnt > 0
                  ? `rgba(124, 92, 255, ${intensity})`
                  : (state.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
              }}/>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div style={{ padding: '16px', margin: '8px 0 0' }}>
        <div style={{
          background: state.dark
            ? 'linear-gradient(135deg, rgb(40,28,52) 0%, rgb(28,22,40) 100%)'
            : 'linear-gradient(135deg, rgb(238,232,255) 0%, rgb(252,224,240) 100%)',
          borderRadius: 22, padding: '16px',
          border: state.dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
        }}>
          <div style={{
            fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
            color: 'rgb(124,92,255)', textTransform: 'uppercase', letterSpacing: 0.5,
          }}>{Icons.spark(11)} Insight</div>
          <div style={{
            marginTop: 6,
            fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 18,
            color: state.dark ? '#fff' : '#111', lineHeight: 1.25, letterSpacing: -0.2,
          }}>
            <em>{catSorted[0]?.[0]}</em> macht <em>{Math.round((catSorted[0]?.[1] || 0)/catTotal*100)}%</em> der
            Punkte aus — gefolgt von {catSorted[1]?.[0]}.
          </div>
        </div>
      </div>
    </div>
  );
}

function Donut({ a, b, ca, cb, size = 100 }) {
  const total = a + b || 1;
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const aFrac = a / total;
  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${size/2} ${size/2})`}>
        <circle cx={size/2} cy={size/2} r={r} stroke={cb} strokeWidth="14" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={ca} strokeWidth="14" fill="none"
          strokeDasharray={`${c * aFrac} ${c}`}/>
      </g>
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        fontFamily="'Instrument Serif', Georgia, serif" fontSize="22" fill="currentColor">
        {Math.round(aFrac * 100)}%
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------
// Season ceremony

function SeasonCeremony({ state, onClose }) {
  const lottaPts = window.pointsThisSeason(state.logs, 'lotta');
  const marcosPts = window.pointsThisSeason(state.logs, 'marcos');
  const winner = lottaPts >= marcosPts ? window.MEMBERS[0] : window.MEMBERS[1];
  const winnerPts = lottaPts >= marcosPts ? lottaPts : marcosPts;
  const loserPts = lottaPts >= marcosPts ? marcosPts : lottaPts;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: `linear-gradient(180deg, ${winner.color} 0%, ${state.dark ? '#000' : '#fff'} 80%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '70px 24px 24px', overflow: 'hidden',
    }}>
      <Confetti active={true} count={120}/>
      <div style={{
        fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 600,
        color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}>Saison {window.SEASON_NUMBER} · Finale</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 52,
        color: '#fff', marginTop: 4, letterSpacing: -1, lineHeight: 1,
      }}>Krönung</div>
      <div style={{ marginTop: 32, position: 'relative' }}>
        <div style={{
          fontSize: 64, position: 'absolute', top: -38, left: '50%',
          transform: 'translateX(-50%)',
          animation: 'wiggle 2.5s ease-in-out infinite',
        }}>👑</div>
        <div style={{
          width: 130, height: 130, borderRadius: '50%',
          background: winner.bg, color: winner.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 70,
          boxShadow: '0 0 0 8px rgba(255,255,255,0.5), 0 20px 60px rgba(0,0,0,0.3)',
        }}>{winner.initial}</div>
      </div>
      <div style={{
        marginTop: 20, fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 44, color: '#fff', lineHeight: 1, letterSpacing: -0.5,
      }}>{winner.name}</div>
      <div style={{
        marginTop: 12, fontFamily: 'Geist, system-ui', fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
      }}>gewinnt mit <strong>{winnerPts} : {loserPts}</strong></div>

      <div style={{
        marginTop: 'auto', width: '100%',
        background: state.dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: 22, padding: 16,
        border: state.dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 11, fontWeight: 600,
          color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
        }}>Saison-Highlights</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6,
          fontFamily: 'Geist, system-ui', fontSize: 13,
          color: state.dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
        }}>
          <div>🥇 Meiste Aufgaben: <strong>{winner.name}</strong></div>
          <div>🔥 Längste Streak: <strong>11 Tage</strong></div>
          <div>🧹 Häufigste Aufgabe: <strong>Abwaschen</strong></div>
          <div>⭐ Wertvollste Aufgabe: <strong>Bad putzen</strong></div>
        </div>
      </div>

      <button onClick={onClose} style={{
        marginTop: 16, width: '100%', padding: '16px',
        background: state.dark ? '#fff' : '#111',
        color: state.dark ? '#111' : '#fff',
        border: 'none', cursor: 'pointer',
        borderRadius: 999,
        fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: 15,
      }}>Saison {window.SEASON_NUMBER + 1} starten</button>
    </div>
  );
}

// ---------------------------------------------------------------
// Onboarding / Login

function Onboarding({ state, onEnter }) {
  const [step, setStep] = React.useState(0);

  if (step === 0) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 80,
        background: state.dark
          ? 'linear-gradient(180deg, rgb(20,18,32) 0%, rgb(8,8,16) 100%)'
          : 'linear-gradient(180deg, rgb(255,250,243) 0%, rgb(252,224,240) 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '90px 28px 36px',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: 80, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,79,50,0.35), transparent 60%)' }}/>
        <div style={{ position: 'absolute', top: 200, left: -60, width: 200, height: 200,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,0.3), transparent 60%)' }}/>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 64,
            color: state.dark ? '#fff' : '#111', lineHeight: 0.95, letterSpacing: -1.5,
          }}>Wer<br/>putzt mehr?</div>
          <div style={{
            marginTop: 16,
            fontFamily: 'Geist, system-ui', fontSize: 16, lineHeight: 1.4,
            color: state.dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)',
            maxWidth: 280,
          }}>Macht den Haushalt zum Spiel. Sammelt Punkte, baut Streaks auf, krönt den Saison-Champion.</div>
        </div>

        <button onClick={() => setStep(1)} style={{
          marginTop: 32, width: '100%', padding: '18px',
          background: state.dark ? '#fff' : '#111', color: state.dark ? '#111' : '#fff',
          border: 'none', cursor: 'pointer', borderRadius: 999,
          fontFamily: 'Geist, system-ui', fontWeight: 600, fontSize: 15,
        }}>Loslegen</button>
        <button style={{
          marginTop: 12, padding: 8,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: state.dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
          fontFamily: 'Geist, system-ui', fontSize: 13,
        }}>Einem Haushalt beitreten</button>
      </div>
    );
  }

  // Step 1: choose user
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: state.dark ? 'rgb(12,12,20)' : 'rgb(252,250,247)',
      display: 'flex', flexDirection: 'column', padding: '90px 24px 36px',
    }}>
      <div style={{
        fontFamily: 'Geist, system-ui', fontSize: 13, fontWeight: 500,
        color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        letterSpacing: 0.4, textTransform: 'uppercase',
      }}>Lotta & Marcos Zuhause</div>
      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 38,
        color: state.dark ? '#fff' : '#111', marginTop: 4, letterSpacing: -0.5,
      }}>Wer bist du?</div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {window.MEMBERS.map(m => (
          <button key={m.id} onClick={() => onEnter(m.id)} style={{
            background: state.dark ? 'rgb(28,28,36)' : '#fff',
            border: state.dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
            borderRadius: 22, padding: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
          }}>
            <Avatar member={m} size={56}/>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 26,
                color: state.dark ? '#fff' : '#111', lineHeight: 1, letterSpacing: -0.3,
              }}>{m.name}</div>
              <div style={{
                marginTop: 4, fontFamily: 'Geist, system-ui', fontSize: 12,
                color: state.dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
              }}>{window.pointsThisSeason(state.logs, m.id)} Punkte · Saison {window.SEASON_NUMBER}</div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: m.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icons.check(18, 'white', 3)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, SeasonCeremony, Onboarding });

// Analytics / Transparenz — neutral balance view

function AnalyticsScreen({ state }) {
  const dark = state.dark;
  const monthAgo = Date.now() - 30 * 86400000;
  const [lotta, marcos] = window.MEMBERS;
  const lottaTime = window.timeByMember(state.logs, 'lotta', monthAgo);
  const marcosTime = window.timeByMember(state.logs, 'marcos', monthAgo);
  const total = lottaTime + marcosTime || 1;

  // Time by category, by member
  const byCat = {};
  Object.keys(window.CATEGORIES).forEach(c => {
    byCat[c] = { lotta: 0, marcos: 0 };
  });
  state.logs.filter(l => l.ts >= monthAgo).forEach(l => {
    byCat[l.cat][l.memberId] += l.time;
  });

  // Last 14 days bar trend (total per day)
  const days = [];
  for (let d = 13; d >= 0; d--) {
    const start = Date.now() - d * 86400000;
    const s = new Date(start); s.setHours(0,0,0,0);
    const ds = s.getTime(); const de = ds + 86400000;
    const lt = state.logs.filter(l => l.memberId === 'lotta' && l.ts >= ds && l.ts < de).reduce((a,l) => a+l.time, 0);
    const mt = state.logs.filter(l => l.memberId === 'marcos' && l.ts >= ds && l.ts < de).reduce((a,l) => a+l.time, 0);
    days.push({ ds, lt, mt });
  }
  const maxDay = Math.max(...days.map(d => d.lt + d.mt), 1);

  const txt = dark ? '#F2ECE4' : '#2A221E';
  const muted = dark ? 'rgba(242,236,228,0.55)' : 'rgba(42,34,30,0.55)';
  const cardBg = dark ? 'rgba(50,40,44,0.75)' : 'rgba(255,255,255,0.78)';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)';

  const lottaPct = lottaTime / total;
  const marcosPct = marcosTime / total;

  return (
    <div style={{ paddingBottom: 140 }}>
      <div style={{ padding: '60px 24px 0' }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 500,
          color: muted, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>Transparenz · 30 Tage</div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40,
          lineHeight: 1.05, letterSpacing: -0.5, color: txt, marginTop: 4,
        }}>Balance</div>
      </div>

      {/* Balance bar — neutral visualization */}
      <div style={{
        margin: '22px 16px 0', padding: '20px', borderRadius: 24,
        background: cardBg, border: cardBorder,
      }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 600,
          color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14,
        }}>Mental Load</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28,
              color: txt, letterSpacing: -0.3, lineHeight: 1,
            }}>{window.formatMinutes(lottaTime)}</div>
            <div style={{ fontSize: 12, color: muted, fontFamily: 'Geist, system-ui', marginTop: 4 }}>{lotta.name}</div>
          </div>
          <div style={{
            width: 1, height: 52, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          }}/>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28,
              color: txt, letterSpacing: -0.3, lineHeight: 1,
            }}>{window.formatMinutes(marcosTime)}</div>
            <div style={{ fontSize: 12, color: muted, fontFamily: 'Geist, system-ui', marginTop: 4 }}>{marcos.name}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, position: 'relative' }}>
          <div style={{
            height: 14, borderRadius: 7, display: 'flex', overflow: 'hidden',
            background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          }}>
            <div style={{ width: `${lottaPct*100}%`, background: lotta.color, transition: 'width 0.8s' }}/>
            <div style={{ width: `${marcosPct*100}%`, background: marcos.color, transition: 'width 0.8s' }}/>
          </div>
          <div style={{
            position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)',
            width: 2, height: 18, background: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
          }}/>
        </div>
        <div style={{
          marginTop: 10, fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 16,
          color: muted, letterSpacing: -0.1, textAlign: 'center', fontStyle: 'italic',
        }}>
          {Math.abs(lottaPct - 0.5) < 0.08
            ? 'ziemlich ausgeglichen.'
            : `${lottaPct > marcosPct ? lotta.name : marcos.name} trägt gerade mehr.`}
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 600,
          color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
        }}>Zeit nach Bereich</div>
        {Object.entries(byCat).map(([c, v]) => {
          const t = v.lotta + v.marcos;
          if (t === 0) return null;
          const lp = v.lotta / t, mp = v.marcos / t;
          return (
            <div key={c} style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CategoryOrb cat={c} size={18}/>
                  <span style={{ fontFamily: 'Geist, system-ui', fontSize: 13, color: txt, fontWeight: 500 }}>{c}</span>
                </div>
                <span style={{ fontFamily: 'Geist, system-ui', fontSize: 12, color: muted }}>{window.formatMinutes(t)}</span>
              </div>
              <div style={{
                height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex',
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: `${lp*100}%`, background: lotta.color }}/>
                <div style={{ width: `${mp*100}%`, background: marcos.color }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* 14-day trend */}
      <div style={{ margin: '22px 16px 0', padding: '20px', borderRadius: 24, background: cardBg, border: cardBorder }}>
        <div style={{
          fontFamily: 'Geist, system-ui', fontSize: 12, fontWeight: 600,
          color: muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
        }}>Letzte 14 Tage · gemeinsam</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
          {days.map((d, i) => {
            const lh = (d.lt / maxDay) * 100;
            const mh = (d.mt / maxDay) * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'flex-end' }}>
                <div style={{ height: `${mh}%`, background: marcos.color, borderRadius: '3px 3px 0 0', minHeight: mh > 0 ? 2 : 0 }}/>
                <div style={{ height: `${lh}%`, background: lotta.color, borderRadius: mh > 0 ? '0 0 3px 3px' : '3px', minHeight: lh > 0 ? 2 : 0 }}/>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: 'Geist, system-ui', fontSize: 10, color: muted }}>
          <span>vor 14T</span><span>heute</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsScreen });

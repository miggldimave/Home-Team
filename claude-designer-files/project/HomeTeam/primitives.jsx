// Home-Team primitives — warm, cooperative UI atoms

function Avatar({ member, size = 36, ring = false, ringColor }) {
  const rc = ringColor || member.color;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: member.bg, color: member.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.42,
      fontFamily: 'Geist, system-ui',
      flexShrink: 0, letterSpacing: -0.3,
      boxShadow: ring ? `0 0 0 2px rgb(253,249,243), 0 0 0 4px ${rc}` : 'none',
    }}>
      {member.initial}
    </div>
  );
}

// Soft orb glyph for category — a blurred colored circle, no hard shapes
function CategoryOrb({ cat, size = 36 }) {
  const c = window.CATEGORIES[cat];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${c.soft}, ${c.hue})`,
      flexShrink: 0,
      boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.04)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}/>
  );
}

// Task icon tile — soft filled square with glyph
function TaskIconTile({ task, size = 44 }) {
  const c = window.CATEGORIES[task.cat];
  const glyph = window.TASK_ICONS[task.id] || '◌';
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: c.soft, color: c.deep,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, flexShrink: 0,
      fontFamily: 'Geist, system-ui',
    }}>{glyph}</div>
  );
}

// Warm flame — smaller, softer than classic orange
function Flame({ size = 14, color = 'rgb(215, 128, 96)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M13.5 1.5c-.3 3.5-3.2 4.7-4.5 7.5-1 2.2-.5 4.4 1 5.5-.5-1.5.3-2.8 1.5-3.5-.2 2 .8 3.5 2.5 3.5 1.8 0 3-1.4 3-3 0-1.2-.5-2.2-1-3 2 1 4 3 4 6.5a8 8 0 01-16 0c0-5 4.5-7 9.5-13.5z"/>
    </svg>
  );
}

function Heart({ size = 16, filled = false, color = 'rgb(215, 128, 96)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={2}>
      <path d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 5.7 3.5 4 7.5C19 16.5 12 21 12 21z"/>
    </svg>
  );
}

function Pill({ children, bg = 'rgba(0,0,0,0.05)', fg = 'rgba(0,0,0,0.7)', style }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: bg, color: fg,
      fontSize: 12, fontWeight: 500,
      fontFamily: 'Geist, system-ui', letterSpacing: -0.1,
      ...style,
    }}>{children}</div>
  );
}

// Progress ring — thin, soft
function Ring({ size = 72, stroke = 5, progress = 0.7, color = 'rgb(215,128,96)', track = 'rgba(0,0,0,0.06)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)' }}/>
      </svg>
      {children && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
      )}
    </div>
  );
}

// Gradient orbs for the soft warm background
function WarmBackdrop({ children, dark = false, intensity = 1 }) {
  const bg = dark ? 'rgb(28, 22, 26)' : 'rgb(253, 248, 241)';
  return (
    <div style={{
      position: 'relative', height: '100%', width: '100%', overflow: 'hidden',
      background: bg,
    }}>
      {/* Orbs */}
      <div style={{
        position: 'absolute', top: -40, right: -60, width: 260, height: 260,
        borderRadius: '50%', filter: 'blur(55px)',
        background: dark ? 'rgba(215, 128, 96, 0.25)' : 'rgba(249, 223, 210, 0.95)',
        opacity: intensity,
      }}/>
      <div style={{
        position: 'absolute', top: 180, left: -80, width: 240, height: 240,
        borderRadius: '50%', filter: 'blur(60px)',
        background: dark ? 'rgba(168, 146, 196, 0.18)' : 'rgba(238, 230, 246, 0.9)',
        opacity: intensity,
      }}/>
      <div style={{
        position: 'absolute', bottom: -60, right: -40, width: 220, height: 220,
        borderRadius: '50%', filter: 'blur(55px)',
        background: dark ? 'rgba(138, 152, 190, 0.15)' : 'rgba(224, 230, 244, 0.7)',
        opacity: intensity * 0.8,
      }}/>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>{children}</div>
    </div>
  );
}

// Icons (hand-drawn minimal)
const Icons = {
  home: (s = 22, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5l9-7 9 7V20a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z"/>
    </svg>
  ),
  list: (s = 22, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3.5" cy="6" r="1.5" fill={c}/><circle cx="3.5" cy="12" r="1.5" fill={c}/><circle cx="3.5" cy="18" r="1.5" fill={c}/>
    </svg>
  ),
  heart: (s = 22, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 5.7 3.5 4 7.5C19 16.5 12 21 12 21z"/>
    </svg>
  ),
  chart: (s = 22, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/>
      <line x1="16" y1="20" x2="16" y2="14"/><line x1="22" y1="20" x2="22" y2="8"/>
    </svg>
  ),
  check: (s = 20, c = 'currentColor', sw = 2.4) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 10 17 19 7"/>
    </svg>
  ),
  clock: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
    </svg>
  ),
  back: (s = 22, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 6 9 12 15 18"/>
    </svg>
  ),
  plus: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  repeat: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 2 21 6 17 10"/><path d="M3 12V9a3 3 0 013-3h15"/>
      <polyline points="7 22 3 18 7 14"/><path d="M21 12v3a3 3 0 01-3 3H3"/>
    </svg>
  ),
  close: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  ),
};

// Soft hearts rising animation for kudos
function Hearts({ active, color = 'rgb(215, 128, 96)' }) {
  const [pieces] = React.useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      delay: Math.random() * 0.4,
      dur: 1.6 + Math.random() * 0.8,
      size: 14 + Math.random() * 12,
      drift: (Math.random() - 0.5) * 80,
    }))
  );
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', bottom: 100, left: `${p.x}%`,
          animation: `heartRise ${p.dur}s ${p.delay}s cubic-bezier(.4,.6,.7,1) forwards`,
          ['--drift']: `${p.drift}px`,
        }}>
          <Heart size={p.size} filled color={color}/>
        </div>
      ))}
    </div>
  );
}

// Soft confetti — leaves/petals instead of sharp rectangles
function Petals({ active, count = 36 }) {
  const colors = ['rgb(215,128,96)', 'rgb(212,164,104)', 'rgb(196,140,170)', 'rgb(168,146,196)', 'rgb(138,152,190)', 'rgb(122,168,170)'];
  const [pieces] = React.useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      dur: 1.6 + Math.random() * 1.2,
      size: 10 + Math.random() * 10,
      rot: Math.random() * 360,
      rotEnd: Math.random() * 540 - 270,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
  );
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: -30, left: `${p.x}%`,
          width: p.size, height: p.size * 1.4,
          background: p.color,
          borderRadius: '60% 40% 60% 40% / 70% 60% 40% 30%',
          opacity: 0.85,
          animation: `petalFall ${p.dur}s ${p.delay}s cubic-bezier(.4,.6,.7,1) forwards`,
          transform: `rotate(${p.rot}deg)`,
          ['--rotEnd']: `${p.rotEnd}deg`,
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, {
  Avatar, CategoryOrb, TaskIconTile, Flame, Heart, Pill, Ring,
  WarmBackdrop, Icons, Hearts, Petals,
});

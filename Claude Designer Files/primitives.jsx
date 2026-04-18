// Shared UI primitives — buttons, badges, rings, icons

function Avatar({ member, size = 36, ring = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: member.bg, color: member.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.45,
      fontFamily: 'Geist, system-ui',
      flexShrink: 0,
      boxShadow: ring ? `0 0 0 2px white, 0 0 0 4px ${member.color}` : 'none',
      letterSpacing: -0.5,
    }}>
      {member.initial}
    </div>
  );
}

function CategoryDot({ cat, size = 28, withGlyph = true }) {
  const c = window.CATEGORIES[cat];
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32,
      background: c.hue,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.5, fontWeight: 700,
      flexShrink: 0,
      boxShadow: `0 2px 6px ${c.hue.replace('rgb', 'rgba').replace(')', ', 0.35)')}`,
    }}>
      {withGlyph && <span style={{ marginTop: -1 }}>{c.emoji}</span>}
    </div>
  );
}

function Pill({ children, bg, fg, style }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 999,
      background: bg, color: fg,
      fontSize: 12, fontWeight: 600,
      fontFamily: 'Geist, system-ui',
      letterSpacing: -0.1,
      ...style,
    }}>{children}</div>
  );
}

// Progress ring (SVG)
function Ring({ size = 60, stroke = 6, progress = 0.7, color = '#7C5CFF', track = '#EEE', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.8,.2,1)' }}/>
      </svg>
      {children && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{children}</div>
      )}
    </div>
  );
}

// Icons (lucide-ish, hand-drawn minimal)
const Icons = {
  home: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z"/>
    </svg>
  ),
  list: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3.5" cy="6" r="1.5" fill={c}/><circle cx="3.5" cy="12" r="1.5" fill={c}/><circle cx="3.5" cy="18" r="1.5" fill={c}/>
    </svg>
  ),
  trophy: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0012 0V3H6v6z"/><path d="M6 5H3a3 3 0 003 3M18 5h3a3 3 0 01-3 3"/>
      <line x1="12" y1="15" x2="12" y2="19"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="10" y1="19" x2="14" y2="19"/>
    </svg>
  ),
  chart: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="4" y2="10"/><line x1="10" y1="20" x2="10" y2="4"/>
      <line x1="16" y1="20" x2="16" y2="14"/><line x1="22" y1="20" x2="22" y2="8"/>
    </svg>
  ),
  flame: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none">
      <path d="M13.5 1.5c-.3 3.5-3.2 4.7-4.5 7.5-1 2.2-.5 4.4 1 5.5-.5-1.5.3-2.8 1.5-3.5-.2 2 .8 3.5 2.5 3.5 1.8 0 3-1.4 3-3 0-1.2-.5-2.2-1-3 2 1 4 3 4 6.5a8 8 0 01-16 0c0-5 4.5-7 9.5-13.5z"/>
    </svg>
  ),
  check: (s = 20, c = 'currentColor', sw = 2.5) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 12 10 17 19 7"/>
    </svg>
  ),
  clock: (s = 14, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
    </svg>
  ),
  spark: (s = 16, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/>
    </svg>
  ),
  back: (s = 22, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 6 9 12 15 18"/>
    </svg>
  ),
  plus: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  filter: (s = 18, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  crown: (s = 20, c = 'currentColor') => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke="none">
      <path d="M2 7l4 6 6-9 6 9 4-6v12H2z"/>
    </svg>
  ),
};

// Confetti — playing card sized, falling
function Confetti({ active, count = 80 }) {
  const [pieces] = React.useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.2 + Math.random() * 1.4,
      color: ['#E84F32', '#7C5CFF', '#00A8B8', '#DC8A32', '#C3569C', '#4E60C4', '#FFD03A'][Math.floor(Math.random() * 7)],
      size: 6 + Math.random() * 8,
      rot: Math.random() * 360,
      rotEnd: Math.random() * 720 - 360,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))
  );
  if (!active) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 200 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: -20, left: `${p.x}%`,
          width: p.size, height: p.shape === 'rect' ? p.size * 0.6 : p.size,
          background: p.color,
          borderRadius: p.shape === 'circle' ? '50%' : 2,
          animation: `confetti-fall ${p.dur}s ${p.delay}s cubic-bezier(.4,.6,.7,1) forwards`,
          transform: `rotate(${p.rot}deg)`,
          ['--rotEnd']: `${p.rotEnd}deg`,
        }} />
      ))}
    </div>
  );
}

Object.assign(window, { Avatar, CategoryDot, Pill, Ring, Icons, Confetti });

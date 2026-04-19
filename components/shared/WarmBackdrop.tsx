export function WarmBackdrop({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const bg = dark ? 'rgb(28, 22, 26)' : 'rgb(253, 248, 241)'
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', background: bg }}>
      <div style={{
        position: 'absolute', top: -40, right: -60, width: 260, height: 260,
        borderRadius: '50%', filter: 'blur(55px)',
        background: dark ? 'rgba(215, 128, 96, 0.25)' : 'rgba(249, 223, 210, 0.95)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', top: 180, left: -80, width: 240, height: 240,
        borderRadius: '50%', filter: 'blur(60px)',
        background: dark ? 'rgba(168, 146, 196, 0.18)' : 'rgba(238, 230, 246, 0.9)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -60, right: -40, width: 220, height: 220,
        borderRadius: '50%', filter: 'blur(55px)',
        background: dark ? 'rgba(138, 152, 190, 0.15)' : 'rgba(224, 230, 244, 0.7)',
        opacity: 0.8,
        pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', height: '100%', width: '100%' }}>{children}</div>
    </div>
  )
}

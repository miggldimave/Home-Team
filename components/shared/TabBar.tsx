import { Icons } from './Icons'

type Tab = 'home' | 'list' | 'appreciate' | 'analytics'

interface TabBarProps {
  activeTab: Tab
  onNavigate: (tab: Tab) => void
  dark: boolean
}

const tabs: { k: Tab; l: string; icon: (s: number, c: string) => React.ReactNode }[] = [
  { k: 'home',       l: 'Heute',    icon: Icons.home },
  { k: 'list',       l: 'Aufgaben', icon: Icons.list },
  { k: 'appreciate', l: 'Wertsch.', icon: Icons.heart },
  { k: 'analytics',  l: 'Balance',  icon: Icons.chart },
]

export function TabBar({ activeTab, onNavigate, dark }: TabBarProps) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '24px 12px calc(12px + env(safe-area-inset-bottom))', background: dark ? 'linear-gradient(to bottom, transparent, rgb(28,22,26) 40%)' : 'linear-gradient(to bottom, transparent, rgb(253,248,241) 40%)', pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
      <div style={{
        background: dark ? 'rgba(40,32,36,0.82)' : 'rgba(253,248,241,0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
        borderRadius: 26,
        padding: '10px 8px 14px',
        display: 'flex',
        justifyContent: 'space-around',
        boxShadow: dark
          ? '0 8px 28px rgba(0,0,0,0.4)'
          : '0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
      }}>
        {tabs.map((t) => {
          const active = activeTab === t.k
          const c = active ? 'rgb(215, 128, 96)' : (dark ? 'rgba(242,236,228,0.5)' : 'rgba(42,34,30,0.45)')
          return (
            <button
              key={t.k}
              onClick={() => onNavigate(t.k)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
              }}
            >
              {t.icon(22, c)}
              <span style={{
                fontSize: 10,
                fontWeight: active ? 600 : 500,
                color: c,
                letterSpacing: '-0.1px',
              }}>{t.l}</span>
            </button>
          )
        })}
      </div>
      </div>
    </div>
  )
}

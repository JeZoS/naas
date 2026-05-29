import ToolHeader from './components/ToolHeader'
import { ALL_TILES } from './data'

export default function AllTools({ isDark, onToggleTheme, onSwitch, onOpenHistory }) {
  return (
    <div>
      <ToolHeader
        title="🔧 All Tools"
        sub="Everything you need to protect your peace"
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onOpenHistory={onOpenHistory}
      />
      <div className="all-grid">
        {ALL_TILES.map(t => (
          <div key={t.id} className="tool-tile" onClick={() => onSwitch(t.id)}>
            <div className="tile-emoji">{t.emoji}</div>
            <div className="tile-name">{t.name}</div>
            <div className="tile-desc">{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

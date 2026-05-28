export default function ToolHeader({ title, sub, roulette, onRoulette, isDark, onToggleTheme }) {
  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open')
  }

  return (
    <div className="tool-header">
      <button className="sidebar-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>

      <div className="title-area">
        <div className="tool-title">{title}</div>
        <div className="tool-sub">{sub}</div>
      </div>

      <div className="header-right">
        {roulette && onRoulette && (
          <button className="roulette-btn" onClick={onRoulette}>
            🎲 {roulette}
          </button>
        )}
        <button className="theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}

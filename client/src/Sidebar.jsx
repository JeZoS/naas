import { useMemo } from 'react'
import { TOOLS, NAV } from './data'

export default function Sidebar({ activeTool, onSwitch }) {
  const toolData = TOOLS[activeTool] || TOOLS.no

  const quote = useMemo(() => {
    const qs = toolData.quotes
    return qs[Math.floor(Math.random() * qs.length)]
  }, [activeTool])

  return (
    <aside className="sidebar" id="sidebar">
      <div className="logo">
        <div className="logo-icon">🔮</div>
        SafeBubble
      </div>

      <div>
        <div className="daily-label">{toolData.dayLbl}</div>
        <div className="daily-card">{quote}</div>
      </div>

      <div>
        <div className="nav-label">Boundary Tools</div>
        <div className="nav-group">
          {NAV.map(item => (
            <div
              key={item.id}
              className={`nav-item${activeTool === item.id ? ' active' : ''}`}
              onClick={() => onSwitch(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="nav-label">Other</div>
        <div className="nav-group">
          <div
            className={`nav-item${activeTool === 'all' ? ' active' : ''}`}
            onClick={() => onSwitch('all')}
          >
            <span className="nav-icon">🔧</span>
            All Tools
          </div>
        </div>
      </div>

      <div className="sidebar-foot">© 2026 SafeBubble</div>
    </aside>
  )
}

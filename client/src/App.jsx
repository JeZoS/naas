import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ToolPage from './ToolPage'
import BoundaryBot from './BoundaryBot'
import AllTools from './AllTools'

export default function App() {
  const [activeTool, setActiveTool] = useState('no')
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light')
  const [toast, setToast] = useState(null)
  const [toastTimer, setToastTimer] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  function showToast(msg) {
    setToast(msg)
    if (toastTimer) clearTimeout(toastTimer)
    const id = setTimeout(() => setToast(null), 2500)
    setToastTimer(id)
  }

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  function renderPage() {
    if (activeTool === 'all') {
      return <AllTools isDark={isDark} onToggleTheme={toggleTheme} onSwitch={setActiveTool} />
    }
    if (activeTool === 'boundary') {
      return (
        <BoundaryBot
          key="boundary"
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onToast={showToast}
        />
      )
    }
    return (
      <ToolPage
        key={activeTool}
        toolId={activeTool}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onToast={showToast}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar activeTool={activeTool} onSwitch={setActiveTool} />
      <main className="main">{renderPage()}</main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

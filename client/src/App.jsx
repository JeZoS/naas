import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ToolPage from './ToolPage'
import BoundaryBot from './BoundaryBot'
import AllTools from './AllTools'
import HistoryDrawer from './components/HistoryDrawer'

export default function App() {
  const [activeTool, setActiveTool] = useState('no')
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light')
  const [toast, setToast] = useState(null)
  const [toastTimer, setToastTimer] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)

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

  const openHistory = () => setHistoryOpen(true)

  function copyText(text) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'))
  }

  function renderPage() {
    if (activeTool === 'all') {
      return (
        <AllTools
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onSwitch={setActiveTool}
          onOpenHistory={openHistory}
        />
      )
    }
    if (activeTool === 'boundary') {
      return (
        <BoundaryBot
          key="boundary"
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onToast={showToast}
          onOpenHistory={openHistory}
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
        onOpenHistory={openHistory}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar activeTool={activeTool} onSwitch={setActiveTool} onOpenHistory={openHistory} />
      <main className="main">{renderPage()}</main>
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} onCopy={copyText} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

import { useState } from 'react'
import { useHistory } from '../lib/useHistory'
import { clearHistory, removeHistory, toggleFavorite } from '../lib/history'

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function HistoryDrawer({ open, onClose, onCopy }) {
  const items = useHistory()
  const [tab, setTab] = useState('all')

  const shown = tab === 'fav' ? items.filter(i => i.favorite) : items

  return (
    <>
      <div className={`drawer-scrim${open ? ' show' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div className="drawer-title">History</div>
          <button className="icon-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="seg drawer-tabs">
          <button className={`seg-btn${tab === 'all' ? ' on' : ''}`} onClick={() => setTab('all')}>
            All
          </button>
          <button className={`seg-btn${tab === 'fav' ? ' on' : ''}`} onClick={() => setTab('fav')}>
            ★ Favorites
          </button>
        </div>

        <div className="drawer-list">
          {shown.length === 0 ? (
            <div className="drawer-empty">
              {tab === 'fav'
                ? 'No favorites yet. Tap ☆ on a result to save it.'
                : 'Nothing here yet. Your generated messages will appear here.'}
            </div>
          ) : (
            shown.map(item => (
              <div key={item.id} className="hist-item">
                <div className="hist-meta">
                  <span className="hist-tool">{item.toolName || 'Politely'}</span>
                  {item.tone && <span className="hist-chip">{item.tone}</span>}
                  {item.cat && <span className="hist-chip">{item.cat}</span>}
                  <span className="hist-time">{timeAgo(item.ts)}</span>
                </div>
                <div className="hist-text">{item.text}</div>
                <div className="hist-actions">
                  <button
                    className={`icon-btn${item.favorite ? ' faved' : ''}`}
                    onClick={() => toggleFavorite(item.id)}
                    title={item.favorite ? 'Unfavorite' : 'Favorite'}
                  >
                    {item.favorite ? '★' : '☆'}
                  </button>
                  <button className="icon-btn" onClick={() => removeHistory(item.id)} title="Delete">
                    🗑
                  </button>
                  <button className="icon-btn copy" onClick={() => onCopy(item.text)} title="Copy">
                    📋 Copy
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <button className="btn-reset" onClick={() => clearHistory({ keepFavorites: true })}>
              Clear non-favorites
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

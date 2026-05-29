import { useState } from 'react'
import { TOOLS } from './data'
import ToolHeader from './components/ToolHeader'

export default function BoundaryBot({ isDark, onToggleTheme, onToast }) {
  const tool = TOOLS.boundary

  const [selCat, setSelCat] = useState(null)
  const [selTone, setSelTone] = useState(null)
  const [genText, setGenText] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [ctx, setCtx] = useState('')
  const [weekLimit, setWeekLimit] = useState(() => +(localStorage.getItem('wl') ?? 3))
  const [weekCount, setWeekCount] = useState(() => +(localStorage.getItem('wc') ?? 0))

  async function gen(cat, tone) {
    const prompt = tool.buildPrompt(cat, tone, name, ctx)
    setLoading(true)
    setGenText('')
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Generation failed')
      setGenText(data.text)
    } catch (e) {
      onToast?.('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function pickCat(catName) {
    setSelCat(catName)
    if (selTone) gen(catName, selTone)
  }

  function pickTone(toneName) {
    setSelTone(toneName)
    if (selCat) gen(selCat, toneName)
  }

  function updateLimit(v) {
    const n = +v
    setWeekLimit(n)
    localStorage.setItem('wl', n)
  }

  function incCount() {
    const n = weekCount + 1
    setWeekCount(n)
    localStorage.setItem('wc', n)
    if (n >= weekLimit) {
      const cat = selCat || 'Work'
      const tone = selTone || 'Encouraging'
      setSelCat(cat)
      setSelTone(tone)
      gen(cat, tone)
    }
  }

  function resetCount() {
    setWeekCount(0)
    localStorage.setItem('wc', 0)
  }

  function doCopy() {
    if (!genText) { onToast?.('Nothing to copy yet.'); return }
    navigator.clipboard.writeText(genText).then(() => onToast?.('Copied to clipboard!'))
  }

  function doDownload() {
    if (!genText) { onToast?.('Nothing to download yet.'); return }
    const blob = new Blob([genText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'politely-boundary.txt',
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <ToolHeader
        title={tool.title}
        sub={tool.sub}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />

      <div className="tool-body">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          {/* 5-column category row */}
          <div>
            <div className="panel-title">{tool.catTitle}</div>
            <div className="cat-row">
              {tool.cats.map(cat => (
                <div
                  key={cat.name}
                  className={`cat-card${selCat === cat.name ? ' sel' : ''}`}
                  style={{ '--c': cat.bg }}
                  onClick={() => pickCat(cat.name)}
                >
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-desc">{cat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly limit slider */}
          <div>
            <div className="limit-title">Set your weekly limit</div>
            <div className="limit-sub">
              Maximum &ldquo;yes&rdquo; responses per week:{' '}
              <strong>{weekLimit}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={weekLimit}
              onChange={e => updateLimit(e.target.value)}
            />
            <div className="range-labels">
              <span>Very strict (1)</span>
              <span>Balanced (3-5)</span>
              <span>Flexible (7)</span>
            </div>
          </div>

          {/* Tone grid */}
          <div>
            <div className="panel-title">{tool.toneTitle}</div>
            <div className="tone-grid">
              {tool.tones.map(tone => (
                <div
                  key={tone.name}
                  className={`tone-card${selTone === tone.name ? ' sel' : ''}`}
                  style={{ '--c': tone.bg }}
                  onClick={() => pickTone(tone.name)}
                >
                  <div className="tone-emoji">{tone.emoji}</div>
                  <div className="tone-name">{tone.name}</div>
                  <div className="tone-desc">{tone.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className="right-panel-title">Personalize (Optional)</div>

          <div>
            <div className="field-label">{tool.recip}</div>
            <input
              className="field-input"
              type="text"
              placeholder="Who are you setting boundaries with?"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <div className="field-label">{tool.reason}</div>
            <textarea
              className="field-input"
              placeholder="Describe the specific boundary situation"
              value={ctx}
              onChange={e => setCtx(e.target.value)}
            />
          </div>

          {/* Weekly count tracker */}
          <div className="count-box">
            <div className="count-title">
              Current count: {weekCount} / {weekLimit}
            </div>
            <div className="count-sub">
              Track how many times you&apos;ve said yes this week
            </div>
            <div className="count-btns">
              <button className="btn-yes" onClick={incCount}>
                ✓ I said yes today
              </button>
              <button className="btn-reset" onClick={resetCount}>
                Reset
              </button>
            </div>
          </div>

          {/* Output */}
          <div>
            <div className="out-header">
              <div className="out-label">🔔 {tool.outLbl}</div>
              <button
                className="regen-btn"
                onClick={() => selCat && selTone && gen(selCat, selTone)}
                disabled={!selCat || !selTone || loading}
              >
                ↻ Regenerate
              </button>
            </div>
            {loading ? (
              <div className="out-generating">
                <span className="spinner">↻</span> Generating...
              </div>
            ) : (
              <div className="out-box">
                {genText || (
                  <span className="placeholder">
                    Select a category and tone to generate your reminder...
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="action-row">
            <button className="act-btn act-copy" onClick={doCopy}>
              📋 Copy
            </button>
            {/* <button
              className="act-btn act-sec"
              onClick={() =>
                navigator.clipboard
                  .writeText(window.location.href)
                  .then(() => onToast?.('Link copied!'))
              }
            >
              🔗 Copy link
            </button>
            <button
              className="act-btn act-sec"
              onClick={() =>
                navigator.share?.({ text: genText }) || doCopy()
              }
            >
              ↗ Share
            </button>
            <button className="act-btn act-sec" onClick={doDownload}>
              ⬇ Download
            </button> */}
          </div>
        </div>
      </div>
    </div>
  )
}

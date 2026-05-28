import { useState } from 'react'
import { TOOLS } from './data'
import ToolHeader from './components/ToolHeader'

function today() {
  return new Date().toLocaleDateString('en-GB')
}

export default function ToolPage({ toolId, isDark, onToggleTheme, onToast }) {
  const tool = TOOLS[toolId]

  const [selCat, setSelCat] = useState(null)
  const [selTone, setSelTone] = useState(null)
  const [genText, setGenText] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [ctx, setCtx] = useState('')

  async function gen(cat, tone, currentName = name, currentCtx = ctx) {
    const prompt = tool.buildPrompt(cat, tone, currentName, currentCtx)
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

  function doRoulette() {
    const ci = Math.floor(Math.random() * tool.cats.length)
    const ti = Math.floor(Math.random() * tool.tones.length)
    const cat = tool.cats[ci].name
    const tone = tool.tones[ti].name
    setSelCat(cat)
    setSelTone(tone)
    gen(cat, tone)
  }

  function doCopy() {
    if (!genText) { onToast?.('Nothing to copy yet.'); return }
    navigator.clipboard.writeText(genText).then(() => onToast?.('Copied to clipboard!'))
  }

  function doCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => onToast?.('Link copied!'))
  }

  function doShare() {
    if (navigator.share && genText) {
      navigator.share({ text: genText })
    } else {
      doCopy()
    }
  }

  function doDownload() {
    if (!genText) { onToast?.('Nothing to download yet.'); return }
    const blob = new Blob([genText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `politely-${toolId}.txt`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  function renderOutput() {
    if (tool.isSlip) {
      return (
        <div className="slip-card">
          <div className="slip-title">PERMISSION SLIP</div>
          <div className="slip-subtitle">Official Self-Authorization</div>
          {loading ? (
            <div className="slip-body placeholder">
              <span className="spinner">↻</span> Generating...
            </div>
          ) : (
            <div className={`slip-body${genText ? '' : ' placeholder'}`}>
              {genText || 'Select a category and tone to generate your slip...'}
            </div>
          )}
          <div className="slip-footer">
            <span>Date: {today()}</span>
            <span>{name || 'Me'}</span>
          </div>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="out-generating">
          <span className="spinner">↻</span> Generating...
        </div>
      )
    }

    return (
      <div className="out-box">
        {genText || (
          <span className="placeholder">
            Select a category and tone to generate your message...
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      <ToolHeader
        title={tool.title}
        sub={tool.sub}
        roulette={tool.roulette}
        onRoulette={doRoulette}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />

      <div className="tool-body">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          <div>
            <div className="panel-title">{tool.catTitle}</div>
            <div className="cat-grid">
              {tool.cats.map(cat => (
                <div
                  key={cat.name}
                  className={`cat-card${selCat === cat.name ? ' sel' : ''}`}
                  style={{ background: cat.bg }}
                  onClick={() => pickCat(cat.name)}
                >
                  <div className="cat-name" style={{ color: cat.tx }}>
                    {cat.name}
                  </div>
                  <div className="cat-desc" style={{ color: cat.tx }}>
                    {cat.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="panel-title">{tool.toneTitle}</div>
            <div className="tone-grid">
              {tool.tones.map(tone => (
                <div
                  key={tone.name}
                  className={`tone-card${selTone === tone.name ? ' sel' : ''}`}
                  style={{ background: tone.bg }}
                  onClick={() => pickTone(tone.name)}
                >
                  <div className="tone-emoji">{tone.emoji}</div>
                  <div className="tone-name" style={{ color: tone.tx }}>
                    {tone.name}
                  </div>
                  <div className="tone-desc" style={{ color: tone.tx }}>
                    {tone.desc}
                  </div>
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
              placeholder={
                toolId === 'permission'
                  ? 'Who is this slip for?'
                  : toolId === 'ghost'
                  ? 'Who are you ghosting?'
                  : toolId === 'no'
                  ? 'Who are you saying no to?'
                  : 'Who are you responding to?'
              }
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {tool.reason !== null && (
            <div>
              <div className="field-label">{tool.reason}</div>
              <textarea
                className="field-input"
                placeholder={
                  toolId === 'ghost'
                    ? 'Why are you exiting this conversation?'
                    : toolId === 'boundary'
                    ? 'Describe the specific boundary situation'
                    : 'Any context or reason?'
                }
                value={ctx}
                onChange={e => setCtx(e.target.value)}
              />
            </div>
          )}

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
            {renderOutput()}
          </div>

          <div className="action-row">
            <button className="act-btn act-copy" onClick={doCopy}>
              📋 Copy
            </button>
            {/* <button className="act-btn act-sec" onClick={doCopyLink}>
              🔗 Copy link
            </button>
            <button className="act-btn act-sec" onClick={doShare}>
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

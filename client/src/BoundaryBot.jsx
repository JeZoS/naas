import { useState } from 'react'
import { TOOLS } from './data'
import ToolHeader from './components/ToolHeader'
import OutputArea from './components/OutputArea'
import { useGenerator } from './lib/useGenerator'

export default function BoundaryBot({ isDark, onToggleTheme, onToast, onOpenHistory }) {
  const tool = TOOLS.boundary

  const [selCat, setSelCat] = useState(null)
  const [selTone, setSelTone] = useState(null)
  const [name, setName] = useState('')
  const [ctx, setCtx] = useState('')
  const [weekLimit, setWeekLimit] = useState(() => +(localStorage.getItem('wl') ?? 3))
  const [weekCount, setWeekCount] = useState(() => +(localStorage.getItem('wc') ?? 0))

  const gen = useGenerator({ toolId: 'boundary', toolName: tool.title, onError: m => onToast?.('Error: ' + m) })

  function generate(cat, tone) {
    gen.generateAll(tool.buildPrompt(cat, tone, name, ctx), { cat, tone })
  }

  function pickCat(catName) {
    setSelCat(catName)
    if (selTone) generate(catName, selTone)
  }

  function pickTone(toneName) {
    setSelTone(toneName)
    if (selCat) generate(selCat, toneName)
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
      generate(cat, tone)
    }
  }

  function resetCount() {
    setWeekCount(0)
    localStorage.setItem('wc', 0)
  }

  function doCopy(text) {
    if (!text) { onToast?.('Nothing to copy yet.'); return }
    navigator.clipboard.writeText(text).then(() => onToast?.('Copied to clipboard!'))
  }

  return (
    <div>
      <ToolHeader
        title={tool.title}
        sub={tool.sub}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onOpenHistory={onOpenHistory}
      />

      <div className="tool-body">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
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
              Maximum &ldquo;yes&rdquo; responses per week: <strong>{weekLimit}</strong>
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
            <div className="count-sub">Track how many times you&apos;ve said yes this week</div>
            <div className="count-btns">
              <button className="btn-yes" onClick={incCount}>
                ✓ I said yes today
              </button>
              <button className="btn-reset" onClick={resetCount}>
                Reset
              </button>
            </div>
          </div>

          <OutputArea
            cards={gen.cards}
            variations={gen.variations}
            onSetVariations={gen.setVariationCount}
            onCopy={doCopy}
            onRegenerate={gen.regenerate}
            onRefine={gen.refine}
            onFavorite={gen.favorite}
            outLbl={tool.outLbl}
            placeholder="Select a category and tone to generate your reminder…"
          />
        </div>
      </div>
    </div>
  )
}

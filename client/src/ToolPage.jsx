import { useState } from 'react'
import { TOOLS } from './data'
import ToolHeader from './components/ToolHeader'
import OutputArea from './components/OutputArea'
import ReplyField from './components/ReplyField'
import { useGenerator } from './lib/useGenerator'
import { augmentPrompt } from './lib/prompt'

export default function ToolPage({ toolId, isDark, onToggleTheme, onToast, onOpenHistory }) {
  const tool = TOOLS[toolId]

  const [selCat, setSelCat] = useState(null)
  const [selTone, setSelTone] = useState(null)
  const [name, setName] = useState('')
  const [ctx, setCtx] = useState('')
  const [replyOn, setReplyOn] = useState(false)
  const [replyTo, setReplyTo] = useState('')

  const gen = useGenerator({ toolId, toolName: tool.title, onError: m => onToast?.('Error: ' + m) })

  function buildBase(cat, tone) {
    const base = tool.buildPrompt(cat, tone, name, ctx)
    return augmentPrompt(base, { replyTo: replyOn ? replyTo : '' })
  }

  function generate(cat, tone) {
    gen.generateAll(buildBase(cat, tone), { cat, tone })
  }

  function pickCat(catName) {
    setSelCat(catName)
    if (selTone) generate(catName, selTone)
  }

  function pickTone(toneName) {
    setSelTone(toneName)
    if (selCat) generate(selCat, toneName)
  }

  function doRoulette() {
    const cat = tool.cats[Math.floor(Math.random() * tool.cats.length)].name
    const tone = tool.tones[Math.floor(Math.random() * tool.tones.length)].name
    setSelCat(cat)
    setSelTone(tone)
    generate(cat, tone)
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
        roulette={tool.roulette}
        onRoulette={doRoulette}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onOpenHistory={onOpenHistory}
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
                  style={{ '--c': cat.bg }}
                  onClick={() => pickCat(cat.name)}
                >
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-desc">{cat.desc}</div>
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

          {!tool.isSlip && (
            <ReplyField
              enabled={replyOn}
              onToggle={() => setReplyOn(v => !v)}
              value={replyTo}
              onChange={setReplyTo}
            />
          )}

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

          <OutputArea
            cards={gen.cards}
            variations={gen.variations}
            onSetVariations={gen.setVariationCount}
            onCopy={doCopy}
            onRegenerate={gen.regenerate}
            onRefine={gen.refine}
            onFavorite={gen.favorite}
            outLbl={tool.outLbl}
            isSlip={tool.isSlip}
            slipName={name}
            placeholder={
              tool.isSlip
                ? 'Select a category and tone to generate your slip…'
                : 'Select a category and tone to generate your message…'
            }
          />
        </div>
      </div>
    </div>
  )
}

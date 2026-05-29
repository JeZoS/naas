import { REFINEMENTS } from '../lib/prompt'

function today() {
  return new Date().toLocaleDateString('en-GB')
}

function CardTools({ card, onCopy, onRegenerate, onRefine, onFavorite }) {
  return (
    <div className="card-tools">
      <div className="refine-row">
        {REFINEMENTS.map(r => (
          <button
            key={r.id}
            className="refine-chip"
            onClick={() => onRefine(card.id, r)}
            disabled={card.loading}
            title={`Make it ${r.instruction}`}
          >
            <span>{r.emoji}</span> {r.label}
          </button>
        ))}
      </div>
      <div className="card-actions">
        <button
          className={`icon-btn${card.favorite ? ' faved' : ''}`}
          onClick={() => onFavorite(card.id)}
          title={card.favorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          {card.favorite ? '★' : '☆'}
        </button>
        <button className="icon-btn" onClick={() => onRegenerate(card.id)} title="Regenerate">
          ↻
        </button>
        <button className="icon-btn copy" onClick={() => onCopy(card.text)} title="Copy">
          📋 Copy
        </button>
      </div>
    </div>
  )
}

function ResultCard({ card, index, multi, tools, isSlip, slipName }) {
  if (isSlip) {
    return (
      <div>
        <div className="slip-card">
          <div className="slip-title">PERMISSION SLIP</div>
          <div className="slip-subtitle">Official Self-Authorization</div>
          <div className={`slip-body${card.text ? '' : ' placeholder'}`}>
            {card.loading ? (
              <span>
                <span className="spinner">↻</span> Generating…
              </span>
            ) : (
              card.error || card.text
            )}
          </div>
          <div className="slip-footer">
            <span>Date: {today()}</span>
            <span>{slipName || 'Me'}</span>
          </div>
        </div>
        {!card.loading && card.text && <CardTools card={card} {...tools} />}
      </div>
    )
  }

  return (
    <div className="result-card">
      {multi && <div className="card-num">Option {index + 1}</div>}
      {card.loading ? (
        <div className="card-loading">
          <span className="spinner">↻</span> Generating…
        </div>
      ) : card.error ? (
        <div className="card-error">⚠ {card.error}</div>
      ) : (
        <div className="card-text">{card.text}</div>
      )}
      {!card.loading && card.text && <CardTools card={card} {...tools} />}
    </div>
  )
}

export default function OutputArea({
  cards,
  variations,
  onSetVariations,
  onCopy,
  onRegenerate,
  onRefine,
  onFavorite,
  outLbl,
  isSlip,
  slipName,
  placeholder,
}) {
  const tools = { onCopy, onRegenerate, onRefine, onFavorite }
  const multi = cards.length > 1

  return (
    <div className="output">
      <div className="out-header">
        <div className="out-label">✨ {outLbl}</div>
        {!isSlip && (
          <div className="seg" role="group" aria-label="Number of options">
            {[1, 3].map(n => (
              <button
                key={n}
                className={`seg-btn${variations === n ? ' on' : ''}`}
                onClick={() => onSetVariations(n)}
              >
                {n === 1 ? '1 option' : '3 options'}
              </button>
            ))}
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        isSlip ? (
          <div className="slip-card">
            <div className="slip-title">PERMISSION SLIP</div>
            <div className="slip-subtitle">Official Self-Authorization</div>
            <div className="slip-body placeholder">{placeholder}</div>
            <div className="slip-footer">
              <span>Date: {today()}</span>
              <span>{slipName || 'Me'}</span>
            </div>
          </div>
        ) : (
          <div className="out-box">
            <span className="placeholder">{placeholder}</span>
          </div>
        )
      ) : (
        <div className={`cards${multi ? ' multi' : ''}`}>
          {cards.map((c, i) => (
            <ResultCard
              key={c.id}
              card={c}
              index={i}
              multi={multi}
              tools={tools}
              isSlip={isSlip}
              slipName={slipName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

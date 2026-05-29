// Optional "reply to a message you received" input.
export default function ReplyField({ enabled, onToggle, value, onChange }) {
  return (
    <div className="reply-block">
      <button
        type="button"
        className={`reply-toggle${enabled ? ' on' : ''}`}
        onClick={onToggle}
        aria-pressed={enabled}
      >
        <span>↩︎ Replying to a message?</span>
        <span className="switch" aria-hidden="true" />
      </button>
      {enabled && (
        <textarea
          className="field-input reply-input"
          placeholder="Paste the message you received, and I'll respond to it…"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

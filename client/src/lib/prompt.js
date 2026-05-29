// Prompt helpers shared by every tool.

// Refine actions shown under each result. Each maps to an instruction the
// model applies to existing text.
export const REFINEMENTS = [
  { id: 'shorter', label: 'Shorter', emoji: '✂️', instruction: 'noticeably shorter and more concise' },
  { id: 'warmer',  label: 'Warmer',  emoji: '🤍', instruction: 'warmer, kinder, and more friendly' },
  { id: 'firmer',  label: 'Firmer',  emoji: '✊', instruction: 'firmer, more confident, and more assertive' },
  { id: 'formal',  label: 'Formal',  emoji: '👔', instruction: 'more formal and professional' },
]

// Augment a freshly built base prompt with optional "reply to" context.
export function augmentPrompt(base, { replyTo } = {}) {
  let p = base
  if (replyTo && replyTo.trim()) {
    p +=
      ` This should be a direct reply to the following message I received: ` +
      `"${replyTo.trim()}". Respond to it naturally.`
  }
  return p
}

// Build a prompt that rewrites an existing message in a new direction.
export function refinePrompt(text, instruction) {
  return (
    `Rewrite the following message to be ${instruction}. ` +
    `Keep the same intent and first-person voice. ` +
    `Message: "${text}"`
  )
}

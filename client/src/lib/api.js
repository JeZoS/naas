// Single place that talks to the generation endpoint.
export async function generate(prompt) {
  const r = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error || 'Generation failed')
  return data.text
}

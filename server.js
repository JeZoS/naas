require('dotenv').config()
const express = require('express')
const OpenAI = require('openai')
const path = require('path')

const app = express()
app.use(express.json())

// Lazy-init so the server starts even before the key is set
let _openai = null
function getClient() {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set — add it to .env')
  if (!_openai) _openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  })
  return _openai
}

const GEN_SYSTEM =
  'You are a concise boundary-setting message writer. ' +
  'Output ONLY the message itself — no quotes, no preamble, no labels. ' +
  'Write in first person. 2-4 sentences max.' + 
  'Do not include thinking steps or reasoning, just the final message.' +
  'Do not include thinking text or reasoning, just the final message.'

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body
  try {
    const openai = getClient()
    const completion = await openai.chat.completions.create({
        model: "openrouter/owl-alpha",
        messages: [
            { role: "system", content: GEN_SYSTEM },
            { role: "user", content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.85,
    });
    res.json({ text: completion.choices[0].message.content.trim() })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, 'client/dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

const PORT = process.env.PORT || 3002
app.listen(PORT, () => console.log(`\n🚀 API ready → http://localhost:${PORT}\n`))

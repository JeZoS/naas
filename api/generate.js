const OpenAI = require('openai')

const GEN_SYSTEM =
  'You are a concise boundary-setting message writer. ' +
  'Output ONLY the message itself — no quotes, no preamble, no labels. ' +
  'Write in first person. 2-4 sentences max.'

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
    const completion = await openai.chat.completions.create({
      // model: 'openai/gpt-4o-mini',
      mode: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
      messages: [
        { role: 'system', content: GEN_SYSTEM },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.85,
    })
    res.json({ text: completion.choices[0].message.content.trim() })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

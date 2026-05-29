import { useCallback, useRef, useState } from 'react'
import { generate } from './api'
import { addHistory, toggleFavorite } from './history'
import { refinePrompt } from './prompt'

let counter = 0

// Drives the result area for every tool: 1–3 result "cards", each
// independently regenerable / refinable / favoritable, with auto-save to
// history on completion.
//
// config: { toolId, toolName, onError }
export function useGenerator(config = {}) {
  const cfgRef = useRef(config)
  cfgRef.current = config

  const [cards, setCards] = useState([])
  const [variations, setVariations] = useState(1)
  const variationsRef = useRef(1)
  const cardsRef = useRef([])

  // Keep a ref in sync so async callbacks read fresh card state.
  const commit = useCallback(updater => {
    setCards(prev => {
      const next = updater(prev)
      cardsRef.current = next
      return next
    })
  }, [])

  const setVariationCount = useCallback(n => {
    variationsRef.current = n
    setVariations(n)
  }, [])

  const run = useCallback(
    async (id, prompt, info) => {
      commit(cs => cs.map(c => (c.id === id ? { ...c, loading: true, error: null } : c)))
      try {
        const text = await generate(prompt)
        const { toolId, toolName } = cfgRef.current
        const historyId = addHistory({ text, toolId, toolName, ...info })
        commit(cs =>
          cs.map(c =>
            c.id === id ? { ...c, text, loading: false, historyId, favorite: false } : c
          )
        )
      } catch (e) {
        commit(cs => cs.map(c => (c.id === id ? { ...c, loading: false, error: e.message } : c)))
        cfgRef.current.onError?.(e.message)
      }
    },
    [commit]
  )

  // Start a fresh batch of N results from the same base prompt.
  const generateAll = useCallback(
    (basePrompt, info) => {
      const n = variationsRef.current
      const fresh = Array.from({ length: n }, () => ({
        id: ++counter,
        text: '',
        loading: true,
        basePrompt,
        info,
      }))
      commit(() => fresh)
      fresh.forEach(c => run(c.id, basePrompt, info))
    },
    [commit, run]
  )

  const regenerate = useCallback(
    id => {
      const card = cardsRef.current.find(c => c.id === id)
      if (card) run(id, card.basePrompt, card.info)
    },
    [run]
  )

  const refine = useCallback(
    (id, refinement) => {
      const card = cardsRef.current.find(c => c.id === id)
      if (!card?.text) return
      run(id, refinePrompt(card.text, refinement.instruction), {
        ...card.info,
        refined: refinement.id,
      })
    },
    [run]
  )

  const favorite = useCallback(
    id => {
      const card = cardsRef.current.find(c => c.id === id)
      if (!card?.historyId) return
      toggleFavorite(card.historyId)
      commit(cs => cs.map(c => (c.id === id ? { ...c, favorite: !c.favorite } : c)))
    },
    [commit]
  )

  const reset = useCallback(() => commit(() => []), [commit])

  return {
    cards,
    variations,
    setVariationCount,
    generateAll,
    regenerate,
    refine,
    favorite,
    reset,
  }
}

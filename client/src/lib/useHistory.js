import { useEffect, useState } from 'react'
import { getHistory, subscribe } from './history'

// Subscribe a component to the shared history store.
export function useHistory() {
  const [items, setItems] = useState(getHistory)
  useEffect(() => subscribe(setItems), [])
  return items
}

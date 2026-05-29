// localStorage-backed history of generated messages with a favorites flag.
// Tiny pub/sub so React components can subscribe via useHistory().

const KEY = 'politely_history'
const CAP = 60

let items = load()
const subs = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function emit() {
  save()
  subs.forEach(fn => fn(items))
}

export function getHistory() {
  return items
}

export function subscribe(fn) {
  subs.add(fn)
  return () => subs.delete(fn)
}

// Add a completed generation. Dedupes by exact text (moves the existing
// entry to the top instead of creating a duplicate). Returns the entry id.
export function addHistory(entry) {
  const text = (entry.text || '').trim()
  if (!text) return null

  const existing = items.find(i => i.text === text)
  if (existing) {
    items = [existing, ...items.filter(i => i.id !== existing.id)]
    emit()
    return existing.id
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  items = [{ id, favorite: false, ts: Date.now(), ...entry, text }, ...items].slice(0, CAP)
  emit()
  return id
}

export function toggleFavorite(id) {
  items = items.map(i => (i.id === id ? { ...i, favorite: !i.favorite } : i))
  emit()
}

export function removeHistory(id) {
  items = items.filter(i => i.id !== id)
  emit()
}

export function clearHistory({ keepFavorites = true } = {}) {
  items = keepFavorites ? items.filter(i => i.favorite) : []
  emit()
}

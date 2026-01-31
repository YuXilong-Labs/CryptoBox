import { ref } from 'vue'

const STORAGE_KEY = 'cryptobox_history'
const MAX_ITEMS = 50

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function useHistory(module) {
  function save(input, extra = {}) {
    if (!input || !input.trim()) return
    const all = getAll()
    // Deduplicate: remove same module+input
    const filtered = all.filter(h => !(h.module === module && h.input === input))
    filtered.unshift({ module, input, time: Date.now(), ...extra })
    if (filtered.length > MAX_ITEMS) filtered.length = MAX_ITEMS
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }

  function getLast() {
    const all = getAll()
    const item = all.find(h => h.module === module)
    return item ? item.input : ''
  }

  function getModuleHistory() {
    return getAll().filter(h => h.module === module)
  }

  return { save, getLast, getModuleHistory }
}

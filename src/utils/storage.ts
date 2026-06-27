export function loadJsonFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`Unable to load storage key ${key}`, error)
    return defaultValue
  }
}

export function saveJsonToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Unable to save storage key ${key}`, error)
  }
}

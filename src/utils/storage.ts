const PIN_PEPPER = 'faith-app-lock-v1'

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

export function isNumericPin(value: string): boolean {
  return /^[0-9]{4,6}$/.test(value)
}

export function isHashedPin(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value)
}

export async function hashString(value: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return `${PIN_PEPPER}:${value}`
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(`${PIN_PEPPER}:${value}`)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

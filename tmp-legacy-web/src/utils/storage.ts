import { z } from 'zod'
import { errorHandler } from './errorHandler'

const PIN_PEPPER = 'faith-app-lock-v1'
const STORAGE_VERSION = 'v2'

export const STORAGE_KEYS = {
  profile: 'faith:profile',
  visits: 'faith:visits',
  cults: 'faith:cults',
  contacts: 'faith:contacts',
  converts: 'faith:converts',
  sermons: 'faith:sermons',
  prayers: 'faith:prayers',
  pin: 'faith:pin',
} as const

const LEGACY_KEYS: Record<string, string> = {
  faith_profile: STORAGE_KEYS.profile,
  fs_visits: STORAGE_KEYS.visits,
  fs_cults: STORAGE_KEYS.cults,
  pastoral_contacts: STORAGE_KEYS.contacts,
  faith_converts: STORAGE_KEYS.converts,
  faith_sermons: STORAGE_KEYS.sermons,
  faith_prayers: STORAGE_KEYS.prayers,
  faith_pin: STORAGE_KEYS.pin,
}

// Ancienne clé de la fonctionnalité « anniversaires » supprimée
const DROPPED_LEGACY_KEYS = ['faith_birthdays']

interface StorageResult<T> {
  success: boolean
  data?: T
  error?: string
}

/** Migre les données des anciennes clés vers les nouvelles (une seule fois). */
export function migrateLegacyData(): void {
  if (typeof window === 'undefined') return
  try {
    const marker = localStorage.getItem('faith:storage-version')
    if (marker === STORAGE_VERSION) return

    for (const [legacy, modern] of Object.entries(LEGACY_KEYS)) {
      try {
        const raw = localStorage.getItem(legacy)
        if (raw === null) continue
        if (localStorage.getItem(modern) === null) {
          localStorage.setItem(modern, raw)
        }
        localStorage.removeItem(legacy)
      } catch (error) {
        errorHandler.log(`Migration échouée pour ${legacy}`, 'warning', { error })
      }
    }

    for (const dropped of DROPPED_LEGACY_KEYS) {
      localStorage.removeItem(dropped)
    }

    localStorage.setItem('faith:storage-version', STORAGE_VERSION)
    errorHandler.log('Données migrées vers v2', 'info')
  } catch (error) {
    errorHandler.log('Migration des données impossible', 'error', { error })
  }
}

export function loadJsonFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch (error) {
    errorHandler.log(`Impossible de charger ${key}`, 'warning', { key, error })
    return defaultValue
  }
}

export function saveJsonToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    const serialized = JSON.stringify(value)

    // Check localStorage quota (typically 5-10MB)
    if (serialized.length > 5 * 1024 * 1024) {
      errorHandler.log('Données trop volumineuses pour localStorage', 'error', { key, size: serialized.length })
      return false
    }

    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    errorHandler.log(`Impossible de sauvegarder ${key}`, 'error', { key, error })
    return false
  }
}

export function loadValidatedData<T>(
  key: string,
  schema: z.ZodSchema<T>,
  defaultValue: T
): StorageResult<T> {
  const raw = loadJsonFromStorage<unknown>(key, null)
  if (raw === null) {
    return { success: true, data: defaultValue }
  }

  const result = schema.safeParse(raw)
  if (result.success) {
    return { success: true, data: result.data }
  }

  errorHandler.log(`Données invalides pour ${key}`, 'warning', {
    key,
    errors: result.error.issues.slice(0, 5),
  })
  return { success: false, error: 'Données invalides', data: defaultValue }
}

/** Charge une liste et écarte silencieusement les entrées corrompues. */
export function loadValidatedList<T>(
  key: string,
  itemSchema: z.ZodSchema<T>
): { success: boolean; data: T[]; error?: string } {
  const raw = loadJsonFromStorage<unknown>(key, null)
  if (raw === null) return { success: true, data: [] }

  if (!Array.isArray(raw)) {
    errorHandler.log(`Données invalides pour ${key} (pas une liste)`, 'warning', { key })
    return { success: false, error: 'Données invalides', data: [] }
  }

  const valid: T[] = []
  let invalidCount = 0
  for (const item of raw) {
    const result = itemSchema.safeParse(item)
    if (result.success) {
      valid.push(result.data)
    } else {
      invalidCount++
    }
  }

  if (invalidCount > 0) {
    errorHandler.log(`${invalidCount} entrée(s) corrompue(s) ignorée(s) dans ${key}`, 'warning', { key, invalidCount })
  }

  return { success: invalidCount === 0, data: valid, error: invalidCount > 0 ? `${invalidCount} entrée(s) corrompue(s) ignorée(s)` : undefined }
}
export function saveValidatedData<T>(
  key: string,
  schema: z.ZodSchema<T>,
  value: T
): StorageResult<T> {
  const result = schema.safeParse(value)
  if (!result.success) {
    const firstError = result.error.issues[0]
    const errorMsg = firstError?.message ?? 'Validation échouée'
    errorHandler.log(`Validation échouée pour ${key}`, 'error', {
      key,
      errors: result.error.issues.slice(0, 5),
    })
    return { success: false, error: errorMsg }
  }

  const saved = saveJsonToStorage(key, result.data)
  if (!saved) {
    return { success: false, error: 'Échec de sauvegarde' }
  }

  return { success: true, data: result.data }
}

/** Sauvegarde une liste entière en validant chaque entrée. */
export function saveValidatedList<T>(
  key: string,
  itemSchema: z.ZodSchema<T>,
  value: T[]
): StorageResult<T[]> {
  const result = z.array(itemSchema).safeParse(value)
  if (!result.success) {
    const firstError = result.error.issues[0]
    const errorMsg = firstError?.message ?? 'Validation échouée'
    errorHandler.log(`Validation échouée pour ${key}`, 'error', {
      key,
      errors: result.error.issues.slice(0, 5),
    })
    return { success: false, error: errorMsg }
  }

  const saved = saveJsonToStorage(key, result.data)
  if (!saved) {
    return { success: false, error: 'Échec de sauvegarde' }
  }

  return { success: true, data: result.data }
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

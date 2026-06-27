import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { Visit } from '../types'
import type { BirthdayEntry } from '../types'

type Cult = { id: string; title: string; weekday: number; time: string; startDate: string }

let scheduledTimers: number[] = []

function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

export async function requestPermission() {
  if (isNative()) {
    try {
      await LocalNotifications.requestPermissions()
    } catch {
      // ignore
    }
    return
  }
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch {
      // ignore
    }
  }
}

async function show(title: string, body: string, id = 1) {
  if (isNative()) {
    try {
      await LocalNotifications.schedule({
        notifications: [{ title, body, id, schedule: { at: new Date() } }],
      })
    } catch {
      // silent
    }
    return
  }
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' })
  }
}

function clearTimers() {
  for (const t of scheduledTimers) clearTimeout(t)
  scheduledTimers = []
}

// ========== CULTES ==========

export function scheduleUpcomingNotifications(cults: Cult[]) {
  clearTimers()
  const now = new Date()
  const horizonMs = 24 * 60 * 60 * 1000

  for (const c of cults) {
    const next = nextCultOccurrence(c, now, horizonMs)
    if (!next) continue
    const delay = next.getTime() - now.getTime()
    if (delay <= 0) continue
    const id = window.setTimeout(() => {
      show(c.title, `🧑‍🏫 Culte aujourd'hui à ${c.time}. Que Dieu te bénisse !`, hashId(c.id))
    }, delay)
    scheduledTimers.push(id)
  }
}

function nextCultOccurrence(c: Cult, from: Date, horizonMs: number): Date | null {
  const [hh, mm] = c.time.split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  const target = new Date(from)
  let diff = c.weekday - from.getDay()
  if (diff < 0) diff += 7
  target.setDate(from.getDate() + diff)
  target.setHours(hh, mm, 0, 0)
  if (target.getTime() <= from.getTime()) target.setDate(target.getDate() + 7)
  if (target.getTime() - from.getTime() <= horizonMs) return target
  return null
}

// ========== VISITES ==========

export function checkVisitsNotifications(visits: Visit[]) {
  const now = new Date()
  for (const v of visits) {
    const visitDate = new Date(v.date)
    if (Number.isNaN(visitDate.getTime())) continue
    const diffMs = visitDate.getTime() - now.getTime()
    // dans l'heure qui suit (rappel immédiat si visite dans ≤ 60 min)
    if (diffMs > 0 && diffMs <= 60 * 60 * 1000) {
      show('📋 Visite imminente', `Visite chez ${v.name} dans moins d'une heure.`, hashId('v_' + v.id))
    }
  }
}

export function scheduleVisitNotification(visit: Visit) {
  const now = new Date()
  const visitDate = new Date(visit.date)
  if (Number.isNaN(visitDate.getTime())) return
  const delay = visitDate.getTime() - now.getTime() - 60 * 60 * 1000 // 1h avant
  if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
    const id = window.setTimeout(() => {
      show('📋 Visite dans 1h', `Rappel : visite chez ${visit.name} à ${visitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`, hashId('v_' + visit.id))
    }, delay)
    scheduledTimers.push(id)
  }
  // aussi vérifier si c'est imminent maintenant
  checkVisitsNotifications([visit])
}

// ========== ANNIVERSAIRES ==========

export function checkBirthdaysNotifications(entries: BirthdayEntry[]) {
  const now = new Date()
  const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const upcoming = entries.filter(e => e.date === today)
  for (const e of upcoming) {
    show('🎂 Anniversaire aujourd’hui', `${e.name} fête son anniversaire aujourd'hui ! Pense à lui souhaiter.`, hashId('b_' + e.id))
  }
}

// ========== CHECK GLOBAL AU LOAD ==========

export function checkAllNotifications(visits: Visit[], entries: BirthdayEntry[]) {
  checkVisitsNotifications(visits)
  checkBirthdaysNotifications(entries)
}

function hashId(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

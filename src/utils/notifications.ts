type Cult = { id: string; title: string; weekday: number; time: string; startDate: string }

let scheduledTimers: number[] = []

export async function requestPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission()
    } catch (error) {
      console.warn('Notification permission request failed', error)
    }
  }
}

export function scheduleUpcomingNotifications(cults: Cult[]) {
  for (const timer of scheduledTimers) {
    clearTimeout(timer)
  }
  scheduledTimers = []

  const now = new Date()
  const horizonMs = 24 * 60 * 60 * 1000
  for (const c of cults) {
    const next = nextOccurrenceWithin(c, now, horizonMs)
    if (!next) continue

    const delay = next.getTime() - now.getTime()
    if (delay <= 0) continue

    const id = window.setTimeout(() => {
      showNotification(`${c.title}`, `Culte aujourd'hui à ${c.time}. Que Jésus vous bénisse.`)
    }, delay)
    scheduledTimers.push(id)
  }
}

function nextOccurrenceWithin(c: Cult, from: Date, horizonMs: number): Date | null {
  const [hh, mm] = c.time.split(':').map(Number)
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null

  const today = new Date(from)
  const target = new Date(today)
  const curWeekday = today.getDay()
  let diff = c.weekday - curWeekday
  if (diff < 0) diff += 7
  target.setDate(today.getDate() + diff)
  target.setHours(hh, mm, 0, 0)

  if (target.getTime() <= from.getTime()) target.setDate(target.getDate() + 7)
  if (target.getTime() - from.getTime() <= horizonMs) return target
  return null
}

function showNotification(title: string, body: string) {
  if (typeof window === 'undefined') return
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  } else {
    console.info('Notification fallback:', title, body)
  }
}

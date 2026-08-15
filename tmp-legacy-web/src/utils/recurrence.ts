import { downloadFile } from './download'

type Cult = { id: string; title: string; weekday: number; time: string; startDate: string }

export function exportICalForCults(cults: Cult[]) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FAITH//Culte//FR']
  for (const c of cults) {
    const rule = `FREQ=WEEKLY;BYDAY=${weekdayToByDay(c.weekday)};WKST=SU`
    const dtstart = `${c.startDate}T${c.time.replace(':', '')}`
    lines.push('BEGIN:VEVENT')
    lines.push('UID:' + c.id)
    lines.push('DTSTART;TZID=UTC:' + dtstart + '00')
    lines.push('RRULE:' + rule)
    lines.push('SUMMARY:' + c.title)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  downloadFile(lines.join('\r\n'), 'cults.ics', 'text/calendar')
}

function weekdayToByDay(w: number) {
  // iCal uses MO,TU,... with week starting Monday but we'll map 0=SU
  const map = ['SU','MO','TU','WE','TH','FR','SA']
  return map[w] || 'SU'
}

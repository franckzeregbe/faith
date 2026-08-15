import { downloadFile } from './download'

type Visit = { id: string; name: string; date: string; notes?: string }

function csvSafe(s: string) {
  if (s == null) return ''
  return '"' + s.replace(/"/g, '""') + '"'
}

export function exportCSV(visits: Visit[]) {
  const header = ['id', 'name', 'date', 'notes']
  const rows = visits.map((v) => [v.id, csvSafe(v.name), v.date, csvSafe(v.notes || '')])
  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadFile(csv, 'visites.csv', 'text/csv')
}

export function exportContactsCSV(contacts: { id: string; name: string; phone?: string; note?: string; lastVisit?: string }[]) {
  const header = ['id', 'name', 'phone', 'note', 'lastVisit']
  const rows = contacts.map((c) => [c.id, csvSafe(c.name), csvSafe(c.phone || ''), csvSafe(c.note || ''), csvSafe(c.lastVisit || '')])
  const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadFile(csv, 'contacts.csv', 'text/csv')
}

export function exportICal(visits: Visit[]) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FAITH//Outil Pastoral//FR'
  ]
  for (const v of visits) {
    const dt = new Date(v.date)
    const dtstamp = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    lines.push('BEGIN:VEVENT')
    lines.push('UID:' + v.id)
    lines.push('DTSTAMP:' + dtstamp)
    lines.push('DTSTART:' + dtstamp)
    lines.push('SUMMARY:Visite — ' + v.name)
    if (v.notes) lines.push('DESCRIPTION:' + v.notes)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  downloadFile(lines.join('\r\n'), 'visites.ics', 'text/calendar')
}

const visits = [
  { id: '1', name: 'Famille Dupond', date: '2026-06-30T09:00', notes: 'Rendez-vous de prière' },
  { id: '2', name: 'Sœur Marie', date: '2026-07-01T15:30', notes: 'Encouragement' }
]

const header = ['id', 'name', 'date', 'notes']
const rows = visits.map((v) => [v.id, `"${v.name}"`, v.date, `"${v.notes}"`])
const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')

console.log(csv)

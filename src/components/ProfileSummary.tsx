import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage } from '../utils/storage'

export default function ProfileSummary() {
  const [nextVisit, setNextVisit] = useState<{ name: string; date: string } | null>(null)

  useEffect(() => {
    const visits = loadJsonFromStorage<any[]>('fs_visits', [])
    const upcoming = visits
      .map(item => ({ ...item, dateObject: new Date(item.date) }))
      .filter(item => item.date && item.dateObject instanceof Date && !Number.isNaN(item.dateObject.getTime()) && item.dateObject >= new Date())
      .sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime())
      .shift()
    if (upcoming) {
      setNextVisit({ name: upcoming.name, date: upcoming.dateObject.toLocaleString() })
    }
  }, [])

  return (
    <div className="stat-card">
      <div className="stat-card-icon data">📅</div>
      <div className="stat-card-body">
        <span className="stat-label">Prochaine visite</span>
        <span className="stat-value">{nextVisit ? nextVisit.name : 'Aucune'}</span>
        <span className="stat-sub">{nextVisit ? nextVisit.date : 'Planifie une visite maintenant'}</span>
      </div>
    </div>
  )
}

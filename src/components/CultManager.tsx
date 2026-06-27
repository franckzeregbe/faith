import React, { useEffect, useState } from 'react'
import { exportICalForCults } from '../utils/recurrence'
import { requestPermission, scheduleUpcomingNotifications } from '../utils/notifications'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import type { Cult } from '../types'

const STORAGE_KEY = 'fs_cults'

export default function CultManager() {
  const [cults, setCults] = useState<Cult[]>([])
  const [title, setTitle] = useState('Culte')
  const [weekday, setWeekday] = useState(0)
  const [time, setTime] = useState('09:00')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    setCults(loadJsonFromStorage<Cult[]>(STORAGE_KEY, []))
    requestPermission()
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, cults)
    scheduleUpcomingNotifications(cults)
  }, [cults])

  function addCult() {
    if (!title.trim()) return
    const newCult: Cult = {
      id: Date.now().toString(),
      title: title.trim(),
      weekday,
      time,
      startDate
    }
    setCults((current) => [...current, newCult])
  }

  function removeCult(id: string) {
    setCults((current) => current.filter((cult) => cult.id !== id))
  }

  return (
    <div className="cult-manager">
      <div className="form-row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du culte" />
        <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
          <option value={0}>Dimanche</option>
          <option value={1}>Lundi</option>
          <option value={2}>Mardi</option>
          <option value={3}>Mercredi</option>
          <option value={4}>Jeudi</option>
          <option value={5}>Vendredi</option>
          <option value={6}>Samedi</option>
        </select>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <button onClick={addCult}>Ajouter culte</button>
      </div>

      <div className="actions">
        <button onClick={() => exportICalForCults(cults)}>Exporter iCal (récurrent)</button>
      </div>

      <ul>
        {cults.map((cult) => (
          <li key={cult.id}>
            <div>{cult.title} — {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][cult.weekday]} {cult.time} (depuis {cult.startDate})</div>
            <div><button onClick={() => removeCult(cult.id)}>Supprimer</button></div>
          </li>
        ))}
      </ul>
    </div>
  )
}

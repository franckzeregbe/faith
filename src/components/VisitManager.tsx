import React, { useEffect, useState } from 'react'
import { exportCSV, exportICal } from '../utils/export'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import type { Visit } from '../types'

const STORAGE_KEY = 'fs_visits'

export default function VisitManager() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setVisits(loadJsonFromStorage<Visit[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, visits)
  }, [visits])

  function addVisit() {
    if (!name || !date) return
    const newVisit: Visit = { id: Date.now().toString(), name: name.trim(), date, notes: notes.trim() }
    setVisits((current) => [newVisit, ...current])
    setName('')
    setDate('')
    setNotes('')
  }

  function removeVisit(id: string) {
    setVisits((current) => current.filter((visit) => visit.id !== id))
  }

  return (
    <div className="visit-manager">
      <div className="form-row">
        <input placeholder="Nom (famille/personne)" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="form-row">
        <input placeholder="Notes (facultatif)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={addVisit}>Ajouter</button>
      </div>

      <div className="actions">
        <button onClick={() => exportCSV(visits)}>Exporter CSV</button>
        <button onClick={() => exportICal(visits)}>Exporter iCal</button>
      </div>

      <ul className="visit-list">
        {visits.map((visit) => (
          <li key={visit.id}>
            <div>
              <strong>{visit.name}</strong> — {new Date(visit.date).toLocaleString()}
            </div>
            {visit.notes ? <div>{visit.notes}</div> : null}
            <div className="row-actions">
              <button onClick={() => removeVisit(visit.id)}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

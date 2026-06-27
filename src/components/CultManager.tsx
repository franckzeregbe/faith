import React, { useEffect, useState } from 'react'
import { exportICalForCults } from '../utils/recurrence'
import { requestPermission, scheduleUpcomingNotifications } from '../utils/notifications'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { Cult } from '../types'

const STORAGE_KEY = 'fs_cults'
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export default function CultManager() {
  const [cults, setCults] = useState<Cult[]>([])
  const [title, setTitle] = useState('Culte')
  const [weekday, setWeekday] = useState(0)
  const [time, setTime] = useState('09:00')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [editing, setEditing] = useState<Cult | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cult | null>(null)

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
    const newCult: Cult = { id: Date.now().toString(), title: title.trim(), weekday, time, startDate }
    setCults(current => [...current, newCult])
    setTitle('Culte')
    setWeekday(0)
    setTime('09:00')
    setStartDate(new Date().toISOString().slice(0, 10))
  }

  function updateCult() {
    if (!editing) return
    setCults(current => current.map(c => c.id === editing.id ? editing : c))
    setEditing(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setCults(current => current.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 14 }}>Ajouter un nouveau culte</h2>
      <div className="form-row">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre du culte" />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <select value={weekday} onChange={e => setWeekday(Number(e.target.value))}>
          {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
        </select>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-primary" onClick={addCult} disabled={!title.trim()}>Ajouter culte</button>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => exportICalForCults(cults)} disabled={cults.length === 0}>
          Exporter iCal (récurrent)
        </button>
      </div>

      {cults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⛪</div>
          <h3>Aucun culte programmé</h3>
          <p>Ajoute tes cultes récurrents pour générer un calendrier iCal.</p>
        </div>
      ) : (
        <ul className="item-list">
          {cults.map(cult => (
            <li key={cult.id} className="item-card">
              <div className="item-card-body">
                <strong>{cult.title}</strong>
                <span className="item-meta">
                  {DAYS[cult.weekday]} à {cult.time} · depuis le {cult.startDate}
                </span>
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...cult })}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(cult)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Modifier le culte</h3>
            <div className="form-row">
              <input placeholder="Titre" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="form-row">
              <select value={editing.weekday} onChange={e => setEditing({ ...editing, weekday: Number(e.target.value) })}>
                {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
              </select>
              <input type="time" value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })} />
              <input type="date" value={editing.startDate} onChange={e => setEditing({ ...editing, startDate: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={updateCult} disabled={!editing.title.trim()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer le culte"
        message={`Supprimer le culte "${deleteTarget?.title}" ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { BirthdayEntry } from '../types'

const STORAGE_KEY = 'faith_birthdays'
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function BirthdayManager() {
  const [entries, setEntries] = useState<BirthdayEntry[]>([])
  const [name, setName] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [phone, setPhone] = useState('')
  const [editing, setEditing] = useState<BirthdayEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BirthdayEntry | null>(null)

  useEffect(() => {
    setEntries(loadJsonFromStorage<BirthdayEntry[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, entries)
  }, [entries])

  function addEntry() {
    if (!name.trim() || !month || !day) return
    const date = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    setEntries(current => [{ id: Date.now().toString(), name: name.trim(), date, phone: phone.trim() }, ...current])
    setName('')
    setMonth('')
    setDay('')
    setPhone('')
  }

  function updateEntry() {
    if (!editing) return
    setEntries(current => current.map(e => e.id === editing.id ? editing : e))
    setEditing(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setEntries(current => current.filter(e => e.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const sorted = useMemo(() => {
    const now = new Date()
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return [...entries].sort((a, b) => {
      const aDays = a.date >= today ? 0 : 1
      const bDays = b.date >= today ? 0 : 1
      if (aDays !== bDays) return aDays - bDays
      return a.date.localeCompare(b.date)
    })
  }, [entries])

  function formatDate(date: string) {
    const [m, d] = date.split('-')
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]}`
  }

  function isUpcoming(date: string) {
    const now = new Date()
    const today = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return date >= today
  }

  return (
    <div>
      <div className="form-row">
        <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          <option value="">Mois</option>
          {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
        </select>
        <select value={day} onChange={e => setDay(e.target.value)}>
          <option value="">Jour</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i} value={String(i + 1)}>{i + 1}</option>
          ))}
        </select>
        <input placeholder="Téléphone (facultatif)" value={phone} onChange={e => setPhone(e.target.value)} />
        <button className="btn btn-primary" onClick={addEntry} disabled={!name.trim() || !month || !day}>Ajouter</button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎂</div>
          <h3>Aucun anniversaire enregistré</h3>
          <p>Ajoute les dates de naissance des membres pour ne plus les oublier.</p>
        </div>
      ) : (
        <ul className="item-list">
          {sorted.map(entry => (
            <li key={entry.id} className="item-card" style={isUpcoming(entry.date) ? { borderLeft: '3px solid var(--primary)' } : undefined}>
              <div className="item-card-body">
                <strong>{entry.name}</strong>
                <span className="item-meta">
                  🎂 {formatDate(entry.date)}
                  {isUpcoming(entry.date) ? ' · À venir' : ' · Passé'}
                </span>
                {entry.phone ? <span className="item-note">{entry.phone}</span> : null}
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...entry })}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(entry)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Modifier l'anniversaire</h3>
            <div className="form-row">
              <input placeholder="Nom" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-row">
              <select value={editing.date.split('-')[0]} onChange={e => setEditing({ ...editing, date: `${e.target.value}-${editing.date.split('-')[1]}` })}>
                {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
              </select>
              <select value={editing.date.split('-')[1]} onChange={e => setEditing({ ...editing, date: `${editing.date.split('-')[0]}-${e.target.value}` })}>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <input placeholder="Téléphone" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={updateEntry} disabled={!editing.name.trim()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer l'anniversaire"
        message={`Supprimer ${deleteTarget?.name} de la liste ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

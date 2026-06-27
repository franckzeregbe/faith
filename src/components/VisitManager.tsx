import React, { useEffect, useState } from 'react'
import { exportCSV, exportICal } from '../utils/export'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { Visit } from '../types'

const STORAGE_KEY = 'fs_visits'

export default function VisitManager() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Visit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Visit | null>(null)

  useEffect(() => {
    setVisits(loadJsonFromStorage<Visit[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, visits)
  }, [visits])

  function addVisit() {
    if (!name || !date) return
    const newVisit: Visit = { id: Date.now().toString(), name: name.trim(), date, notes: notes.trim() }
    setVisits(current => [newVisit, ...current])
    setName('')
    setDate('')
    setNotes('')
  }

  function updateVisit() {
    if (!editing) return
    setVisits(current => current.map(v => v.id === editing.id ? editing : v))
    setEditing(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setVisits(current => current.filter(v => v.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const filtered = visits.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="form-row">
        <input placeholder="Nom (famille/personne)" value={name} onChange={e => setName(e.target.value)} />
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <input placeholder="Notes (facultatif)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-primary" onClick={addVisit} disabled={!name || !date}>Ajouter</button>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(visits)} disabled={visits.length === 0}>Exporter CSV</button>
        <button className="btn btn-secondary btn-sm" onClick={() => exportICal(visits)} disabled={visits.length === 0}>Exporter iCal</button>
      </div>

      {visits.length > 0 && (
        <div className="search-bar" style={{ marginTop: 20 }}>
          <input placeholder="Rechercher une visite..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{visits.length === 0 ? 'Aucune visite planifiée' : 'Aucune visite trouvée'}</h3>
          <p>{visits.length === 0 ? 'Ajoute ta première visite pastorale ci-dessus.' : 'Essaye un autre terme de recherche.'}</p>
        </div>
      ) : (
        <ul className="item-list">
          {filtered.map(visit => (
            <li key={visit.id} className="item-card">
              <div className="item-card-body">
                <strong>{visit.name}</strong>
                <span className="item-meta">{new Date(visit.date).toLocaleString()}</span>
                {visit.notes ? <span className="item-note">{visit.notes}</span> : null}
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...visit })}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(visit)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Modifier la visite</h3>
            <div className="form-row">
              <input placeholder="Nom" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-row">
              <input type="datetime-local" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Notes" value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={updateVisit} disabled={!editing.name || !editing.date}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer la visite"
        message={`Supprimer la visite chez ${deleteTarget?.name} ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

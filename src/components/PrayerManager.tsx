import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { PrayerRequest } from '../types'

const STORAGE_KEY = 'faith_prayers'

export default function PrayerManager() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [title, setTitle] = useState('')
  const [requester, setRequester] = useState('')
  const [notes, setNotes] = useState('')
  const [editing, setEditing] = useState<PrayerRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PrayerRequest | null>(null)

  useEffect(() => {
    setPrayers(loadJsonFromStorage<PrayerRequest[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, prayers)
  }, [prayers])

  function addPrayer() {
    if (!title.trim()) return
    setPrayers(current => [{
      id: Date.now().toString(),
      title: title.trim(),
      requester: requester.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: 'en prière',
      notes: notes.trim(),
    }, ...current])
    setTitle('')
    setRequester('')
    setNotes('')
  }

  function updatePrayer() {
    if (!editing) return
    setPrayers(current => current.map(p => p.id === editing.id ? editing : p))
    setEditing(null)
  }

  function toggleStatus(prayer: PrayerRequest) {
    setPrayers(current => current.map(p =>
      p.id === prayer.id ? { ...p, status: p.status === 'en prière' ? 'exaucée' : 'en prière' } : p
    ))
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setPrayers(current => current.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const answered = prayers.filter(p => p.status === 'exaucée').length

  return (
    <div>
      <div className="form-row">
        <input placeholder="Motif de prière" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Pour qui ? (nom)" value={requester} onChange={e => setRequester(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <input placeholder="Note (facultatif)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-primary" onClick={addPrayer} disabled={!title.trim()}>Ajouter</button>
      </div>

      {prayers.length > 0 && (
        <div className="empty-state" style={{ padding: '16px 0', flexDirection: 'row', gap: 16 }}>
          <span>Total : <strong>{prayers.length}</strong></span>
          <span>✅ Exaucées : <strong>{answered}</strong></span>
          <span>🙏 En prière : <strong>{prayers.length - answered}</strong></span>
        </div>
      )}

      {prayers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🙏</div>
          <h3>Aucune demande de prière</h3>
          <p>Enregistre les motifs de prière pour suivre les réponses de Dieu.</p>
        </div>
      ) : (
        <ul className="item-list">
          {prayers.map(prayer => (
            <li key={prayer.id} className="item-card">
              <div className="item-card-body">
                <strong>{prayer.title}</strong>
                <span className="item-meta">{prayer.requester} · {prayer.date}</span>
                {prayer.notes ? <span className="item-note">{prayer.notes}</span> : null}
              </div>
              <div className="item-actions">
                <button
                  className="btn btn-sm"
                  style={{
                    background: prayer.status === 'exaucée' ? '#dcfce7' : '#fef3c7',
                    color: prayer.status === 'exaucée' ? '#166534' : '#92400e',
                    border: '1px solid',
                    borderColor: prayer.status === 'exaucée' ? '#bbf7d0' : '#fde68a',
                  }}
                  onClick={() => toggleStatus(prayer)}
                >
                  {prayer.status === 'exaucée' ? '✅ Exaucée' : '⏳ En prière'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...prayer })}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(prayer)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Modifier la demande</h3>
            <div className="form-row">
              <input placeholder="Motif" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Pour qui" value={editing.requester} onChange={e => setEditing({ ...editing, requester: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Notes" value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div className="form-row">
              <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as 'en prière' | 'exaucée' })}>
                <option value="en prière">⏳ En prière</option>
                <option value="exaucée">✅ Exaucée</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={updatePrayer} disabled={!editing.title.trim()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer la demande"
        message={`Supprimer cette demande de prière ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

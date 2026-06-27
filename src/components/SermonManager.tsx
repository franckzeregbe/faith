import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { Sermon } from '../types'

const STORAGE_KEY = 'faith_sermons'

export default function SermonManager() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [title, setTitle] = useState('')
  const [bibleText, setBibleText] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [editing, setEditing] = useState<Sermon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null)

  useEffect(() => {
    setSermons(loadJsonFromStorage<Sermon[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, sermons)
  }, [sermons])

  function addSermon() {
    if (!title.trim() || !bibleText.trim()) return
    setSermons(current => [{ id: Date.now().toString(), title: title.trim(), bibleText: bibleText.trim(), date, notes: notes.trim() }, ...current])
    setTitle('')
    setBibleText('')
    setDate(new Date().toISOString().slice(0, 10))
    setNotes('')
  }

  function updateSermon() {
    if (!editing) return
    setSermons(current => current.map(s => s.id === editing.id ? editing : s))
    setEditing(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setSermons(current => current.filter(s => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <div className="form-row">
        <input placeholder="Titre de la prédication" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Texte biblique (ex: Jean 3:16)" value={bibleText} onChange={e => setBibleText(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-primary" onClick={addSermon} disabled={!title.trim() || !bibleText.trim()}>Ajouter</button>
      </div>

      {sermons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>Aucune prédication enregistrée</h3>
          <p>Ajoute tes sermons pour garder une trace de la Parole proclamée.</p>
        </div>
      ) : (
        <ul className="item-list">
          {sermons.map(sermon => (
            <li key={sermon.id} className="item-card">
              <div className="item-card-body">
                <strong>{sermon.title}</strong>
                <span className="item-meta">{sermon.bibleText} · {sermon.date}</span>
                {sermon.notes ? <span className="item-note">{sermon.notes}</span> : null}
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...sermon })}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(sermon)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Modifier la prédication</h3>
            <div className="form-row">
              <input placeholder="Titre" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Texte biblique" value={editing.bibleText} onChange={e => setEditing({ ...editing, bibleText: e.target.value })} />
              <input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Notes" value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={updateSermon} disabled={!editing.title.trim()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer la prédication"
        message={`Supprimer "${deleteTarget?.title}" ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

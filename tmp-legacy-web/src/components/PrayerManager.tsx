import React, { useEffect, useState } from 'react'
import { STORAGE_KEYS, loadValidatedList, saveValidatedList } from '../utils/storage'
import { prayerRequestSchema } from '../schemas'
import ConfirmDialog from './ConfirmDialog'
import type { PrayerRequest } from '../types'

export default function PrayerManager() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([])
  const [title, setTitle] = useState('')
  const [requester, setRequester] = useState('')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'tous' | 'en prière' | 'exaucée'>('tous')
  const [editing, setEditing] = useState<PrayerRequest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PrayerRequest | null>(null)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const result = loadValidatedList(STORAGE_KEYS.prayers, prayerRequestSchema)
    setPrayers(result.data)
  }, [])

  useEffect(() => {
    const result = saveValidatedList(STORAGE_KEYS.prayers, prayerRequestSchema, prayers)
    setSaveError(result.success ? '' : (result.error ?? 'Échec de sauvegarde'))
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

  const filtered = (search ? prayers.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.requester.toLowerCase().includes(search.toLowerCase()) ||
    p.notes?.toLowerCase().includes(search.toLowerCase())
  ) : prayers).filter(p => statusFilter === 'tous' || p.status === statusFilter)
  const answered = prayers.filter(p => p.status === 'exaucée').length
  const answeredRate = prayers.length > 0 ? Math.round((answered / prayers.length) * 100) : 0

  return (
    <div>
      {/* Statistiques */}
      {prayers.length > 0 && (
        <div className="mini-stats">
          <div className="mini-stat">
            <span className="mini-stat-num">{prayers.length}</span>
            <span className="mini-stat-label">Total</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-num" style={{ color: '#166534' }}>{answered}</span>
            <span className="mini-stat-label">✅ Exaucées</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-num" style={{ color: '#92400e' }}>{prayers.length - answered}</span>
            <span className="mini-stat-label">⏳ En prière</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-num" style={{ color: 'var(--primary-dark)' }}>{answeredRate}%</span>
            <span className="mini-stat-label">Taux de réponse</span>
          </div>
        </div>
      )}

      <div className="form-row">
        <input placeholder="Motif de prière" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Pour qui ? (nom)" value={requester} onChange={e => setRequester(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <input placeholder="Note (facultatif)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-primary" onClick={addPrayer} disabled={!title.trim()}>Ajouter</button>
      </div>

      {saveError && <span style={{ color: 'red', fontSize: '0.85rem' }}>{saveError}</span>}

      {prayers.length > 0 && (
        <div className="filter-chips">
          {(['tous', 'en prière', 'exaucée'] as const).map(f => (
            <button
              key={f}
              className={`filter-chip ${statusFilter === f ? 'active' : ''}`}
              onClick={() => setStatusFilter(f)}
            >
              {f === 'tous' ? 'Toutes' : f === 'en prière' ? '⏳ En prière' : '✅ Exaucées'}
            </button>
          ))}
        </div>
      )}

      {prayers.length > 0 && (
        <div className="search-bar">
          <input placeholder="Rechercher par motif, nom ou note..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {prayers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🙏</div>
          <h3>Aucune demande de prière</h3>
          <p>Enregistre les motifs de prière pour suivre les réponses de Dieu.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Aucun résultat</h3>
          <p>Essaie un autre terme de recherche.</p>
        </div>
      ) : (
        <ul className="item-list">
          {filtered.map(prayer => (
            <li key={prayer.id} className="item-card">
              <div className="item-avatar" style={{ background: prayer.status === 'exaucée' ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                {(prayer.requester || prayer.title).charAt(0).toUpperCase()}
              </div>
              <div className="item-card-body">
                <strong>{prayer.title}</strong>
                <span className="item-meta">{prayer.requester || 'Anonyme'} · {prayer.date}</span>
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

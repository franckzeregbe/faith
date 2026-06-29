import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { ConvertEntry } from '../types'

const STORAGE_KEY = 'faith_converts'

const CONVERT_TYPES: ConvertEntry['type'][] = ['profession de foi', 'baptême', 'repentance', 'consécration', 'autre']
const STATUSES: ConvertEntry['status'][] = ['suivi', 'disciple', 'engage(e)', 'relâché']

export default function ConvertManager() {
  const [entries, setEntries] = useState<ConvertEntry[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState<ConvertEntry['type']>('profession de foi')
  const [status, setStatus] = useState<ConvertEntry['status']>('suivi')
  const [notes, setNotes] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ConvertEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ConvertEntry | null>(null)

  useEffect(() => {
    setEntries(loadJsonFromStorage<ConvertEntry[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, entries)
  }, [entries])

  function addEntry() {
    if (!name.trim()) return
    setEntries(current => [{
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      date: new Date().toISOString().slice(0, 10),
      type,
      status,
      notes: notes.trim(),
    }, ...current])
    setName('')
    setPhone('')
    setNotes('')
    setType('profession de foi')
    setStatus('suivi')
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

  const filtered = search ? entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.phone?.toLowerCase().includes(search.toLowerCase()) ||
    e.notes?.toLowerCase().includes(search.toLowerCase())
  ) : entries
  const total = entries.length
  const disciples = entries.filter(e => e.status === 'disciple' || e.status === 'engage(e)').length
  const types = entries.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div>
      <div className="section-card-header" style={{ border: 'none', padding: 0, marginBottom: 16 }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          « Allez, faites de toutes les nations des disciples. » — Matthieu 28:19
        </p>
      </div>

      {total > 0 && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div className="stat-card" style={{ flex: 1, minWidth: 120, padding: '12px 16px' }}>
            <span className="stat-label">Nouvelles âmes</span>
            <span className="stat-value" style={{ fontSize: '1.2rem' }}>{total}</span>
          </div>
          <div className="stat-card" style={{ flex: 1, minWidth: 120, padding: '12px 16px' }}>
            <span className="stat-label">Disciples actifs</span>
            <span className="stat-value" style={{ fontSize: '1.2rem' }}>{disciples}</span>
          </div>
          <div className="stat-card" style={{ flex: 1, minWidth: 120, padding: '12px 16px' }}>
            <span className="stat-label">Baptêmes</span>
            <span className="stat-value" style={{ fontSize: '1.2rem' }}>{types['baptême'] || 0}</span>
          </div>
        </div>
      )}

      <div className="form-row">
        <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Téléphone (optionnel)" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <select value={type} onChange={e => setType(e.target.value as ConvertEntry['type'])}>
          {CONVERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value as ConvertEntry['status'])}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="Note (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} />
        <button className="btn btn-primary" onClick={addEntry} disabled={!name.trim()}>Ajouter</button>
      </div>

      {entries.length > 0 && (
        <div className="search-bar">
          <input placeholder="Rechercher par nom, téléphone ou note..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🕊️</div>
          <h3>Aucune âme enregistrée</h3>
          <p>Ajoute chaque personne qui donne sa vie à Jésus — profession de foi, baptême, repentance.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Aucun résultat</h3>
          <p>Essaie un autre terme de recherche.</p>
        </div>
      ) : (
        <ul className="item-list">
          {filtered.map(entry => (
            <li key={entry.id} className="item-card">
              <div className="item-card-body">
                <strong>{entry.name}</strong>
                <span className="item-meta">
                  🕊️ {entry.type} · {entry.date}
                  {entry.phone ? ` · 📞 ${entry.phone}` : ''}
                </span>
                <span style={{
                  display: 'inline-flex', alignSelf: 'flex-start', marginTop: 6,
                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem', fontWeight: 700,
                  background: entry.status === 'relâché' ? '#fee2e2' : entry.status === 'suivi' ? '#fef3c7' : '#dcfce7',
                  color: entry.status === 'relâché' ? '#991b1b' : entry.status === 'suivi' ? '#92400e' : '#166534',
                }}>
                  {entry.status === 'suivi' ? '📌 Suivi' : entry.status === 'disciple' ? '📖 Disciple' : entry.status === 'engage(e)' ? '🔥 Engagé(e)' : '❌ Relâché'}
                </span>
                {entry.notes ? <span className="item-note">{entry.notes}</span> : null}
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
            <h3>Modifier</h3>
            <div className="form-row">
              <input placeholder="Nom" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Téléphone" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
            </div>
            <div className="form-row">
              <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as ConvertEntry['type'] })}>
                {CONVERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as ConvertEntry['status'] })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <input placeholder="Notes" value={editing.notes} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
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
        title="Supprimer"
        message={`Supprimer ${deleteTarget?.name} des nouvelles âmes ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

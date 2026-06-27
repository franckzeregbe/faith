import React, { useEffect, useState } from 'react'
import { exportContactsCSV } from '../utils/export'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'
import type { Contact } from '../types'

const STORAGE_KEY = 'pastoral_contacts'

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [lastVisit, setLastVisit] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Contact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)

  useEffect(() => {
    setContacts(loadJsonFromStorage<Contact[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, contacts)
  }, [contacts])

  function addContact() {
    if (!name.trim()) return
    setContacts(current => [
      { id: Date.now().toString(), name: name.trim(), phone: phone.trim(), note: note.trim(), lastVisit },
      ...current,
    ])
    setName('')
    setPhone('')
    setNote('')
    setLastVisit('')
  }

  function updateContact() {
    if (!editing) return
    setContacts(current => current.map(c => c.id === editing.id ? editing : c))
    setEditing(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setContacts(current => current.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const filtered = contacts.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  )

  return (
    <div>
      <div className="form-row">
        <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <input placeholder="Date dernière visite" type="date" value={lastVisit} onChange={e => setLastVisit(e.target.value)} />
        <input placeholder="Note courte" value={note} onChange={e => setNote(e.target.value)} />
        <button className="btn btn-primary" onClick={addContact} disabled={!name.trim()}>Enregistrer</button>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => exportContactsCSV(contacts)} disabled={contacts.length === 0}>
          Exporter contacts CSV
        </button>
      </div>

      {contacts.length > 0 && (
        <div className="search-bar" style={{ marginTop: 20 }}>
          <input placeholder="Rechercher un contact..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>{contacts.length === 0 ? 'Aucun contact enregistré' : 'Aucun contact trouvé'}</h3>
          <p>{contacts.length === 0 ? 'Ajoute tes premiers contacts pastoraux.' : 'Essaye un autre terme de recherche.'}</p>
        </div>
      ) : (
        <ul className="item-list">
          {filtered.map(contact => (
            <li key={contact.id} className="item-card">
              <div className="item-card-body">
                <strong>{contact.name}</strong>
                {contact.phone ? <span className="item-meta">{contact.phone}</span> : null}
                {contact.lastVisit ? <span className="item-meta">Dernière visite : {contact.lastVisit}</span> : null}
                {contact.note ? <span className="item-note">{contact.note}</span> : null}
              </div>
              <div className="item-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...contact })}>Modifier</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(contact)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Modifier le contact</h3>
            <div className="form-row">
              <input placeholder="Nom" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Téléphone" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
            </div>
            <div className="form-row">
              <input placeholder="Date dernière visite" type="date" value={editing.lastVisit || ''} onChange={e => setEditing({ ...editing, lastVisit: e.target.value })} />
              <input placeholder="Note" value={editing.note || ''} onChange={e => setEditing({ ...editing, note: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={updateContact} disabled={!editing.name.trim()}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer le contact"
        message={`Supprimer ${deleteTarget?.name} de la liste ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

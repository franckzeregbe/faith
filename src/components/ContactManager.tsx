import React, { useEffect, useState } from 'react'
import { exportContactsCSV } from '../utils/export'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import type { Contact } from '../types'

const STORAGE_KEY = 'pastoral_contacts'

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [lastVisit, setLastVisit] = useState('')

  useEffect(() => {
    setContacts(loadJsonFromStorage<Contact[]>(STORAGE_KEY, []))
  }, [])

  useEffect(() => {
    saveJsonToStorage(STORAGE_KEY, contacts)
  }, [contacts])

  function addContact() {
    if (!name.trim()) return
    setContacts((current) => [
      { id: Date.now().toString(), name: name.trim(), phone: phone.trim(), note: note.trim(), lastVisit },
      ...current
    ])
    setName('')
    setPhone('')
    setNote('')
    setLastVisit('')
  }

  function removeContact(id: string) {
    setContacts((current) => current.filter((contact) => contact.id !== id))
  }

  return (
    <div className="contact-manager">
      <div className="form-row">
        <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-row">
        <input placeholder="Date dernière visite" type="date" value={lastVisit} onChange={(e) => setLastVisit(e.target.value)} />
        <input placeholder="Note courte" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={addContact}>Enregistrer</button>
      </div>
      <div className="actions">
        <button onClick={() => exportContactsCSV(contacts)}>Exporter contacts CSV</button>
      </div>

      <ul className="visit-list">
        {contacts.map((contact) => (
          <li key={contact.id}>
            <div>
              <strong>{contact.name}</strong> {contact.phone && `- ${contact.phone}`}<br />
              {contact.lastVisit ? <small>Dernière visite: {contact.lastVisit}</small> : null}
              <div>{contact.note}</div>
            </div>
            <button onClick={() => removeContact(contact.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

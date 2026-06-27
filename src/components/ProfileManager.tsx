import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import type { Profile } from '../types'

const STORAGE_KEY = 'faith_profile'

const defaultProfile: Profile = {
  name: '',
  church: '',
  role: 'Pasteur',
  email: '',
  city: '',
  phone: '',
  note: '',
  slogan: '',
  photoUrl: '',
}

export default function ProfileManager() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setProfile(loadJsonFromStorage<Profile>(STORAGE_KEY, defaultProfile))
  }, [])

  useEffect(() => {
    setSaved(false)
  }, [profile])

  function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile(current => ({ ...current, photoUrl: reader.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setProfile(current => ({ ...current, photoUrl: '' }))
  }

  function saveProfile() {
    saveJsonToStorage(STORAGE_KEY, profile)
    setSaved(true)
  }

  return (
    <div>
      <div className="profile-grid">
        <label className="photo-picker">
          {profile.photoUrl ? <img src={profile.photoUrl} alt="Photo" /> : <span>Photo pro</span>}
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </label>

        <div className="profile-fields">
          <div className="form-row">
            <input placeholder="Nom" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            <input placeholder="Église" value={profile.church} onChange={e => setProfile({ ...profile, church: e.target.value })} />
          </div>
          <div className="form-row">
            <input placeholder="Fonction" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })} />
            <input placeholder="Ville" value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} />
          </div>
          <div className="form-row">
            <input placeholder="Email pro" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
            <input placeholder="Téléphone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="form-row" style={{ marginTop: 14 }}>
        <input placeholder="Note pro / mission" value={profile.note} onChange={e => setProfile({ ...profile, note: e.target.value })} />
      </div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <input placeholder="Slogan (ex: « Servir et aimer »)" value={profile.slogan} onChange={e => setProfile({ ...profile, slogan: e.target.value })} />
      </div>

      <div className="form-actions" style={{ justifyContent: 'space-between' }}>
        <div>
          {profile.photoUrl && (
            <button className="btn btn-secondary btn-sm" onClick={removePhoto}>Supprimer photo</button>
          )}
        </div>
        <div className="form-row">
          {saved ? <span className="form-feedback">Profil enregistré ✓</span> : null}
          <button className="btn btn-primary" onClick={saveProfile}>Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

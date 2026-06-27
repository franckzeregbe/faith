import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage } from '../utils/storage'
import type { Profile } from '../types'

const PROFILE_KEY = 'faith_profile'
const VISITS_KEY = 'fs_visits'
const CULTS_KEY = 'fs_cults'
const CONTACTS_KEY = 'pastoral_contacts'

export default function ProfileSummary() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ visits: 0, cults: 0, contacts: 0 })
  const [nextVisit, setNextVisit] = useState<{ name: string; date: string } | null>(null)

  useEffect(() => {
    const storedProfile = loadJsonFromStorage<Profile | null>(PROFILE_KEY, null)
    setProfile(storedProfile)

    const visits = loadJsonFromStorage<any[]>(VISITS_KEY, [])
    const cults = loadJsonFromStorage<any[]>(CULTS_KEY, [])
    const contacts = loadJsonFromStorage<any[]>(CONTACTS_KEY, [])
    setStats({ visits: visits.length, cults: cults.length, contacts: contacts.length })

    const upcoming = visits
      .map((item) => ({
        ...item,
        dateObject: new Date(item.date)
      }))
      .filter((item) => item.date && item.dateObject instanceof Date && !Number.isNaN(item.dateObject.getTime()) && item.dateObject >= new Date())
      .sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime())
      .shift()

    if (upcoming) {
      setNextVisit({ name: upcoming.name, date: upcoming.dateObject.toLocaleString() })
    }
  }, [])

  const impactScore = stats.visits * 2 + stats.cults * 3 + stats.contacts
  const impactLabel = impactScore >= 20 ? 'Impact élevé' : impactScore >= 10 ? 'Impact solide' : 'Impact en croissance'

  return (
    <div className="dashboard-panel">
      <div className="dashboard-main">
        <div className="profile-summary">
          {profile && profile.name ? (
            <div className="profile-summary-photo">
              {profile.photoUrl ? <img src={profile.photoUrl} alt="Photo de profil" /> : <span>Photo pro</span>}
            </div>
          ) : null}
          <div className="profile-summary-info">
            <div className="profile-summary-badge">FAITH Pro</div>
            {profile && profile.name ? <div className="profile-summary-name">{profile.name}</div> : <div className="profile-summary-name">Bienvenue dans FAITH</div>}
            {profile && profile.name ? <div className="profile-summary-role">{profile.role} • {profile.church}</div> : <div className="profile-summary-role">Dashboard de gestion pastorale</div>}
            <div className="profile-summary-stat">
              {stats.visits} visite{stats.visits > 1 ? 's' : ''} · {stats.cults} culte{stats.cults > 1 ? 's' : ''} · {stats.contacts} contact{stats.contacts > 1 ? 's' : ''}
            </div>
            <div className="profile-summary-impact">{impactLabel} • Score {impactScore}</div>
          </div>
        </div>

        <div className="dashboard-headline">
          <h2>Tableau de bord</h2>
          <p>Suivez votre prochaine visite et concentrez-vous sur la section active.</p>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-card">
          <span className="dashboard-card-title">Prochaine visite</span>
          <strong>{nextVisit ? nextVisit.name : 'Aucune visite prévue'}</strong>
          <span>{nextVisit ? nextVisit.date : 'Planifie une visite maintenant'}</span>
        </div>
      </div>
    </div>
  )
}

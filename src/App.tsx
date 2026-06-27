import React, { useMemo, useState, useEffect } from 'react'
import VisitManager from './components/VisitManager'
import MessageGenerator from './components/MessageGenerator'
import CultManager from './components/CultManager'
import ContactManager from './components/ContactManager'
import DailyPostGenerator from './components/DailyPostGenerator'
import ProfileManager from './components/ProfileManager'
import SermonManager from './components/SermonManager'
import PrayerManager from './components/PrayerManager'
import BirthdayManager from './components/BirthdayManager'
import { loadJsonFromStorage } from './utils/storage'
import type { Profile } from './types'

const NAV_ITEMS = [
  { id: 'profile', label: 'Profil', icon: '👤', desc: 'Identité & église' },
  { id: 'visites', label: 'Visites', icon: '📋', desc: 'Planifier & exporter' },
  { id: 'cultes', label: 'Cultes', icon: '⛪', desc: 'Récurrents & iCal' },
  { id: 'contacts', label: 'Contacts', icon: '👥', desc: 'Annuaire pastoral' },
  { id: 'sermons', label: 'Prédications', icon: '📖', desc: 'Sermons & notes' },
  { id: 'prayers', label: 'Prières', icon: '🙏', desc: 'Suivi des demandes' },
  { id: 'birthdays', label: 'Anniversaires', icon: '🎂', desc: 'Dates des membres' },
  { id: 'messages', label: 'Messages', icon: '✉️', desc: 'SMS / WhatsApp / FB' },
  { id: 'posts', label: 'Posts', icon: '📱', desc: 'Contenu quotidien' },
] as const

type SectionId = typeof NAV_ITEMS[number]['id']

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ visits: 0, cults: 0, contacts: 0 })

  useEffect(() => {
    const stored = loadJsonFromStorage<Profile | null>('faith_profile', null)
    setProfile(stored)
    const visits = loadJsonFromStorage<any[]>('fs_visits', [])
    const cults = loadJsonFromStorage<any[]>('fs_cults', [])
    const contacts = loadJsonFromStorage<any[]>('pastoral_contacts', [])
    setStats({ visits: visits.length, cults: cults.length, contacts: contacts.length })
  }, [])

  const impactScore = Math.min(stats.visits * 2 + stats.cults * 3 + stats.contacts, 100)
  const serviceStreak = 5

  const activeNav = NAV_ITEMS.find(n => n.id === activeSection)!

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileManager />
      case 'visites': return <VisitManager />
      case 'cultes': return <CultManager />
      case 'contacts': return <ContactManager />
      case 'sermons': return <SermonManager />
      case 'prayers': return <PrayerManager />
      case 'birthdays': return <BirthdayManager />
      case 'messages': return <MessageGenerator />
      case 'posts': return <DailyPostGenerator />
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">FOI</div>
          <div className="sidebar-logo-text">
            <strong>FAITH</strong>
            <small>Gestion pastorale</small>
          </div>
        </div>

        <div className="nav-section">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${item.id === activeSection ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="app-content">
        <div className="app-header">
          <div>
            <h1>{activeNav.label}</h1>
            <p>{activeNav.desc}</p>
          </div>

          {profile?.name && (
            <div className="profile-badge">
              <div className="profile-badge-img">
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" /> : '📷'}
              </div>
              <div className="profile-badge-info">
                <span className="name">{profile.name}</span>
                <span className="role">{profile.role} • {profile.church}</span>
                <span className="stats">
                  {stats.visits} visites · {stats.cults} cultes · {stats.contacts} contacts
                </span>
                <span className="impact">Score {impactScore} · {serviceStreak} jours</span>
              </div>
            </div>
          )}
        </div>

        {activeSection === 'profile' && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-card-icon score">🔥</div>
              <div className="stat-card-body">
                <span className="stat-label">Score d'impact</span>
                <span className="stat-value">{impactScore}%</span>
                <span className="stat-sub">Continue d'avancer dans le service</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon streak">⭐</div>
              <div className="stat-card-body">
                <span className="stat-label">Flamme de service</span>
                <span className="stat-value">{serviceStreak} jours</span>
                <span className="stat-sub">Garde le rythme avec Jésus</span>
              </div>
            </div>
          </div>
        )}

        <section className="section-card">
          {renderSection()}
        </section>
      </main>
    </div>
  )
}

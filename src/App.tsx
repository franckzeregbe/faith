import React, { useState, useEffect } from 'react'
import VisitManager from './components/VisitManager'
import MessageGenerator from './components/MessageGenerator'
import CultManager from './components/CultManager'
import ContactManager from './components/ContactManager'
import ProfileManager from './components/ProfileManager'
import SermonManager from './components/SermonManager'
import ConvertManager from './components/ConvertManager'
import PrayerManager from './components/PrayerManager'
import BirthdayManager from './components/BirthdayManager'
import SettingsManager from './components/SettingsManager'
import PinLock from './components/PinLock'
import Logo from './components/Logo'
import { loadJsonFromStorage } from './utils/storage'
import type { Profile } from './types'

const NAV_ITEMS = [
  { id: 'profile', label: 'Profil', icon: '👤', desc: 'Identité & église' },
  { id: 'visites', label: 'Visites', icon: '📋', desc: 'Planifier & exporter' },
  { id: 'cultes', label: 'Cultes', icon: '⛪', desc: 'Récurrents & iCal' },
  { id: 'contacts', label: 'Contacts', icon: '👥', desc: 'Annuaire pastoral' },
  { id: 'converts', label: 'Âmes', icon: '🕊️', desc: 'Âmes gagnées à Jésus' },
  { id: 'sermons', label: 'Prédications', icon: '📖', desc: 'Sermons & notes' },
  { id: 'prayers', label: 'Prières', icon: '🙏', desc: 'Suivi des demandes' },
  { id: 'birthdays', label: 'Anniversaires', icon: '🎂', desc: 'Dates des membres' },
  { id: 'messages', label: 'Inspiration', icon: '✉️', desc: 'Messages & publications' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️', desc: 'Sécurité & données' },
] as const

type SectionId = typeof NAV_ITEMS[number]['id']

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = loadJsonFromStorage<Profile | null>('faith_profile', null)
    setProfile(stored)
  }, [])

  useEffect(() => {
    const stored = loadJsonFromStorage<Profile | null>('faith_profile', null)
    setProfile(stored)
  }, [activeSection])

  function navigateTo(id: SectionId) {
    setActiveSection(id)
    setMenuOpen(false)
  }

  const activeNav = NAV_ITEMS.find(n => n.id === activeSection)!

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileManager />
      case 'visites': return <VisitManager />
      case 'cultes': return <CultManager />
      case 'contacts': return <ContactManager />
      case 'converts': return <ConvertManager />
      case 'sermons': return <SermonManager />
      case 'prayers': return <PrayerManager />
      case 'birthdays': return <BirthdayManager />
      case 'messages': return <MessageGenerator />
      case 'settings': return <SettingsManager />
    }
  }

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className="app-shell">
      {/* Hamburger button */}
      <button className="hamburger-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
        ☰
      </button>

      {/* Mobile header */}
      <div className="mobile-header">
        {activeNav.icon} {activeNav.label}
      </div>

      {/* Sidebar backdrop */}
      <div className={`sidebar-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Sidebar */}
      <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ cursor: 'pointer', padding: '8px 4px 16px' }} onClick={() => navigateTo('settings')}>
          <Logo />
        </div>

        <div className="nav-section">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${item.id === activeSection ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
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
                {profile.slogan && <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontStyle: 'italic' }}>{profile.slogan}</span>}
              </div>
            </div>
          )}
        </div>

        <section className="section-card">
          {renderSection()}
        </section>
      </main>
    </div>
  )
}

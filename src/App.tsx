import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import VisitManager from './components/VisitManager'
import MessageGenerator from './components/MessageGenerator'
import CultManager from './components/CultManager'
import ContactManager from './components/ContactManager'
import ProfileManager from './components/ProfileManager'
import SermonManager from './components/SermonManager'
import ConvertManager from './components/ConvertManager'
import PrayerManager from './components/PrayerManager'
import BirthdayManager from './components/BirthdayManager'
import BibleReader from './components/BibleReader'
import SettingsManager from './components/SettingsManager'
import PinLock from './components/PinLock'
import Logo from './components/Logo'
import { loadJsonFromStorage } from './utils/storage'
import type { Profile } from './types'

const NAV_SECTIONS = [
  {
    label: 'Général',
    items: [
      { id: 'home', label: 'Accueil', icon: '🏠', desc: 'Tableau de bord' },
      { id: 'profile', label: 'Profil', icon: '👤', desc: 'Identité & église' },
    ] as const,
  },
  {
    label: 'Ministère',
    items: [
      { id: 'visites', label: 'Visites', icon: '📋', desc: 'Planifier & exporter' },
      { id: 'cultes', label: 'Cultes', icon: '⛪', desc: 'Récurrents & iCal' },
      { id: 'contacts', label: 'Contacts', icon: '👥', desc: 'Annuaire pastoral' },
      { id: 'converts', label: 'Âmes', icon: '🧑', desc: 'Âmes gagnées à Jésus' },
    ] as const,
  },
  {
    label: 'Contenu',
    items: [
      { id: 'sermons', label: 'Prédications', icon: '📖', desc: 'Sermons & notes' },
      { id: 'messages', label: 'Inspiration', icon: '✉️', desc: 'Messages & publications' },
    ] as const,
  },
  {
    label: 'Spirituel',
    items: [
      { id: 'bible', label: 'Bible', icon: '📜', desc: 'Lire & méditer' },
      { id: 'prayers', label: 'Prières', icon: '🙏', desc: 'Suivi des demandes' },
      { id: 'birthdays', label: 'Anniversaires', icon: '🎂', desc: 'Dates des membres' },
    ] as const,
  },
  {
    label: 'Système',
    items: [
      { id: 'settings', label: 'Paramètres', icon: '⚙️', desc: 'Sécurité & données' },
    ] as const,
  },
]

const NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items)
type SectionId = typeof NAV_ITEMS[number]['id']

type SectionId = typeof NAV_ITEMS[number]['id']

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('home')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const stored = loadJsonFromStorage<Profile | null>('faith_profile', null)
    setProfile(stored)
  }, [])

  useEffect(() => {
    const stored = loadJsonFromStorage<Profile | null>('faith_profile', null)
    setProfile(stored)
  }, [activeSection])

  function navigateTo(id: string) {
    setActiveSection(id as SectionId)
    setSidebarOpen(false)
  }

  const activeNav = NAV_ITEMS.find(n => n.id === activeSection)!

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <Dashboard onNavigate={navigateTo} />
      case 'profile': return <ProfileManager />
      case 'visites': return <VisitManager />
      case 'cultes': return <CultManager />
      case 'contacts': return <ContactManager />
      case 'converts': return <ConvertManager />
      case 'sermons': return <SermonManager />
      case 'bible': return <BibleReader />
      case 'prayers': return <PrayerManager />
      case 'birthdays': return <BirthdayManager />
      case 'messages': return <MessageGenerator />
      case 'settings': return <SettingsManager onNavigate={navigateTo} />
    }
  }

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`mobile-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="mobile-topbar">
        <button type="button" className="mobile-menu-btn" onClick={() => setSidebarOpen(open => !open)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>
        </button>
        <div className="mobile-topbar-brand">
          <Logo size={32} />
        </div>
      </div>

      {/* Sidebar (desktop + mobile drawer) */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigateTo('settings')}>
          <Logo size={48} />
        </div>
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="nav-section">
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
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
        ))}
      </aside>

      <main className="app-content">
        <div className="app-content-inner">
        <div className="app-header">
          <div className="header-title-group">
            <div className="header-logo-desktop">
              <Logo size={64} />
            </div>
            <div>
              <h1>{activeNav.label}</h1>
              <p>{activeNav.desc}</p>
            </div>
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
        </div>
      </main>
    </div>
  )
}

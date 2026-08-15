import React, { useState, useEffect, lazy, Suspense } from 'react'
import Dashboard from './components/Dashboard'
import VisitManager from './components/VisitManager'
import MessageGenerator from './components/MessageGenerator'
import CultManager from './components/CultManager'
import ContactManager from './components/ContactManager'
import ProfileManager from './components/ProfileManager'
import SermonManager from './components/SermonManager'
import ConvertManager from './components/ConvertManager'
import PrayerManager from './components/PrayerManager'
import SettingsManager from './components/SettingsManager'
import PinLock from './components/PinLock'
import Logo from './components/Logo'
import { loadJsonFromStorage } from './utils/storage'
import type { Profile } from './types'

// La Bible (4 Mo de données) n'est chargée que lorsqu'on ouvre la section
const BibleReader = lazy(() => import('./components/BibleReader'))

type NavItem = { id: string; label: string; icon: string; desc: string }
type NavSection = { label: string; items: NavItem[]; collapsible?: boolean }

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Général',
    items: [
      { id: 'home', label: 'Accueil', icon: '🏠', desc: 'Tableau de bord' },
      { id: 'profile', label: 'Profil', icon: '👤', desc: 'Identité & église' },
    ] as const,
  },
  {
    label: 'Ministère',
    collapsible: true,
    items: [
      { id: 'visites', label: 'Visites', icon: '📋', desc: 'Planifier & exporter' },
      { id: 'cultes', label: 'Cultes', icon: '⛪', desc: 'Récurrents & iCal' },
      { id: 'contacts', label: 'Contacts', icon: '👥', desc: 'Annuaire pastoral' },
      { id: 'converts', label: 'Âmes', icon: '🧑', desc: 'Âmes gagnées à Jésus' },
      { id: 'prayers', label: 'Prières', icon: '🙏', desc: 'Suivre les demandes' },
    ] as const,
  },
  {
    label: 'Contenu',
    collapsible: true,
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

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [activeSection, setActiveSection] = useState<SectionId>('home')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const s of NAV_SECTIONS) {
      if (s.collapsible) initial.add(s.label)
    }
    return initial
  })

  useEffect(() => {
    const stored = loadJsonFromStorage<Profile | null>('faith_profile', null)
    setProfile(stored)
  }, [])

  function navigateTo(id: SectionId) {
    setActiveSection(id)
    setSidebarOpen(false)
  }

  function toggleSection(label: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  // À l'ouverture du menu (mobile), la section active est dépliée
  function openSidebar() {
    setSidebarOpen(true)
    setCollapsedSections(prev => {
      const next = new Set(prev)
      for (const s of NAV_SECTIONS) {
        if (s.collapsible && s.items.some(i => i.id === activeSection)) next.delete(s.label)
      }
      return next
    })
  }

  const activeNav = NAV_ITEMS.find(n => n.id === activeSection) ?? NAV_ITEMS[0]

  const renderSection = (): React.ReactNode => {
    switch (activeSection) {
      case 'home': return <Dashboard onNavigate={navigateTo} />
      case 'profile': return <ProfileManager />
      case 'visites': return <VisitManager />
      case 'cultes': return <CultManager />
      case 'contacts': return <ContactManager />
      case 'converts': return <ConvertManager />
      case 'sermons': return <SermonManager />
      case 'bible': return (
        <Suspense fallback={<div className="empty-state"><div className="empty-state-icon">📜</div><h3>Chargement de la Bible...</h3></div>}>
          <BibleReader />
        </Suspense>
      )
      case 'prayers': return <PrayerManager />
      case 'messages': return <MessageGenerator />
      case 'settings': return <SettingsManager onNavigate={navigateTo} />
      default: return <div>Section introuvable</div>
    }
  }

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`mobile-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="mobile-topbar">
        <button type="button" className="mobile-menu-btn" onClick={() => (sidebarOpen ? setSidebarOpen(false) : openSidebar())}>
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
        {profile?.photoUrl && (
          <div className="sidebar-profile-photo" aria-label="Photo de profil">
            <img src={profile.photoUrl} alt="Photo de profil" />
          </div>
        )}
        {NAV_SECTIONS.map(section => {
          const isCollapsed = section.collapsible && collapsedSections.has(section.label)
          return (
            <div key={section.label} className="nav-section">
              {section.collapsible ? (
                <button
                  type="button"
                  className={`nav-section-toggle ${isCollapsed ? '' : 'open'}`}
                  onClick={() => toggleSection(section.label)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="nav-section-label">{section.label}</span>
                  <svg className="nav-section-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              ) : (
                <div className="nav-section-label">{section.label}</div>
              )}
              {!isCollapsed && section.items.map(item => (
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
          )
        })}
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

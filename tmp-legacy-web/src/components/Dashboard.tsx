import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { loadJsonFromStorage } from '../utils/storage'
import type { Visit, Cult, Profile } from '../types'

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'] as const

type NavFn = (id: string) => void

interface DashboardProps {
  onNavigate: NavFn
}

interface StatItem {
  label: string
  count: number
  icon: string
  section: string
  color: string
  bgColor: string
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<StatItem[]>([])
  const [nextVisit, setNextVisit] = useState<Visit | null>(null)
  const [todayCults, setTodayCults] = useState<Cult[]>([])
  const [today] = useState(() => new Date())
  const [overviewOpen, setOverviewOpen] = useState(false)

  const handleToggleOverview = useCallback(() => {
    setOverviewOpen(prev => !prev)
  }, [])

  const handleNavigate = useCallback((section: string) => {
    onNavigate(section)
  }, [onNavigate])

  useEffect(() => {
    setProfile(loadJsonFromStorage<Profile | null>('faith_profile', null))

    const visits = loadJsonFromStorage<Visit[]>('faith:visits', [])
    const cults = loadJsonFromStorage<Cult[]>('faith:cults', [])
    const contacts = loadJsonFromStorage<unknown[]>('faith:contacts', [])
    const sermons = loadJsonFromStorage<unknown[]>('faith:sermons', [])
    const prayers = loadJsonFromStorage<unknown[]>('faith:prayers', [])
    const converts = loadJsonFromStorage<unknown[]>('faith:converts', [])

    setStats([
      { label: 'Visites', count: visits.length, icon: '📋', section: 'visites', color: '#7c6f64', bgColor: 'rgba(124, 111, 100, 0.1)' },
      { label: 'Cultes', count: cults.length, icon: '⛪', section: 'cultes', color: '#8b7355', bgColor: 'rgba(139, 115, 85, 0.1)' },
      { label: 'Contacts', count: contacts.length, icon: '👥', section: 'contacts', color: '#6b8e6b', bgColor: 'rgba(107, 142, 107, 0.1)' },
      { label: 'Âmes', count: converts.length, icon: '🧑', section: 'converts', color: '#bb8f5d', bgColor: 'rgba(187, 143, 93, 0.1)' },
      { label: 'Prédications', count: sermons.length, icon: '📖', section: 'sermons', color: '#8b7d6b', bgColor: 'rgba(139, 125, 107, 0.1)' },
      { label: 'Prières', count: prayers.length, icon: '🙏', section: 'prayers', color: '#9b8b7b', bgColor: 'rgba(155, 139, 123, 0.1)' },
    ])

    // Prochaine visite
    const now = new Date()
    const upcoming = visits
      .map(v => ({ ...v, d: new Date(v.date) }))
      .filter(v => v.d instanceof Date && !isNaN(v.d.getTime()) && v.d >= now)
      .sort((a, b) => a.d.getTime() - b.d.getTime())
    if (upcoming.length > 0) setNextVisit(upcoming[0])

    // Cultes du jour
    const todayDay = now.getDay()
    setTodayCults(cults.filter(c => c.weekday === todayDay))
  }, [])

  const total = useMemo(() => stats.reduce((acc, s) => acc + s.count, 0), [stats])
  const todayStr = useMemo(() => `${DAYS[today.getDay()]} ${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`, [today])
  const todayEventsCount = useMemo(() => todayCults.length + (nextVisit ? 1 : 0), [todayCults.length, nextVisit])

  return (
    <div className="dashboard-container">
      {/* Header avec profil et date */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-greeting">
            <span className="dashboard-date">{todayStr}</span>
            <h2 className="dashboard-title">
              {profile?.name ? `Bienvenue, ${profile.name.split(' ')[0]}` : 'Bienvenue'}
            </h2>
            <p className="dashboard-subtitle">
              {profile?.church ? `${profile.church}${profile?.role ? ` • ${profile.role}` : ''}` : 'Votre compagnon pastoral quotidien'}
            </p>
          </div>
          {profile?.photoUrl && (
            <img src={profile.photoUrl} alt="Profil" className="dashboard-avatar" />
          )}
        </div>
      </div>

      {/* Vue d'ensemble - Stats cards (déroulant) */}
      <div className={`dashboard-section dashboard-collapsible ${overviewOpen ? 'open' : ''}`}>
        <button
          type="button"
          className="dashboard-section-header dashboard-collapse-toggle"
          onClick={handleToggleOverview}
          aria-expanded={overviewOpen}
          aria-label={overviewOpen ? "Masquer la vue d'ensemble" : "Afficher la vue d'ensemble"}
        >
          <h3>Vue d'ensemble</h3>
          <span className="dashboard-total">
            {total} élément{total > 1 ? 's' : ''}
            <svg
              className={`dashboard-chevron ${overviewOpen ? 'rotated' : ''}`}
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {overviewOpen && (
        <div className="dashboard-stats-grid">
          {stats.map((s, index) => (
            <div 
              key={s.section} 
              className="dashboard-stat-card"
              onClick={() => onNavigate(s.section)}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                '--stat-color': s.color,
                '--stat-bg': s.bgColor
              } as React.CSSProperties}
            >
              <div className="dashboard-stat-card-icon" style={{ background: s.bgColor, color: s.color }}>
                {s.icon}
              </div>
              <div className="dashboard-stat-card-body">
                <span className="dashboard-stat-card-num">{s.count}</span>
                <span className="dashboard-stat-card-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Aujourd'hui - Événements */}
      {todayEventsCount > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h3>Aujourd'hui</h3>
            <span className="dashboard-badge">{todayEventsCount} événement{todayEventsCount > 1 ? 's' : ''}</span>
          </div>
          <div className="dashboard-events">
            {todayCults.length > 0 && (
              todayCults.map(cult => (
                <div 
                  key={cult.id} 
                  className="dashboard-event-card dashboard-event-cult"
                  onClick={() => onNavigate('cultes')}
                >
                  <div className="dashboard-event-icon">⛪</div>
                  <div className="dashboard-event-body">
                    <strong>{cult.title}</strong>
                    <span>{cult.time}</span>
                  </div>
                  <span className="dashboard-event-action">Voir</span>
                </div>
              ))
            )}
            
            {nextVisit && (
              <div 
                className="dashboard-event-card dashboard-event-visit"
                onClick={() => onNavigate('visites')}
              >
                <div className="dashboard-event-icon">📋</div>
                <div className="dashboard-event-body">
                  <strong>Visite : {nextVisit.name}</strong>
                  <span>{new Date(nextVisit.date).toLocaleString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <span className="dashboard-event-action">Voir</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h3>Actions rapides</h3>
        </div>
        <div className="dashboard-quick-actions">
          <button className="dashboard-action-btn" onClick={() => onNavigate('visites')}>
            <span className="dashboard-action-icon">📋</span>
            <span className="dashboard-action-label">Nouvelle visite</span>
          </button>
          <button className="dashboard-action-btn" onClick={() => onNavigate('converts')}>
            <span className="dashboard-action-icon">🧑</span>
            <span className="dashboard-action-label">Nouvelle âme</span>
          </button>
          <button className="dashboard-action-btn" onClick={() => onNavigate('bible')}>
            <span className="dashboard-action-icon">📜</span>
            <span className="dashboard-action-label">Lire la Bible</span>
          </button>
          <button className="dashboard-action-btn" onClick={() => onNavigate('prayers')}>
            <span className="dashboard-action-icon">🙏</span>
            <span className="dashboard-action-label">Prière</span>
          </button>
          <button className="dashboard-action-btn" onClick={() => onNavigate('messages')}>
            <span className="dashboard-action-icon">✉️</span>
            <span className="dashboard-action-label">Message</span>
          </button>
          <button className="dashboard-action-btn" onClick={() => onNavigate('contacts')}>
            <span className="dashboard-action-icon">👥</span>
            <span className="dashboard-action-label">Contact</span>
          </button>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { loadJsonFromStorage } from '../utils/storage'
import type { Visit, Cult, BirthdayEntry, Profile } from '../types'

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

type NavFn = (id: string) => void

type Props = { onNavigate: NavFn }

export default function Dashboard({ onNavigate }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<{ label: string; count: number; icon: string; section: string }[]>([])
  const [nextVisit, setNextVisit] = useState<Visit | null>(null)
  const [todayCults, setTodayCults] = useState<Cult[]>([])
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayEntry[]>([])

  useEffect(() => {
    setProfile(loadJsonFromStorage<Profile | null>('faith_profile', null))

    const visits = loadJsonFromStorage<Visit[]>('fs_visits', [])
    const cults = loadJsonFromStorage<Cult[]>('fs_cults', [])
    const contacts = loadJsonFromStorage<any[]>('pastoral_contacts', [])
    const sermons = loadJsonFromStorage<any[]>('faith_sermons', [])
    const prayers = loadJsonFromStorage<any[]>('faith_prayers', [])
    const converts = loadJsonFromStorage<any[]>('faith_converts', [])
    const birthdays = loadJsonFromStorage<BirthdayEntry[]>('faith_birthdays', [])

    setStats([
      { label: 'Visites', count: visits.length, icon: '📋', section: 'visites' },
      { label: 'Cultes', count: cults.length, icon: '⛪', section: 'cultes' },
      { label: 'Contacts', count: contacts.length, icon: '👥', section: 'contacts' },
      { label: 'Âmes', count: converts.length, icon: '🧑', section: 'converts' },
      { label: 'Sermons', count: sermons.length, icon: '📖', section: 'sermons' },
      { label: 'Prières', count: prayers.length, icon: '🙏', section: 'prayers' },
      { label: 'Anniversaires', count: birthdays.length, icon: '🎂', section: 'birthdays' },
    ])

    // Prochaine visite
    const upcoming = visits
      .map(v => ({ ...v, d: new Date(v.date) }))
      .filter(v => v.d instanceof Date && !isNaN(v.d.getTime()) && v.d >= new Date())
      .sort((a, b) => a.d.getTime() - b.d.getTime())
    if (upcoming.length > 0) setNextVisit(upcoming[0])

    // Cultes du jour
    const today = new Date().getDay()
    setTodayCults(cults.filter(c => c.weekday === today))

    // Anniversaires à venir (30 jours)
    const now = new Date()
    const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const soon = birthdays
      .map(b => ({ ...b, dayMonth: b.date }))
      .filter(b => b.dayMonth >= todayStr)
      .sort((a, b) => a.dayMonth.localeCompare(b.dayMonth))
      .slice(0, 5)
    setUpcomingBirthdays(soon)
  }, [])

  const total = stats.reduce((acc, s) => acc + s.count, 0)

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Bienvenue */}
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text)' }}>
          {profile?.name ? `Bienvenue ${profile.name.split(' ')[0]} 👋` : 'Bienvenue sur FAITH 👋'}
        </h2>
        <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          {total > 0
            ? `${total} élément${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''} dans ta base pastorale`
            : 'Commence par remplir ton profil et ajouter tes premières données.'}
        </p>
      </div>

      {/* Grille de stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 10,
      }}>
        {stats.map(s => (
          <div
            key={s.section}
            onClick={() => onNavigate(s.section)}
            style={{
              background: 'var(--surface-card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', padding: '14px 12px', cursor: 'pointer',
              textAlign: 'center', transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{s.count}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Événements */}
      <div style={{ display: 'grid', gap: 12 }}>
        {todayCults.length > 0 && (
          <div className="item-card" style={{ cursor: 'pointer', borderLeft: '3px solid var(--primary)' }} onClick={() => onNavigate('cultes')}>
            <div className="item-card-body">
              <strong>⛪ Culte aujourd'hui</strong>
              {todayCults.map(c => (
                <span key={c.id} className="item-meta">{c.title} — {c.time}</span>
              ))}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>Voir</span>
          </div>
        )}

        {nextVisit && (
          <div className="item-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('visites')}>
            <div className="item-card-body">
              <strong>📋 Prochaine visite</strong>
              <span className="item-meta">{nextVisit.name} — {nextVisit.d.toLocaleString()}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>Voir</span>
          </div>
        )}

        {upcomingBirthdays.length > 0 && (
          <div className="item-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('birthdays')}>
            <div className="item-card-body">
              <strong>🎂 Anniversaires à venir</strong>
              {upcomingBirthdays.slice(0, 3).map(b => (
                <span key={b.id} className="item-meta">{b.name} — {b.date}</span>
              ))}
              {upcomingBirthdays.length > 3 && <span className="item-meta">+{upcomingBirthdays.length - 3} autre{upcomingBirthdays.length - 3 > 1 ? 's' : ''}</span>}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>Voir</span>
          </div>
        )}
      </div>

      {/* Raccourcis rapides */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('visites')}>➕ Visite</button>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('converts')}>🧑 Nouvelle âme</button>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('prayers')}>🙏 Prière</button>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('settings')}>⚙️ Paramètres</button>
      </div>
    </div>
  )
}

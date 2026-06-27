import React, { useMemo, useState } from 'react'
import VisitManager from './components/VisitManager'
import MessageGenerator from './components/MessageGenerator'
import CultManager from './components/CultManager'
import ContactManager from './components/ContactManager'
import DailyPostGenerator from './components/DailyPostGenerator'
import ProfileManager from './components/ProfileManager'
import ProfileSummary from './components/ProfileSummary'

const sections = [
  {
    id: 'profile',
    title: 'Profil professionnel',
    description: 'Conservez votre identité, votre église et vos coordonnées pour un usage pro.',
    component: <ProfileManager />
  },
  {
    id: 'visites',
    title: 'Visites pastorales',
    description: 'Ajoutez, planifiez et exportez votre programme de visites.',
    component: <VisitManager />
  },
  {
    id: 'cultes',
    title: 'Cultes & cellules',
    description: 'Créez des cultes récurrents et exportez un calendrier iCal.',
    component: <CultManager />
  },
  {
    id: 'contacts',
    title: 'Contacts pastoraux',
    description: 'Gardez vos frères et sœurs en mémoire et exportez vos listes.',
    component: <ContactManager />
  },
  {
    id: 'messages',
    title: 'Générateur de messages',
    description: 'Créez rapidement des messages courts pour SMS, WhatsApp et réseaux sociaux.',
    component: <MessageGenerator />
  },
  {
    id: 'posts',
    title: 'Posts journaliers',
    description: 'Obtenez un contenu quotidien inspirant, prêt à publier.',
    component: <DailyPostGenerator />
  }
]

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSection = useMemo(() => sections[activeIndex], [activeIndex])

  function goNext() {
    setActiveIndex((current) => Math.min(current + 1, sections.length - 1))
  }

  function goBack() {
    setActiveIndex((current) => Math.max(current - 1, 0))
  }

  function jumpTo(index: number) {
    setActiveIndex(index)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-grid">
          <div className="app-hero">
            <div className="app-logo">FAITH</div>
            <div className="app-hero-text">
              <p className="app-tag">Gestion pastorale structurée</p>
              <h1>FAITH — Gestion pastorale</h1>
              <p className="app-subtitle">Tous tes outils pastoraux dans une interface claire.</p>
            </div>
          </div>
          <div className="app-header-summary">
            <ProfileSummary />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="section-nav">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              className={`step-button ${index === activeIndex ? 'active' : ''}`}
              onClick={() => jumpTo(index)}
            >
              <strong>{section.title}</strong>
            </button>
          ))}
        </div>

        <section className="section-card active-section">
          <div className="section-header">
            <h2>{activeSection.title}</h2>
            <p>{activeSection.description}</p>
          </div>
          {activeSection.component}
          <div className="wizard-actions">
            <button type="button" className="secondary" onClick={goBack} disabled={activeIndex === 0}>
              Précédent
            </button>
            <button type="button" onClick={goNext}>
              {activeIndex < sections.length - 1 ? 'Suivant' : 'Terminé'}
            </button>
          </div>
        </section>
      </main>

      <footer className="app-footer">« Que tout ce que vous faites soit fait avec amour, en servant le Seigneur et non les hommes. » — inspiré de 1 Corinthiens 16:14</footer>
    </div>
  )
}

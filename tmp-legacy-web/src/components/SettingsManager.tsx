import React, { useEffect, useRef, useState } from 'react'
import { hashString, isNumericPin, loadJsonFromStorage, saveJsonToStorage, STORAGE_KEYS } from '../utils/storage'
import { profileSchema, visitSchema, cultSchema, contactSchema, convertEntrySchema, sermonSchema, prayerRequestSchema } from '../schemas'
import ConfirmDialog from './ConfirmDialog'

const ALL_KEYS: { key: string; label: string; schema: unknown }[] = [
  { key: STORAGE_KEYS.profile, label: 'Profil', schema: profileSchema },
  { key: STORAGE_KEYS.visits, label: 'Visites', schema: visitSchema },
  { key: STORAGE_KEYS.cults, label: 'Cultes', schema: cultSchema },
  { key: STORAGE_KEYS.contacts, label: 'Contacts', schema: contactSchema },
  { key: STORAGE_KEYS.converts, label: 'Âmes', schema: convertEntrySchema },
  { key: STORAGE_KEYS.sermons, label: 'Prédications', schema: sermonSchema },
  { key: STORAGE_KEYS.prayers, label: 'Prières', schema: prayerRequestSchema },
]

const SECTIONS = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'profile', label: 'Profil', icon: '👤' },
  { id: 'visites', label: 'Visites', icon: '📋' },
  { id: 'cultes', label: 'Cultes', icon: '⛪' },
  { id: 'contacts', label: 'Contacts', icon: '👥' },
  { id: 'converts', label: 'Âmes', icon: '🧑' },
  { id: 'sermons', label: 'Prédications', icon: '📖' },
  { id: 'bible', label: 'Bible', icon: '📜' },
  { id: 'prayers', label: 'Prières', icon: '🙏' },
  { id: 'messages', label: 'Inspiration', icon: '✉️' },
  { id: 'settings', label: 'Paramètres', icon: '⚙️' },
]

type Props = {
  onNavigate?: (id: string) => void
}

export default function SettingsManager({ onNavigate }: Props) {
  const [pinEnabled, setPinEnabled] = useState(false)
  const [showPinInput, setShowPinInput] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [clearTarget, setClearTarget] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState('')
  const [stats, setStats] = useState<{ key: string; count: number }[]>([])

  useEffect(() => {
    const stored = loadJsonFromStorage<string>(STORAGE_KEYS.pin, '')
    setPinEnabled(stored.length > 0)

    if (stored && isNumericPin(stored)) {
      hashString(stored).then(hashed => saveJsonToStorage(STORAGE_KEYS.pin, hashed))
    }

    const s = ALL_KEYS.map(({ key, label }) => {
      let count = 0
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          count = Array.isArray(parsed) ? parsed.length : (parsed && typeof parsed === 'object' ? 1 : 0)
        }
      } catch { /* ignore */ }
      return { key: label, count }
    })
    setStats(s)
  }, [])

  async function enablePin() {
    if (newPin.length < 4) { setPinError('Le code doit faire au moins 4 chiffres.'); return }
    if (newPin !== confirmPin) { setPinError('Les codes ne correspondent pas.'); return }
    const hashedPin = await hashString(newPin)
    saveJsonToStorage(STORAGE_KEYS.pin, hashedPin)
    setPinEnabled(true)
    setPinSuccess('Code PIN activé ✓')
    setPinError('')
    setNewPin('')
    setConfirmPin('')
    setShowPinInput(false)
  }

  function disablePin() {
    localStorage.removeItem(STORAGE_KEYS.pin)
    setPinEnabled(false)
    setPinSuccess('Code PIN désactivé')
  }

  function exportAll() {
    const data: Record<string, any> = {}
    for (const { key } of ALL_KEYS) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) data[key] = JSON.parse(raw)
      } catch { /* ignore */ }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faith-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importAll(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        let count = 0
        let errors = 0
        for (const { key, label } of ALL_KEYS) {
          if (data[key] === undefined) continue
          try {
            localStorage.setItem(key, JSON.stringify(data[key]))
            count++
          } catch {
            errors++
          }
        }        if (fileRef.current) fileRef.current.value = ''
        if (count === 0) {
          setImportMsg('Aucune section reconnue dans le fichier.')
        } else {
          setImportMsg(`${count} section(s) restaurée(s)${errors ? `, ${errors} en échec.` : '.'} Recharge la page.`)
        }
      } catch {
        setImportMsg('Erreur : fichier invalide.')
      }
    }
    reader.readAsText(file)
  }

  function clearAllData() {
    for (const { key } of ALL_KEYS) {
      localStorage.removeItem(key)
    }
    window.location.reload()
  }

  return (
    <div style={{ display: 'grid', gap: 28 }}>

      {/* Navigation rapide */}
      <div className="settings-nav-dropdown">
        <label>Aller à une section</label>
        <select
          value=""
          onChange={e => { if (e.target.value && onNavigate) onNavigate(e.target.value) }}
          className="settings-nav-select"
        >
          <option value="" disabled>Sélectionner...</option>
          {SECTIONS.map(s => (
            <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
          ))}
        </select>
      </div>

      {/* Sécurité */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text)' }}>🔐 Sécurité</h3>
        <div className="item-card" style={{ cursor: 'default' }}>
          <div className="item-card-body">
            <strong>Verrouillage PIN</strong>
            <span className="item-meta">{pinEnabled ? '✅ Activé' : '❌ Désactivé'}</span>
          </div>
          <div className="item-actions">
            {!showPinInput && !pinEnabled && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowPinInput(true)}>Activer</button>
            )}
            {!showPinInput && pinEnabled && (
              <button className="btn btn-danger btn-sm" onClick={disablePin}>Désactiver</button>
            )}
          </div>
        </div>

        {showPinInput && (
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            <div className="form-row">
              <input
                type="password" inputMode="numeric" maxLength={4}
                placeholder="Nouveau code (4 chiffres)"
                value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setPinError('') }}
              />
              <input
                type="password" inputMode="numeric" maxLength={4}
                placeholder="Confirmer le code"
                value={confirmPin} onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setPinError('') }}
              />
            </div>
            {pinError && <span style={{ color: '#991b1b', fontSize: '0.85rem' }}>{pinError}</span>}
            {pinSuccess && <span style={{ color: '#166534', fontSize: '0.85rem' }}>{pinSuccess}</span>}
            <div className="form-row">
              <button className="btn btn-primary" onClick={enablePin}>Enregistrer</button>
              <button className="btn btn-secondary" onClick={() => { setShowPinInput(false); setPinError(''); setPinSuccess('') }}>Annuler</button>
            </div>
          </div>
        )}
      </div>

      {/* Données */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text)' }}>💾 Données</h3>

        <div className="settings-data-grid">
          {stats.map(s => (
            <div key={s.key} className="item-card" style={{ padding: '10px 14px', cursor: 'default' }}>
              <div className="item-card-body">
                <strong style={{ fontSize: '0.85rem' }}>{s.key}</strong>
                <span className="item-meta">{s.count} élément{s.count > 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="form-row">
          <button className="btn btn-primary" onClick={exportAll}>📤 Exporter (sauvegarde)</button>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>📥 Importer (restaurer)</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importAll} />
          <button className="btn btn-danger" onClick={() => setClearTarget(true)}>🗑️ Tout effacer</button>
        </div>
        {importMsg && <span style={{ fontSize: '0.85rem', color: importMsg.includes('Erreur') ? '#991b1b' : '#166534', marginTop: 8, display: 'block' }}>{importMsg}</span>}
      </div>

      {/* À propos */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text)' }}>ℹ️ À propos</h3>
        <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'grid', gap: 4, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          <span><strong style={{ color: 'var(--text)' }}>FAITH</strong> — Gestion pastorale</span>
          <span>Version 1.1.0 • 100% offline</span>
          <span>Développé pour l'œuvre de Dieu 🙏</span>
        </div>
      </div>

      <ConfirmDialog
        open={clearTarget}
        title="Tout effacer"
        message="Cette action supprime toutes les données (profil, visites, cultes, contacts, prédications, prières). Cette action est irréversible."
        confirmLabel="Tout effacer"
        onConfirm={clearAllData}
        onCancel={() => setClearTarget(false)}
      />
    </div>
  )
}

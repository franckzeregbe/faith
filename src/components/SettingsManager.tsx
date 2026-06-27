import React, { useEffect, useRef, useState } from 'react'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'
import ConfirmDialog from './ConfirmDialog'

const PIN_KEY = 'faith_pin'

const ALL_KEYS = ['faith_profile', 'fs_visits', 'fs_cults', 'pastoral_contacts', 'faith_converts', 'faith_sermons', 'faith_prayers', 'faith_birthdays']

export default function SettingsManager() {
  const [pin, setPin] = useState('')
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
    const stored = loadJsonFromStorage<string>(PIN_KEY, '')
    setPinEnabled(stored.length > 0)
    const s = ALL_KEYS.map(key => {
      let count = 0
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          count = Array.isArray(parsed) ? parsed.length : (parsed && typeof parsed === 'object' ? 1 : 0)
        }
      } catch { /* ignore */ }
      return { key, count }
    })
    setStats(s)
  }, [])

  function enablePin() {
    if (newPin.length < 4) { setPinError('Le code doit faire au moins 4 chiffres.'); return }
    if (newPin !== confirmPin) { setPinError('Les codes ne correspondent pas.'); return }
    saveJsonToStorage(PIN_KEY, newPin)
    setPinEnabled(true)
    setPinSuccess('Code PIN activé ✓')
    setPinError('')
    setNewPin('')
    setConfirmPin('')
    setShowPinInput(false)
  }

  function disablePin() {
    localStorage.removeItem(PIN_KEY)
    setPinEnabled(false)
    setPinSuccess('Code PIN désactivé')
  }

  function exportAll() {
    const data: Record<string, any> = {}
    for (const key of ALL_KEYS) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) data[key] = JSON.parse(raw)
      } catch { /* ignore */ }
    }
    data[PIN_KEY] = loadJsonFromStorage(PIN_KEY, '')
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
        for (const key of ALL_KEYS) {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]))
            count++
          }
        }
        if (data[PIN_KEY]) saveJsonToStorage(PIN_KEY, data[PIN_KEY])
        setImportMsg(`${count} sections restaurées avec succès. Recharge la page.`)
        if (fileRef.current) fileRef.current.value = ''
      } catch {
        setImportMsg('Erreur : fichier invalide.')
      }
    }
    reader.readAsText(file)
  }

  function clearAllData() {
    for (const key of ALL_KEYS) {
      localStorage.removeItem(key)
    }
    window.location.reload()
  }

  const LABELS: Record<string, string> = {
    faith_profile: 'Profil',
    fs_visits: 'Visites',
    fs_cults: 'Cultes',
    pastoral_contacts: 'Contacts',
    faith_converts: 'Nouvelles âmes',
    faith_sermons: 'Prédications',
    faith_prayers: 'Prières',
    faith_birthdays: 'Anniversaires',
  }

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      {/* Sécurité */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text)' }}>🔐 Sécurité</h3>
        <div className="item-card" style={{ cursor: 'default' }}>
          <div className="item-card-body">
            <strong>Verrouillage par code PIN</strong>
            <span className="item-meta">
              {pinEnabled ? '✅ Activé' : '❌ Désactivé'} — Un code à 4 chiffres protège l'accès à l'app.
            </span>
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
                type="password" inputMode="numeric" maxLength={6}
                placeholder="Nouveau code (4-6 chiffres)"
                value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setPinError('') }}
              />
              <input
                type="password" inputMode="numeric" maxLength={6}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {stats.map(s => (
            <div key={s.key} className="item-card" style={{ padding: '10px 14px', cursor: 'default' }}>
              <div className="item-card-body">
                <strong style={{ fontSize: '0.85rem' }}>{LABELS[s.key] || s.key}</strong>
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
          <span>Version 0.1.0</span>
          <span>Stockage local — 100% offline</span>
          <span>Développé pour l'œuvre de Dieu 🙏</span>
        </div>
      </div>

      <ConfirmDialog
        open={clearTarget}
        title="Tout effacer"
        message="Cette action supprime toutes les données (profil, visites, cultes, contacts, prédications, prières, anniversaires). Cette action est irréversible."
        confirmLabel="Tout effacer"
        onConfirm={clearAllData}
        onCancel={() => setClearTarget(false)}
      />
    </div>
  )
}

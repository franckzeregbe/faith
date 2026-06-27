import React, { useState } from 'react'
import { generateMessage, TEMPLATE_TYPES } from '../utils/generator'

type TemplateType = keyof typeof TEMPLATE_TYPES

const LABELS: Record<TemplateType, { label: string; desc: string }> = {
  encouragement: { label: 'SMS court', desc: 'Message bref à envoyer par SMS' },
  whatsapp: { label: 'WhatsApp', desc: 'Message plus long avec signature pasteur' },
  facebook: { label: 'Facebook post', desc: 'Publication publique avec hashtags' },
}

export default function MessageGenerator() {
  const [name, setName] = useState('')
  const [type, setType] = useState<TemplateType>('encouragement')
  const [preview, setPreview] = useState('')

  function onGenerate() {
    const recipient = name.trim() || 'frère/sœur'
    setPreview(generateMessage(type, recipient))
  }

  function copyToClipboard() {
    if (!preview) return
    navigator.clipboard.writeText(preview)
  }

  return (
    <div>
      <div className="section-card-header" style={{ border: 'none', padding: 0, marginBottom: 16 }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
          Génére des messages chrétiens prêts à envoyer — SMS d'encouragement, message WhatsApp ou publication Facebook.
          Inspire-toi des versets bibliques pour bénir ton entourage.
        </p>
      </div>

      <div className="form-row">
        <input
          placeholder="Nom du destinataire (optionnel)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <select value={type} onChange={e => setType(e.target.value as TemplateType)}>
          {Object.entries(LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label} — {val.desc}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={onGenerate}>Générer</button>
      </div>

      <div className="preview-box">
        <label>Message généré</label>
        <textarea
          readOnly
          value={preview}
          rows={8}
          placeholder="Remplis le nom (ou laisse vide), choisis le type, puis clique sur Générer..."
          style={preview ? {} : { color: 'var(--muted)' }}
        />
        {preview && (
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={copyToClipboard}>📋 Copier</button>
            <span className="preview-hint">Copie et colle dans ton application préférée.</span>
          </div>
        )}
      </div>
    </div>
  )
}

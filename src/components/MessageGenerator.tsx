import React, { useState } from 'react'
import { generateMessage, TEMPLATE_TYPES } from '../utils/generator'

type TemplateType = keyof typeof TEMPLATE_TYPES

export default function MessageGenerator() {
  const [name, setName] = useState('frère/sœur')
  const [type, setType] = useState<TemplateType>('encouragement')
  const [preview, setPreview] = useState('')

  function onGenerate() {
    setPreview(generateMessage(type, name))
  }

  function copyToClipboard() {
    if (!preview) return
    navigator.clipboard.writeText(preview)
  }

  return (
    <div>
      <div className="form-row">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du frère/sœur" />
        <select value={type} onChange={e => setType(e.target.value as TemplateType)}>
          <option value="encouragement">SMS court</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="facebook">Facebook post</option>
        </select>
        <button className="btn btn-primary" onClick={onGenerate}>Générer</button>
      </div>

      <div className="preview-box">
        <label>Message généré</label>
        <textarea readOnly value={preview} rows={6} placeholder="Clique sur Générer pour créer un message..." />
        {preview && (
          <div className="form-actions">
            <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>Copier</button>
            <span className="preview-hint">Copiez-collez dans votre app SMS/WhatsApp/Facebook.</span>
          </div>
        )}
      </div>
    </div>
  )
}

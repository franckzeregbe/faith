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

  return (
    <div className="message-generator">
      <div className="form-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du frère/sœur" />
        <select value={type} onChange={(e) => setType(e.target.value as TemplateType)}>
          <option value="encouragement">SMS court</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="facebook">Facebook post</option>
        </select>
        <button onClick={onGenerate}>Générer</button>
      </div>

      <div className="preview">
        <label>Message généré</label>
        <textarea readOnly value={preview} rows={6} />
        <div className="small">Copiez-collez dans votre app SMS/WhatsApp/Facebook.</div>
      </div>
    </div>
  )
}
